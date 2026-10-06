/* ALTERNATIVE R&B（仓库名 pbrnb）— interactions
   theme toggle · scroll reveal · reading progress · waveform · marquee · filter */
(() => {
  "use strict";
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme ---------- */
  const KEY = "pbrnb-theme";
  const saved = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
  if (saved) root.setAttribute("data-theme", saved);
  else if (matchMedia("(prefers-color-scheme: light)").matches) root.setAttribute("data-theme", "day");

  const toggle = document.querySelector("[data-theme-toggle]");
  const flip = () => {
    const next = root.getAttribute("data-theme") === "day" ? "night" : "day";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch { /* ignore */ }
    toggle?.setAttribute("aria-label", next === "day" ? "切换到夜间模式" : "切换到日间模式");
  };
  toggle?.addEventListener("click", flip);
  addEventListener("keydown", (e) => {
    if (e.key === "t" && !e.metaKey && !e.ctrlKey && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "")) flip();
  });

  /* ---------- waveform ---------- */
  document.querySelectorAll("[data-wave]").forEach((el) => {
    const n = Number(el.dataset.wave) || 48;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const bar = document.createElement("i");
      const h = 14 + Math.round(Math.abs(Math.sin(i * 1.7)) * 82);
      bar.style.height = h + "%";
      if (!reduce) {
        bar.style.animationDelay = (i * 0.045).toFixed(2) + "s";
        bar.style.animationDuration = (1.05 + (i % 5) * 0.16).toFixed(2) + "s";
      }
      frag.append(bar);
    }
    el.append(frag);
  });

  /* ---------- marquee: duplicate for seamless loop ---------- */
  document.querySelectorAll(".marquee__row").forEach((row) => {
    row.innerHTML += row.innerHTML;
  });

  /* ---------- reveal on scroll ---------- */
  const revealables = document.querySelectorAll("[data-reveal]");
  /* 截图 / 打印用静态模式：?shot=1 时全部显示、不依赖滚动 */
  const shotMode = new URLSearchParams(location.search).has("shot");
  if (shotMode) {
    root.classList.add("shot");
    revealables.forEach((el) => el.classList.add("is-in"));
  }
  if ("IntersectionObserver" in window && !reduce && !shotMode) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealables.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 6, 5) * 55 + "ms";
      io.observe(el);
    });
  } else {
    revealables.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- reading progress ---------- */
  const bar = document.querySelector(".progress");
  if (bar) {
    let ticking = false;
    const update = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? Math.min(1, scrollY / h) * 100 : 0) + "%";
      ticking = false;
    };
    addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- index filter ---------- */
  const filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    const cards = [...document.querySelectorAll("[data-tags]")];
    const empty = document.querySelector("[data-empty]");
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      filterBar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const want = btn.dataset.filter;
      let shown = 0;
      cards.forEach((c) => {
        const hit = want === "all" || c.dataset.tags.split(",").includes(want);
        c.hidden = !hit;
        if (hit) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* ---------- footer year + vinyl pause ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  document.querySelectorAll(".vinyl").forEach((v) => {
    const spin = (state) => v.querySelectorAll(".vinyl__disc, .vinyl__label").forEach((d) => { d.style.animationPlayState = state; });
    v.addEventListener("mouseenter", () => spin("paused"));
    v.addEventListener("mouseleave", () => spin("running"));
  });
})();
