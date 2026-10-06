# PBRNB · 另类 R&B 乐评档案

> 低音、留白与失真 —— 一份关于另类 R&B（PBR&B）的独立乐评档案。

**在线阅读：<https://frkocnluo.github.io/pbrnb/>**

一个零依赖的静态站点：手写的设计系统 + 一个几十行的 Node 生成器，部署在 GitHub Pages 上，全球可访问。

---

## 内容

| 篇目 | 艺人 | 评分 |
| --- | --- | --- |
| Blonde | Frank Ocean | 9.6 |
| Channel Orange | Frank Ocean | 9.3 |
| A Seat at the Table | Solange | 9.2 |
| Ctrl | SZA | 9.1 |
| Take Me Apart | Kelela | 9.0 |
| House of Balloons | The Weeknd | 8.9 |
| 一个啤酒玩笑，如何变成一种流派名（专题） | — | 不下评分 |

全部文字为原创乐评，共约 9100 汉字。每篇都必须包含具体的保留意见。

**内容原则**

- 不直接引用歌词原文，只做描述与转述。
- 不伪造或冒充任何媒体、评论者的原话。凡是加引号的他人表述，都注明出处。
- 事实性陈述尽量在文末「延伸阅读」给出可核验的公开来源。
- 不使用受版权保护的唱片封面原图。页面上的「封面」都是按专辑气质生成的抽象色块与几何图形。

## 设计

主题取自 PBR&B 的听感本身：**暗夜底 + 电紫→霓虹品红渐变 + 胶片颗粒**。

- **字体**：Playfair Display（高对比衬线，用于标题与大字评分）、Inter（正文）、JetBrains Mono（标签、编号、元信息）。中文回退到思源宋体 / 苹方 / 微软雅黑。
- **母题**：旋转黑胶与唱臂、实时波形、滚动厂牌条（marquee）、按「曲目」排版的档案目录、页码化的正文小节。
- **交互**：滚动进场、顶部阅读进度、`REVIEWS` 页的标签筛选、黑胶悬停暂停。按 <kbd>T</kbd> 或点右上角图标切换日间 / 夜间模式（记忆到 localStorage，默认跟随系统）。
- **无障碍**：语义化标题层级、跳转焦点可见、`aria-current` / `aria-pressed` / `aria-label` 标注；`prefers-reduced-motion` 下关闭全部动效与滚动动画。
- **响应式**：1180px 容器，1000px / 700px 两个断点；`?shot=1` 为截图与打印提供静态模式。

## 技术

- **零运行时依赖**，没有框架、没有打包器、没有 CSS 预处理器。构建只需要 Node.js ≥ 18。
- 生成结果是纯静态 HTML，直接由 GitHub Pages 提供，无需 CI。
- 包含 `sitemap.xml`、`robots.txt`、`feed.xml`（RSS 2.0）、`.nojekyll`、自定义 `404.html`。

## 目录结构

```
.
├── index.html              # 首页（构建产物）
├── about.html              # 关于与评分标准（构建产物）
├── 404.html                # 404（构建产物）
├── reviews/
│   ├── index.html          # 乐评索引（构建产物）
│   └── <slug>.html         # 各篇文章（构建产物）
├── assets/
│   ├── css/style.css       # 构建产物（源：_build/styles.css）
│   ├── js/app.js           # 构建产物（源：_build/app.js）
│   └── img/og.png          # 社交分享图
├── feed.xml / sitemap.xml / robots.txt / .nojekyll
└── _build/                 # 源与工具
    ├── data.mjs            # 站点与专辑元信息、评分、延伸阅读链接
    ├── layout.mjs          # HTML 模板与组件
    ├── styles.css          # 设计系统（源）
    ├── app.js              # 交互（源）
    ├── build.mjs           # 生成器
    ├── check.mjs           # 自检：断链、资源引用、正文结构
    ├── normalize.mjs       # 正文风格统一（可重复运行）
    ├── serve.mjs           # 本地预览服务器
    └── reviews/*.json      # 文章正文（结构化）
```

> 构建产物直接提交到仓库根目录，这样 GitHub Pages 不需要任何构建步骤。

## 本地开发

```bash
npm run build     # 生成站点
npm run serve     # 本地预览 http://127.0.0.1:4173
npm run dev       # 构建 + 预览
node _build/check.mjs      # 自检（CI 友好：有问题时退出码为 1）
node _build/normalize.mjs  # 统一正文风格（幂等）
```

## 新增一篇乐评

1. 在 `_build/reviews/<slug>.json` 写入正文（结构见下）。
2. 在 `_build/data.mjs` 的 `entries` 里加上该条目的元信息（艺人、年份、厂牌、评分、封面配色、延伸阅读）。
3. 运行 `npm run build`。

正文 JSON 结构：

```json
{
  "slug": "blonde",
  "excerpt": "60–90 字的导语",
  "sections": [{ "h": "小标题", "ps": ["段落一", "段落二"] }],
  "pullQuote": "作为拉引言的一句判断",
  "tags": ["另类 R&B", "2016"]
}
```

## 评分标准

10 分制，只用于同一份档案内的横向比较，不对应任何商业榜单；分数与文字冲突时以文字为准。

| 分数 | 标签 |
| --- | --- |
| 9.0 – 10.0 | 档案级 |
| 8.0 – 8.9 | 值得反复 |
| 7.0 – 7.9 | 局部成立 |
| 6.0 – 6.9 | 尚可一听 |
| 5.0 – 5.9 | 平庸 |
| 0 – 4.9 | 不推荐 |

## 许可

文字内容采用 **CC BY-NC 4.0**：欢迎署名转载与引用，禁止商业使用。生成器与样式代码（`_build/`、`assets/`）采用 **MIT**。

本站与文中提到的艺人、厂牌、媒体均无隶属或合作关系，亦非其官方内容。

## 更正

发现事实错误请在 [Issues](https://github.com/frkocnluo/pbrnb/issues) 提出——这是这份档案唯一接受的更正渠道。
