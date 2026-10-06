/* ALTERNATIVE R&B（仓库名 pbrnb）— 静态站点生成器
   用法：node _build/build.mjs
   读取 _build/reviews/*.json（正文）+ _build/data.mjs（元信息）→ 输出到仓库根目录。 */
import { readFile, writeFile, mkdir, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { site, entries, marquee, manifesto, ratingScale, nav } from "./data.mjs";
import { page, esc, up, cover, tags, vinyl, marqueeStrip, trackRow, card, scoreOf, scoreLabel, badgeClass, readingTime } from "./layout.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const bodiesDir = path.join(here, "reviews");

const log = (...a) => console.log("[build]", ...a);

/* ---------- 0. 规范化部署地址 ---------- */
const base = site.url.replace(/\/$/, "");
const basePath = base === "" ? "" : new URL(base).pathname.replace(/\/$/, "");

/* ---------- 1. 载入正文 ---------- */
async function loadBodies() {
  if (!existsSync(bodiesDir)) return [];
  const files = (await readdir(bodiesDir)).filter((f) => f.endsWith(".json"));
  const out = [];
  for (const f of files) {
    const raw = await readFile(path.join(bodiesDir, f), "utf8");
    try {
      out.push(JSON.parse(raw.replace(/^\uFEFF/, "")));
    } catch (e) {
      console.error(`[build] ✗ ${f} JSON 解析失败：${e.message}`);
    }
  }
  return out;
}

const bodies = await loadBodies();
const bySlug = new Map(bodies.map((b) => [b.slug, b]));

const docs = [];
for (const e of entries) {
  const b = bySlug.get(e.slug);
  if (!b) {
    console.warn(`[build] ! 缺少正文：_build/reviews/${e.slug}.json —— 已跳过该条目`);
    continue;
  }
  const text = (b.sections || []).flatMap((s) => [s.h, ...(s.ps || [])]).join("");
  docs.push({ ...e, ...b, body: b, chars: (text.match(/[\u4e00-\u9fa5]/g) || []).length, minutes: readingTime(text) });
}

const featured = docs.find((d) => d.featured) || docs[0];
const totalChars = docs.reduce((n, d) => n + d.chars, 0);

/* ---------- 2. 首页 ---------- */
const hero = `<section class="hero" id="top">
  <div class="hero__glow hero__glow--a" aria-hidden="true"></div>
  <div class="hero__glow hero__glow--b" aria-hidden="true"></div>
  <div class="wrap hero__grid">
    <div>
      <p class="hero__kicker">ALTERNATIVE R&amp;B · 另类 R&amp;B 乐评档案</p>
      <h1 class="hero__title">ALTERNATIVE<em>R&amp;B</em><span class="sub">低音、留白与失真</span></h1>
      <p class="hero__lede">这个名字一开始是个玩笑：2010 年代初，英文媒体用 PBR&amp;B 概称一批难以归类的创作者。我们不再沿用那个玩笑做招牌，但继续记录它划出的声音地带——被位移的人声、被拉长的混响、被留白的副歌。这里写它们的来处，也写它们的代价。</p>
      <div class="hero__meta">
        <span>档案条目<b>${docs.length}</b></span>
        <span>正文约<b>${(totalChars / 10000).toFixed(1)} 万字</b></span>
        <span>评分制<b>10 分制</b></span>
      </div>
      <div class="wave" data-wave="64" aria-hidden="true"></div>
    </div>
    ${vinyl()}
  </div>
</section>`;

const featuredSection = featured
  ? `<section class="section" id="featured">
  <div class="wrap">
    <p class="eyebrow"><span class="n">本期主评</span> FEATURED REVIEW</p>
    <div class="featured" data-reveal>
      <a href="reviews/${featured.slug}.html" aria-label="${esc(featured.artist)} — ${esc(featured.title)}">
        ${cover(featured, { tag: `ALTERNATIVE R&B · ${featured.released}` })}
      </a>
      <div>
        <div class="score-block">
          <span class="score">${scoreOf(featured.score)}</span>
          <span class="score.out-of">/ 10</span>
          <span class="badge${badgeClass(featured.score)}">${scoreLabel(featured.score)}</span>
        </div>
        <h2 class="featured__title"><a href="reviews/${featured.slug}.html">${esc(featured.title)}</a></h2>
        <p class="featured__artist">${esc(featured.artist)} · ${esc(featured.year)} · ${esc(featured.label)}</p>
        <p class="featured__excerpt">${esc(featured.excerpt)}</p>
        <div class="meta-row">
          <span>发行 <b>${esc(featured.released)}</b></span>
          <span>正文 <b>${featured.chars} 字 / 约 ${featured.minutes} 分钟</b></span>
          <span>关键曲目 <b>${esc(featured.key)}</b></span>
        </div>
        <div class="meta-row"><span><a href="reviews/${featured.slug}.html" style="border-bottom:1px solid var(--magenta);color:var(--bone)">阅读全文 →</a></span></div>
      </div>
    </div>
  </div>
</section>`
  : "";

const tracklistSection = `<section class="section" id="tracklist">
  <div class="wrap">
    <p class="eyebrow"><span class="n">档案目录</span> TRACKLIST</p>
    <nav class="tracklist" aria-label="乐评目录">
      ${docs.map((d, i) => trackRow(d, i)).join("\n      ")}
    </nav>
  </div>
</section>`;

const manifestoSection = `<section class="section section--tight" id="manifesto">
  <div class="wrap">
    <p class="eyebrow"><span class="n">编辑方针</span> EDITORIAL LINE</p>
    <div class="grid">
      ${manifesto
        .map(
          (m) => `<div class="card" data-reveal>
        <span class="card__artist">${esc(m.n)}</span>
        <h3 class="card__title">${esc(m.h)}</h3>
        <p class="card__excerpt">${esc(m.p)}</p>
      </div>`
        )
        .join("\n      ")}
    </div>
  </div>
</section>`;

await writeFile(
  path.join(root, "index.html"),
  page({
    title: "",
    description: site.description,
    path: "index.html",
    current: "index.html",
    body: `<main>${hero}${marqueeStrip()}${featuredSection}${tracklistSection}${manifestoSection}</main>`,
  }),
  "utf8"
);
log("✓ index.html");

/* ---------- 3. 乐评索引 ---------- */
const tagCount = new Map();
docs.forEach((d) => (d.tags || []).forEach((t) => tagCount.set(t, (tagCount.get(t) || 0) + 1)));
const filters = [...tagCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([t]) => t);

const reviewsIndex = `<main>
<section class="section" style="padding-top:clamp(7rem,16vh,10rem)">
  <div class="wrap">
    <p class="eyebrow"><span class="n">全部乐评</span> REVIEWS · ${docs.length} ENTRIES</p>
    <h1 class="article__title" style="font-family:var(--serif);font-size:clamp(2.4rem,7vw,4.6rem);margin-bottom:1rem">乐评<span style="color:var(--violet-soft);font-style:italic">档案</span></h1>
    <p class="article__deck" style="font-size:1.05rem;color:var(--bone-2);max-width:44rem">从 2011 年的免费 mixtape 到 2017 年的俱乐部与卧室之间，这些专辑共同构成了「另类 R&amp;B」这个标签的边界与裂缝。每篇都包含具体的保留意见。</p>
    <div class="filter" data-filter-bar role="group" aria-label="按标签筛选" style="margin-top:2.4rem">
      <button type="button" data-filter="all" aria-pressed="true">全部</button>
      ${filters.map((t) => `<button type="button" data-filter="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("\n      ")}
    </div>
    <div class="grid" id="list">
      ${docs.map((d) => card(d, 1)).join("\n      ")}
    </div>
    <p data-empty hidden style="color:var(--bone-3);font-family:var(--mono);font-size:.8rem;letter-spacing:.16em;text-transform:uppercase">该标签下暂无条目</p>
  </div>
</section>
</main>`;

await mkdir(path.join(root, "reviews"), { recursive: true });
await writeFile(
  path.join(root, "reviews", "index.html"),
  page({
    title: "乐评档案",
    description: "ALTERNATIVE R&B 全部专辑乐评索引：Frank Ocean、The Weeknd、Solange、SZA、Kelela，以及关于 PBR&B 这个标签本身的专题。",
    path: "reviews/index.html",
    current: "reviews/index.html",
    depth: 1,
    body: reviewsIndex,
  }),
  "utf8"
);
log("✓ reviews/index.html");

/* ---------- 4. 文章页 ---------- */
function renderAside(d) {
  const listen = (d.listen || [])
    .map((l) => `<a href="${esc(l.url)}" rel="noopener">${esc(l.platform)} — 搜索收听</a>`)
    .join("");
  const further = (d.further || [])
    .map((l) => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)}</a>`)
    .join("");
  return `<aside class="aside" data-reveal>
    ${cover(d, { tag: d.kind === "feature" ? "专题 · FEATURE" : String(d.year) })}
    ${
      d.score
        ? `<div class="score-block"><span class="score">${scoreOf(d.score)}</span><span class="score.out-of">/ 10</span></div>
           <span class="badge${badgeClass(d.score)}">${scoreLabel(d.score)}</span>`
        : `<span class="badge badge--cyan">专题 · 不下评分</span>`
    }
    <div>
      <h3>唱片信息</h3>
      <dl>
        <div><dt>艺人</dt><dd>${esc(d.artist)}</dd></div>
        <div><dt>年份 / 发行</dt><dd>${esc(d.year)} · ${esc(d.released)}</dd></div>
        <div><dt>厂牌</dt><dd>${esc(d.label)}</dd></div>
        ${d.credits ? `<div><dt>制作与客串</dt><dd>${esc(d.credits)}</dd></div>` : ""}
        ${d.key ? `<div><dt>关键曲目</dt><dd>${esc(d.key)}</dd></div>` : ""}
        <div><dt>正文篇幅</dt><dd>${d.chars} 字 · 约 ${d.minutes} 分钟</dd></div>
      </dl>
    </div>
    ${listen ? `<div><h3>收听</h3><div class="readlist">${listen}</div></div>` : ""}
    ${further ? `<div><h3>延伸阅读</h3><div class="readlist">${further}</div></div>` : ""}
    <div><h3>标签</h3>${tags(d.tags || [])}</div>
  </aside>`;
}

for (const [i, d] of docs.entries()) {
  const prev = docs[i - 1];
  const next = docs[i + 1];
  const secs = d.sections || [];
  const cut = secs.length >= 4 ? 2 : secs.length - 1;
  const prose = secs
    .map((s, idx) => {
      const ps = (s.ps || [])
        .map((p, pi) => {
          const noDrop = idx === 0 && pi === 0 && !/^[\u4e00-\u9fa5]/.test(p.trim());
          return `<p${noDrop ? ' class="no-drop"' : ""}>${esc(p)}</p>`;
        })
        .join("\n        ");
      const block = `<section id="sec-${idx + 1}">
        <h2><span class="idx">${String(idx + 1).padStart(2, "0")}</span>${esc(s.h)}</h2>
        ${ps}
      </section>`;
      return idx === cut - 1 && d.pullQuote
        ? `${block}\n      <blockquote class="pull" id="pull">${esc(d.pullQuote)}</blockquote>`
        : block;
    })
    .join("\n      ");

  const body = `<main>
<article class="article">
  <div class="wrap">
    <header class="article__head">
      <p class="eyebrow"><span class="n">${d.kind === "feature" ? "专题" : "乐评"}</span> ${d.kind === "feature" ? "FEATURE" : "REVIEW"} · ${esc(d.released)}</p>
      <h1 class="article__title">${esc(d.title)}</h1>
      <p class="featured__artist">${esc(d.artist)}${d.kind === "review" ? ` · ${esc(d.year)} · ${esc(d.label)}` : ""}</p>
      <p class="article__deck">${esc(d.excerpt)}</p>
      <div class="meta-row">
        <span>阅读 <b>约 ${d.minutes} 分钟</b></span>
        <span>篇幅 <b>${d.chars} 字</b></span>
        ${d.score ? `<span>评分 <b>${scoreOf(d.score)} / 10</b></span>` : ""}
      </div>
    </header>
    <div class="article__grid">
      <div class="prose" id="body">${prose}</div>
      ${renderAside(d)}
    </div>
    <nav class="pager" id="pager" aria-label="上一篇 / 下一篇">
      ${
        prev
          ? `<a class="prev" href="${prev.slug}.html"><div class="k">← 上一篇</div><div class="t">${esc(prev.title)}</div></a>`
          : `<a class="prev" href="index.html"><div class="k">← 返回</div><div class="t">乐评档案</div></a>`
      }
      ${
        next
          ? `<a class="next" href="${next.slug}.html"><div class="k">下一篇 →</div><div class="t">${esc(next.title)}</div></a>`
          : `<a class="next" href="index.html"><div class="k">返回 →</div><div class="t">乐评档案</div></a>`
      }
    </nav>
  </div>
</article>
</main>`;

  await writeFile(
    path.join(root, "reviews", `${d.slug}.html`),
    page({
      title: `${d.artist} — ${d.title}`,
      description: d.excerpt,
      path: `reviews/${d.slug}.html`,
      current: "reviews/index.html",
      depth: 1,
      body,
    }),
    "utf8"
  );
  log(`✓ reviews/${d.slug}.html`);
}

/* ---------- 5. 关于 ---------- */
const aboutBody = `<main>
<section class="section" style="padding-top:clamp(7rem,16vh,10rem)">
  <div class="wrap">
    <p class="eyebrow"><span class="n">关于</span> ABOUT THIS ARCHIVE</p>
    <h1 class="article__title" style="font-family:var(--serif);font-size:clamp(2.4rem,7vw,4.6rem)">关于这份<span style="font-style:italic;color:var(--violet-soft)">档案</span></h1>
    <div class="article__grid">
      <div class="prose">
        <section>
          <h2><span class="idx">01</span>这是什么</h2>
          <p>ALTERNATIVE R&amp;B 是一份个人乐评档案，只写一件事：另类 R&amp;B —— 2010 年代曾被叫作 PBR&amp;B 的那片声音地带。这里的每一篇都是原创长评，写作方式参照英文音乐媒体的批评传统：先交代语境，再描述具体的声音，然后进入歌词与结构，最后给出判断，并且必须包含具体的保留意见。</p>
          <p>本站曾用名 PBRNB，那是把 PBR&amp;B 这个玩笑挪用作招牌的做法。改名不是因为 alternative 更准确，而是因为招牌上的玩笑总会比文章里的批评传播得更远——一个写作者不该让前者替后者说话。这段改名的理由写在那篇专题的最后一节里。</p>
          <p>本站不使用任何受版权保护的唱片封面原图。页面上的「封面」都是按专辑气质生成的抽象色块与几何图形，仅用于版面识别。</p>
        </section>
        <section>
          <h2><span class="idx">02</span>评分标准</h2>
          <p>10 分制。分数只用于横向比较同一份档案内的条目，不对应任何商业榜单，也不代表「客观质量」。分数与文字冲突时，以文字为准。</p>
          <div class="grid" id="scale" style="margin-top:1.4rem">
            ${ratingScale
              .map(
                (r) => `<div class="card"><span class="card__artist">${esc(r.range)}</span><h3 class="card__title">${esc(r.label)}</h3><p class="card__excerpt">${esc(r.desc)}</p></div>`
              )
              .join("\n            ")}
          </div>
        </section>
        <section>
          <h2><span class="idx">03</span>编辑方针</h2>
          ${manifesto.map((m) => `<p><strong style="color:var(--amber);font-weight:500">${esc(m.n)} ${esc(m.h)}</strong> —— ${esc(m.p)}</p>`).join("\n          ")}
        </section>
        <section>
          <h2><span class="idx">04</span>事实与引用</h2>
          <p>文中涉及发行日期、厂牌、曲目、参与者等事实性信息时，会尽量在文末「延伸阅读」给出可核验的公开来源。凡引用他人观点，都会明确标注为引语与出处；不会伪造任何媒体或评论者的原话。本站文字为原创乐评，与文中提到的艺人、厂牌、媒体均无隶属或合作关系。</p>
          <p>如果你发现事实错误，欢迎在 GitHub 仓库提交 issue 指正——这是这份档案唯一接受的更正渠道。</p>
        </section>
        <section>
          <h2><span class="idx">05</span>参考文献与延伸阅读</h2>
          <div class="readlist">
            <a href="https://en.wikipedia.org/wiki/Alternative_R%26B" rel="noopener">Wikipedia — Alternative R&amp;B（含 PBR&amp;B 别称的说明）</a>
            <a href="https://www.independent.co.uk/arts-entertainment/music/features/alternative-r-b-much-more-than-bump-n-grind-9142021.html" rel="noopener">The Independent — Alternative R&amp;B: Much more than bump'n'grind</a>
            <a href="https://www.metacritic.com/music/blonde/frank-ocean/critic-reviews" rel="noopener">Metacritic — 《Blonde》媒体评论汇总（含《The Wire》2016 年 11 月评论）</a>
            <a href="https://en.wikipedia.org/wiki/Blonde_(Frank_Ocean_album)" rel="noopener">Wikipedia — Blonde (Frank Ocean album)</a>
            <a href="https://en.wikipedia.org/wiki/House_of_Balloons" rel="noopener">Wikipedia — House of Balloons</a>
            <a href="https://en.wikipedia.org/wiki/A_Seat_at_the_Table" rel="noopener">Wikipedia — A Seat at the Table</a>
            <a href="https://en.wikipedia.org/wiki/Ctrl_(SZA_album)" rel="noopener">Wikipedia — Ctrl (SZA album)</a>
            <a href="https://en.wikipedia.org/wiki/Take_Me_Apart" rel="noopener">Wikipedia — Take Me Apart</a>
          </div>
        </section>
        <section>
          <h2><span class="idx">06</span>联系与转载</h2>
          <p>站点源码与全部文章以 Markdown/JSON 形式存放在 <a href="${esc(site.repo)}" rel="noopener" style="border-bottom:1px solid var(--line-strong)">GitHub 仓库</a>。转载请注明出处并保留原文链接；商业用途请先联系。</p>
        </section>
      </div>
      <aside class="aside" data-reveal>
        <div>
          <h3>站点信息</h3>
          <dl>
            <div><dt>名称</dt><dd>ALTERNATIVE R&amp;B（另类 R&amp;B 乐评档案）</dd></div>
            <div><dt>曾用名</dt><dd>PBRNB</dd></div>
            <div><dt>主题</dt><dd>另类 R&amp;B（PBR&amp;B）</dd></div>
            <div><dt>条目</dt><dd>${docs.length} 篇 · 约 ${(totalChars / 10000).toFixed(1)} 万字</dd></div>
            <div><dt>技术</dt><dd>零依赖静态站点 · GitHub Pages</dd></div>
            <div><dt>更新</dt><dd>不定期</dd></div>
          </dl>
        </div>
        <div>
          <h3>快捷键</h3>
          <p style="font-size:.86rem;color:var(--bone-2);margin:0">按 <span class="tag">T</span> 切换日间 / 夜间模式。</p>
        </div>
        <div>
          <h3>导航</h3>
          <div class="readlist">
            ${nav.map((n) => `<a href="${n.href}">${esc(n.label)} · ${esc(n.en)}</a>`).join("")}
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>
</main>`;

await writeFile(
  path.join(root, "about.html"),
  page({
    title: "关于与评分标准",
    description: "ALTERNATIVE R&B 的编辑方针、10 分制评分标准、事实与引用原则，以及可核验的参考文献。",
    path: "about.html",
    current: "about.html",
    body: aboutBody,
  }),
  "utf8"
);
log("✓ about.html");

/* ---------- 6. 404 ---------- */
await writeFile(
  path.join(root, "404.html"),
  page({
    title: "页面不存在",
    description: "找不到这个页面。",
    path: "404.html",
    current: "",
    body: `<main><section class="section" style="padding-top:clamp(8rem,22vh,14rem);min-height:70vh">
  <div class="wrap">
    <p class="eyebrow"><span class="n">404</span> SIGNAL LOST</p>
    <h1 class="article__title" style="font-family:var(--serif);font-size:clamp(2.6rem,9vw,6rem);line-height:.95">这一轨<br><em style="font-style:italic;color:var(--magenta)">是空的</em></h1>
    <p class="article__deck" style="margin-top:1.6rem">你访问的页面不存在，或者已经被挪走。回到档案目录继续听。</p>
    <div class="meta-row" style="margin-top:2rem">
      <span><a href="${esc(basePath)}/index.html" style="border-bottom:1px solid var(--magenta)">返回首页</a></span>
      <span><a href="${esc(basePath)}/reviews/index.html" style="border-bottom:1px solid var(--line-strong)">乐评档案</a></span>
    </div>
  </div>
</section></main>`,
  }),
  "utf8"
);
log("✓ 404.html");

/* ---------- 7. feed / sitemap / robots / .nojekyll ---------- */
const rfc822 = (d) => new Date(`${d}T09:00:00Z`).toUTCString();
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(site.name)} · ${esc(site.tagline)}</title>
  <link>${esc(base)}/</link>
  <description>${esc(site.description)}</description>
  <language>zh-cn</language>
  <atom:link href="${esc(base)}/feed.xml" rel="self" type="application/rss+xml"/>
  ${docs
    .map(
      (d) => `<item>
    <title>${esc(`${d.artist} — ${d.title}`)}</title>
    <link>${esc(base)}/reviews/${d.slug}.html</link>
    <guid isPermaLink="true">${esc(base)}/reviews/${d.slug}.html</guid>
    <pubDate>${rfc822(d.released)}</pubDate>
    <description>${esc(d.excerpt)}</description>
  </item>`
    )
    .join("\n  ")}
</channel>
</rss>
`;

const urls = ["index.html", "about.html", "reviews/index.html", ...docs.map((d) => `reviews/${d.slug}.html`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(base)}/${u === "index.html" ? "" : u}</loc></url>`).join("\n")}
</urlset>
`;

await writeFile(path.join(root, "feed.xml"), feed, "utf8");
await writeFile(path.join(root, "sitemap.xml"), sitemap, "utf8");
await writeFile(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`, "utf8");
await writeFile(path.join(root, ".nojekyll"), "", "utf8");
log("✓ feed.xml / sitemap.xml / robots.txt / .nojekyll");

/* ---------- 8. 资源 ---------- */
await mkdir(path.join(root, "assets", "css"), { recursive: true });
await mkdir(path.join(root, "assets", "js"), { recursive: true });
await copyFile(path.join(here, "styles.css"), path.join(root, "assets", "css", "style.css"));
await copyFile(path.join(here, "app.js"), path.join(root, "assets", "js", "app.js"));
log("✓ assets/css/style.css · assets/js/app.js");

log(`完成：${docs.length} 篇正文，共约 ${totalChars} 汉字。输出目录 ${root}`);
if (docs.length < entries.length) {
  log(`提示：还有 ${entries.length - docs.length} 篇正文未生成，补齐 JSON 后重新运行即可。`);
}
