---
name: ecodesign-architecture
description: Eco-designed architectural decisions for a web digital service
context: 
  Use whenever the user starts a new project, chooses a framework, hesitates between SPA and MPA, considers a PWA, structures a monorepo, 
  or asks about lifetime, hardware compatibility, or maintainability of an application. Covers the upstream technical choices that shape the
  footprint of the entire project (tech stack, dependencies, modularity, support for older devices). 
  Trigger even if the user just says "what framework for a sober site" or "I want it to work on old phones". 
  Always mobilize this skill before writing any structural code for a project starting up.
metadata:
    version: 1.0.0
    referentiel: 
      RGESN, RGESN-3.1, RGESN-3.2, RGESN-3.3, RGESN-3.4, RGESN-3.5, RGESN-3.6, RGESN-3.7,
      AFNOR-2201, AFNOR-2201-7, AFNOR-2201-8,
      WSG, WSG-1, WSG-4
    tag: architecture, api
    last-updated: 20/05/2026
---

# Ecodesign — Technical architecture

Structural technical choices to minimize the environmental footprint of a web digital service across its full lifecycle.

## Frameworks covered

- **RGESN 2024**: family 3 (Architecture), criteria 3.1 to 3.7
- **AFNOR SPEC 2201**: §7 (Architecture) and §8 (Specifications)
- **WSG**: Web Development (4.x) and Product/Business (1.x)

## Guiding principles

### 1. Pick the simplest tech that solves the problem

Hierarchy to apply in order:

1. **Static HTML** (static site generator: Eleventy, Hugo, Astro in static mode) — Minimal footprint, maximum lifespan.
2. **Server-rendered site** (light SSR: Astro, Fresh, Hono, Express + templates) — If interactivity is limited.
3. **MPA with islands of interactivity** (Astro Islands, htmx) — If interactivity is localized.
4. **SPA** (React, Vue, Svelte) — Only if justified by a real application (complex shared state, offline-first requirements).

**Rule**: never default to React/Vue/Angular. Justify the choice by real needs, not habit.

### 2. Backward compatibility (RGESN 5.1, 5.2)

- Target at minimum browsers more than 5 years old (Baseline "Widely available" of the Web Platform).
- No JS that breaks on older versions: provide fallbacks or make HTML self-sufficient (progressive enhancement).
- Test on an old device or with throttling 3G slow + CPU 4x slowdown (DevTools).
- Ban frameworks that don't support browsers > 2 years old (RGESN 5.1 priority).

### 3. Dependency sobriety

- **Audit every dependency** before adding: gzipped weight, transitive deps, alternatives. Tools: `bundlephobia.com`, `npm-check`.
- **Prefer native APIs**: `fetch` over axios, `Intl` over moment.js, `URLSearchParams` over a query-string lib.
- **Refuse heavy meta-frameworks** when a lighter one suffices (Next.js → Astro, Nuxt → Astro, Gatsby → 11ty).
- **JS bundle target**: < 100 KB gzipped for a standard site, < 50 KB for a content site.

### 4. Modularity and optional features (RGESN 2.4, AFNOR §6)

- A feature must be deactivatable if not used by the majority of users.
- No dead code in production: tree-shaking required, regular audit of unused routes.
- If a feature is used by < 10% of users: make it opt-in and loaded on demand.

### 5. Architecture designed for end-of-life (RGESN 1.5, AFNOR §15)

- Document from the start how to decommission the service (data export, redirects, archival).
- No dependency on a proprietary service without an open alternative.
- Portable code and data (open formats, standards).

## Checklist by project type

### Showcase site / blog / documentation
- [ ] Static generator (Astro, 11ty, Hugo)
- [ ] No JS except essential interactions
- [ ] Pre-rendered HTML served, no global hydration
- [ ] CSS < 20 KB, JS < 30 KB

### E-commerce / moderate SaaS application
- [ ] SSR or MPA with islands
- [ ] Partial hydration (Astro Islands, Qwik resumability)
- [ ] Initial bundle < 100 KB gzipped
- [ ] Mandatory code splitting per route

### Complex application (dashboard, editor, business tool)
- [ ] Justify the SPA choice in architecture doc
- [ ] Lightest framework available (Preact, Svelte, Solid) if SPA
- [ ] Aggressive lazy loading on secondary routes
- [ ] Controlled prefetching (`<link rel="prefetch">` targeted, not global)

## Anti-patterns to refuse

- Creating a Next.js/Nuxt project for a simple 5-page site → propose Astro or static.
- Importing full lodash to use `_.debounce` → write the function in 5 lines.
- Polyfill bundles for IE11 on a site targeting a modern audience (but conversely, don't break on old entry-level Android).
- Loading React + a 200 KB design system to display a contact form.
- Server-rendering with full hydration of a static content page.

## Expected output

When this skill is activated, Claude must:

1. **Ask or recall the functional question**: "Does this app really need to be a SPA?" (unless already decided).
2. **Propose the most sober stack** that meets the need, with justification.
3. **List minimal dependencies** with estimated gzipped weights.
4. **Specify the compatibility target** (browsers, devices).
5. **Document the choices** in an `ARCHITECTURE.md` file or in comments, referencing the matching RGESN/AFNOR/WSG criteria.

## Key criteria reference

- **RGESN 3.1**: "Does the digital service mainly use open protocols and data formats?" (priority)
- **RGESN 3.2**: "Does the service allow archival of content that no longer needs to be online?"
- **RGESN 3.6**: "Does the service limit the use of energy-intensive third-party libraries and frameworks?" (priority)
- **RGESN 5.1**: "Is the service usable on older hardware models?" (priority)
- **WSG 4.1**: Use sustainable frameworks and libraries
- **WSG 4.10**: Minimize dependencies
- **AFNOR SPEC 2201 §7.2**: Favor modular and evolutive architectures
