/* LỚP 2 MASTERY — study flow, practice engine, tests */
"use strict";

const Learn = {
  norm(s) {
    return String(s == null ? "" : s).normalize("NFC").toLowerCase().trim()
      .replace(/[.!?…]+$/g, "").replace(/\s+/g, " ").replace(/^["'“”]+|["'“”]+$/g, "");
  },
  parts(s) { return String(s).split(/[;\n]/).map((x) => this.norm(x)).filter(Boolean); },
  checkAnswer(expected, given) {
    const exp = this.parts(expected);
    const got = String(given == null ? "" : given).split(/[\s,;]+/).map((x) => this.norm(x)).filter(Boolean);
    if (exp.length > 1) {
      if (got.length !== exp.length) return false;
      const a = [...exp].sort(), b = [...got].sort();
      return a.every((v, i) => v === b[i]);
    }
    if (got.length === 1) return got[0] === exp[0];
    return this.norm(String(given).replace(/[;,\s]+/g, " ")) === exp[0];
  },
  isSelfCheck(q) {
    const t = this.norm(q.question || "");
    if (/^(đọc|nói|kể|nghe|hát|thuộc|chính tả|nghe viết|nghe - viết|kể chuyện)/.test(t)) return true;
    if (/(chính tả|đọc to|đọc thuộc|kể lại|nói thành câu|nghe - viết|tập đọc)/.test(t)) return true;
    const a = this.norm(q.answer || "");
    if (a.length > 40) return true;
    if (/[^0-9a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ\s.,;'"/-]/.test(a)) return true;
    return false;
  },
  shuffle(a) {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  },
  subjOf(sid) { return sid.indexOf("MATH_") === 0 ? "MATH" : "VIETNAMESE"; },
  errTag(q) { return (q.error_tags || [])[0] || null; },

  /* ============ màn hình LÀM BÀI / kiểm tra: 1 câu hỏi ============ */
  renderQuestion(el, ctx) {
    const q = ctx.items[ctx.idx];
    const skill = ctx.skillMap[q.skill_id] || {};
    const subj = this.subjOf(q.skill_id);
    const self = this.isSelfCheck(q);
    const lv = Store.masteryOf(ctx.d, q.skill_id);
    const pct = ctx.items.length ? Math.round(ctx.idx / ctx.items.length * 100) : 0;
    const title = ctx.title || "Luyện tập";
    el.innerHTML = `
      <div class="card quiz-card">
        <div class="quiz-top">
          <span class="quiz-counter">${Util.esc(title)} · Câu ${ctx.idx + 1} / ${ctx.items.length}</span>
          <span class="quiz-skill">${VH.masteryBadge(ctx.d, q.skill_id)} <b>${Util.esc(skill.name || q.skill_id)}</b></span>
        </div>
        <div class="progress"><span style="width:${pct}%"></span></div>
        <div class="quiz-q">${Util.esc(q.question)}</div>
        <div class="muted small">${Util.esc(q.note || "AI đề xuất – không phải nội dung nguyên bản SGK")}</div>
        ${self ? `
          <div class="btn-row">
            <button class="btn green" id="selfOk">✅ Con đã làm đúng</button>
            <button class="btn ghost" id="selfNo">🔄 Con cần luyện thêm</button>
          </div>` : `
          <div class="answer-row">
            <input id="ansInput" class="answer-input" placeholder="Nhập đáp án…" autocomplete="off">
            <button class="btn" id="checkBtn">KIỂM TRA</button>
          </div>
          <div id="retryZone" hidden></div>`}
        <div class="feedback" id="fb" hidden></div>
        <div class="btn-row" id="nextRow" hidden>
          <button class="btn" id="nextBtn">${ctx.idx + 1 < ctx.items.length ? "Câu tiếp theo →" : "Xem kết quả 🏁"}</button>
        </div>
      </div>`;
    const fb = el.querySelector("#fb");
    const nextRow = el.querySelector("#nextRow");
    const done = (ok, detail, xpAward) => {
      ctx.results.push({ q, ok });
      if (ok && xpAward) {
        const r = el.querySelector(".quiz-card").getBoundingClientRect();
        Confetti.burst(r.left + r.width / 2, r.top + 60, 50);
      }
      fb.innerHTML = detail;
      fb.className = "feedback " + (ok ? "ok" : "no");
      fb.hidden = false;
      nextRow.hidden = false;
      App.refreshTopbar();
    };
    const answerSample = (extra) => `<div class="muted small" style="margin-top:8px">Đáp án mẫu: <b>${Util.esc(q.answer || "")}</b>${q.hint ? "<br>💡 " + Util.esc(q.hint) : ""}${extra || ""}</div>`;
    if (self) {
      el.querySelector("#selfOk").addEventListener("click", () => {
        Store.recordSelf(ctx.d, q.skill_id, true);
        done(true, `🎉 Ghi nhận hoàn thành! +5 XP<small class="muted" style="display:block;margin-top:6px">Chuẩn cần đạt: <b>${Util.esc(q.answer || "")}</b>${q.hint ? "<br>💡 " + Util.esc(q.hint) : ""}</small>`, true);
      });
      el.querySelector("#selfNo").addEventListener("click", () => {
        Store.recordSelf(ctx.d, q.skill_id, false);
        done(false, `Con luyện thêm nhé.${answerSample()}`);
      });
    } else {
      const input = el.querySelector("#ansInput");
      const checkBtn = el.querySelector("#checkBtn");
      let tries = 0, usedHint = false;
      const retryZone = el.querySelector("#retryZone");
      const doCheck = () => {
        if (input.disabled) return;
        const ok = this.checkAnswer(q.answer, input.value);
        tries++;
        if (ok) {
          Store.record(ctx.d, q.skill_id, true, null);
          const st = Store.skill(ctx.d, q.skill_id);
          input.disabled = true; checkBtn.disabled = true;
          done(true, `✅ Chính xác! <b>+10 XP</b> ⭐<small class="muted" style="display:block;margin-top:6px">${st.correct} câu đúng · chuỗi ${st.streak} · Mức thành thạo M${Store.masteryLvl(st)} — ${Util.esc(Store.masteryName(Store.masteryLvl(st)))}</small>${usedHint ? '<small class="muted" style="display:block">(đã dùng gợi ý)</small>' : ""}`, true);
        } else if (tries === 1) {
          Store.record(ctx.d, q.skill_id, false, this.errTag(q));
          fb.innerHTML = `Chưa đúng rồi, mình thử xem lại nhé. 🤗`;
          fb.className = "feedback no";
          fb.hidden = false;
          retryZone.hidden = false;
          retryZone.innerHTML = `<div class="btn-row" style="margin-top:8px">
            <button class="btn ghost small" id="hintBtn">💡 XEM GỢI Ý</button>
            <span class="muted small">hoặc nhập lại đáp án khác</span>
          </div><div class="hint" id="hintBox" hidden>${Util.esc(q.hint || "Đọc kỹ đề và thử lại từng bước nhé.")}</div>`;
          const hb = retryZone.querySelector("#hintBtn");
          hb.addEventListener("click", () => { retryZone.querySelector("#hintBox").hidden = false; hb.hidden = true; usedHint = true; });
          input.select();
        } else {
          Store.record(ctx.d, q.skill_id, false, this.errTag(q));
          input.disabled = true; checkBtn.disabled = true;
          done(false, `Đáp án đúng là <b>${Util.esc(q.answer || "")}</b>.${q.hint ? `<br>💡 Cách làm: ${Util.esc(q.hint)}` : ""}<div class="muted small" style="margin-top:8px">Sai không sao cả — hệ thống đã ghi nhớ để ôn lại đúng chỗ.</div>`);
        }
      };
      checkBtn.addEventListener("click", doCheck);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") doCheck(); });
      setTimeout(() => input.focus(), 60);
    }
    el.querySelector("#nextBtn").addEventListener("click", () => {
      ctx.idx++;
      if (ctx.idx < ctx.items.length) this.renderQuestion(el, ctx);
      else ctx.onDone(el, ctx);
    });
  },

  /* ============ BÀI TẬP theo bài học ============ */
  async lessonPractice(el, bookId, lessonNo) {
    const subject = bookId.startsWith("math") ? "MATH" : "VIETNAMESE";
    const curFile = subject === "MATH" ? "data/curriculum/math.json" : "data/curriculum/vietnamese.json";
    const dgFile = subject === "MATH" ? "data/assessment/diagnostic_math.json" : "data/assessment/diagnostic_vietnamese.json";
    const finFile = subject === "MATH" ? "data/assessment/final_math.json" : "data/assessment/final_vietnamese.json";
    const [A, cur, dg, fin] = await Promise.all([
      Analytics.all(),
      App.fetchJSON(curFile),
      App.fetchJSON(dgFile).catch(() => null),
      App.fetchJSON(finFile).catch(() => null),
    ]);
    let lesson = null, unitName = "";
    for (const t of cur.topics || []) {
      if (App.bookFor(t.topic_id) !== bookId) continue;
      for (const u of t.units || []) for (const l of u.lessons || []) {
        if (l.lesson_no === lessonNo) { lesson = l; unitName = u.name; }
      }
    }
    if (!lesson) { el.innerHTML = `<div class="notice">Không tìm thấy bài học.</div><div class="btn-row"><a class="btn ghost" href="#/baitap">← Chọn bài khác</a></div>`; return; }
    const sids = lesson.skills || [];
    const pool = [];
    (A.examples || []).forEach((x) => { if (sids.includes(x.skill_id)) pool.push(Object.assign({}, x)); });
    [dg, fin].forEach((a) => (a && a.questions ? a.questions : []).forEach((q) => { if (sids.includes(q.skill_id)) pool.push(Object.assign({}, q)); }));
    const items = this.shuffle(pool).slice(0, 12);
    const d = Store.load();
    const ctx = {
      items, idx: 0, results: [], d, skillMap: A.skillMap,
      title: `Bài ${lessonNo}. ${lesson.name}`,
      onDone: (box, c) => this.practiceSummary(box, c, { bookId, lessonNo, subject, unitName, lessonName: lesson.name }),
    };
    el.innerHTML = `<p><a href="#/baitap">← Chọn bài khác</a></p>
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 4px">✏️ ${Util.esc(lesson.name)}</h1>
      <p class="muted" style="margin:0 0 18px">${Util.esc(unitName)} · ${sids.length} kỹ năng · mỗi câu đúng +10 XP ⭐${items.length ? "" : " · bài này chưa có câu luyện tập sinh sẵn"}</p>`;
    if (!items.length) {
      el.innerHTML += `<div class="notice">Bài này chưa có câu luyện tập trong dataset — hãy dùng chế độ Học ngay để khám phá kỹ năng.</div><div class="btn-row"><a class="btn ghost" href="#/hoc">🎓 Học ngay</a></div>`;
      return;
    }
    const qBox = document.createElement("div");
    el.appendChild(qBox);
    this.renderQuestion(qBox, ctx);
  },

  practiceSummary(el, ctx, info) {
    const correct = ctx.results.filter((r) => r.ok).length;
    const total = ctx.results.length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    if (pct >= 80) Confetti.center(90);
    const bySkill = {};
    ctx.results.forEach((r) => {
      const sid = r.q.skill_id;
      bySkill[sid] = bySkill[sid] || { ok: 0, n: 0 };
      bySkill[sid].n++;
      if (r.ok) bySkill[sid].ok++;
    });
    el.innerHTML = `
      <div class="card quiz-card">
        <div class="quiz-top"><span class="quiz-counter">🏁 Kết quả · ${Util.esc(info.lessonName)}</span><span class="badge ${pct >= 80 ? "mastery3" : "mastery2"}">${pct}%</span></div>
        <div class="quiz-q" style="font-size:1.6rem">${correct} / ${total} đúng</div>
        <p>${pct >= 80 ? "Tuyệt vời! Bài này con nắm rất chắc. 🎉" : pct >= 60 ? "Khá tốt! Luyện lại các câu sai là hoàn hảo." : "Hãy học lại kỹ năng trong bài rồi luyện thêm lần nữa — chậm mà chắc. 💪"}</p>
        <div class="sum-list">
          ${Object.keys(bySkill).map((sid) => `<div class="sum-row"><span>${Util.esc((ctx.skillMap[sid] || {}).name || sid)}</span><span>${bySkill[sid].ok}/${bySkill[sid].n} đúng</span>${VH.masteryBadge(ctx.d, sid)}</div>`).join("")}
        </div>
        <div class="btn-row">
          <button class="btn" id="againBtn">🔄 Làm lại</button>
          <a class="btn ghost" href="#/hoc/${info.subject === "MATH" ? "math" : "vie"}">🎓 Học thêm</a>
          <a class="btn ghost" href="#/baitap">Chọn bài khác</a>
        </div>
      </div>`;
    el.querySelector("#againBtn").addEventListener("click", () => {
      ctx.idx = 0; ctx.results = [];
      this.renderQuestion(el, ctx);
    });
  },

  /* ============ HỌC NGAY — flow 8 bước cho 1 kỹ năng ============ */
  async study(el, sid) {
    const A = await Analytics.all();
    const s = A.skillMap[sid];
    if (!s) { el.innerHTML = `<div class="notice">Không tìm thấy kỹ năng ${Util.esc(sid)}.</div>`; return; }
    const subject = s.subject;
    const d = Store.load();
    const exAll = (A.examples || []).filter((x) => x.skill_id === sid);
    const practice = exAll.filter((x) => x.kind !== "MASTERY_CHECK");
    const checks = exAll.filter((x) => x.kind === "MASTERY_CHECK");
    let ass = [];
    const dgFile = subject === "MATH" ? "data/assessment/diagnostic_math.json" : "data/assessment/diagnostic_vietnamese.json";
    const finFile = subject === "MATH" ? "data/assessment/final_math.json" : "data/assessment/final_vietnamese.json";
    try {
      const [dg, fin] = await Promise.all([App.fetchJSON(dgFile), App.fetchJSON(finFile)]);
      ass = (dg.questions || []).concat(fin.questions || []).filter((q) => q.skill_id === sid);
    } catch (e) {}
    const STEPS = ["Ôn nhanh", "Kiến thức mới", "Ví dụ", "Tự làm", "Hiểu bản chất", "Mastery Check", "Kết quả"];
    const ctx = {
      sid, s, subject, d, A,
      step: 0, results: [], usedHint: false, whyOk: false,
      practice: this.shuffle(practice).slice(0, 3),
      checks: this.shuffle(checks.concat(ass)).slice(0, 5),
    };
    const box = document.createElement("div");
    el.innerHTML = `<p><a href="#/hoc">← Học ngay</a></p>`;
    el.appendChild(box);
    const render = () => this.studyStep(box, ctx, STEPS);
    render();
  },

  studyStep(el, ctx, STEPS) {
    const s = ctx.s;
    const stepsHtml = STEPS.map((st, i) => `<div class="step-dot ${i < ctx.step ? "done" : i === ctx.step ? "now" : ""}"><div class="sd"></div><span>${st}</span></div>`).join("");
    const nextBtn = (label) => `<div class="btn-row"><button class="btn" id="stNext">${label || "Tiếp tục →"}</button></div>`;
    const bindNext = (fn) => {
      const b = el.querySelector("#stNext");
      if (b) b.addEventListener("click", () => { ctx.step++; if (fn) fn(); else this.studyStep(el, ctx, STEPS); });
    };
    if (ctx.step === 0) {
      const p = ctx.A.preq[s.skill_id];
      const pres = (p && p.prerequisite_skill_ids ? p.prerequisite_skill_ids : []).map((x) => ctx.A.skillMap[x]).filter(Boolean);
      el.innerHTML = `<div class="steps">${stepsHtml}</div><div class="learn-card">
        <h2>🔄 Ôn nhanh kiến thức nền</h2>
        <p class="muted">Trước khi học “${Util.esc(s.name)}”, cùng điểm lại kiến thức nền:</p>
        ${pres.length ? pres.map((pr) => `<div class="plan-item"><span class="p-ico">${VH.subjIcon(pr.subject)}</span><span style="flex:1;min-width:0"><b>${Util.esc(pr.name)}</b><small>${Util.esc(pr.description || "")}</small></span>${VH.masteryBadge(ctx.d, pr.skill_id)}</div>`).join("") : '<div class="step-box">Kỹ năng này không cần kiến thức nền — bắt đầu luôn thôi! 🚀</div>'}
        ${nextBtn("Đã sẵn sàng →")}
      </div>`;
      bindNext();
      return;
    }
    if (ctx.step === 1) {
      const demo = this.bridgeDemo(s.skill_id);
      el.innerHTML = `<div class="steps">${stepsHtml}</div><div class="learn-card">
        <h2>💡 Kiến thức mới: ${Util.esc(s.name)}</h2>
        <p>${Util.esc(s.description || "")}</p>
        ${s.reason_importance ? `<div class="step-box">🎯 <b>Tại sao quan trọng:</b> ${Util.esc(s.reason_importance)}</div>` : ""}
        ${demo}
        <h3 style="margin-top:16px">🪜 Con đường thành thạo</h3>
        ${[1, 2, 3, 4].map((i) => { const key = "level_" + i; return s.mastery_definition && s.mastery_definition[key] ? `<div class="step-box"><b>M${i}</b> — ${Util.esc(s.mastery_definition[key])}</div>` : ""; }).join("")}
        ${nextBtn("Con đã hiểu →")}
      </div>`;
      bindNext();
      return;
    }
    if (ctx.step === 2) {
      const ex = ctx.practice[0] || ctx.checks[0];
      if (!ex) { ctx.step++; return this.studyStep(el, ctx, STEPS); }
      el.innerHTML = `<div class="steps">${stepsHtml}</div><div class="learn-card">
        <h2>🧪 Ví dụ minh họa</h2>
        <div class="quiz-q">${Util.esc(ex.question)}</div>
        <div class="step-box">💡 <b>Cách làm:</b> ${Util.esc(ex.hint || "Đọc kỹ đề, làm từng bước nhỏ rồi kiểm tra lại.")}</div>
        <div class="step-box">✅ <b>Đáp án:</b> ${Util.esc(ex.answer || "")}</div>
        ${nextBtn("Con hiểu rồi →")}
      </div>`;
      bindNext();
      return;
    }
    if (ctx.step === 3) {
      if (!ctx.practice.length) { ctx.step++; return this.studyStep(el, ctx, STEPS); }
      const items = ctx.practice;
      const qctx = {
        items, idx: 0, results: [], d: ctx.d, skillMap: ctx.A.skillMap,
        title: "Tự làm",
        onDone: (box, c) => {
          ctx.usedHint = c.usedHint || false;
          ctx.step++;
          this.studyStep(el, ctx, STEPS);
        },
      };
      el.innerHTML = `<div class="steps">${stepsHtml}</div>`;
      const qBox = document.createElement("div");
      el.appendChild(qBox);
      this.renderQuestion(qBox, qctx);
      return;
    }
    if (ctx.step === 4) {
      const why = this.whyQuestions(s);
      el.innerHTML = `<div class="steps">${stepsHtml}</div><div class="learn-card">
        <h2>🧠 Kiểm tra hiểu bản chất</h2>
        <p class="muted">Không chỉ hỏi đáp án — hệ thống kiểm tra xem con có thực sự hiểu không.</p>
        ${why.map((w, i) => w.choices ? `
          <div class="step-box"><b>${Util.esc(w.q)}</b>
            ${w.choices.map((c, j) => `<button class="choice" data-why="${i}" data-c="${j}">${Util.esc(c)}</button>`).join("")}
            <div class="feedback" data-whyfb="${i}" hidden></div>
          </div>` : `
          <div class="step-box"><b>${Util.esc(w.q)}</b><div class="btn-row" style="margin-top:8px">
            <button class="btn green small" data-selfwhy="${i}" data-pass="1">✅ Con trả lời được</button>
            <button class="btn ghost small" data-selfwhy="${i}" data-pass="0">🔄 Con cần luyện thêm</button>
          </div><div class="feedback" data-whyfb="${i}" hidden></div></div>`).join("")}
        <div id="whyNext" hidden></div>
      </div>`;
      let answered = 0, okCount = 0;
      const totalWhy = why.length;
      const checkDone = () => {
        if (answered >= totalWhy) {
          ctx.whyOk = okCount >= Math.ceil(totalWhy / 2);
          el.querySelector("#whyNext").hidden = false;
          el.querySelector("#whyNext").innerHTML = nextBtn("Tiếp tục →");
          bindNext();
        }
      };
      el.querySelectorAll("[data-why]").forEach((b) => b.addEventListener("click", () => {
        const i = Number(b.dataset.why), c = Number(b.dataset.c);
        const w = why[i];
        const fb = el.querySelector(`[data-whyfb="${i}"]`);
        el.querySelectorAll(`[data-why="${i}"]`).forEach((x) => { x.disabled = true; });
        if (c === w.correct) { b.classList.add("pick-ok"); okCount++; fb.innerHTML = `✅ Đúng! ${Util.esc(w.explain || "")}`; fb.className = "feedback ok"; fb.hidden = false; }
        else { b.classList.add("pick-no"); fb.innerHTML = `Chưa đúng — ${Util.esc(w.explain || "xem lại ví dụ ở bước trước nhé.")}`; fb.className = "feedback no"; fb.hidden = false; }
        answered++;
        checkDone();
      }));
      el.querySelectorAll("[data-selfwhy]").forEach((b) => b.addEventListener("click", () => {
        const i = Number(b.dataset.selfwhy);
        const pass = b.dataset.pass === "1";
        const fb = el.querySelector(`[data-whyfb="${i}"]`);
        el.querySelectorAll(`[data-selfwhy="${i}"]`).forEach((x) => { x.disabled = true; });
        if (pass) { okCount++; fb.innerHTML = "🎉 Tuyệt! Giải thích được là hiểu sâu."; fb.className = "feedback ok"; }
        else { fb.innerHTML = "Không sao — học lại bước Kiến thức mới rồi thử lại nhé."; fb.className = "feedback no"; }
        fb.hidden = false;
        answered++;
        checkDone();
      }));
      return;
    }
    if (ctx.step === 5) {
      if (!ctx.checks.length) { ctx.step++; return this.studyStep(el, ctx, STEPS); }
      const qctx = {
        items: ctx.checks, idx: 0, results: [], d: ctx.d, skillMap: ctx.A.skillMap,
        title: "💎 Mastery Check",
        onDone: (box, c) => {
          ctx.step++;
          this.studyResult(el, ctx, STEPS, c);
        },
      };
      el.innerHTML = `<div class="steps">${stepsHtml}</div>
        <div class="learn-card" style="margin-bottom:16px">
          <h2>💎 Kiểm tra thành thạo</h2>
          <p class="muted">Không tính điểm. Mục tiêu là xem con đã thật sự làm chủ kỹ năng chưa. ${ctx.checks.length} câu, cố gắng không dùng gợi ý nhé!</p>
        </div>`;
      const qBox = document.createElement("div");
      el.appendChild(qBox);
      this.renderQuestion(qBox, qctx);
      return;
    }
    return this.studyResult(el, ctx, STEPS, null);
  },

  studyResult(el, ctx, STEPS, checkCtx) {
    const stepsHtml = STEPS.map((st, i) => `<div class="step-dot done"><div class="sd"></div><span>${st}</span></div>`).join("");
    const s = ctx.s;
    const correct = checkCtx ? checkCtx.results.filter((r) => r.ok).length : 0;
    const total = checkCtx ? checkCtx.results.length : 0;
    const acc = total ? Math.round(correct / total * 100) : 0;
    const st = Store.skill(ctx.d, s.skill_id);
    const lv = Store.masteryLvl(st);
    const interval = [1, 3, 7, 14, 30][lv] || 1;
    const next = new Date(Date.now() + interval * 86400000);
    st.nextReview = Store.dateKey(next.getTime());
    st.interval = interval;
    ctx.d.skills[s.skill_id] = st;
    Store.save(ctx.d);
    if (lv >= 2) Confetti.center(110);
    el.innerHTML = `<div class="steps">${stepsHtml}</div><div class="learn-card">
      <h2>🏁 Kết quả học tập</h2>
      <div class="quiz-q" style="font-size:1.8rem">MASTERY LEVEL ${lv}</div>
      <p><b>${["🔴 Chưa biết", "🟠 Cần hướng dẫn", "🟡 Làm được, chưa ổn định", "🟢 Thành thạo", "💎 Thành thạo & giải thích được"][lv]}</b></p>
      <div class="sum-list">
        ${total ? `<div class="sum-row"><span>Accuracy (Mastery Check)</span><span><b>${acc}%</b></span><span class="badge ${acc >= 80 ? "mastery3" : "mastery2"}">${acc >= 80 ? "Đạt" : "Cần luyện thêm"}</span></div>` : ""}
        <div class="sum-row"><span>Không cần gợi ý</span><span>${ctx.usedHint ? "Đã dùng gợi ý" : "✅"}</span></div>
        <div class="sum-row"><span>Hiểu bản chất (“Tại sao?”)</span><span>${ctx.whyOk ? "✅" : "Cần ôn thêm"}</span></div>
        <div class="sum-row"><span>Next Review</span><span><b>Sau ${interval} ngày</b> (${st.nextReview})</span></div>
      </div>
      <div class="btn-row">
        <a class="btn" href="#/hoc">🎓 TIẾP TỤC HỌC</a>
        <a class="btn purple" href="#/hoc/skill/${s.skill_id}">🔄 Học lại kỹ năng</a>
        <a class="btn ghost" href="#/lichon">📅 Xem lịch ôn</a>
      </div>
    </div>`;
  },

  bridgeDemo(sid) {
    if (sid === "MATH_ADD_BRIDGE10_001") {
      return `<div class="step-box" style="border-style:solid;background:#fff">
        <b>🧮 Ví dụ trực quan: 8 + 5 = ?</b>
        <div class="block-demo">
          ${[0, 1, 2, 3, 4, 5, 6, 7].map(() => '<span class="blk a">●</span>').join("")}
          <span style="align-self:center">+</span>
          ${[0, 1, 2, 3, 4].map(() => '<span class="blk b">●</span>').join("")}
        </div>
        <div class="step-box"><b>Bước 1:</b> 8 cần thêm 2 để tròn 10 → tách 5 = 2 + 3<br><b>Bước 2:</b> 8 + 2 = 10<br><b>Bước 3:</b> 10 + 3 = <b>13</b> ✅</div>
        <p class="muted small">Mẹo: khi cộng số qua 10, luôn “mượn” số để tròn 10 trước, rồi cộng phần còn lại.</p>
      </div>`;
    }
    if (sid === "MATH_SUB_BRIDGE10_001") {
      return `<div class="step-box" style="border-style:solid;background:#fff">
        <b>🧮 Ví dụ trực quan: 13 − 5 = ?</b>
        <div class="step-box"><b>Bước 1:</b> tách 13 = 10 + 3<br><b>Bước 2:</b> 10 − 5 = 5<br><b>Bước 3:</b> 5 + 3 = <b>8</b> ✅</div>
        <p class="muted small">Mẹo: trừ qua 10 thì tách số bị trừ thành 10 và phần còn lại.</p>
      </div>`;
    }
    if (sid === "MATH_ADD_CARRY_100_001") {
      return `<div class="step-box" style="border-style:solid;background:#fff">
        <b>🧮 Ví dụ trực quan: 27 + 18 = ?</b>
        <div class="step-box"><b>Bước 1:</b> cộng đơn vị: 7 + 8 = 15 → viết 5, nhớ 1<br><b>Bước 2:</b> cộng chục: 2 + 1 + 1 (nhớ) = 4<br><b>Bước 3:</b> kết quả <b>45</b> ✅</div>
      </div>`;
    }
    if (sid === "MATH_SUB_BORROW_100_001") {
      return `<div class="step-box" style="border-style:solid;background:#fff">
        <b>🧮 Ví dụ trực quan: 52 − 27 = ?</b>
        <div class="step-box"><b>Bước 1:</b> 2 không trừ được 7 → mượn 1 chục (52 = 4 chục + 12)<br><b>Bước 2:</b> 12 − 7 = 5<br><b>Bước 3:</b> 4 − 2 = 2 → kết quả <b>25</b> ✅</div>
      </div>`;
    }
    return "";
  },

  whyQuestions(s) {
    const qs = [];
    if (s.skill_id === "MATH_ADD_BRIDGE10_001") {
      qs.push({ q: "Tại sao con tách số 5 thành 2 và 3 khi tính 8 + 5?", choices: ["Vì 8 cần thêm 2 để tròn 10, rồi cộng nốt 3", "Vì 5 lớn hơn 3", "Vì con thích số 2 và số 3"], correct: 0, explain: "Tròn 10 giúp tính nhẩm nhanh: 8 + 2 = 10 rồi 10 + 3 = 13." });
      qs.push({ q: "Nếu đổi 8 thành 7 thì 7 + 5 = ?", answer: "12" });
    } else if (s.skill_id === "MATH_SUB_BRIDGE10_001") {
      qs.push({ q: "Tại sao khi tính 13 − 5 con lại tách 13 thành 10 và 3?", choices: ["Vì 10 − 5 = 5 dễ nhẩm, rồi cộng lại 3", "Vì 13 lớn hơn 10", "Vì 5 nhỏ hơn 10"], correct: 0, explain: "Tách thành 10 giúp trừ nhẩm nhanh: 10 − 5 = 5, 5 + 3 = 8." });
      qs.push({ q: "Nếu đổi 13 thành 12 thì 12 − 5 = ?", answer: "7" });
    } else if (s.subject === "MATH") {
      qs.push({ q: `Con hãy nói lại bằng lời của mình: làm thế nào để giỏi kỹ năng “${s.name}”?` });
      qs.push({ q: "Con có thể nghĩ ra một cách làm khác không? Thử nói cho bố mẹ nghe nhé." });
    } else {
      qs.push({ q: "Con tìm thông tin để trả lời ở đâu? Con nói lại bằng lời của mình được không?" });
      qs.push({ q: "Vì sao con nghĩ như vậy? Con kể lại cho bố mẹ nghe nhé." });
    }
    return qs;
  },

  /* ============ KIỂM TRA ============ */
  async testHub(el) {
    const seg = location.hash.replace(/^#\/?/, "").split("/");
    const tests = [
      { id: "math-dg", file: "data/assessment/diagnostic_math.json", label: "Toán · Kiểm tra đầu vào", sub: "MATH" },
      { id: "math-fin", file: "data/assessment/final_math.json", label: "Toán · Kiểm tra cuối chương trình", sub: "MATH" },
      { id: "vie-dg", file: "data/assessment/diagnostic_vietnamese.json", label: "Tiếng Việt · Kiểm tra đầu vào", sub: "VIETNAMESE" },
      { id: "vie-fin", file: "data/assessment/final_vietnamese.json", label: "Tiếng Việt · Kiểm tra cuối chương trình", sub: "VIETNAMESE" },
    ];
    const t = seg[1] ? tests.find((x) => x.id === seg[1]) : null;
    if (t) return this.runTest(el, t);
    const d = Store.load();
    el.innerHTML = `
      <h1 style="font-family:'Baloo 2',sans-serif;margin:0 0 6px">📝 Kiểm tra năng lực</h1>
      <p class="sub">Đề do AI sinh theo đúng dạng bài SGK (không sao chép nguyên văn). Làm xong chấm ngay từng câu, cập nhật mastery và lưu lịch sử.</p>
      <div class="grid cols-2">
        ${tests.map((x) => `<a class="card" href="#/kiemtra/${x.id}" style="display:block"><h3>${x.sub === "MATH" ? "🧮" : "📖"} ${x.label}</h3><p>Làm hết câu hỏi → chấm từng câu → tổng kết % đúng và kỹ năng cần củng cố.</p><span class="btn small ${x.sub === "MATH" ? "" : "pink"}">Bắt đầu →</span></a>`).join("")}
      </div>
      <section class="section"><h2>Lịch sử kiểm tra</h2>
        <div class="card">
          ${(d.tests || []).length ? d.tests.map((h) => `<div class="sum-row"><span>${Util.esc(h.label)}</span><span>${h.correct}/${h.total} · ${h.pct}%</span><span class="muted small">${Util.esc(h.date)}</span></div>`).join("") : '<p class="muted">Chưa làm bài kiểm tra nào.</p>'}
        </div>
      </section>
    `;
  },

  async runTest(el, t) {
    const [a, A] = await Promise.all([App.fetchJSON(t.file), Analytics.all()]);
    const items = a.questions || [];
    const d = Store.load();
    const ctx = {
      items, idx: 0, results: [], d, skillMap: A.skillMap,
      title: a.title || t.label,
      onDone: (box, c) => this.testSummary(box, c, t),
    };
    el.innerHTML = `<p><a href="#/kiemtra">← Chọn đề khác</a></p>
      <div class="card quiz-card">
        <div class="quiz-top"><span class="quiz-counter">📝 ${Util.esc(a.title || t.label)}</span><span class="muted small">${items.length} câu${a.duration_minutes ? " · " + a.duration_minutes + " phút" : ""}</span></div>
        <p class="muted">${Util.esc(a.description || "")}</p>
        <button class="btn big" id="startBtn">🚀 Bắt đầu làm bài</button>
      </div>`;
    const qBox = document.createElement("div");
    el.appendChild(qBox);
    el.querySelector("#startBtn").addEventListener("click", () => this.renderQuestion(qBox, ctx));
  },

  testSummary(el, ctx, t) {
    const correct = ctx.results.filter((r) => r.ok).length;
    const total = ctx.results.length;
    const pct = total ? Math.round(correct / total * 100) : 0;
    const d = Store.load();
    const now = new Date();
    d.tests = d.tests || [];
    d.tests.unshift({ label: t.label, correct, total, pct, date: now.toLocaleDateString("vi-VN") + " " + now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) });
    d.tests = d.tests.slice(0, 20);
    Store.save(d);
    if (pct >= 80) Confetti.center(120);
    const bySkill = {};
    ctx.results.forEach((r) => {
      const sid = r.q.skill_id;
      bySkill[sid] = bySkill[sid] || { ok: 0, n: 0 };
      bySkill[sid].n++;
      if (r.ok) bySkill[sid].ok++;
    });
    el.innerHTML = `
      <div class="card quiz-card">
        <div class="quiz-top"><span class="quiz-counter">🏁 ${Util.esc(t.label)}</span><span class="badge ${pct >= 80 ? "mastery3" : "mastery2"}">${pct}%</span></div>
        <div class="quiz-q" style="font-size:1.6rem">${correct} / ${total} đúng</div>
        <p>${pct >= 80 ? "Xuất sắc! Năng lực phần này đang rất tốt. 🎉" : pct >= 60 ? "Khá! Củng cố các câu sai là hoàn hảo." : "Hãy học lại các kỹ năng chưa đạt rồi kiểm tra lại nhé. 💪"}</p>
        <div class="sum-list">
          ${Object.keys(bySkill).map((sid) => `<div class="sum-row"><span>${Util.esc((ctx.skillMap[sid] || {}).name || sid)}</span><span>${bySkill[sid].ok}/${bySkill[sid].n} đúng</span>${VH.masteryBadge(ctx.d, sid)}</div>`).join("")}
        </div>
        <h3 style="margin-top:16px">Xem lại từng câu</h3>
        <div class="review-list">
          ${ctx.results.map((r, i) => `<div class="review-row ${r.ok ? "ok" : "no"}"><span>${i + 1}. ${r.ok ? "✅" : "❌"}</span><div><div>${Util.esc(r.q.question)}</div>${r.ok ? "" : `<div class="muted small">Đáp án mẫu: ${Util.esc(r.q.answer || "")}</div>`}</div></div>`).join("")}
        </div>
        <div class="btn-row">
          <a class="btn" href="#/kiemtra/${t.id}">🔄 Làm lại đề</a>
          <a class="btn ghost" href="#/kiemtra">Chọn đề khác</a>
          <a class="btn ghost" href="#/hoc">🎓 Đi học bài</a>
        </div>
      </div>`;
  },
};
