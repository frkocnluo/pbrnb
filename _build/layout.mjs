/* ALTERNATIVE R&B（仓库名 pbrnb）— HTML 渲染层（无依赖静态生成） */
import { site, nav, marquee } from "./data.mjs";

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* 路径前缀：root 页面 "" ，/reviews/ 页面 "../" */
export const up = (depth) => "../".repeat(depth);

export const scoreOf = (n) => (Number.isInteger(n) ? n.toFixed(1) : n.toFixed(1));

export const scoreLabel = (n) =>
  n >= 9 ? "档案级" : n >= 8 ? "值得反复" : n >= 7 ? "局部成立" : n >= 6 ? "尚可一听" : n >= 5 ? "平庸" : "不推荐";

export const badgeClass = (n) => (n >= 9 ? "" : n >= 8 ? " badge--amber" : " badge--cyan");

export function readingTime(text) {
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const latin = (text.match(/[A-Za-z]+/g) || []).length;
  return Math.max(1, Math.round((cjk + latin * 1.5) / 420));
}

const FONTS =
  "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400;1,9..144,600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap";

const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#07080a"/><circle cx="16" cy="16" r="11" fill="none" stroke="#e2e8f0" stroke-width="1.2"/><circle cx="16" cy="16" r="7" fill="none" stroke="#1d232e" stroke-width="1.2"/><circle cx="16" cy="16" r="3.2" fill="#d4ff00"/></svg>`
  );

/* ---------------- 通用外壳 ---------------- */
export function page({ title, description, path, current, depth = 0, body, bodyClass = "" }) {
  const p = up(depth);
  const url = site.url.replace(/\/$/, "") + "/" + path;
  const full = title ? `${title} · ${site.name}` : `${site.name} · ${site.tagline}`;
  const navHtml = nav
    .map((n) => {
      const isCurrent = current === n.href;
      return `<a href="${p}${n.href}"${isCurrent ? ' aria-current="page"' : ""}>${esc(n.en)}</a>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description || site.description)}">
<meta name="author" content="${esc(site.author)}">
<meta name="theme-color" content="#07080a">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description || site.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:locale" content="zh_CN">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:image" content="${esc(site.url.replace(/\/$/, ""))}/assets/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)} — ${esc(site.tagline)}">
<meta name="twitter:image" content="${esc(site.url.replace(/\/$/, ""))}/assets/img/og.png">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${p}assets/css/style.css">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)} 乐评" href="${p}feed.xml">
</head>
<body class="${bodyClass}">
<div class="progress" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<div class="scanlines" aria-hidden="true"></div>
<header class="topbar">
  <a class="brand" href="${p}index.html" aria-label="${esc(site.name)} 首页">
    <span class="brand__disc" aria-hidden="true"></span>
    <span class="brand__word">ALTERNATIVE <b>R&amp;B</b></span>
  </a>
  <nav class="nav" aria-label="主导航">${navHtml}</nav>
  <button class="toggle" type="button" data-theme-toggle aria-label="切换日间/夜间模式">
    <svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9"/></svg>
    <svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>
  </button>
</header>
${body}
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div class="footer__word" aria-hidden="true">ALTERNATIVE<br>R&amp;B</div>
      <div class="footer__meta">
        <span>${esc(site.tagline)} · 另类 R&amp;B 乐评档案</span>
        <span>© <span data-year>2026</span> ${esc(site.name)} · 文字原创，转载请注明出处</span>
        <span><a href="${esc(site.repo)}" rel="noopener">GitHub 仓库</a> · <a href="${p}feed.xml">RSS</a> · <a href="${p}about.html">关于与评分标准</a></span>
      </div>
    </div>
    <p class="footer__note">本站文字为原创乐评，非任何唱片公司、艺人和媒体的官方内容；涉及事实性信息时以文末「延伸阅读」中的公开来源为准。所有专辑封面均以抽象色块与几何图形示意，不使用受版权保护的原始封面图。</p>
  </div>
</footer>
<script src="${p}assets/js/app.js" defer></script>
</body>
</html>
`;
}

/* ---------------- 组件 ---------------- */
export function vinyl() {
  return `<div class="vinyl" aria-hidden="true">
    <div class="vinyl__disc"></div>
    <div class="vinyl__label">
      <span>ALTERNATIVE</span><span>R&amp;B</span><span>SIDE A · 33⅓</span>
    </div>
    <div class="vinyl__arm"></div>
  </div>`;
}

export function cover(entry, { tag = "", p = "" } = {}) {
  const { from = "#07080a", to = "#1a1f26", art = "halo", image } = entry.cover || {};
  const imgHtml = image
    ? `<img class="cover__img" src="${p}${image}" alt="${esc(entry.title)}" loading="lazy" decoding="async" />`
    : `<div class="cover__art cover__art--${art}"></div>`;
  const bgStyle = from && to ? ` style="background:linear-gradient(150deg, ${from}, ${to})"` : "";
  return `<div class="cover cover--hover"${bgStyle}>
    ${imgHtml}
    <div class="cover__overlay" aria-hidden="true"></div>
    <span class="cover__tag">${esc(tag || site.name)}</span>
  </div>`;
}

export function tags(list = []) {
  return `<div class="tags">${list.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>`;
}

export function marqueeStrip() {
  const row = marquee.map((m) => `<span>${esc(m)}</span>`).join("");
  return `<div class="marquee" aria-hidden="true"><div class="marquee__row">${row}</div></div>`;
}

export function trackRow(entry, i) {
  const no = String(i + 1).padStart(2, "0");
  const href = `reviews/${entry.slug}.html`;
  return `<a class="track" href="${href}">
    <span class="track__no">${no}</span>
    <span class="track__title">${esc(entry.title)}</span>
    <span class="track__artist">${esc(entry.artist)}${entry.kind === "feature" ? "" : " · " + esc(entry.year)}</span>
    <span class="track__score">${entry.score ? scoreOf(entry.score) : "专题"}</span>
  </a>`;
}

export function card(entry, depth = 0) {
  const p = up(depth);
  const tagStr = [...(entry.tags || []), entry.artist].join(",");
  return `<article class="card" data-reveal data-tags="${esc(tagStr)}">
    <a href="${p}reviews/${entry.slug}.html" aria-label="${esc(entry.artist)} — ${esc(entry.title)}">
      ${cover(entry, { tag: entry.kind === "feature" ? "专题 · FEATURE" : String(entry.year), p })}
    </a>
    <span class="card__artist">${esc(entry.artist)}</span>
    <h3 class="card__title"><a href="${p}reviews/${entry.slug}.html">${esc(entry.title)}</a></h3>
    <p class="card__excerpt">${esc(entry.excerpt)}</p>
    <div class="card__foot">
      ${entry.score ? `<span class="card__score">${scoreOf(entry.score)}</span><span class="badge${badgeClass(entry.score)}">${scoreLabel(entry.score)}</span>` : `<span class="badge badge--cyan">专题</span>`}
    </div>
  </article>`;
}
