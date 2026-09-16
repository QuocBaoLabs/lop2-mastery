/* LỚP 2 MASTERY — app shell, state, navigation */
"use strict";

const NAV = [
  { group: "HỌC TẬP", items: [
    { id: "home", label: "Trang chủ", icon: "🏠" },
    { id: "hoc", label: "Học ngay", icon: "🎓" },
    { id: "toan", label: "Toán", icon: "🧮" },
    { id: "tiengviet", label: "Tiếng Việt", icon: "📖" },
    { id: "onluyen", label: "Ôn luyện", icon: "🧠" },
    { id: "baitap", label: "Bài tập", icon: "✏️" },
    { id: "kiemtra", label: "Kiểm tra", icon: "📝" },
  ]},
  { group: "THEO DÕI", items: [
    { id: "map", label: "Bản đồ kiến thức", icon: "🗺️" },
    { id: "tiendo", label: "Tiến độ", icon: "📊" },
    { id: "mastery", label: "Mastery", icon: "🎯" },
    { id: "lichon", label: "Lịch ôn", icon: "📅" },
    { id: "loi", label: "Phân tích lỗi", icon: "⚠️" },
  ]},
  { group: "GIA ĐÌNH", items: [
    { id: "thanhtich", label: "Thành tích", icon: "🏆" },
    { id: "must", label: "MUST MASTER", icon: "📚" },
    { id: "baocao", label: "Báo cáo phụ huynh", icon: "👨‍👩‍👦" },
    { id: "caidat", label: "Cài đặt", icon: "⚙️" },
  ]},
];

const Store = {
  KEY: "lop2mastery_v1",
  empty() {
    return { profile: { name: "Bé Minh", cls: "Lớp 2A", avatar: "👦" }, skills: {}, activity: {}, errors: {}, tests: [] };
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(this.KEY));
      return d && typeof d === "object" ? d : this.empty();
    } catch (e) { return this.empty(); }
  },
  save(d) { try { localStorage.setItem(this.KEY, JSON.stringify(d)); } catch (e) {} },
  reset() { try { localStorage.removeItem(this.KEY); } catch (e) {} },
  todayKey() {
    const t = new Date();
    return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  },
  dateKey(ms) {
    const t = new Date(ms);
    return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
  },
  skill(d, sid) {
    return d.skills[sid] || { attempts: 0, correct: 0, selfPass: 0, streak: 0, lastTs: 0, nextReview: null, interval: 1 };
  },
  masteryLvl(st) {
    const c = (st.correct || 0) + (st.selfPass || 0);
    if (c <= 0) return 0;
    if (c < 4) return 1;
    if (c < 7) return 2;
    if (c < 10) return 3;
    return 4;
  },
  masteryOf(d, sid) { return this.masteryLvl(this.skill(d, sid)); },
  masteryName(lv) {
    return ["Chưa biết", "Cần hướng dẫn", "Làm được, chưa ổn định", "Thành thạo", "Thành thạo & giải thích được"][lv] || "Chưa biết";
  },
  record(d, sid, ok, tag) {
    const s = this.skill(d, sid);
    s.attempts = (s.attempts || 0) + 1;
    s.lastTs = Date.now();
    const k = this.todayKey();
    d.activity[k] = d.activity[k] || { correct: 0, attempts: 0 };
    d.activity[k].attempts++;
    if (ok) { s.correct = (s.correct || 0) + 1; s.streak = (s.streak || 0) + 1; d.activity[k].correct++; }
    else {
      s.streak = 0;
      if (tag) d.errors[tag] = (d.errors[tag] || 0) + 1;
    }
    d.skills[sid] = s;
    this.save(d);
    return s;
  },
  recordSelf(d, sid, pass) {
    const s = this.skill(d, sid);
    s.attempts = (s.attempts || 0) + 1;
    s.lastTs = Date.now();
    if (pass) s.selfPass = (s.selfPass || 0) + 1;
    const k = this.todayKey();
    d.activity[k] = d.activity[k] || { correct: 0, attempts: 0 };
    d.activity[k].attempts++;
    if (pass) d.activity[k].correct++;
    d.skills[sid] = s;
    this.save(d);
    return s;
  },
  xp(d) {
    let xp = 0;
    Object.values(d.skills || {}).forEach((s) => { xp += (s.correct || 0) * 10 + (s.selfPass || 0) * 5; });
    (d.tests || []).forEach((t) => { xp += (t.correct || 0) * 5; });
    return xp;
  },
  level(xp) { return Math.floor(Math.sqrt(Math.max(0, xp) / 120)) + 1; },
  levelProgress(xp) {
    const lv = this.level(xp);
    const cur = Math.pow(lv - 1, 2) * 120;
    const next = Math.pow(lv, 2) * 120;
    return Math.max(2, Math.min(100, Math.round(((xp - cur) / (next - cur)) * 100)));
  },
  streak(d) {
    const act = d.activity || {};
    const keys = Object.keys(act);
    if (!keys.length) return 0;
    let cur = new Date();
    if (!act[this.dateKey(cur.getTime())]) cur = new Date(cur.getTime() - 86400000);
    let n = 0;
    while (act[this.dateKey(cur.getTime())]) { n++; cur = new Date(cur.getTime() - 86400000); }
    return n;
  },
  accuracy(d, sid) {
    const s = this.skill(d, sid);
    if (!s.attempts) return null;
    return Math.round((s.correct || 0) / s.attempts * 100);
  },
  risk(d, sid, skill, dependents) {
    const s = this.skill(d, sid);
    const imp = skill ? (skill.importance_score || 50) : 50;
    let weakness = 0, forgetting = 0;
    if (s.attempts) {
      const acc = this.accuracy(d, sid) || 0;
      weakness = 100 - acc;
      const days = s.lastTs ? Math.floor((Date.now() - s.lastTs) / 86400000) : 30;
      forgetting = Math.min(100, days * 4);
    } else if (s.lastTs) forgetting = 30;
    const dep = Math.min(24, (dependents || 0) * 8);
    const g3 = skill && skill.grade3_foundation ? 5 : 0;
    let r = Math.round(40 * weakness / 100 + 25 * imp / 100 + 20 * forgetting / 100 + dep + g3);
    if (skill && skill.importance_level === "A") r = Math.max(r, 40);
    return Math.min(100, r);
  },
  band(r) {
    if (r >= 80) return { label: "Ưu tiên ngay", color: "red" };
    if (r >= 60) return { label: "Cần củng cố", color: "orange" };
    if (r >= 30) return { label: "Theo dõi", color: "yellow" };
    return { label: "Ổn", color: "green" };
  },
};

const Util = {
  esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },
  fmt(n) { return Number(n || 0).toLocaleString("vi-VN"); },
  bookName(key) {
    const m = { math1: "Toán 2 · Tập 1", math2: "Toán 2 · Tập 2", vie1: "Tiếng Việt 2 · Tập 1", vie2: "Tiếng Việt 2 · Tập 2" };
    return m[key] || key;
  },
  refLabel(r) {
    return `${Util.bookName(r.book)}${r.volume ? " · " + r.volume : ""}${r.lesson ? " · " + r.lesson : ""} · PDF tr.${r.pdf_page ?? "?"}${r.printed_page ? ` (sách tr.${r.printed_page})` : ""}`;
  },
  md(src) {
    let s = String(src || "");
    s = s.replace(/^```([\s\S]*?)^```/gm, (m, code) => "<pre><code>" + this.esc(code.replace(/\n$/, "")) + "</code></pre>");
    s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    s = s.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
    s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    s = s.replace(/^&gt; (.*)$/gm, "<blockquote>$1</blockquote>");
    s = s.replace(/^\s*[-*] (.*)$/gm, "<li>$1</li>");
    s = s.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
    s = s.replace(/^\s*\d+\. (.*)$/gm, "<li>$1</li>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    s = s.replace(/\n{2,}/g, "\n");
    s = s.replace(/\n(?!<)/g, "<br>");
    return s;
  },
};

const Confetti = {
  burst(x, y, n) {
    const colors = ["#2563eb", "#ec4899", "#10b981", "#8b5cf6", "#f97316", "#facc15", "#22d3ee", "#f43f5e"];
    n = n || 70;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = "confetti";
      const size = 6 + Math.random() * 8;
      p.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size * 0.55}px;background:${colors[i % colors.length]};--dx:${(Math.random() - 0.5) * 260}px;--dy:${-(90 + Math.random() * 240)}px;--rot:${Math.random() * 720}deg;animation-delay:${(Math.random() * 0.15).toFixed(2)}s`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }
  },
  center(n) { this.burst(window.innerWidth / 2, window.innerHeight / 3, n); },
};

const Modal = {
  open(html) {
    const m = document.getElementById("modal");
    document.getElementById("modalCard").innerHTML = html;
    m.hidden = false;
    document.body.style.overflow = "hidden";
  },
  close() {
    const m = document.getElementById("modal");
    m.hidden = true;
    document.body.style.overflow = "";
  },
};

const App = {
  state: { cache: {}, index: [] },
  routes: {},
  init() {
    document.getElementById("modal").addEventListener("click", (e) => { if (e.target.dataset.close) Modal.close(); });
    this.renderNav();
    this.bindTopbar();
    this.route();
    window.addEventListener("hashchange", () => this.route());
    this.buildIndex();
  },
  route() {
    const h = location.hash.replace(/^#\/?/, "").split("/")[0] || "home";
    const fn = this.routes[h] || this.routes.home;
    document.querySelectorAll("[data-nav]").forEach((b) => b.classList.toggle("active", b.dataset.nav === h));
    const app = document.getElementById("app");
    app.innerHTML = '<div class="loading"><span class="spinner"></span>Đang tải…</div>';
    Promise.resolve(fn(app)).catch((e) => {
      app.innerHTML = `<div class="notice">Lỗi khi tải dữ liệu: ${Util.esc(String((e && e.message) || e))}</div>`;
    });
    this.refreshTopbar();
    window.scrollTo(0, 0);
  },
  renderNav() {
    document.getElementById("sideNav").innerHTML = NAV.map((g) => `
      <div class="nav-group"><span class="nav-group-title">${g.group}</span>
        ${g.items.map((i) => `<a href="#/${i.id}" data-nav="${i.id}"><span class="nav-ico">${i.icon}</span><span class="nav-label">${i.label}</span></a>`).join("")}
      </div>`).join("");
    const bottom = [
      { id: "home", icon: "🏠", label: "Trang chủ" },
      { id: "hoc", icon: "🎓", label: "Học ngay" },
      { id: "baitap", icon: "✏️", label: "Bài tập" },
      { id: "kiemtra", icon: "📝", label: "Kiểm tra" },
      { id: "menu", icon: "☰", label: "Menu" },
    ];
    document.getElementById("bottomNav").innerHTML = bottom.map((i) =>
      i.id === "menu"
        ? `<button id="moreBtn"><span class="nav-ico">${i.icon}</span><span class="nav-label">${i.label}</span></button>`
        : `<a href="#/${i.id}" data-nav="${i.id}"><span class="nav-ico">${i.icon}</span><span class="nav-label">${i.label}</span></a>`
    ).join("");
    document.getElementById("moreBtn").addEventListener("click", () => {
      Modal.open(`<div class="menu-overlay">
        <div class="menu-head">⭐ LỚP 2 MASTERY<button class="icon-btn" id="closeMenu">✖</button></div>
        ${NAV.map((g) => `<div class="menu-group"><b>${g.group}</b>${g.items.map((i) => `<a href="#/${i.id}" data-nav="${i.id}" class="menu-item">${i.icon} ${i.label}</a>`).join("")}</div>`).join("")}
      </div>`);
      document.getElementById("closeMenu").addEventListener("click", Modal.close);
      document.querySelectorAll("#modalCard [data-nav]").forEach((a) => a.addEventListener("click", Modal.close));
    });
  },
  bindTopbar() {
    const input = document.getElementById("searchInput");
    const box = document.getElementById("searchResults");
    input.addEventListener("input", () => this.search(input.value, box));
    input.addEventListener("focus", () => { if (input.value.trim()) this.search(input.value, box); });
    document.addEventListener("click", (e) => {
      if (!document.getElementById("searchBox").contains(e.target)) box.hidden = true;
    });
    document.getElementById("rewardBtn").addEventListener("click", () => Views.thanhtich(null, true));
    document.getElementById("notifBtn").addEventListener("click", () => this.showNotifs());
    this.refreshTopbar();
  },
  refreshTopbar() {
    const d = Store.load();
    const xp = Store.xp(d);
    document.getElementById("xpNum").textContent = Util.fmt(xp);
    document.getElementById("streakNum").textContent = Store.streak(d);
    const p = d.profile || {};
    ["sideName", "topName"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = p.name || "Bé Minh"; });
    ["sideClass", "topClass"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = p.cls || "Lớp 2A"; });
    ["sideAvatar", "topAvatar"].forEach((id) => { const el = document.getElementById(id); if (el) el.textContent = p.avatar || "👦"; });
  },
  showNotifs() {
    const notifs = Notify.build();
    document.getElementById("notifDot").hidden = !notifs.length;
    Modal.open(`<div class="pop-card"><h3>🔔 Thông báo</h3>
      ${notifs.length ? notifs.map((n) => `<a class="notif-row" href="${n.href}"><span>${n.icon}</span><span><b>${Util.esc(n.title)}</b><small>${Util.esc(n.sub)}</small></span></a>`).join("") : '<p class="muted">Hôm nay chưa có thông báo mới.</p>'}
      <button class="btn ghost" id="closeNotif">Đóng</button></div>`);
    document.getElementById("closeNotif").addEventListener("click", Modal.close);
    document.querySelectorAll("#modalCard .notif-row").forEach((a) => a.addEventListener("click", Modal.close));
  },
  async buildIndex() {
    try {
      const [sk, m, v] = await Promise.all([
        this.fetchJSON("data/skills/all_skills.json"),
        this.fetchJSON("data/curriculum/math.json"),
        this.fetchJSON("data/curriculum/vietnamese.json"),
      ]);
      const idx = [];
      (sk.skills || []).forEach((s) => idx.push({ type: "skill", title: s.name, sid: s.skill_id, href: `#/hoc/skill/${s.skill_id}`, sub: (s.subject === "MATH" ? "🧮 Toán · " : "📖 Tiếng Việt · ") + (s.domain || "") }));
      [m, v].forEach((cur) => (cur.topics || []).forEach((t) => {
        const book = this.bookFor(t.topic_id);
        (t.units || []).forEach((u) => (u.lessons || []).forEach((l) => idx.push({ type: "lesson", title: `Bài ${l.lesson_no}. ${l.name}`, href: `#/baitap/${book}/${l.lesson_no}`, sub: Util.bookName(book) + " · " + u.name })));
      }));
      this.state.index = idx;
    } catch (e) {}
  },
  bookFor(topicId) {
    const t = String(topicId).toUpperCase();
    if (t.indexOf("MATH_T1") === 0) return "math1";
    if (t.indexOf("MATH_T2") === 0) return "math2";
    if (t.indexOf("VIE_T2") === 0) return "vie2";
    return "vie1";
  },
  search(q, box) {
    q = q.trim().toLowerCase();
    if (!q) { box.hidden = true; return; }
    const res = this.state.index.filter((i) => i.title.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q)).slice(0, 8);
    box.innerHTML = res.length
      ? res.map((i) => `<a href="${i.href}"><span>${i.type === "skill" ? "🎯" : "📘"}</span><span><b>${Util.esc(i.title)}</b><small>${Util.esc(i.sub)}</small></span></a>`).join("")
      : `<div class="no-result">Không tìm thấy “${Util.esc(q)}”</div>`;
    box.hidden = false;
    box.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { box.hidden = true; document.getElementById("searchInput").value = ""; }));
  },
  async fetchJSON(path) {
    if (!this.state.cache[path]) {
      const res = await fetch(path);
      if (!res.ok) throw new Error("Không tìm thấy " + path);
      this.state.cache[path] = await res.json();
    }
    return this.state.cache[path];
  },
  async fetchText(path) {
    if (!this.state.cache[path]) {
      const res = await fetch(path);
      if (!res.ok) throw new Error("Không tìm thấy " + path);
      this.state.cache[path] = await res.text();
    }
    return this.state.cache[path];
  },
};

const Notify = {
  build() {
    const d = Store.load();
    const out = [];
    const due = Analytics.dueReviews(d).length;
    if (due) out.push({ icon: "🧠", title: `${due} kỹ năng đến hạn ôn`, sub: "Vào Ôn luyện để giữ trí nhớ lâu dài", href: "#/onluyen" });
    const st = Store.streak(d);
    if (st === 3) out.push({ icon: "🔥", title: "Chuỗi 3 ngày!", sub: "Bé đang học rất đều đặn", href: "#/thanhtich" });
    const xp = Store.xp(d);
    if (xp >= 100 && xp < 200) out.push({ icon: "⭐", title: "Đã đạt 100 XP", sub: "Mở phần thưởng đầu tiên", href: "#/thanhtich" });
    return out.slice(0, 5);
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
