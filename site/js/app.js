/* Lop 2 Mastery - app shell */
"use strict";

const App = {
  state: { cache: {} },
  routes: [
    { id: "home", label: "Trang chủ", render: Views.home },
    { id: "curriculum", label: "Chương trình", render: Views.curriculum },
    { id: "skills", label: "Kỹ năng", render: Views.skills },
    { id: "graph", label: "Bản đồ kiến thức", render: Views.graph },
    { id: "data", label: "Bộ dữ liệu", render: Views.data },
    { id: "docs", label: "Tài liệu", render: Views.docs },
  ],
  async init() {
    this.renderNav();
    this.route();
    window.addEventListener("hashchange", () => this.route());
    document.getElementById("navToggle").addEventListener("click", () => {
      document.getElementById("nav").classList.toggle("open");
    });
  },
  route() {
    const h = location.hash.replace(/^#\/?/, "").split("/")[0] || "home";
    const found = this.routes.find((r) => r.id === h) || this.routes[0];
    document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("active", b.dataset.route === found.id));
    document.getElementById("nav").classList.remove("open");
    const app = document.getElementById("app");
    app.innerHTML = '<div class="loading">Đang tải…</div>';
    found.render(app).catch((e) => {
      app.innerHTML = `<div class="notice">Lỗi khi tải dữ liệu: ${Util.esc(String(e && e.message || e))}</div>`;
    });
    window.scrollTo(0, 0);
  },
  renderNav() {
    document.getElementById("nav").innerHTML = this.routes
      .map((r) => `<button data-route="${r.id}" data-nav="${r.id}">${r.label}</button>`)
      .join("");
    document.querySelectorAll("[data-nav]").forEach((b) =>
      b.addEventListener("click", () => (location.hash = "#/" + b.dataset.nav))
    );
    document.querySelector(".brand").addEventListener("click", () => (location.hash = "#/"));
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

const Util = {
  esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },
  importanceBadge(lv) {
    const map = { A: "CORE", B: "IMPORTANT", C: "SUPPORT", D: "FAST" };
    return `<span class="badge ${lv}">${map[lv] || lv}</span>`;
  },
  masteryBadge(lv) {
    return `<span class="badge mastery${lv}">M${lv}</span>`;
  },
  bookName(key) {
    const m = { math1: "Toán 2 · Tập 1", math2: "Toán 2 · Tập 2", vie1: "Tiếng Việt 2 · Tập 1", vie2: "Tiếng Việt 2 · Tập 2" };
    return m[key] || key;
  },
  refLabel(r) {
    return `${Util.bookName(r.book)}${r.volume ? " · " + r.volume : ""}${r.lesson ? " · " + r.lesson : ""} · PDF tr.${r.pdf_page ?? "?"}${r.printed_page ? ` (sách tr.${r.printed_page})` : ""}`;
  },
  /* Markdown siêu gọn (đủ cho tài liệu dự án) */
  md(src) {
    let s = String(src || "");
    s = s.replace(/^```([\s\S]*?)^```/gm, (m, code) => "<pre><code>" + this.esc(code.replace(/\n$/, "")) + "</code></pre>");
    s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");
    s = s.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
    s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");
    s = s.replace(/^&gt; (.*)$/gm, "<blockquote>$1</blockquote>");
    const tableRx = /^(\|.+\|\s*\n\|[-: |]+\|\s*\n)((?:\|.+\|\s*\n?)+)/gm;
    s = s.replace(tableRx, (m, head, body) => {
      const rows = (head + body).trim().split(/\n/).filter((l) => !/^[| -]+$/.test(l.replace(/\|/g, "")));
      const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const isHead = rows.length > 0 && rows[0].includes("---") === false;
      let html = "<table><thead><tr>" + cells(rows[0]).map((c) => `<th>${c}</th>`).join("") + "</tr></thead><tbody>";
      rows.slice(2).forEach((r) => { html += "<tr>" + cells(r).map((c) => `<td>${c}</td>`).join("") + "</tr>"; });
      return html + "</tbody></table>";
    });
    s = s.replace(/^\s*[-*] (.*)$/gm, "<li>$1</li>");
    s = s.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
    s = s.replace(/^\s*\d+\. (.*)$/gm, "<li>$1</li>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    s = s.replace(/\n{2,}/g, "\n");
    s = s.replace(/\n(?!<)/g, "<br>");
    return s;
  },
};

document.addEventListener("DOMContentLoaded", () => App.init());
