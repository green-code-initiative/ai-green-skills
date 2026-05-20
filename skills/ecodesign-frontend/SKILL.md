---
name: ecodesign-frontend
description: Write eco-designed HTML, CSS and JavaScript on the client side. Use every time the user asks to generate or refactor UI components, pages, markup, styling, or JS code running in the browser. Covers: light DOM, semantic HTML, minimal performant CSS, parsimonious JavaScript, sober animations, removal of heavy libraries, web performance practices with direct environmental impact. Trigger even for micro-tasks ("write me a sober menu", "make this component in pure CSS"). Always activate for any frontend code production, alongside the media and content-ux skills when relevant.
metadata:
   tag: ecoconception, front, html
   version: 1.0.0
   last-updated: 20/05/2026
   referentiel: RGESN
---

# Ecodesign — Frontend (HTML / CSS / JS)

Practices to write minimalist, performant, energy-sober client code. Each byte saved on the frontend means less network transfer, less CPU/GPU compute, and therefore less energy consumed on the user's device — which represents the dominant share of a web service's footprint.

## Frameworks covered

- **RGESN 2024**: families 6 (UX/UI) and 7 (Frontend), criteria 6.1 to 7.10
- **AFNOR SPEC 2201**: §9 (User interface), §10 (Front-end)
- **WSG**: Web Development 4.x (especially 4.4 to 4.9)

## HTML principles

### Semantics above all
- Use HTML5 semantic tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`). They avoid identification CSS and improve accessibility.
- Avoid generic `<div>` when a semantic tag exists.
- Target DOM depth: **< 15 levels**, **< 1500 nodes** per page (RGESN 7.1, WSG 4.4).

### Self-supporting HTML
- Served HTML must be readable without JS. The page must display its main content without running a single script.
- Test by disabling JS in DevTools: content must remain accessible.

### Native forms
- Use native HTML types (`type="email"`, `type="tel"`, `type="date"`, `type="number"`) instead of custom JS pickers.
- Native validation attributes (`required`, `pattern`, `min`, `max`) before resorting to JS.
- `<input list="...">` + `<datalist>` rather than a JS combobox.

## CSS principles

### Minimal, native CSS
- No heavy CSS framework by default. Tailwind is acceptable if aggressively purged (< 20 KB in prod).
- Use **native CSS variables** (`--primary-color`) rather than a preprocessor when possible.
- Favor **CSS Grid** and **Flexbox** rather than hacks or layout libs.
- Ban Bootstrap-like libs imported whole without purging.

### Sober animations
- Prefer `transform` and `opacity` for animations (GPU, no reflow).
- Avoid infinite animations (autoplay loops): they consume CPU/GPU continuously (RGESN 6.5, WSG UX 1.5).
- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
  }
  ```
- No purely decorative scroll animations (parallax, AOS).

### Selectors and specificity
- Short, flat selectors. Avoid deeply nested selectors that slow down style recalc.
- No global `*` with expensive properties.

### Fonts (see also `ecodesign-media`)
- Maximum 2 font families, 2 weights per family.
- `font-display: swap` systematically.
- Prefer a system font (`font-family: system-ui, -apple-system, sans-serif;`) when design allows — saves 50 to 300 KB.

## JavaScript principles

### As little as possible
- Target: **critical JS bundle < 30 KB gzipped** for a standard site, < 70 KB for an application.
- For each JS feature, ask: "Can it be done without? In pure HTML/CSS?"

### HTML/CSS patterns that replace JS
- Dropdown menu: `<details>` / `<summary>` — no JS.
- Modal: native `<dialog>` + `showModal()` — lightweight.
- Tabs: anchors + `:target` or radio + `:checked` + CSS.
- Carousel: CSS `scroll-snap` — no Swiper.js (90+ KB).
- Lazy loading: native `loading="lazy"` on `<img>` and `<iframe>`.
- Form validation: native HTML attributes + `:invalid` CSS.

### When JS is necessary
- **Vanilla JS first** — no framework for a localized interaction.
- **No jQuery** (and no full lodash) in 2026.
- **Dynamic imports**: load a heavy component only on user interaction (`import('./heavy.js')` on click).
- **Native Web Components** rather than framework components for small islands.
- **Debounce / throttle** on frequent events (scroll, resize, input).

### Event listeners
- Event delegation rather than N individual listeners.
- `passive: true` on scroll/touch listeners.
- Clean up listeners on unmount (avoid leaks).

### No permanent background execution
- No fast `setInterval` polling. Prefer Server-Sent Events or WebSockets where appropriate, otherwise polling > 30s.
- No permanent `requestAnimationFrame` if no rendering is needed.
- Stop animation loops when the page is hidden (`document.visibilityState !== 'visible'`).

## Anti-patterns to systematically refuse

- Importing React/Vue to display a hamburger menu.
- Aggressive polyfills for minority browsers (verify the real target first).
- Continuously animated `box-shadow` or `filter: blur` on large elements (GPU cost).
- Heavy client-side analytics tracker (> 50 KB). Prefer a server-side solution (Plausible, Pirsch, logs).
- Decorative web fonts on secondary text (footer, captions).
- `console.log` left in production.

## Generation checklist

Before delivering code, check:

- [ ] The page renders its main content **without JS**.
- [ ] Reasonable DOM depth (< 15 levels).
- [ ] No JS framework if not necessary.
- [ ] Animations respecting `prefers-reduced-motion`.
- [ ] Fonts limited and sobrly loaded.
- [ ] No unjustified short-interval `setInterval`.
- [ ] Native lazy loading on images below the fold.
- [ ] Critical CSS and JS inlined if < 14 KB (first TCP packet).

## Good practice examples

### Dropdown menu without JS
```html
<details class="menu">
  <summary>Products</summary>
  <ul>
    <li><a href="/products/a">Product A</a></li>
    <li><a href="/products/b">Product B</a></li>
  </ul>
</details>
```

### Modal without framework
```html
<button onclick="dlg.showModal()">Open</button>
<dialog id="dlg">
  <p>Content</p>
  <form method="dialog"><button>Close</button></form>
</dialog>
```

### Pure CSS carousel
```html
<div class="carousel">
  <img src="1.webp" alt="…">
  <img src="2.webp" alt="…">
</div>
<style>
.carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.carousel img {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
</style>
```

## Key criteria reference

- **RGESN 6.4** (priority): "Does the service avoid trap content (dark patterns)?"
- **RGESN 7.1** (priority): "Does the service limit DOM depth of pages?"
- **RGESN 7.3**: "Does the service use appropriate compression for CSS and JavaScript files?"
- **RGESN 7.5**: "Does the service mainly use stylesheets rather than image or video animations?"
- **WSG 4.4**: Minimize DOM complexity
- **WSG 4.5**: Reduce JavaScript footprint
- **AFNOR SPEC 2201 §10.3**: Limit external libraries and favor native code
