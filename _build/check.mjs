/* ALTERNATIVE R&B（仓库名 pbrnb）— 自检：内部链接、资源引用、正文 JSON 结构
   用法：node _build/check.mjs  */
import { readFile, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { site } from "./data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const basePath = new URL(site.url).pathname.replace(/\/$/, "");
const problems = [];
const note = [];

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === ".git" || e.name === "_build" || e.name === "node_modules" || e.name === ".tools" || e.name === ".preview") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = await walk(root);
const htmls = files.filter((f) => f.endsWith(".html"));

/* 1. HTML 内部的本地链接与资源 */
for (const f of htmls) {
  const html = await readFile(f, "utf8");
  const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|data:|#|\/\/)/.test(ref)) continue;
    /* 站点绝对路径（如 404 页面）→ 校验它是否指向真实产物 */
    if (ref.startsWith("/")) {
      if (basePath && ref.startsWith(basePath + "/")) {
        const target = path.join(root, ref.slice(basePath.length + 1).split("#")[0]);
        if (!existsSync(target)) problems.push(`站点绝对断链 ${path.relative(root, f)} → ${ref}`);
      } else {
        note.push(`${path.relative(root, f)} 含站点绝对路径 ${ref}（部署前缀为 ${basePath || "/"}）`);
      }
      continue;
    }
    const target = path.resolve(path.dirname(f), ref.split("#")[0].split("?")[0]);
    if (!existsSync(target)) {
      problems.push(`断链 ${path.relative(root, f)} → ${ref}`);
    }
  }
  /* 基本结构 */
  for (const need of ["<title>", 'name="description"', "assets/css/style.css", "assets/js/app.js"]) {
    if (!html.includes(need)) problems.push(`缺少 ${need} ← ${path.relative(root, f)}`);
  }
  if ((html.match(/<h1/g) || []).length !== 1) {
    note.push(`${path.relative(root, f)} 的 <h1> 数量为 ${(html.match(/<h1/g) || []).length}`);
  }
  const txt = html.replace(/<[^>]+>/g, " ");
  if (txt.includes("undefined") || txt.includes("NaN")) problems.push(`渲染占位残留（undefined/NaN）← ${path.relative(root, f)}`);
  if (txt.includes("[object Object]")) problems.push(`渲染错误 [object Object] ← ${path.relative(root, f)}`);
}

/* 2. 正文 JSON */
const dir = path.join(root, "_build", "reviews");
if (existsSync(dir)) {
  const jsons = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  for (const j of jsons) {
    const raw = await readFile(path.join(dir, j), "utf8");
    if (raw.charCodeAt(0) === 0xfeff) problems.push(`${j} 含 BOM`);
    let o;
    try {
      o = JSON.parse(raw);
    } catch (e) {
      problems.push(`${j} JSON 解析失败：${e.message}`);
      continue;
    }
    for (const k of ["slug", "excerpt", "sections", "pullQuote"]) {
      if (!o[k]) problems.push(`${j} 缺少字段 ${k}`);
    }
    const ps = (o.sections || []).flatMap((s) => s.ps || []);
    const cjk = ((o.sections || []).flatMap((s) => [s.h, ...(s.ps || [])]).join("").match(/[\u4e00-\u9fa5]/g) || []).length;
    if (cjk < 600) problems.push(`${j} 正文偏短（${cjk} 汉字）`);
    if (ps.some((p) => /\*\*|^#|<[a-z]+>/i.test(p))) problems.push(`${j} 段落残留 markdown/HTML 标记`);
    note.push(`${j.padEnd(24)} 汉字 ${String(cjk).padStart(5)} · 小节 ${(o.sections || []).length} · 段落 ${ps.length}`);
  }
}

/* 3. 必需要有的产物 */
for (const f of ["index.html", "about.html", "404.html", "reviews/index.html", "feed.xml", "sitemap.xml", "robots.txt", ".nojekyll"]) {
  if (!existsSync(path.join(root, f))) problems.push(`缺少产物 ${f}`);
}

console.log("— 概览 —");
note.forEach((n) => console.log("  " + n));
console.log(`\n— 结果 — 页面 ${htmls.length} 个，问题 ${problems.length} 处`);
problems.forEach((p) => console.log("  ✗ " + p));
if (!problems.length) console.log("  ✓ 内部链接、资源引用与正文结构全部通过");
process.exit(problems.length ? 1 : 0);
