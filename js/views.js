/* Lop 2 Mastery - views */
"use strict";

const Views = {
  async home(el) {
    const [math, vie, skills, core] = await Promise.all([
      App.fetchJSON("data/curriculum/math.json").catch(() => null),
      App.fetchJSON("data/curriculum/vietnamese.json").catch(() => null),
      App.fetchJSON("data/skills/all_skills.json").catch(() => null),
      App.fetchJSON("data/skills/core_20_percent.json").catch(() => null),
    ]);
    const mSkills = (skills && skills.skills ? skills.skills : []).filter((s) => s.subject === "MATH");
    const vSkills = (skills && skills.skills ? skills.skills : []).filter((s) => s.subject === "VIETNAMESE");
    const mCore = (core && core.math ? core.math : []).length;
    const vCore = (core && core.vietnamese ? core.vietnamese : []).length;
    const mUnits = math && math.topics ? math.topics.reduce((a, t) => a + (t.units ? t.units.length : 0), 0) : 0;
    const vUnits = vie && vie.topics ? vie.topics.reduce((a, t) => a + (t.units ? t.units.length : 0), 0) : 0;

    el.innerHTML = `
    <section class="hero">
      <h1>Lớp 2 Mastery</h1>
      <p>Hệ thống học tăng tốc Toán + Tiếng Việt lớp 2. Trẻ không học theo số trang — trẻ học theo <b>năng lực đã làm chủ</b>. Dataset này là nền tảng dữ liệu + đặc tả sản phẩm cho dashboard học tập thông minh.</p>
      <div class="chips">
        <span class="chip">📐 SGK Toán 2 · Tập 1, 2</span>
        <span class="chip">📖 SGK Tiếng Việt 2 · Tập 1, 2</span>
        <span class="chip">🎯 Mastery Learning</span>
        <span class="chip">🧠 Spaced Repetition</span>
        <span class="chip">🔎 Truy vết nguồn từng trang SGK</span>
      </div>
    </section>

    <section class="section">
      <div class="grid cols-4">
        <div class="stat"><b>${(mSkills.length + vSkills.length) || "—"}</b><span>kỹ năng (skill) chuẩn hóa</span></div>
        <div class="stat"><b>${mCore + vCore || "—"}</b><span>kỹ năng lõi (Top 20%)</span></div>
        <div class="stat"><b>${mUnits + vUnits || "—"}</b><span>chủ đề · đơn vị học</span></div>
        <div class="stat"><b>576</b><span>trang PDF được đọc &amp; ánh xạ</span></div>
      </div>
    </section>

    <section class="section">
      <h2>Triết lý hệ thống — 10 nguyên tắc</h2>
      <div class="grid cols-2">
        ${[
          ["80/20 Learning", "Tập trung vào 20% kỹ năng tạo ra 80% năng lực."],
          ["Mastery Learning", "Chỉ chuyển bài mới khi trẻ thực sự thành thạo kỹ năng hiện tại."],
          ["Active Recall", "Trẻ chủ động nhớ lại thay vì đọc lại thụ động."],
          ["Spaced Repetition", "Ôn đúng lúc, đúng khoảng cách (1–3–7–14–30 ngày)."],
          ["Prerequisite Learning", "Mỗi kỹ năng đều biết rõ kiến thức nền phía trước."],
          ["Error-based Learning", "Mỗi lỗi sai được phân loại và là tín hiệu để dạy lại."],
          ["Adaptive Practice", "Đúng liên tục → giảm bài lặp; sai → quay về gốc."],
          ["Interleaving", "Đan xen dạng bài để trẻ không học vẹt theo mẫu."],
          ["Retrieval Practice", "Kiểm tra là cách học, không chỉ là cách đánh giá."],
          ["Học theo năng lực", "Không theo số trang — theo mức độ làm chủ kỹ năng."],
        ].map(([t, d]) => `<div class="card"><h3>${t}</h3><p>${d}</p></div>`).join("")}
      </div>
    </section>

    <section class="section">
      <h2>Mục tiêu</h2>
      <div class="card">
        <p style="font-size:1.05rem;color:var(--ink)">
          <b>Học ít hơn → Hiểu sâu hơn → Nhớ lâu hơn → Hoàn thành sớm hơn → Không tạo lỗ hổng kiến thức.</b>
        </p>
      </div>
    </section>

    <section class="section">
      <h2>Quy trình xây dựng dataset — 12 pha</h2>
      <div class="phase-list">
        ${["Đọc &amp; lập mục lục chuẩn 4 sách","Trích xuất kỹ năng từ nội dung bài học","Gom các kỹ năng trùng","Dựng đồ thị kiến thức tiên quyết","Phân loại 80/20 &amp; chấm điểm tầm quan trọng","Thiết kế quy tắc mastery","Định nghĩa dạng bài tập + sinh bài mẫu","Soạn bài kiểm tra đầu vào &amp; cuối chương trình","Thiết kế spaced repetition + gợi ý học","Viết đặc tả dashboard &amp; sản phẩm","Xuất dataset JSON sạch","Tự audit chất lượng (AUDIT_REPORT)"].map((t) => `<div class="phase"><div>${t}</div></div>`).join("")}
      </div>
    </section>

    <section class="section">
      <h2>Bắt đầu khám phá</h2>
      <div class="grid cols-3">
        <a class="card" href="#/curriculum" style="color:var(--ink)"><h3>🗺️ Chương trình</h3><p>Bản đồ chủ đề → bài học → kỹ năng của cả 4 quyển sách.</p></a>
        <a class="card" href="#/skills" style="color:var(--ink)"><h3>🧩 Kỹ năng</h3><p>Danh sách kỹ năng, mức quan trọng, nền móng lớp 3 và quy tắc mastery.</p></a>
        <a class="card" href="#/graph" style="color:var(--ink)"><h3>🔗 Bản đồ kiến thức</h3><p>Đồ thị tiên quyết — kỹ năng nào là nền của kỹ năng nào.</p></a>
        <a class="card" href="#/data" style="color:var(--ink)"><h3>💾 Bộ dữ liệu</h3><p>Toàn bộ JSON dataset + tải về để xây ứng dụng.</p></a>
        <a class="card" href="#/docs" style="color:var(--ink)"><h3>📋 Tài liệu &amp; Spec</h3><p>Product spec, dashboard spec, README cho Codex, audit report.</p></a>
        <a class="card" href="data/README.md" style="color:var(--ink)"><h3>🚀 START HERE FOR CODEX</h3><p>Đọc README rồi xây ứng dụng dashboard.</p></a>
      </div>
    </section>
    `;
  },

  async curriculum(el) {
    const [math, vie] = await Promise.all([
      App.fetchJSON("data/curriculum/math.json"),
      App.fetchJSON("data/curriculum/vietnamese.json"),
    ]);
    const tabs = [["math", "📐 Toán"], ["vie", "📖 Tiếng Việt"]];
    el.innerHTML = `
      <h1 style="font-size:1.5rem">Bản đồ chương trình lớp 2</h1>
      <div class="tabs" id="curTabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${k === "math" ? "active" : ""}">${l}</button>`).join("")}</div>
      <div id="curBody"></div>
    `;
    const body = el.querySelector("#curBody");
    const render = (key, data) => {
      if (!data) { body.innerHTML = '<div class="notice">Chưa có dữ liệu.</div>'; return; }
      body.innerHTML = data.topics.map((t, ti) => `
        <div class="tree-item">
          <div class="tree-head" data-open="0"><span class="caret">▶</span><b>${Util.esc(t.name)}</b><span class="muted small">${t.units.length} chủ đề con</span></div>
          <div class="tree-body">${t.units.map((u) => `
            <div class="tree-item" style="margin-bottom:8px">
              <div class="tree-head" data-open="0"><span class="caret">▶</span><b>${Util.esc(u.name)}</b><span class="muted small">tr.${u.pages || "—"}</span></div>
              <div class="tree-body">${(u.lessons || []).map((l) => `
                <div class="lesson-line">
                  <b>Bài ${l.lesson_no ?? ""}: ${Util.esc(l.name)}</b>
                  <span class="muted">· tr.${(l.printed_pages || l.pdf_pages || []).join(", ") || "—"}</span>
                  <div class="kpi">${(l.skills || []).map((s) => `<span class="chip" style="background:var(--primary-soft);color:var(--primary);border-color:transparent">${Util.esc(s)}</span>`).join("")}</div>
                  ${l.summary ? `<div class="muted small">${Util.esc(l.summary)}</div>` : ""}
                </div>`).join("")}</div>
            </div>`).join("")}</div>
        </div>`).join("");
      body.querySelectorAll(".tree-head").forEach((h) =>
        h.addEventListener("click", () => {
          h.classList.toggle("open");
          h.nextElementSibling.classList.toggle("open");
        })
      );
    };
    el.querySelectorAll("#curTabs button").forEach((b) =>
      b.addEventListener("click", () => {
        el.querySelectorAll("#curTabs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        render(b.dataset.tab, b.dataset.tab === "math" ? math : vie);
      })
    );
    render("math", math);
  },

  async skills(el) {
    const [data, core] = await Promise.all([
      App.fetchJSON("data/skills/all_skills.json"),
      App.fetchJSON("data/skills/core_20_percent.json").catch(() => null),
    ]);
    const all = data.skills || [];
    const coreIds = new Set([...(core?.math || []), ...(core?.vietnamese || [])]);
    el.innerHTML = `
      <h1 style="font-size:1.5rem">Ngân hàng kỹ năng <span class="muted">(${all.length})</span></h1>
      <div class="filter-bar">
        <input type="search" id="skSearch" placeholder="Tìm kỹ năng… (vd: cộng có nhớ, chính tả)">
        <select id="skSubject"><option value="">Môn: tất cả</option><option value="MATH">Toán</option><option value="VIETNAMESE">Tiếng Việt</option></select>
        <select id="skImp"><option value="">Mức: tất cả</option><option value="A">A · CORE</option><option value="B">B · IMPORTANT</option><option value="C">C · SUPPORT</option><option value="D">D · FAST TRACK</option></select>
        <select id="skG3"><option value="">Nền móng lớp 3: tất cả</option><option value="1">⚠️ Có</option></select>
      </div>
      <div id="skList" class="grid cols-2"></div>
    `;
    const list = el.querySelector("#skList");
    const render = () => {
      const q = el.querySelector("#skSearch").value.toLowerCase();
      const subj = el.querySelector("#skSubject").value;
      const imp = el.querySelector("#skImp").value;
      const g3 = el.querySelector("#skG3").value;
      const items = all.filter((s) => {
        if (subj && s.subject !== subj) return false;
        if (imp && s.importance_level !== imp) return false;
        if (g3 === "1" && !s.grade3_foundation) return false;
        if (q && !(s.name + " " + s.skill_id + " " + (s.description || "")).toLowerCase().includes(q)) return false;
        return true;
      });
      list.innerHTML = items.map((s) => `
        <div class="skill-card">
          <h4>${Util.esc(s.name)} ${coreIds.has(s.skill_id) ? '<span class="badge A">TOP 20%</span>' : ""} ${s.grade3_foundation ? '<span class="badge G3">⚠️ Nền lớp 3</span>' : ""}</h4>
          <div class="skill-id">${Util.esc(s.skill_id)}</div>
          <div class="kpi">${Util.importanceBadge(s.importance_level)}<span class="chip" style="background:#eef4f7;color:var(--muted);border-color:transparent">Điểm ${s.importance_score}/100</span></div>
          <p>${Util.esc(s.description || "")}</p>
          <div class="kv"><b>Nguồn SGK</b><span>${(s.source_refs || []).slice(0, 3).map(Util.refLabel).join(" · ") || "—"}${(s.source_refs || []).length > 3 ? ` +${s.source_refs.length - 3} trang` : ""}</span></div>
          <div class="kv"><b>Tiên quyết</b><span>${(s.prerequisites || []).map((p) => `<code>${Util.esc(p)}</code>`).join(" ") || "không có"}</span></div>
          <details><summary style="cursor:pointer;color:var(--primary)">Xem thang mastery</summary>
            <div class="mastery-scale">
              ${[0, 1, 2, 3, 4].map((i) => `<div><b>M${i}</b> — ${Util.esc((s.mastery_definition || {})["level_" + i] || "—")}</div>`).join("")}
            </div>
            <div class="kv"><b>Quy tắc kiểm tra mastery</b><span>${Util.esc(s.mastery_check_rule || "—")}</span></div>
          </details>
        </div>`).join("") || '<div class="notice">Không có kỹ năng khớp bộ lọc.</div>';
    };
    el.querySelectorAll("#skSearch, #skSubject, #skImp, #skG3").forEach((i) => i.addEventListener("input", render));
    render();
  },

  async graph(el) {
    const [skills, edgesData] = await Promise.all([
      App.fetchJSON("data/skills/all_skills.json"),
      App.fetchJSON("data/skills/prerequisites.json"),
    ]);
    const byId = {};
    (skills.skills || []).forEach((s) => (byId[s.skill_id] = s));
    const edges = (edgesData.edges || []).filter((e) => byId[e.from] && byId[e.to]);
    const nodes = new Set();
    edges.forEach((e) => { nodes.add(e.from); nodes.add(e.to); });

    const depth = {};
    const visit = (n, d) => { if (depth[n] === undefined || depth[n] < d) depth[n] = d; };
    edges.forEach((e) => visit(e.to, 0));
    let changed = true;
    while (changed) {
      changed = false;
      edges.forEach((e) => {
        const d = (depth[e.from] ?? 0) + 1;
        if (d > (depth[e.to] ?? 0)) { depth[e.to] = d; changed = true; }
      });
    }
    [...nodes].forEach((n) => { if (depth[n] === undefined) depth[n] = 0; });
    const layers = {};
    [...nodes].forEach((n) => { (layers[depth[n]] = layers[depth[n]] || []).push(n); });

    const W = 1200, H = Math.max(400, Object.keys(layers).length * 130 + 80);
    const maxLayer = Math.max(...Object.values(layers).map((l) => l.length), 1);
    const cellW = W / maxLayer;
    const pos = {};
    Object.entries(layers).forEach(([d, arr]) => {
      arr.forEach((n, i) => {
        pos[n] = { x: W / 2 + (i - (arr.length - 1) / 2) * Math.min(200, cellW), y: 70 + Number(d) * 130 };
      });
    });

    let svg = `<svg id="graphSvg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
    edges.forEach((e) => {
      const a = pos[e.from], b = pos[e.to];
      if (a && b) svg += `<path class="link" d="M ${a.x} ${a.y + 24} C ${a.x} ${(a.y + b.y) / 2}, ${b.x} ${(a.y + b.y) / 2}, ${b.x} ${b.y - 24}"/>`;
    });
    [...nodes].forEach((n) => {
      const s = byId[n], p = pos[n];
      const cls = ["node", s.importance_level === "A" ? "core" : "", s.grade3_foundation ? "g3" : ""].filter(Boolean).join(" ");
      const label = (s.name || n).slice(0, 34);
      svg += `<g class="${cls}" data-id="${n}" transform="translate(${p.x - 95},${p.y - 24})">
        <rect width="190" height="48" rx="10"></rect>
        <text x="95" y="19" text-anchor="middle">${Util.esc(label)}</text>
        <text x="95" y="36" text-anchor="middle" style="font-size:9px;fill:#5b7283">${n}</text>
      </g>`;
    });
    svg += `</svg>`;
    el.innerHTML = `
      <h1 style="font-size:1.5rem">Bản đồ kiến thức tiên quyết</h1>
      <p class="muted">${edges.length} mối quan hệ tiên quyết giữa ${nodes.size} kỹ năng. Đỏ = kỹ năng lõi (CORE). Viền tím đứt = nền móng lớp 3. Kéo để di chuyển, cuộn để phóng to.</p>
      <div class="graph-wrap" id="graphWrap">
        <div class="graph-tools">
          <button id="gIn">＋</button><button id="gOut">－</button><button id="gReset">⤾</button>
        </div>
        <div id="graphScroll" style="overflow:auto;max-height:620px">${svg}</div>
      </div>
      <div id="gDetail" class="notice hidden"></div>
    `;
    const wrap = el.querySelector("#graphScroll");
    el.querySelectorAll(".node").forEach((g) =>
      g.addEventListener("click", () => {
        el.querySelectorAll(".node").forEach((x) => x.classList.remove("sel"));
        g.classList.add("sel");
        const s = byId[g.dataset.id];
        const detail = el.querySelector("#gDetail");
        detail.classList.remove("hidden");
        detail.innerHTML = `<b>${Util.esc(s.name)}</b> (${s.skill_id}) — ${Util.importanceBadge(s.importance_level)} ${s.grade3_foundation ? '<span class="badge G3">⚠️ Nền lớp 3</span>' : ""}<br>
        <span class="muted">${Util.esc(s.description || "")}</span><br>
        <span class="muted">Tiên quyết: ${(s.prerequisites || []).map((p) => `<code>${p}</code>`).join(" ") || "không có"}</span>`;
      })
    );
  },

  async data(el) {
    let manifest = null;
    try { manifest = await App.fetchJSON("data/manifest.json"); } catch (e) {}
    const files = manifest?.files || [];
    el.innerHTML = `
      <h1 style="font-size:1.5rem">Bộ dữ liệu &amp; schema</h1>
      <p class="muted">Toàn bộ dataset là JSON thuần — sẵn sàng cho Codex xây ứng dụng mà không cần phân tích lại SGK.</p>
      <div class="section">
        <h2>Cấu trúc thư mục dữ liệu</h2>
        <div class="card"><pre style="background:#102a3c;color:#d9eaf2;padding:14px;border-radius:12px;overflow:auto;font-size:.82rem">${Util.esc(`curriculum/   Bản đồ chương trình 2 môn (chủ đề → bài → kỹ năng → trang)
skills/       Kỹ năng, tiên quyết, Top 20%
exercises/    Dạng bài tập + bài mẫu sinh mới
assessment/   Kiểm tra đầu vào & cuối chương trình
rules/        Mastery · Fast track · Spaced repetition · Recommendation · Risk · Lỗi
source_map/   Ánh xạ từng trang PDF → bài học`)}</pre></div>
      </div>
      <div class="section">
        <h2>Files (${files.length})</h2>
        <div class="file-list">${files.map((f) => `
          <a class="file-row" href="${Util.esc(f.path)}" download>📄 ${Util.esc(f.path.replace("data/", ""))}<span class="size">${f.size ? Math.round(f.size / 1024) + " KB" : ""}</span><span style="color:var(--primary)">⬇</span></a>`).join("")}
        </div>
      </div>
    `;
  },

  async docs(el) {
    let manifest = null;
    try { manifest = await App.fetchJSON("data/manifest.json"); } catch (e) {}
    const docs = manifest?.docs || [];
    el.innerHTML = `
      <h1 style="font-size:1.5rem">Tài liệu &amp; Product Spec</h1>
      <div class="tabs" id="docTabs">${docs.map((d, i) => `<button data-i="${i}" class="${i === 0 ? "active" : ""}">${Util.esc(d.label)}</button>`).join("")}</div>
      <div id="docBody"></div>
    `;
    const body = el.querySelector("#docBody");
    const load = async (i) => {
      const d = docs[i];
      body.innerHTML = '<div class="loading">Đang tải…</div>';
      try {
        const md = await App.fetchText(d.path);
        body.innerHTML = `<div class="doc">${Util.md(md)}</div>`;
      } catch (e) {
        body.innerHTML = `<div class="notice">Không tải được ${Util.esc(d.path)}</div>`;
      }
    };
    el.querySelectorAll("#docTabs button").forEach((b) =>
      b.addEventListener("click", () => {
        el.querySelectorAll("#docTabs button").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        load(Number(b.dataset.i));
      })
    );
    if (docs.length) load(0);
  },
};
