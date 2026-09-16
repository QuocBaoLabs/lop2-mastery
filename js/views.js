/* LỚP 2 MASTERY — analytics + views */
"use strict";

const Analytics = {
  cache: {},
  async all() {
    if (!this.cache.skills) {
      const [skills, preq, core, curM, curV, ex] = await Promise.all([
        App.fetchJSON("data/skills/all_skills.json"),
        App.fetchJSON("data/skills/prerequisites.json"),
        App.fetchJSON("data/skills/core_20_percent.json"),
        App.fetchJSON("data/curriculum/math.json"),
        App.fetchJSON("data/curriculum/vietnamese.json"),
        App.fetchJSON("data/exercises/generated_practice_examples.json").catch(() => ({ examples: [] })),
      ]);
      this.cache.skills = skills.skills || [];
      this.cache.skillMap = {};
      this.cache.skills.forEach((s) => { this.cache.skillMap[s.skill_id] = s; });
      this.cache.preq = {};
      (preq.skills || []).forEach((p) => { this.cache.preq[p.skill_id] = p; });
      this.cache.core = core.skills || [];
      this.cache.coreSet = new Set(this.cache.core.map((c) => c.skill_id));
      this.cache.curM = curM;
      this.cache.curV = curV;
      this.cache.examples = ex.examples || [];
    }
    return this.cache;
  },
  dependentsOf(sid) {
    const p = this.cache.preq[sid];
    return p ? (p.dependent_skill_ids || []).length : 0;
  },
  dueReviews(d) {
    const today = Store.todayKey();
    return (this.cache.skills || []).filter((s) => {
      const st = Store.skill(d, s.skill_id);
      if (st.nextReview && st.nextReview <= today) return true;
      if (!st.nextReview && st.attempts && Store.masteryLvl(st) < 3 && (Date.now() - st.lastTs) > 86400000) return true;
      return false;
    });
  },
  todayPlan(d) {
    const learned = {};
    Object.keys(d.skills || {}).forEach((k) => { if (d.skills[k].attempts) learned[k] = true; });
    const news = this.cache.skills.filter((s) => !learned[s.skill_id])
      .sort((a, b) => ((this.cache.coreSet.has(b.skill_id) ? 1 : 0) - (this.cache.coreSet.has(a.skill_id) ? 1 : 0)) || ((b.importance_score || 0) - (a.importance_score || 0)))
      .slice(0, 2);
    const reviews = this.dueReviews(d).slice(0, 3);
    const checks = this.cache.skills.filter((s) => {
      const st = Store.skill(d, s.skill_id);
      return st.attempts && Store.masteryLvl(st) >= 2 && Store.masteryLvl(st) < 4;
    }).slice(0, 1);
    const minutes = news.length * 15 + reviews.length * 5 + checks.length * 10;
    return { news, reviews, checks, minutes };
  },
  riskList(d) {
    return this.cache.skills.map((s) => {
      const st = Store.skill(d, s.skill_id);
      return { s, st, risk: (st.attempts || st.lastTs) ? Store.risk(d, s.skill_id, s, this.dependentsOf(s.skill_id)) : 0 };
    }).filter((x) => x.risk > 0).sort((a, b) => b.risk - a.risk).slice(0, 6);
  },
  masteryDist(d, subject) {
    const dist = [0, 0, 0, 0, 0];
    this.cache.skills.filter((s) => !subject || s.subject === subject).forEach((s) => {
      dist[Store.masteryOf(d, s.skill_id)]++;
    });
    return dist;
  },
  subjectStats(d, subject) {
    const list = this.cache.skills.filter((s) => s.subject === subject);
    const total = list.length;
    let mastered = 0, studying = 0, weak = 0;
    list.forEach((s) => {
      const st = Store.skill(d, s.skill_id);
      const lv = Store.masteryOf(d, s.skill_id);
      if (lv >= 3) mastered++;
      else if (st.attempts) { if (lv >= 1) studying++; else weak++; }
    });
    return { total, mastered, studying, weak, pct: total ? Math.round(mastered / total * 100) : 0 };
  },
  domains(subject) {
    const map = {};
    this.cache.skills.filter((s) => s.subject === subject).forEach((s) => {
      const dom = s.domain || "Khác";
      (map[dom] = map[dom] || []).push(s);
    });
    return Object.keys(map).sort((a, b) => map[b].length - map[a].length).map((k) => ({ name: k, skills: map[k] }));
  },
  lessonsDone(d) {
    let done = 0, total = 0;
    [this.cache.curM, this.cache.curV].forEach((cur) => (cur.topics || []).forEach((t) => (t.units || []).forEach((u) => (u.lessons || []).forEach((l) => {
      total++;
      const sids = l.skills || [];
      if (sids.length && sids.every((s) => Store.masteryOf(d, s) >= 2)) done++;
    }))));
    return { done, total };
  },
  achievements(d) {
    const xp = Store.xp(d);
    const streak = Store.streak(d);
    const skills = d.skills || {};
    const mastered = this.cache.skills.filter((s) => Store.masteryOf(d, s.skill_id) >= 3).length;
    const tests = d.tests || [];
    const best = tests.length ? Math.max.apply(null, tests.map((t) => t.pct || 0)) : 0;
    const totalCorrect = Object.values(skills).reduce((a, s) => a + (s.correct || 0), 0);
    return [
      { icon: "🌟", name: "Bước đầu tiên", desc: "Trả lời câu hỏi đầu tiên", got: Object.keys(skills).length > 0 },
      { icon: "🔥", name: "Chuỗi 3 ngày", desc: "Học 3 ngày liên tiếp", got: streak >= 3 },
      { icon: "⚡", name: "Chuỗi 7 ngày", desc: "Học 7 ngày liên tiếp", got: streak >= 7 },
      { icon: "🎯", name: "10 câu đúng", desc: "Tổng 10 câu trả lời đúng", got: totalCorrect >= 10 },
      { icon: "💎", name: "Thành thạo đầu tiên", desc: "Đạt M3 kỹ năng đầu tiên", got: mastered >= 1 },
      { icon: "📝", name: "Kiểm tra xuất sắc", desc: "Đạt ≥ 80% một bài kiểm tra", got: best >= 80 },
      { icon: "🏅", name: "100 XP", desc: "Tích lũy 100 điểm", got: xp >= 100 },
      { icon: "🏆", name: "Nhà vô địch", desc: "Thành thạo 10 kỹ năng", got: mastered >= 10 },
    ];
  },
};

const VH = {
  masteryBadge(d, sid) {
    const lv = Store.masteryOf(d, sid);
    return `<span class="badge mastery${lv}" title="${Util.esc(Store.masteryName(lv))}">M${lv}</span>`;
  },
  subjIcon(subject) { return subject === "MATH" ? "🧮" : "📖"; },
  domainIcon(domain, subject) {
    const dm = {
      "Số học": "🔢", "Phép cộng": "➕", "Phép trừ": "➖", "Phép nhân": "✖️", "Phép chia": "➗",
      "Giải toán": "🧾", "Bài toán có lời văn": "🧾", "Đo lường": "📏", "Đại lượng": "📏",
      "Hình học": "🔷", "Thống kê": "📊", "Thời gian": "⏰",
      "Đọc": "📖", "Viết": "✍️", "Chính tả": "✍️", "Từ và câu": "🔤", "Luyện từ và câu": "🔤", "Nói và nghe": "🎤",
    };
    return dm[domain] || (subject === "MATH" ? "🧮" : "📖");
  },
  domainColor(domain, subject) {
    if (subject === "VIETNAMESE") return "#fdeef6";
    const c = { "Số học": "#eaf2ff", "Phép cộng": "#e5f9f1", "Phép trừ": "#fff1e5", "Phép nhân": "#f1ecfe", "Phép chia": "#fef5e0", "Hình học": "#e0f7fa", "Thống kê": "#fdeaea" };
    return c[domain] || "#eaf2ff";
  },
  donut(dist, size) {
    const colors = ["#94a3b8", "#f97316", "#f59e0b", "#10b981", "#8b5cf6"];
    const total = dist.reduce((a, b) => a + b, 0) || 1;
    const r = 52, C = 2 * Math.PI * r;
    let off = 0;
    const segs = dist.map((n, i) => {
      const frac = n / total;
      const seg = `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${colors[i]}" stroke-width="16" stroke-dasharray="${(frac * C).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-off * C).toFixed(1)}" transform="rotate(-90 70 70)"/>`;
      off += frac;
      return seg;
    }).join("");
    return `<svg width="${size || 140}" height="${size || 140}" viewBox="0 0 140 140">${segs}<text x="70" y="66" text-anchor="middle" font-size="26" font-weight="800" fill="#1c2b45">${total}</text><text x="70" y="86" text-anchor="middle" font-size="11" fill="#6b7a90">kỹ năng</text></svg>`;
  },
  ring(pct, text, color) {
    const r = 44, C = 2 * Math.PI * r;
    return `<svg width="96" height="96" viewBox="0 0 96 96">
      <circle r="${r}" cx="48" cy="48" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="9"/>
      <circle r="${r}" cx="48" cy="48" fill="none" stroke="${color || "#fff"}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(pct / 100 * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 48 48)"/>
      <text x="48" y="54" text-anchor="middle" font-size="21" font-weight="800" fill="#fff">${text}</text></svg>`;
  },
};

const Views = {
  async home(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const xp = Store.xp(d);
    const lv = Store.level(xp);
    const lvP = Store.levelProgress(xp);
    const streak = Store.streak(d);
    const plan = Analytics.todayPlan(d);
    const mS = Analytics.subjectStats(d, "MATH");
    const vS = Analytics.subjectStats(d, "VIETNAMESE");
    const dist = Analytics.masteryDist(d);
    const risks = Analytics.riskList(d);
    const ld = Analytics.lessonsDone(d);
    const ach = Analytics.achievements(d);
    const lastBadge = ach.filter((a) => a.got).pop() || ach[0];
    const profile = d.profile || {};
    const studied = Object.keys(d.skills || {}).filter((k) => d.skills[k].attempts).length;
    const totalAttempts = Object.values(d.skills || {}).reduce((a, s) => a + (s.attempts || 0), 0);
    const mins = totalAttempts * 1;
    const hh = Math.floor(mins / 60), mm = mins % 60;
    const planItem = (sid, why) => {
      const s = A.skillMap[sid];
      if (!s) return "";
      const subj = s.subject === "MATH" ? "toan" : "tiengviet";
      return `<a class="plan-item" href="#/hoc/skill/${sid}">
        <span class="p-ico">${VH.subjIcon(s.subject)}</span>
        <span style="flex:1;min-width:0"><b>${Util.esc(s.name)}</b><small>${why} · ${Util.esc(s.domain || "")} ${A.coreSet.has(sid) ? "· 🔥 CORE" : ""}</small></span>
        ${VH.masteryBadge(d, sid)}
      </a>`;
    };
    el.innerHTML = `
      <section class="hero">
        <div class="hero-scene">
          <span class="float-emo f1">👧</span><span class="float-emo f2">📚</span><span class="float-emo f3">👦</span><span class="float-emo f4">⭐</span>
        </div>
        <div class="hero-left">
          <p class="greet">Chào ${Util.esc(profile.name || "Bé Minh")}! 👋</p>
          <h1>Hôm nay mình cùng chinh phục thêm một kỹ năng nhé!</h1>
          <span class="quote">“Kiến thức hôm nay – Tương lai rạng ngời!”</span>
          <div class="hero-ctas">
            <a class="btn white big" href="#/hoc">🎓 HỌC NGAY</a>
            <a class="btn ghost-light big" href="#/tiendo">📊 Xem tiến độ</a>
          </div>
        </div>
        <div class="hero-right">
          <div class="level-ring">
            ${VH.ring(lvP, lv, "#fff")}
            <div><b class="lvl">Cấp ${lv}</b><small>${Util.fmt(xp)} XP</small></div>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><span>🔥 Chuỗi ngày học</span><b>${streak} ngày</b></div>
            <div class="hero-stat"><span>⭐ Điểm</span><b>${Util.fmt(xp)} XP</b></div>
            <div class="hero-stat"><span>${lastBadge.icon} Badge gần nhất</span><b>${Util.esc(lastBadge.name)}</b></div>
          </div>
        </div>
      </section>

      <div class="quick">
        <a class="qa m1" href="#/toan"><span class="qa-ico">🧮</span><b>HỌC TOÁN</b><small>${mS.mastered}/${mS.total} thành thạo</small></a>
        <a class="qa m2" href="#/tiengviet"><span class="qa-ico">📖</span><b>HỌC TIẾNG VIỆT</b><small>${vS.mastered}/${vS.total} thành thạo</small></a>
        <a class="qa m3" href="#/baitap"><span class="qa-ico">✏️</span><b>LÀM BÀI TẬP</b><small>Luyện theo bài học</small></a>
        <a class="qa m4" href="#/onluyen"><span class="qa-ico">🧠</span><b>ÔN TẬP THÔNG MINH</b><small>${Analytics.dueReviews(d).length} đến hạn</small></a>
        <a class="qa m5" href="#/kiemtra"><span class="qa-ico">📝</span><b>KIỂM TRA NĂNG LỰC</b><small>Đầu vào &amp; cuối chương</small></a>
        <a class="qa m6" href="#/tiendo"><span class="qa-ico">📊</span><b>XEM TIẾN ĐỘ</b><small>Toán ${mS.pct}% · TV ${vS.pct}%</small></a>
      </div>

      <section class="section">
        <h2>☀️ Hôm nay bé nên học gì?</h2>
        <p class="sub">Dựa trên tiến độ, mức độ thành thạo và trí nhớ dài hạn.</p>
        <div class="plan-grid">
          <div class="plan-col">
            <h3>🌱 KIẾN THỨC MỚI</h3>
            ${plan.news.map((s) => planItem(s.skill_id, "Bài mới · " + (A.coreSet.has(s.skill_id) ? "ưu tiên" : "nền tảng"))).join("") || '<p class="muted">Tuyệt vời! Đã học hết kỹ năng mới — xem phần ôn tập.</p>'}
          </div>
          <div class="plan-col">
            <h3>🧠 ÔN TẬP ĐÚNG LÚC</h3>
            ${plan.reviews.map((s) => planItem(s.skill_id, "Đến hạn ôn để không quên")).join("") || '<p class="muted">Hôm nay chưa có kỹ năng nào đến hạn ôn.</p>'}
          </div>
          <div class="plan-col">
            <h3>💎 MASTERY CHECK</h3>
            ${plan.checks.map((s) => planItem(s.skill_id, "Kiểm tra thành thạo")).join("") || '<p class="muted">Chưa có kỹ năng nào sẵn sàng kiểm tra thành thạo.</p>'}
          </div>
          <div class="plan-sum">
            <span>📅 Hôm nay:</span>
            <span>🌱 ${plan.news.length} kỹ năng mới</span>
            <span>🧠 ${plan.reviews.length} kỹ năng cần ôn</span>
            <span>💎 ${plan.checks.length} Mastery Check</span>
            <span>⏱️ Khoảng ${plan.minutes} phút</span>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>📊 Tiến độ học tập</h2>
        <div class="grid cols-2">
          <div class="card">
            <h3>🧮 Toán</h3>
            <div class="subj-progress"><div class="sp-head"><span>Thành thạo kỹ năng</span><b>${mS.pct}%</b></div><div class="progress"><span style="width:${mS.pct}%"></span></div></div>
            <p class="small muted">${mS.total} kỹ năng · ${mS.mastered} thành thạo · ${mS.studying} đang luyện · ${mS.weak} cần củng cố</p>
            <a class="btn small ghost" href="#/toan">Xem chi tiết →</a>
          </div>
          <div class="card">
            <h3>📖 Tiếng Việt</h3>
            <div class="subj-progress"><div class="sp-head"><span>Thành thạo kỹ năng</span><b>${vS.pct}%</b></div><div class="progress pink"><span style="width:${vS.pct}%"></span></div></div>
            <p class="small muted">${vS.total} kỹ năng · ${vS.mastered} thành thạo · ${vS.studying} đang luyện · ${vS.weak} cần củng cố</p>
            <a class="btn small ghost" href="#/tiengviet">Xem chi tiết →</a>
          </div>
        </div>
        <div class="grid cols-4" style="margin-top:16px">
          <div class="card stat-card"><span class="s-ico">✅</span><span><b>${ld.done}/${ld.total}</b><small>bài đã hoàn thành</small></span></div>
          <div class="card stat-card"><span class="s-ico">⭐</span><span><b>${studied}</b><small>kỹ năng đã học</small></span></div>
          <div class="card stat-card"><span class="s-ico">🏆</span><span><b>${mS.mastered + vS.mastered}</b><small>kỹ năng thành thạo</small></span></div>
          <div class="card stat-card"><span class="s-ico">⏱️</span><span><b>${hh ? hh + " giờ " : ""}${mm} phút</b><small>thời gian học ước tính</small></span></div>
        </div>
      </section>

      <section class="section">
        <h2>🎯 Mastery Overview</h2>
        <div class="card">
          <div class="donut-wrap">
            ${VH.donut(dist)}
            <div class="legend">
              ${["🔴 Chưa biết", "🟠 Cần hướng dẫn", "🟡 Làm được, chưa ổn định", "🟢 Thành thạo", "💎 Thành thạo & giải thích được"].map((l, i) => `<span class="lg"><span class="dot2" style="background:${["#94a3b8", "#f97316", "#f59e0b", "#10b981", "#8b5cf6"][i]}"></span>M${i} ${l} — <b>${dist[i]}</b></span>`).join("")}
            </div>
            <a class="btn small ghost" style="margin-left:auto" href="#/mastery">Xem tất cả →</a>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>🎯 Khu vực cần ôn thêm</h2>
        <div class="card">
          ${risks.length ? risks.map((r) => {
            const b = Store.band(r.risk);
            const acc = Store.accuracy(d, r.s.skill_id);
            const err = r.st.attempts - (r.st.correct || 0);
            return `<div class="risk-row">
              <span class="risk-num" style="color:${b.color === "red" ? "#ef4444" : b.color === "orange" ? "#f97316" : b.color === "yellow" ? "#f59e0b" : "#10b981"}">${r.risk}</span>
              <span style="flex:1;min-width:0"><b>${VH.subjIcon(r.s.subject)} ${Util.esc(r.s.name)}</b><small>Độ chính xác ${acc == null ? "—" : acc + "%"} · sai ${err} lần${r.st.lastTs ? " · ôn gần nhất " + new Date(r.st.lastTs).toLocaleDateString("vi-VN") : ""}</small></span>
              <span class="badge" style="background:${b.color === "red" ? "#fdeaea" : b.color === "orange" ? "#fff1e5" : b.color === "yellow" ? "#fef5e0" : "#e5f9f1"};color:${b.color === "red" ? "#b91c1c" : b.color === "orange" ? "#c2410c" : b.color === "yellow" ? "#92600a" : "#047857"}">${b.color === "red" ? "🔴" : b.color === "orange" ? "🟠" : b.color === "yellow" ? "🟡" : "🟢"} ${b.label}</span>
              <a class="btn small orange" href="#/hoc/skill/${r.s.skill_id}">ÔN NGAY</a>
            </div>`;
          }).join("") : '<p class="muted">Bé chưa có kỹ năng cần củng cố — hãy bắt đầu học để hệ thống phân tích nhé!</p>'}
        </div>
      </section>
    `;
  },

  async hoc(el) {
    const seg = location.hash.replace(/^#\/?/, "").split("/");
    if (seg[1] === "skill" && seg[2]) return Learn.study(el, seg[2]);
    const A = await Analytics.all();
    const d = Store.load();
    const plan = Analytics.todayPlan(d);
    const learned = {};
    Object.keys(d.skills || {}).forEach((k) => { if (d.skills[k].attempts) learned[k] = true; });
    const next = plan.news[0] || A.skills.find((s) => !learned[s.skill_id]) || A.skills[0];
    const domRows = (subject, label) => `
      <div class="card">
        <h2>${label}</h2>
        ${Analytics.domains(subject).map((dm) => `<div class="skill-mini"><span class="p-ico">${VH.domainIcon(dm.name, subject)}</span><span class="nm"><b>${Util.esc(dm.name)}</b></span><span class="muted small">${dm.skills.length} kỹ năng</span><a class="btn small ghost" href="#/${subject === "MATH" ? "toan" : "tiengviet"}">Xem →</a></div>`).join("")}
      </div>`;
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">🎓 Học ngay</h1>
      <p class="sub">Quy trình: Ôn nhanh → Kiến thức mới → Ví dụ → Tự làm → Hiểu bản chất → Mastery Check → Xếp lịch ôn.</p>
      ${next ? `
      <div class="card" style="background:linear-gradient(120deg,#eaf2ff,#f1ecfe);border:0">
        <h2>✨ Gợi ý tiếp theo cho bé</h2>
        <div class="quiz-skill" style="margin:10px 0">${VH.subjIcon(next.subject)} <b style="font-size:1.1rem">${Util.esc(next.name)}</b> ${A.coreSet.has(next.skill_id) ? '<span class="badge CORE">🔥 CORE</span>' : ""}${next.grade3_foundation ? '<span class="badge G3">⚠️ Nền lớp 3</span>' : ""}</div>
        <p class="muted">${Util.esc(next.description || "")}</p>
        <div class="btn-row"><a class="btn big" href="#/hoc/skill/${next.skill_id}">🚀 BẮT ĐẦU HỌC</a></div>
      </div>` : ""}
      <div class="grid cols-2" style="margin-top:18px">
        ${domRows("MATH", "🧮 Toán")}
        ${domRows("VIETNAMESE", "📖 Tiếng Việt")}
      </div>
    `;
  },

  async toan(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const st = Analytics.subjectStats(d, "MATH");
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">🧮 Toán lớp 2</h1>
      <p class="sub">Học theo năng lực — không theo số trang. Các nhóm kiến thức lấy từ chương trình thực tế.</p>
      <div class="card">
        <div class="subj-progress"><div class="sp-head"><span>Tiến độ thành thạo</span><b>${st.pct}%</b></div><div class="progress"><span style="width:${st.pct}%"></span></div></div>
        <p class="small muted">${st.total} kỹ năng · ${st.mastered} thành thạo · ${st.studying} đang luyện · ${st.weak} cần củng cố</p>
      </div>
      <div class="domain-grid" style="margin-top:18px">
        ${Analytics.domains("MATH").map((dm) => {
          const mastered = dm.skills.filter((s) => Store.masteryOf(d, s.skill_id) >= 3).length;
          const studying = dm.skills.filter((s) => { const x = Store.skill(d, s.skill_id); const lv = Store.masteryOf(d, s.skill_id); return x.attempts && lv >= 1 && lv < 3; }).length;
          const weak = dm.skills.filter((s) => { const x = Store.skill(d, s.skill_id); return x.attempts && Store.masteryOf(d, s.skill_id) === 0; }).length;
          const pct = dm.skills.length ? Math.round(mastered / dm.skills.length * 100) : 0;
          return `<div class="domain-card">
            <div class="domain-head"><span class="d-ico" style="background:${VH.domainColor(dm.name, "MATH")}">${VH.domainIcon(dm.name, "MATH")}</span><div><h3>${Util.esc(dm.name.toUpperCase())}</h3><small>${dm.skills.length} kỹ năng</small></div></div>
            <div class="progress"><span style="width:${pct}%"></span></div>
            <div class="domain-stats">
              <span style="background:var(--green-soft);color:#047857">${mastered} Thành thạo</span>
              <span style="background:var(--yellow-soft);color:#92600a">${studying} Đang luyện</span>
              <span style="background:var(--red-soft);color:#b91c1c">${weak} Cần củng cố</span>
            </div>
            ${dm.skills.slice(0, 4).map((s) => `<div class="skill-mini"><span class="nm">${Util.esc(s.name)}</span>${VH.masteryBadge(d, s.skill_id)}<a class="btn small ghost" href="#/hoc/skill/${s.skill_id}">Học</a></div>`).join("")}
          </div>`;
        }).join("")}
      </div>
    `;
  },

  async tiengviet(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const st = Analytics.subjectStats(d, "VIETNAMESE");
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">📖 Tiếng Việt lớp 2</h1>
      <p class="sub">Đọc – Viết – Từ và câu – Nói và nghe: học theo năng lực, mỗi kỹ năng đều truy vết được về bài học trong SGK.</p>
      <div class="card">
        <div class="subj-progress"><div class="sp-head"><span>Tiến độ thành thạo</span><b>${st.pct}%</b></div><div class="progress pink"><span style="width:${st.pct}%"></span></div></div>
        <p class="small muted">${st.total} kỹ năng · ${st.mastered} thành thạo · ${st.studying} đang luyện · ${st.weak} cần củng cố</p>
      </div>
      <div class="domain-grid" style="margin-top:18px">
        ${Analytics.domains("VIETNAMESE").map((dm) => {
          const mastered = dm.skills.filter((s) => Store.masteryOf(d, s.skill_id) >= 3).length;
          const pct = dm.skills.length ? Math.round(mastered / dm.skills.length * 100) : 0;
          const need = dm.skills.filter((s) => Store.masteryOf(d, s.skill_id) < 3).slice(0, 1);
          return `<div class="domain-card">
            <div class="domain-head"><span class="d-ico" style="background:${VH.domainColor(dm.name, "VIETNAMESE")}">${VH.domainIcon(dm.name, "VIETNAMESE")}</span><div><h3>${Util.esc(dm.name)}</h3><small>${dm.skills.length} kỹ năng · ${mastered} thành thạo</small></div></div>
            <div class="progress pink"><span style="width:${pct}%"></span></div>
            ${need.length ? `<div class="skill-mini"><span class="nm">💡 Nên học: ${Util.esc(need[0].name)}</span><a class="btn small ghost" href="#/hoc/skill/${need[0].skill_id}">Học</a></div>` : ""}
            ${dm.skills.slice(0, 4).map((s) => `<div class="skill-mini"><span class="nm">${Util.esc(s.name)}</span>${VH.masteryBadge(d, s.skill_id)}<a class="btn small ghost" href="#/hoc/skill/${s.skill_id}">Học</a></div>`).join("")}
          </div>`;
        }).join("")}
      </div>
    `;
  },

  async onluyen(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const due = Analytics.dueReviews(d);
    const risks = Analytics.riskList(d);
    const row = (s, why, btn) => `
      <div class="risk-row">
        <span style="flex:1;min-width:0"><b>${VH.subjIcon(s.subject)} ${Util.esc(s.name)}</b><small>${why}</small></span>
        ${VH.masteryBadge(d, s.skill_id)}
        ${btn}
      </div>`;
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">🧠 Ôn luyện thông minh</h1>
      <p class="sub">Spaced repetition: ôn đúng lúc — đúng khoảng cách (1 → 3 → 7 → 14 → 30 ngày) để trí nhớ không phai.</p>
      <section class="section" style="margin-top:8px"><h2>⏰ Đến hạn ôn hôm nay</h2>
        <div class="card">
          ${due.length ? due.map((s) => {
            const st = Store.skill(d, s.skill_id);
            const days = st.lastTs ? Math.max(0, Math.floor((Date.now() - st.lastTs) / 86400000)) : 0;
            return row(s, `Lần ôn trước: ${days} ngày trước · gợi ý 3–5 phút`, `<a class="btn small purple" href="#/hoc/skill/${s.skill_id}">ÔN NGAY</a>`);
          }).join("") : '<p class="muted">🎉 Hôm nay không có kỹ năng nào đến hạn ôn!</p>'}
        </div>
      </section>
      <section class="section"><h2>⚠️ Cần củng cố (theo điểm rủi ro)</h2>
        <div class="card">
          ${risks.length ? risks.map((r) => {
            const b = Store.band(r.risk);
            const acc = Store.accuracy(d, r.s.skill_id);
            return row(r.s, `Độ chính xác ${acc == null ? "—" : acc + "%"} · risk ${r.risk}/100 · ${b.label}`, `<a class="btn small orange" href="#/hoc/skill/${r.s.skill_id}">ÔN NHANH 3 PHÚT</a>`);
          }).join("") : '<p class="muted">Chưa có dữ liệu để phân tích rủi ro.</p>'}
        </div>
      </section>
    `;
  },

  async baitap(el) {
    const seg = location.hash.replace(/^#\/?/, "").split("/");
    if (seg[1] && seg[2] && /^\d+$/.test(seg[2])) return Learn.lessonPractice(el, seg[1], Number(seg[2]));
    const A = await Analytics.all();
    const d = Store.load();
    const bookList = (bookId) => {
      const cur = bookId.startsWith("math") ? A.curM : A.curV;
      return (cur.topics || []).filter((t) => App.bookFor(t.topic_id) === bookId).map((t) => (t.units || []).map((u) => (u.lessons || []).map((l) => {
        const sids = l.skills || [];
        const ok = sids.length ? sids.filter((s) => Store.masteryOf(d, s) >= 2).length : 0;
        return `<a class="plan-item" href="#/baitap/${bookId}/${l.lesson_no}">
          <span class="p-ico">${bookId.startsWith("math") ? "🧮" : "📖"}</span>
          <span style="flex:1;min-width:0"><b>Bài ${l.lesson_no}. ${Util.esc(l.name)}</b><small>${ok}/${sids.length} kỹ năng đạt M2+ · sách tr.${l.printed_pages[0]}–${l.printed_pages[l.printed_pages.length - 1]}</small></span>
          <span class="badge ${ok === sids.length && sids.length ? "mastery3" : "mastery0"}">${ok === sids.length && sids.length ? "Đạt" : "Luyện"}</span>
        </a>`;
      }).join(""))).join("");
    };
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">✏️ Bài tập theo bài học</h1>
      <p class="sub">Chọn bài trong SGK để luyện đúng kỹ năng. Mỗi câu đúng: +10 XP ⭐. Bài tập là bài mới tương đương dạng SGK.</p>
      <div class="tabs"><a class="active" href="#/baitap">🧮 Toán</a><a href="#/baitap">📖 Tiếng Việt</a></div>
      <div class="grid cols-2">
        <div class="card"><h2>📐 Toán 2 · Tập 1</h2>${bookList("math1")}</div>
        <div class="card"><h2>📐 Toán 2 · Tập 2</h2>${bookList("math2")}</div>
        <div class="card"><h2>📖 Tiếng Việt 2 · Tập 1</h2>${bookList("vie1")}</div>
        <div class="card"><h2>📖 Tiếng Việt 2 · Tập 2</h2>${bookList("vie2")}</div>
      </div>
    `;
  },

  async kiemtra(el) {
    return Learn.testHub(el);
  },

  async map(el) {
    const seg = location.hash.replace(/^#\/?/, "").split("/");
    const subject = seg[1] === "vie" ? "VIETNAMESE" : "MATH";
    const A = await Analytics.all();
    const d = Store.load();
    const nodes = A.skills.filter((s) => s.subject === subject);
    const levels = {};
    const memo = (sid) => {
      if (levels[sid] != null) return levels[sid];
      const p = A.preq[sid];
      const pres = p ? (p.prerequisite_skill_ids || []) : [];
      if (!pres.length) { levels[sid] = 0; return 0; }
      let mx = 0;
      pres.forEach((x) => { mx = Math.max(mx, memo(x) + 1); });
      levels[sid] = mx;
      return mx;
    };
    nodes.forEach((n) => memo(n.skill_id));
    const maxLv = Math.max(0, ...nodes.map((n) => levels[n.skill_id]));
    const cols = {};
    nodes.forEach((n) => {
      const l = levels[n.skill_id];
      (cols[l] = cols[l] || []).push(n);
    });
    const colW = 200, rowH = 58, padX = 30, padY = 26;
    const maxRows = Math.max(1, ...Object.values(cols).map((c) => c.length));
    const W = (maxLv + 1) * colW + padX * 2;
    const H = maxRows * rowH + padY * 2;
    const pos = {};
    Object.keys(cols).forEach((l) => {
      cols[l].forEach((n, i) => {
        pos[n.skill_id] = { x: padX + Number(l) * colW + colW / 2, y: padY + i * rowH + rowH / 2 };
      });
    });
    const edges = [];
    nodes.forEach((n) => {
      const p = A.preq[n.skill_id];
      (p && p.prerequisite_skill_ids ? p.prerequisite_skill_ids : []).forEach((pr) => {
        if (pos[pr] && pos[n.skill_id]) edges.push(`<path class="map-edge" d="M${pos[pr].x + 46} ${pos[pr].y} C${pos[pr].x + 90} ${pos[pr].y}, ${pos[n.skill_id].x - 90} ${pos[n.skill_id].y}, ${pos[n.skill_id].x - 46} ${pos[n.skill_id].y}"/>`);
      });
    });
    const nodeHtml = nodes.map((n) => {
      const st = Store.skill(d, n.skill_id);
      const lv = Store.masteryOf(d, n.skill_id);
      const p = A.preq[n.skill_id];
      const pres = p ? (p.prerequisite_skill_ids || []) : [];
      const locked = pres.length && pres.every((pr) => Store.masteryOf(d, pr) === 0);
      let fill = "#dbe5f1", stroke = "#b6c4d8", txt = "#64748b";
      if (!locked && st.attempts) {
        if (lv >= 3) { fill = "#d1fae5"; stroke = "#10b981"; txt = "#047857"; }
        else if (lv >= 1) { fill = "#fef3c7"; stroke = "#f59e0b"; txt = "#92600a"; }
        else { fill = "#fdeaea"; stroke = "#ef4444"; txt = "#b91c1c"; }
      } else if (!locked) { fill = "#eaf2ff"; stroke = "#93c5fd"; txt = "#1d4ed8"; }
      const label = n.name.length > 24 ? n.name.slice(0, 23) + "…" : n.name;
      return `<g class="map-node" data-sid="${n.skill_id}" transform="translate(${pos[n.skill_id].x - 46}, ${pos[n.skill_id].y - 20})">
        <rect width="92" height="40" rx="12" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>
        <text x="46" y="25" text-anchor="middle" fill="${txt}">${Util.esc(label)}</text>
      </g>`;
    }).join("");
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">🗺️ Bản đồ kiến thức</h1>
      <p class="sub">Xanh: đã thành thạo · Vàng: đang học · Đỏ: có lỗ hổng · Xám: chưa mở khóa. Bấm vào kỹ năng để xem chi tiết.</p>
      <div class="tabs"><a class="${subject === "MATH" ? "active" : ""}" href="#/map/math">🧮 Toán</a><a class="${subject === "VIETNAMESE" ? "active" : ""}" href="#/map/vie">📖 Tiếng Việt</a></div>
      <div class="map-wrap">
        <svg width="100%" viewBox="0 0 ${W} ${H}" style="min-width:${Math.min(W, 900)}px;display:block;margin:0 auto">
          <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c3d3ea"/></marker></defs>
          ${edges.join("")}${nodeHtml}
        </svg>
      </div>
    `;
    el.querySelectorAll(".map-node").forEach((g) => g.addEventListener("click", () => this.skillDrawer(g.dataset.sid)));
  },

  skillDrawer(sid) {
    const A = Analytics.cache;
    const d = Store.load();
    const s = A.skillMap[sid];
    if (!s) return;
    const st = Store.skill(d, sid);
    const lv = Store.masteryOf(d, sid);
    const p = A.preq[sid];
    const pres = (p && p.prerequisite_skill_ids ? p.prerequisite_skill_ids : []).map((x) => A.skillMap[x]).filter(Boolean);
    const deps = (p && p.dependent_skill_ids ? p.dependent_skill_ids : []).map((x) => A.skillMap[x]).filter(Boolean);
    const acc = Store.accuracy(d, sid);
    const names = (list) => list.map((x) => `<a href="#/map">${Util.esc(x.name)}</a>`).join(" · ") || "—";
    Modal.open(`<div class="drawer-body">
      <h2 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">${VH.subjIcon(s.subject)} ${Util.esc(s.name)}</h2>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0">
        ${VH.masteryBadge(d, sid)}<span class="badge ${s.importance_level}">${s.importance_level === "A" ? "CORE" : s.importance_level === "B" ? "IMPORTANT" : s.importance_level === "C" ? "SUPPORT" : "FAST"} · ${s.importance_score}/100</span>
        ${s.grade3_foundation ? '<span class="badge G3">⚠️ Nền tảng lớp 3</span>' : ""}
      </div>
      <p>${Util.esc(s.description || "")}</p>
      <div class="lab">Mức thành thạo hiện tại</div>
      <p><b>M${lv} — ${Util.esc(Store.masteryName(lv))}</b>${acc != null ? ` · Độ chính xác ${acc}%` : ""}</p>
      <div class="lab">Kiến thức tiên quyết</div><p>${names(pres)}</p>
      <div class="lab">Kỹ năng phụ thuộc</div><p>${names(deps)}</p>
      <div class="lab">Thống kê luyện tập</div>
      <p>Đã làm ${st.attempts || 0} câu · đúng ${st.correct || 0} · chuỗi đúng ${st.streak || 0}${st.nextReview ? ` · ôn tiếp theo: ${st.nextReview}` : ""}</p>
      <div class="lab">Nguồn SGK</div>
      <p class="small muted">${(s.source_refs || []).map((r) => Util.esc(Util.refLabel(r))).join("<br>") || "—"}</p>
      <div class="btn-row"><a class="btn" href="#/hoc/skill/${sid}">🎓 HỌC</a><a class="btn purple" href="#/onluyen">🧠 ÔN</a><button class="btn ghost" id="closeDrawer">Đóng</button></div>
    </div>`);
    document.getElementById("closeDrawer").addEventListener("click", Modal.close);
  },

  async tiendo(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const mS = Analytics.subjectStats(d, "MATH");
    const vS = Analytics.subjectStats(d, "VIETNAMESE");
    const ld = Analytics.lessonsDone(d);
    const studied = Object.keys(d.skills || {}).filter((k) => d.skills[k].attempts).length;
    const mastered = mS.mastered + vS.mastered;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const t = new Date(Date.now() - i * 86400000);
      const key = Store.dateKey(t.getTime());
      const a = d.activity[key] || { attempts: 0, correct: 0 };
      days.push({ key, label: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][t.getDay()], ...a });
    }
    const maxA = Math.max(1, ...days.map((x) => x.attempts));
    const xp = Store.xp(d);
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">📊 Tiến độ</h1>
      <p class="sub">Tiến độ được tính từ mức độ thành thạo kỹ năng (mastery), không phải số trang đã lật.</p>
      <div class="grid cols-2">
        <div class="card">
          <h3>🧮 Toán</h3>
          <div class="subj-progress"><div class="sp-head"><span>${mS.mastered}/${mS.total} kỹ năng thành thạo</span><b>${mS.pct}%</b></div><div class="progress"><span style="width:${mS.pct}%"></span></div></div>
          <p class="small muted">${mS.studying} đang luyện · ${mS.weak} cần củng cố · ${mS.total - mS.mastered - mS.studying - mS.weak} chưa học</p>
        </div>
        <div class="card">
          <h3>📖 Tiếng Việt</h3>
          <div class="subj-progress"><div class="sp-head"><span>${vS.mastered}/${vS.total} kỹ năng thành thạo</span><b>${vS.pct}%</b></div><div class="progress pink"><span style="width:${vS.pct}%"></span></div></div>
          <p class="small muted">${vS.studying} đang luyện · ${vS.weak} cần củng cố · ${vS.total - vS.mastered - vS.studying - vS.weak} chưa học</p>
        </div>
      </div>
      <div class="grid cols-4" style="margin-top:16px">
        <div class="card stat-card"><span class="s-ico">✅</span><span><b>${ld.done}/${ld.total}</b><small>bài đã hoàn thành (M2+)</small></span></div>
        <div class="card stat-card"><span class="s-ico">⭐</span><span><b>${studied}</b><small>kỹ năng đã học</small></span></div>
        <div class="card stat-card"><span class="s-ico">🏆</span><span><b>${mastered}</b><small>kỹ năng thành thạo</small></span></div>
        <div class="card stat-card"><span class="s-ico">🔥</span><span><b>${Store.streak(d)}</b><small>ngày học liên tục</small></span></div>
      </div>
      <section class="section"><h2>📅 Hoạt động 7 ngày qua</h2>
        <div class="card">
          <div style="display:flex;gap:14px;align-items:flex-end;height:150px">
            ${days.map((x) => `<div style="flex:1;text-align:center">
              <div style="height:110px;display:flex;align-items:flex-end;justify-content:center;gap:4px">
                <div style="width:40%;max-width:34px;background:linear-gradient(180deg,#3b82f6,#60a5fa);border-radius:8px 8px 0 0;height:${Math.round(x.attempts / maxA * 100)}%"></div>
              </div>
              <small class="muted">${x.label}</small><br><small class="muted">${x.attempts} câu</small>
            </div>`).join("")}
          </div>
        </div>
      </section>
      <section class="section"><h2>📝 Lịch sử kiểm tra</h2>
        <div class="card">
          ${(d.tests || []).length ? (d.tests || []).map((t) => `<div class="sum-row"><span>${Util.esc(t.label)}</span><span>${t.correct}/${t.total} · ${t.pct}%</span><span class="muted small">${Util.esc(t.date)}</span></div>`).join("") : '<p class="muted">Chưa làm bài kiểm tra nào.</p>'}
        </div>
      </section>
    `;
  },

  async mastery(el) {
    const seg = location.hash.replace(/^#\/?/, "").split("/");
    const subj = seg[1] === "vie" ? "VIETNAMESE" : seg[1] === "math" ? "MATH" : null;
    const A = await Analytics.all();
    const d = Store.load();
    const dist = Analytics.masteryDist(d, subj);
    const list = A.skills.filter((s) => !subj || s.subject === subj);
    const byLevel = [0, 1, 2, 3, 4].map((lv) => list.filter((s) => Store.masteryOf(d, s.skill_id) === lv));
    const colors = ["#94a3b8", "#f97316", "#f59e0b", "#10b981", "#8b5cf6"];
    const icons = ["🔴", "🟠", "🟡", "🟢", "💎"];
    const names = ["Chưa biết", "Cần hướng dẫn", "Làm được, chưa ổn định", "Thành thạo", "Thành thạo & giải thích được"];
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">🎯 Mastery</h1>
      <p class="sub">5 mức thành thạo từng kỹ năng — trẻ chỉ chuyển bài mới khi đã thực sự làm chủ.</p>
      <div class="tabs"><a class="${!subj ? "active" : ""}" href="#/mastery">Tất cả</a><a class="${subj === "MATH" ? "active" : ""}" href="#/mastery/math">🧮 Toán</a><a class="${subj === "VIETNAMESE" ? "active" : ""}" href="#/mastery/vie">📖 Tiếng Việt</a></div>
      <div class="card"><div class="donut-wrap">
        ${VH.donut(dist, 170)}
        <div class="legend">${[0, 1, 2, 3, 4].map((lv) => `<span class="lg"><span class="dot2" style="background:${colors[lv]}"></span>${icons[lv]} M${lv} ${names[lv]} — <b>${dist[lv]}</b></span>`).join("")}</div>
      </div></div>
      ${[4, 3, 2, 1, 0].map((lv) => `
        <section class="section" style="margin-top:22px"><h2 style="font-size:1.08rem">${icons[lv]} M${lv} — ${names[lv]} <span class="badge mastery${lv}">${byLevel[lv].length} kỹ năng</span></h2>
          <div class="card">
            ${byLevel[lv].length ? byLevel[lv].slice(0, 14).map((s) => `<div class="skill-mini"><span class="nm">${VH.subjIcon(s.subject)} ${Util.esc(s.name)}</span>${A.coreSet.has(s.skill_id) ? '<span class="badge CORE">CORE</span>' : ""}<a class="btn small ghost" href="#/hoc/skill/${s.skill_id}">${lv >= 3 ? "Ôn" : "Học"}</a></div>`).join("") : '<p class="muted">Không có kỹ năng nào ở mức này.</p>'}
          </div>
        </section>`).join("")}
    `;
  },

  async lichon(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const today = Store.todayKey();
    const byDate = {};
    A.skills.forEach((s) => {
      const st = Store.skill(d, s.skill_id);
      if (st.nextReview) (byDate[st.nextReview] = byDate[st.nextReview] || []).push(s);
    });
    const days = [];
    for (let i = 0; i < 14; i++) {
      const t = new Date(Date.now() + i * 86400000);
      const key = Store.dateKey(t.getTime());
      days.push({ key, dow: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][t.getDay()], day: t.getDate(), month: t.getMonth() + 1, items: byDate[key] || [] });
    }
    const dueToday = days[0].items.length;
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">📅 Lịch ôn thông minh</h1>
      <p class="sub">Sau mỗi lần học, hệ thống xếp lịch ôn lại theo khoảng cách tăng dần (1 → 3 → 7 → 14 → 30 ngày) để trí nhớ bền vững.</p>
      <div class="plan-sum" style="margin-bottom:16px"><span>☀️ HÔM NAY:</span><span>${dueToday} kỹ năng đến hạn</span><span>⏱️ Khoảng ${dueToday * 4} phút</span></div>
      <div class="cal-grid">
        ${days.map((x) => `<div class="cal-day ${x.key === today ? "today" : ""}">
          <div class="cd-head">${x.dow} ${x.day}/${x.month} ${x.key === today ? "· Hôm nay" : ""}</div>
          ${x.items.length ? x.items.slice(0, 4).map((s) => `<a class="cal-item ${s.subject === "MATH" ? "math" : ""}" href="#/hoc/skill/${s.skill_id}" title="${Util.esc(s.name)}">${s.subject === "MATH" ? "🧮" : "📖"} ${Util.esc(s.name)}</a>`).join("") : '<span class="muted small">—</span>'}
          ${x.items.length > 4 ? `<span class="muted small">+${x.items.length - 4} nữa</span>` : ""}
        </div>`).join("")}
      </div>
      <section class="section"><h2>💡 Cách lịch hoạt động</h2>
        <div class="card"><p class="muted">Kỹ năng vừa học → ôn sau 1 ngày. Nếu nhớ tốt → 3 ngày → 7 ngày → 14 ngày → 30 ngày. Nếu quên → quay lại khoảng cách ngắn hơn. Kỹ năng CORE luôn được kiểm tra định kỳ ngay cả khi đã đạt M4.</p></div>
      </section>
    `;
  },

  async loi(el) {
    const A = await Analytics.all();
    const d = Store.load();
    let tax = null;
    try { tax = await App.fetchJSON("data/rules/error_taxonomy.json"); } catch (e) {}
    const entries = Object.keys(d.errors || {}).map((tag) => {
      let name = tag, action = "";
      if (tax && tax.subjects) {
        const found = (tax.subjects.MATH && tax.subjects.MATH.errors || []).concat(tax.subjects.VIETNAMESE ? tax.subjects.VIETNAMESE.errors : []).find((x) => x.error_id === tag);
        if (found) { name = found.error_name; action = found.recommended_action; }
      }
      return { tag, count: d.errors[tag], name, action };
    }).sort((a, b) => b.count - a.count);
    const weakSkills = A.skills.map((s) => {
      const st = Store.skill(d, s.skill_id);
      if (!st.attempts) return null;
      const acc = Store.accuracy(d, s.skill_id);
      return { s, acc, err: st.attempts - (st.correct || 0) };
    }).filter(Boolean).sort((a, b) => (a.acc - b.acc) || (b.err - a.err)).slice(0, 8);
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">⚠️ Phân tích lỗi</h1>
      <p class="sub">Mỗi lỗi sai là một tín hiệu để dạy lại đúng chỗ — không chỉ chấm đúng/sai.</p>
      <section class="section" style="margin-top:8px"><h2>🧩 Các kiểu lỗi thường gặp</h2>
        <div class="card">
          ${entries.length ? entries.map((e) => `<div class="risk-row">
            <span class="risk-num" style="color:var(--red)">${e.count}</span>
            <span style="flex:1;min-width:0"><b>${Util.esc(e.name)}</b><small>${Util.esc(e.action || "Luyện lại dạng bài liên quan.")}</small></span>
            <span class="badge" style="background:var(--red-soft);color:#b91c1c">${Util.esc(e.tag)}</span>
          </div>`).join("") : '<p class="muted">Chưa ghi nhận lỗi nào — hệ thống sẽ phân tích khi bé làm bài.</p>'}
        </div>
      </section>
      <section class="section"><h2>📉 Kỹ năng cần chú ý (độ chính xác thấp nhất)</h2>
        <div class="card">
          ${weakSkills.length ? weakSkills.map((w) => `<div class="risk-row">
            <span class="risk-num" style="color:${w.acc >= 60 ? "var(--green)" : "var(--orange)"}">${w.acc}%</span>
            <span style="flex:1;min-width:0"><b>${VH.subjIcon(w.s.subject)} ${Util.esc(w.s.name)}</b><small>Sai ${w.err} lần / ${Store.skill(d, w.s.skill_id).attempts} câu</small></span>
            <a class="btn small orange" href="#/hoc/skill/${w.s.skill_id}">ÔN NGAY</a>
          </div>`).join("") : '<p class="muted">Chưa có dữ liệu luyện tập.</p>'}
        </div>
      </section>
    `;
  },

  async thanhtich(el, asModal) {
    const A = await Analytics.all();
    const d = Store.load();
    const xp = Store.xp(d);
    const lv = Store.level(xp);
    const lvP = Store.levelProgress(xp);
    const ach = Analytics.achievements(d);
    const earned = ach.filter((a) => a.got).length;
    const html = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">🏆 Thành tích</h1>
      <p class="sub">Học giống một trò chơi — nhưng vẫn nghiêm túc về giáo dục.</p>
      <div class="card" style="background:linear-gradient(120deg,#fef5e0,#fff7ed);border:0">
        <h2>⭐ Cấp ${lv} — ${Util.fmt(xp)} XP</h2>
        <div class="progress orange"><span style="width:${lvP}%"></span></div>
        <p class="small muted">${Util.fmt(Math.pow(lv, 2) * 120 - xp)} XP nữa để lên cấp ${lv + 1} · Đã mở ${earned}/${ach.length} phần thưởng</p>
      </div>
      <div class="badge-grid" style="margin-top:18px">
        ${ach.map((a) => `<div class="ach-card ${a.got ? "" : "locked"}"><span class="a-ico">${a.icon}</span><b>${Util.esc(a.name)}</b><small>${Util.esc(a.desc)}</small><br><span class="badge ${a.got ? "mastery3" : "mastery0"}">${a.got ? "Đã đạt" : "Chưa mở"}</span></div>`).join("")}
      </div>
    `;
    if (asModal) Modal.open(html);
    else el.innerHTML = html;
  },

  async must(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const col = (subject) => A.core.filter((c) => c.subject === subject).map((c) => {
      const s = A.skillMap[c.skill_id];
      return `<div class="skill-mini">
        <span class="nm"><b>${Util.esc(c.name)}</b>${c.importance_level === "A" ? ' <span class="badge CORE">🔥 CORE</span>' : ""}${c.grade3_foundation ? ' <span class="badge G3">⚠️ Nền lớp 3</span>' : ""}</span>
        ${VH.masteryBadge(d, c.skill_id)}
        <a class="btn small ${Store.masteryOf(d, c.skill_id) >= 3 ? "ghost" : ""}" href="#/hoc/skill/${c.skill_id}">${Store.masteryOf(d, c.skill_id) >= 3 ? "Ôn" : "Học"}</a>
      </div>`;
    }).join("");
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">🏆 MUST MASTER — Những kỹ năng bắt buộc phải thành thạo</h1>
      <p class="sub">Top 20% kỹ năng tạo ra 80% năng lực. Kỹ năng nền tảng lớp 3 bắt buộc đạt tối thiểu M3 trước khi hoàn thành chương trình lớp 2.</p>
      <div class="grid cols-2">
        <div class="card"><h2>🧮 TOÁN (${A.core.filter((c) => c.subject === "MATH").length})</h2>${col("MATH")}</div>
        <div class="card"><h2>📖 TIẾNG VIỆT (${A.core.filter((c) => c.subject === "VIETNAMESE").length})</h2>${col("VIETNAMESE")}</div>
      </div>
    `;
  },

  async baocao(el) {
    const A = await Analytics.all();
    const d = Store.load();
    const mS = Analytics.subjectStats(d, "MATH");
    const vS = Analytics.subjectStats(d, "VIETNAMESE");
    const risks = Analytics.riskList(d);
    const streak = Store.streak(d);
    const studied = Object.keys(d.skills || {}).filter((k) => d.skills[k].attempts).length;
    const totalAttempts = Object.values(d.skills || {}).reduce((a, s) => a + (s.attempts || 0), 0);
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">👨‍👩‍👦 Báo cáo phụ huynh</h1>
      <p class="sub">Tóm tắt dễ đọc cho cha mẹ — cập nhật theo hoạt động học của bé trên thiết bị này.</p>
      <div class="grid cols-4">
        <div class="card stat-card"><span class="s-ico">🧮</span><span><b>${mS.pct}%</b><small>Toán thành thạo</small></span></div>
        <div class="card stat-card"><span class="s-ico">📖</span><span><b>${vS.pct}%</b><small>Tiếng Việt thành thạo</small></span></div>
        <div class="card stat-card"><span class="s-ico">🔥</span><span><b>${streak} ngày</b><small>học liên tục</small></span></div>
        <div class="card stat-card"><span class="s-ico">✏️</span><span><b>${totalAttempts}</b><small>câu đã luyện (${studied} kỹ năng)</small></span></div>
      </div>
      <div class="grid cols-2" style="margin-top:16px">
        <div class="card">
          <h2>🧮 Toán</h2>
          <table class="tbl"><tr><th>Chỉ số</th><th>Giá trị</th></tr>
            <tr><td>Kỹ năng thành thạo (M3+)</td><td><b>${mS.mastered}/${mS.total}</b></td></tr>
            <tr><td>Đang luyện</td><td>${mS.studying}</td></tr>
            <tr><td>Cần củng cố</td><td>${mS.weak}</td></tr>
          </table>
        </div>
        <div class="card">
          <h2>📖 Tiếng Việt</h2>
          <table class="tbl"><tr><th>Chỉ số</th><th>Giá trị</th></tr>
            <tr><td>Kỹ năng thành thạo (M3+)</td><td><b>${vS.mastered}/${vS.total}</b></td></tr>
            <tr><td>Đang luyện</td><td>${vS.studying}</td></tr>
            <tr><td>Cần củng cố</td><td>${vS.weak}</td></tr>
          </table>
        </div>
      </div>
      <section class="section"><h2>⚠️ Những kỹ năng cần quan tâm</h2>
        <div class="card">
          ${risks.length ? risks.slice(0, 5).map((r) => {
            const b = Store.band(r.risk);
            return `<div class="risk-row"><span class="risk-num" style="color:${b.color === "red" ? "#ef4444" : "#f97316"}">${r.risk}</span><span style="flex:1;min-width:0"><b>${VH.subjIcon(r.s.subject)} ${Util.esc(r.s.name)}</b><small>${b.label}${r.s.grade3_foundation ? " · nền tảng lớp 3" : ""}${A.coreSet.has(r.s.skill_id) ? " · kỹ năng CORE" : ""}</small></span><a class="btn small orange" href="#/hoc/skill/${r.s.skill_id}">Xem</a></div>`;
          }).join("") : '<p class="muted">Chưa có kỹ năng nào ở mức rủi ro.</p>'}
        </div>
      </section>
      <section class="section"><h2>📌 Lưu ý</h2>
        <div class="card"><p class="muted">• Dữ liệu học được lưu riêng trên trình duyệt (localStorage), không gửi lên máy chủ.<br>• Đề bài tập là bài mới do AI đề xuất tương đương dạng SGK — không sao chép nguyên văn sách.<br>• Để theo dõi đồng bộ nhiều thiết bị, cần bước phát triển tiếp theo là tài khoản + máy chủ đồng bộ.</p></div>
      </section>
    `;
  },

  async caidat(el) {
    const d = Store.load();
    const p = d.profile || {};
    const avatars = ["👦", "👧", "🧒", "🐱", "🦁", "🐰", "🐼", "🦊"];
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">⚙️ Cài đặt</h1>
      <p class="sub">Hồ sơ bé và dữ liệu học tập.</p>
      <div class="grid cols-2">
        <div class="card">
          <h2>👤 Hồ sơ học sinh</h2>
          <div class="btn-row" style="margin-top:4px">${avatars.map((a) => `<button class="icon-btn avatar-pick" data-av="${a}" style="width:46px;height:46px;font-size:22px;${a === p.avatar ? "border:2px solid var(--blue)" : ""}">${a}</button>`).join("")}</div>
          <div class="btn-row" style="align-items:end">
            <div style="flex:1"><label class="muted small">Tên bé</label><input id="pName" class="answer-input" style="font-size:1rem;padding:10px 14px" value="${Util.esc(p.name || "Bé Minh")}"></div>
            <div style="flex:1"><label class="muted small">Lớp</label><input id="pCls" class="answer-input" style="font-size:1rem;padding:10px 14px" value="${Util.esc(p.cls || "Lớp 2A")}"></div>
          </div>
          <div class="btn-row"><button class="btn" id="saveProfile">💾 Lưu hồ sơ</button></div>
        </div>
        <div class="card">
          <h2>💾 Dữ liệu học tập</h2>
          <p class="muted">Tiến độ, XP, chuỗi ngày học, lịch sử kiểm tra được lưu riêng trên trình duyệt này.</p>
          <div class="btn-row"><button class="btn orange" id="resetData">🗑️ Xóa toàn bộ tiến độ</button></div>
        </div>
      </div>
      <section class="section"><h2>📚 Về nội dung</h2>
        <div class="card">
          <p class="muted">• Nền tảng dữ liệu: quét OCR đầy đủ <b>576 trang</b> của 4 bộ SGK (Toán 2 T1/T2, Tiếng Việt 2 T1/T2 — Bộ Kết nối tri thức với cuộc sống).<br>• <b>118 kỹ năng</b> chuẩn hóa (64 Toán + 54 Tiếng Việt), 24 kỹ năng CORE (top 20%), đồ thị tiên quyết 2 chiều.<br>• Mọi kỹ năng đều có <b>source_refs</b> truy về sách/tập/bài/trang PDF/trang in.<br>• Bài tập và đề kiểm tra là bài mới do AI đề xuất tương đương dạng SGK — không phải nội dung nguyên bản SGK.</p>
          <div class="btn-row"><a class="btn ghost" href="data/docs/README.md" target="_blank">📄 Xem README dataset</a><a class="btn ghost" href="https://github.com/QuocBaoLabs/lop2-mastery" target="_blank">🐙 Mã nguồn GitHub</a></div>
        </div>
      </section>
    `;
    el.querySelectorAll(".avatar-pick").forEach((b) => b.addEventListener("click", () => {
      el.querySelectorAll(".avatar-pick").forEach((x) => x.style.border = "1px solid var(--line)");
      b.style.border = "2px solid var(--blue)";
      b.dataset.picked = "1";
    }));
    el.querySelector("#saveProfile").addEventListener("click", () => {
      const nd = Store.load();
      const picked = el.querySelector(".avatar-pick[data-picked]");
      nd.profile = {
        name: el.querySelector("#pName").value.trim() || "Bé Minh",
        cls: el.querySelector("#pCls").value.trim() || "Lớp 2A",
        avatar: picked ? picked.dataset.av : (p.avatar || "👦"),
      };
      Store.save(nd);
      App.refreshTopbar();
      alert("Đã lưu hồ sơ! 🎉");
    });
    el.querySelector("#resetData").addEventListener("click", () => {
      if (confirm("Xóa toàn bộ tiến độ học đã lưu trên trình duyệt này?")) { Store.reset(); location.hash = "#/"; location.reload(); }
    });
  },
};

Object.assign(App.routes, {
  home: (el) => Views.home(el),
  hoc: (el) => Views.hoc(el),
  toan: (el) => Views.toan(el),
  tiengviet: (el) => Views.tiengviet(el),
  onluyen: (el) => Views.onluyen(el),
  baitap: (el) => Views.baitap(el),
  kiemtra: (el) => Views.kiemtra(el),
  map: (el) => Views.map(el),
  tiendo: (el) => Views.tiendo(el),
  mastery: (el) => Views.mastery(el),
  lichon: (el) => Views.lichon(el),
  loi: (el) => Views.loi(el),
  thanhtich: (el) => Views.thanhtich(el, false),
  must: (el) => Views.must(el),
  baocao: (el) => Views.baocao(el),
  caidat: (el) => Views.caidat(el),
});
