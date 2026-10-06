/* ALTERNATIVE R&B（仓库名 pbrnb）— 正文风格统一与事实软化（内容维护工具）
   用法：node _build/normalize.mjs
   作用：① 统一小节标题编号 ② 统一曲名标注（歌名不加书名号）③ 统一标签空格
        ④ 修正无法确证的时间/地点表述 ⑤ 合并重复来源的表述
   该脚本可重复运行（幂等）。 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "reviews");

/* 歌名：去掉书名号（专辑名保留《》） */
const SONGS = [
  "Nikes", "Ivy", "Pink + White", "Be Yourself", "Solo (Reprise)", "Solo", "Skyline To",
  "Self Control", "Good Guy", "Nights", "Pretty Sweet", "Facebook Story", "Close to You",
  "White Ferrari", "Seigfried", "Godspeed", "Futura Free",
  "Thinkin Bout You", "Sierra Leone", "Sweet Life", "Super Rich Kids", "Pilot Jones",
  "Crack Rock", "Pyramids", "Lost", "Monks", "Bad Religion", "Pink Matter", "Forrest Gump",
  "High for This", "What You Need", "House of Balloons / Glass Table Girls", "The Morning",
  "Wicked Games", "The Party & the After Party", "Coming Down", "Loft Music", "The Knowing", "Twenty Eight",
  "Frontline", "Waitin", "Take Me Apart", "Enough", "Jupiter", "Better", "LMK", "Truth or Dare",
  "S.O.S.", "Blue Light", "Onanon", "Turn to Dust", "Altadena",
  "Supermodel", "Love Galore", "Doves in the Wind", "Drew Barrymore", "Prom", "The Weekend",
  "Go Gina", "Garden (Say It Like Dat)", "Broken Clocks", "Anything", "Wavy (Interlude)",
  "Normal Girl", "Pretty Little Birds", "20 Something",
  "Rise", "Weary", "Cranes in the Sky", "Mad", "Don't You Wait", "Don't Touch My Hair",
  "Where Do We Go", "F.U.B.U.", "Borderline", "Junie", "Don't Wish Me Well", "Scales",
];
const songRe = new RegExp("《(" + SONGS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")》", "g");

/* 去掉书名号会吞掉原来的分隔符（《Ivy》《Self Control》→ IvySelf Control），
   因此需要补回：歌名紧跟歌名 → 顿号；歌名紧跟中文 → 空格。两条规则均幂等。 */
const ALT = [...SONGS].sort((a, b) => b.length - a.length).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
const JUNCTIONS = [
  { re: new RegExp(`(${ALT})(?=${ALT})`, "g"), to: "$1、", what: "补回歌名之间的顿号" },
  { re: new RegExp(`(${ALT})(?=[\\u4e00-\\u9fa5])`, "g"), to: "$1 ", what: "补回歌名与中文之间的空格" },
];

/* 中文排版：中英文/数字之间加空格（「盘古之白」），并合并多余空格 */
const CJK = "\\u4e00-\\u9fa5";
const SPACING = [
  { re: new RegExp(`([${CJK}])([A-Za-z0-9&])`, "g"), to: "$1 $2", what: "中英之间补空格" },
  { re: new RegExp(`([A-Za-z0-9&])([${CJK}])`, "g"), to: "$1 $2", what: "英中之间补空格" },
  { re: / {2,}/g, to: " ", what: "合并多余空格" },
];

/* 逐条定向修正：无法确证或来源表述重复的地方 */
const PATCHES = [
  [
    /英国月刊《The Wire》在 2016 年 11 月给出正面评论，Metacritic 收录的摘句称，其总体效果是他至今最彻底的一次对自身世界的阅读；Pitchfork 当时也以 Best New Music 推荐过这张专辑。/,
    "英国月刊《The Wire》在 2016 年 11 月给出正面评论，称其总体效果是他至今最彻底的一次对自身世界的阅读（该评论的摘句由 Metacritic 收录）；Pitchfork 当时也以 Best New Music 推荐过这张专辑。",
  ],
  [
    /它的写作与她搬去新奥尔良、在德州Marfa的停留有关。/,
    "它的写作与她搬去新奥尔良之后的阶段有关。",
  ],
  [
    /2012 年，英国《The Independent》发表了一篇题为/,
    "英国《The Independent》曾发表一篇题为",
  ],
];

const TAGS = {
  "另类R&B": "另类 R&B",
  "免费mixtape": "免费 mixtape",
  "概念专辑": "概念专辑",
};

let files = 0;
for (const f of (await readdir(dir)).filter((n) => n.endsWith(".json"))) {
  const file = path.join(dir, f);
  const raw = (await readFile(file, "utf8")).replace(/^\uFEFF/, "");
  const o = JSON.parse(raw);
  const before = JSON.stringify(o);
  let hits = [];

  for (const s of o.sections || []) {
    const h0 = s.h;
    s.h = s.h.replace(/^[一二三四五六七八九十]+、\s*/, "");
    for (const { re, to } of SPACING) s.h = s.h.replace(re, to);
    if (s.h !== h0) hits.push(`标题规范化：${h0} → ${s.h}`);
    s.ps = (s.ps || []).map((p) => {
      let out = p.replace(songRe, "$1");
      if (out !== p) hits.push("曲名去书名号");
      for (const { re, to, what } of JUNCTIONS) {
        if (re.test(out)) {
          const fixed = out.replace(re, to);
          if (fixed !== out) hits.push(what);
          out = fixed;
        }
      }
      for (const { re, to, what } of SPACING) {
        if (re.test(out)) {
          const fixed = out.replace(re, to);
          if (fixed !== out) hits.push(what);
          out = fixed;
        }
      }
      for (const [re, to] of PATCHES) {
        if (re.test(out)) {
          out = out.replace(re, to);
          hits.push("定向修正：" + to.slice(0, 18) + "…");
        }
      }
      return out;
    });
  }

  o.tags = (o.tags || []).map((t) => {
    const n = TAGS[t] ?? t;
    if (n !== t) hits.push(`标签规范化：${t} → ${n}`);
    return n;
  });

  if (JSON.stringify(o) !== before || hits.length) {
    await writeFile(file, JSON.stringify(o, null, 2) + "\n", "utf8");
    files++;
    console.log(`✓ ${f}`);
    [...new Set(hits)].forEach((h) => console.log(`    · ${h}`));
  } else {
    console.log(`= ${f} 无需改动`);
  }
}
console.log(`\n处理完成：改写 ${files} 个文件。`);
