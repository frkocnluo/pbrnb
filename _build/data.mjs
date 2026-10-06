/* PBRNB(旧站名) — 站点数据
   站名已于本次改版从 PBRNB 改为 ALTERNATIVE R&B；仓库名与部署路径保持 pbrnb 不变。 */

export const site = {
  name: "ALTERNATIVE R&B",
  wordmark: "ALTERNATIVE R&B",
  formerName: "PBRNB",
  tagline: "低音、留白与失真",
  description:
    "一份关于另类 R&B（alternative R&B，2010 年代曾被叫作 PBR&B）的独立乐评档案：专辑长评、术语考据与聆听笔记。不做算法推荐，只写下判断。",
  // 部署地址（GitHub Pages 项目站点）
  url: "https://frkocnluo.github.io/pbrnb",
  repo: "https://github.com/frkocnluo/pbrnb",
  locale: "zh-CN",
  author: "ALTERNATIVE R&B",
};

/* 首页滚动条：厂牌 / 艺人 / 声音关键词 */
export const marquee = [
  "ALTERNATIVE R&B", "FRANK OCEAN", "THE WEEKND", "KELELA", "SZA",
  "SOLANGE", "BLOOD ORANGE", "MIGUEL", "FKA TWIGS", "SAMPA",
  "BOYS DON'T CRY", "WARP", "TDE", "SAINT RECORDS",
];

/* 评分体系（本站自定，10 分制） */
export const ratingScale = [
  { range: "9.0 – 10.0", label: "档案级", desc: "值得放进长期聆听序列的作品；声音与写作都经得起反复检视。" },
  { range: "8.0 – 8.9", label: "值得反复", desc: "有明确的方法与辨识度，个别处仍可挑剔。" },
  { range: "7.0 – 7.9", label: "局部成立", desc: "有亮点，但整体未达到它自己想要的高度。" },
  { range: "6.0 – 6.9", label: "尚可一听", desc: "完成度尚可，缺少决定性的判断。" },
  { range: "5.0 – 5.9", label: "平庸", desc: "声音上安全，写作上保守。" },
  { range: "0 – 4.9", label: "不推荐", desc: "无论从聆听还是写作角度，都难以给出理由。" },
];

const spotify = (q) => "https://open.spotify.com/search/" + encodeURIComponent(q);
const youtube = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);

/* 条目：kind = review | feature */
export const entries = [
  {
    kind: "review",
    slug: "blonde",
    artist: "Frank Ocean",
    title: "Blonde",
    zh: "金发",
    year: 2016,
    released: "2016-08-20",
    label: "Boys Don't Cry（独立发行）",
    score: 9.6,
    featured: true,
    cover: { from: "#1b1030", to: "#ff8a3d", art: "halo" },
    credits: "17 首 · 制作：Malay / Om'Mas Keith / Jon Brion 等 · 客串：Beyoncé、André 3000、Kim Burrell、Yung Lean",
    key: "Nikes / Nights / White Ferrari / Seigfried / Godspeed",
    listen: [
      { platform: "Spotify", url: spotify("Frank Ocean Blonde") },
      { platform: "YouTube", url: youtube("Frank Ocean Blonde full album") },
    ],
    further: [
      { label: "Wikipedia — Blonde (Frank Ocean album)", url: "https://en.wikipedia.org/wiki/Blonde_(Frank_Ocean_album)" },
      { label: "Metacritic — Blonde 媒体评论汇总（含 The Wire 2016 年 11 月评论）", url: "https://www.metacritic.com/music/blonde/frank-ocean/critic-reviews" },
    ],
  },
  {
    kind: "review",
    slug: "channel-orange",
    artist: "Frank Ocean",
    title: "Channel Orange",
    zh: "橘色频道",
    year: 2012,
    released: "2012-07-10",
    label: "Def Jam",
    score: 9.3,
    cover: { from: "#2b1a06", to: "#ffb057", art: "bars" },
    credits: "17 首 · 客串：Earl Sweatshirt、André 3000 · John Mayer 在 Pyramids 中弹吉他",
    key: "Thinkin Bout You / Pyramids / Super Rich Kids / Bad Religion / Pink Matter",
    listen: [
      { platform: "Spotify", url: spotify("Frank Ocean Channel Orange") },
      { platform: "YouTube", url: youtube("Frank Ocean Channel Orange full album") },
    ],
    further: [
      { label: "Wikipedia — Channel Orange", url: "https://en.wikipedia.org/wiki/Channel_Orange" },
    ],
  },
  {
    kind: "review",
    slug: "a-seat-at-the-table",
    artist: "Solange",
    title: "A Seat at the Table",
    zh: "桌边一席",
    year: 2016,
    released: "2016-09-30",
    label: "Saint Records / Columbia",
    score: 9.2,
    cover: { from: "#12261f", to: "#d9c48a", art: "split" },
    credits: "21 首（含 6 段 interlude）· 首周登顶 Billboard 200",
    key: "Cranes in the Sky / Don't Touch My Hair / Mad / F.U.B.U. / Borderline",
    listen: [
      { platform: "Spotify", url: spotify("Solange A Seat at the Table") },
      { platform: "YouTube", url: youtube("Solange A Seat at the Table full album") },
    ],
    further: [
      { label: "Wikipedia — A Seat at the Table", url: "https://en.wikipedia.org/wiki/A_Seat_at_the_Table" },
    ],
  },
  {
    kind: "review",
    slug: "ctrl",
    artist: "SZA",
    title: "Ctrl",
    zh: "控制",
    year: 2017,
    released: "2017-06-09",
    label: "Top Dawg Entertainment / RCA",
    score: 9.1,
    cover: { from: "#101d33", to: "#7fb2ff", art: "rings" },
    credits: "14 首 · 制作：ThankGod4Cody、Carter Lang、Cam O'bi、Scum 等 · TDE 首位女性签约艺人",
    key: "Drew Barrymore / Love Galore / The Weekend / Broken Clocks / 20 Something",
    listen: [
      { platform: "Spotify", url: spotify("SZA Ctrl") },
      { platform: "YouTube", url: youtube("SZA Ctrl full album") },
    ],
    further: [
      { label: "Wikipedia — Ctrl (SZA album)", url: "https://en.wikipedia.org/wiki/Ctrl_(SZA_album)" },
    ],
  },
  {
    kind: "review",
    slug: "take-me-apart",
    artist: "Kelela",
    title: "Take Me Apart",
    zh: "把我拆开",
    year: 2017,
    released: "2017-10-06",
    label: "Warp Records",
    score: 9.0,
    cover: { from: "#1a0a1f", to: "#b06cff", art: "blur" },
    credits: "13 首 · 合作：Jam City、Kingdom、Ariel Rechtshaid、Bok Bok 等",
    key: "LMK / Frontline / Waitin / Truth or Dare / Blue Light",
    listen: [
      { platform: "Spotify", url: spotify("Kelela Take Me Apart") },
      { platform: "YouTube", url: youtube("Kelela Take Me Apart full album") },
    ],
    further: [
      { label: "Wikipedia — Take Me Apart", url: "https://en.wikipedia.org/wiki/Take_Me_Apart" },
    ],
  },
  {
    kind: "review",
    slug: "house-of-balloons",
    artist: "The Weeknd",
    title: "House of Balloons",
    zh: "气球屋",
    year: 2011,
    released: "2011-03-21",
    label: "免费 mixtape（后收入 Trilogy 合集）",
    score: 8.9,
    cover: { from: "#210a12", to: "#ff2e7e", art: "rings" },
    credits: "10 首 · 制作：Doc McKinney、Illangelo · 采样 Siouxsie and the Banshees、Beach House",
    key: "High for This / Wicked Games / The Morning / House of Balloons / The Knowing",
    listen: [
      { platform: "Spotify", url: spotify("The Weeknd House of Balloons") },
      { platform: "YouTube", url: youtube("The Weeknd House of Balloons mixtape") },
    ],
    further: [
      { label: "Wikipedia — House of Balloons", url: "https://en.wikipedia.org/wiki/House_of_Balloons" },
    ],
  },
  {
    kind: "feature",
    slug: "what-is-pbrnb",
    artist: "专题",
    title: "一个啤酒玩笑，如何变成一种流派名",
    zh: "论 PBR&B 这个名字",
    year: 2011,
    released: "2011 年前后",
    label: "术语考据",
    cover: { from: "#0f0b1c", to: "#7a4dff", art: "split" },
    tagsExtra: ["术语", "批评"],
    listen: [],
    further: [
      { label: "Wikipedia — Alternative R&B", url: "https://en.wikipedia.org/wiki/Alternative_R%26B" },
      { label: "The Independent — Alternative R&B: Much more than bump'n'grind", url: "https://www.independent.co.uk/arts-entertainment/music/features/alternative-r-b-much-more-than-bump-n-grind-9142021.html" },
    ],
  },
];

/* 导航 */
export const nav = [
  { href: "index.html", label: "首页", en: "Index" },
  { href: "reviews/index.html", label: "乐评", en: "Reviews" },
  { href: "about.html", label: "关于", en: "About" },
];

export const manifesto = [
  { n: "01", h: "不做算法推荐", p: "没有个性化推荐位，没有播放量排行榜。这里只有写下来的判断，以及判断的理由。" },
  { n: "02", h: "把声音写清楚", p: "先描述你听到的东西：低频的位置、人声的距离、混响的长度，然后才谈论它意味着什么。" },
  { n: "03", h: "允许批评", p: "每一篇评论都必须包含具体的保留意见。没有缺点的赞美，对读者没有用处。" },
  { n: "04", h: "标注来源", p: "凡涉及事实性陈述，尽量给出可核验的出处；凡引用他人观点，明确标注为引语。" },
];
