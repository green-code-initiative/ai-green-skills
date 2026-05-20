---
name: browser-compatibility
description: Ensure retrocompatibility of code for browsers
metadata:
  tag: RGESN 2.4
  version: 1.0.0
  last-updated: 20/05/2026
---

## Purpose

Produce code, configuration, and review feedback that comply with criterion **RGESN 2.4** of the French General Eco-design Framework for Digital Services, so that the resulting service remains usable on older operating systems and browsers and does not force premature device replacement.

---

## Trigger

This skill is activated when:

- The user asks for code targeting a web, mobile, or desktop runtime without specifying a minimum version.
- The user edits or creates a compatibility-declaring file (`package.json` with `browserslist`, `build.gradle`, Xcode deployment target, `pyproject.toml`, `.nvmrc`, `engines` field…).
- The user explicitly asks to "apply the backward compatibility skill", "check RGESN 2.4", or to review compatibility of a piece of code.
- The user introduces a new dependency or a recent runtime API (e.g. `Array.prototype.findLast`, `structuredClone`, `View Transitions`, Android 14-only API).

---

## Source of Truth

The agent **must** consult the following references before producing any output.
It must **never** invent information not present in these sources.

| Source | URL / Path |
|---|---|
| RGESN 2.4 criterion (primary) | https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/critere/2.4/ |
| MDN Browser Compatibility tables | https://developer.mozilla.org/ |
| Can I use | https://caniuse.com/ |
| Android API levels | https://apilevels.com/ |
| Browserslist | https://browsersl.ist/ |

---

## Instructions

Execute the following steps **in order**. Do not skip any step.

1. **Identify and validate the input**
   Determine the runtime family (web, Android, iOS, desktop, server) and the target language. If the runtime or the existing minimum version is unclear, ask the user before proceeding — do not guess. If the project already declares a minimum version (`browserslist`, `minSdkVersion`, `IPHONEOS_DEPLOYMENT_TARGET`, `engines`, `python_requires`), read it and use it as the binding target.

2. **Consult the source of truth**
   For every non-trivial API, syntax, or dependency about to be used, look up its support window on the appropriate source (MDN/caniuse for web, apilevels for Android, Apple developer docs for iOS, official release notes for runtimes). Record the first stable release date.

3. **Apply the RGESN 2.4 window**

   | Service type | Minimum target |
   |---|---|
   | Native application (iOS, Android, desktop) | OS versions released **5 years ago or less**, counted from their first stable release |
   | Web service | Major browser versions released **2 years ago or less** |

   Reject any API or dependency whose support starts inside the forbidden zone, unless a polyfill or graceful degradation is provided.

4. **Produce code, configuration, and report**
   - Write the requested code, favouring well-established APIs.
   - For each enhancement that only works on recent runtimes, wrap it in **feature detection** (never user-agent sniffing) with a baseline-compatible fallback.
   - Declare the target compatibility explicitly in the project configuration (see Output Format).
   - Flag any third-party dependency that imposes a stricter constraint than RGESN 2.4.

5. **Self-check before responding** *(mandatory — never skip)*
   Verify that: (a) every API used has a documented support date older than the RGESN 2.4 window OR is guarded by feature detection with a fallback; (b) the declared target is present in the response; (c) no advice relies on "users update"; (d) every claim about API support cites the source consulted in step 2. Remove or fix any item that fails a check. Only then respond to the user.

---

## Fallback Behavior

| Situation | Agent action |
|---|---|
| Runtime, language, or existing minimum version is unknown | Ask the user: "Which runtime (web/Android/iOS/desktop/server) and which minimum version should this code support? If none is set, I will apply the RGESN 2.4 default (web: last 2 years; native: last 5 years)." |
| A required API has no compatible fallback within the target window | Produce the "no compatible solution" output block below, listing the blocking APIs and proposing alternatives |
| A source of truth (MDN, caniuse, apilevels) is unreachable | Inform the user; do not hallucinate support dates from memory; propose to retry or to use a conservative baseline |

---

## Output Format

The agent **must** produce output in exactly this structure:

    ## Code

    [code in the requested language]

    ## Declared compatibility

    - Target: [e.g. browsers >= 2024-05, Android >= 9 (API 28), iOS >= 16, Python >= 3.9, Node >= 18]
    - Method: [progressive enhancement / polyfill / version detection / build configuration]
    - Configuration snippet: [the exact `browserslist`, `minSdkVersion`, deployment target, or `engines` line to add]

    ## Points of attention

    - [Any API whose support is partial on the target window, with the source consulted]
    - [Third-party dependencies with their own constraints]
    - [Required polyfills, with the package name]

### When no compatible solution exists

    ## No compatible solution within the RGESN 2.4 window

    - Blocking API/feature: [name] — first stable support: [date], source: [URL]
    - Proposed alternatives: [list]
    - If the user still wants to proceed: explicit acknowledgement required before producing code.

---

## Constraints

The agent **must never**:

- [ ] Invent information not present in the declared sources of truth (MDN, caniuse, apilevels, RGESN 2.4 page)
- [ ] Skip the self-check step (Step 5) before responding
- [ ] Produce output in a format different from the one defined in Output Format
- [ ] Proceed when the runtime or minimum version is ambiguous — always ask first
- [ ] Use APIs released within the forbidden zone (last 6 months for web, last 2 years for native) without an explicit polyfill or fallback
- [ ] Rely on user-agent sniffing instead of feature detection
- [ ] Justify a recent API by "users update" or "browsers auto-upgrade"
- [ ] Add a dependency without verifying its own minimum-version constraints

---

## Examples

### Example 1 — Happy path: lazy loading on the web

**Input:**

    Add lazy loading of images on the product list page. The project's package.json has no browserslist field yet.

**Expected output:**

    ## Code

    // Feature detection: IntersectionObserver is supported in all browsers
    // released since 2019, well within the RGESN 2.4 web window (last 2 years).
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            io.unobserve(img);
          }
        }
      });
      document.querySelectorAll('img[data-src]').forEach(img => io.observe(img));
    } else {
      // Baseline fallback: load all images immediately.
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
      });
    }

    ## Declared compatibility

    - Target: browsers released in the last 2 years (RGESN 2.4 web window)
    - Method: progressive enhancement + feature detection
    - Configuration snippet:
        // package.json
        { "browserslist": ["> 0.5%", "last 2 years", "not dead"] }

    ## Points of attention

    - IntersectionObserver: supported since Chrome 51, Firefox 55, Safari 12.1, Edge 15 (source: MDN). Within the window.
    - No third-party dependency added.

### Example 2 — No compatible solution: View Transitions API

**Input:**

    Use the View Transitions API to animate route changes. We support browsers from the last 2 years.

**Expected output:**

    ## No compatible solution within the RGESN 2.4 window

    - Blocking API/feature: `document.startViewTransition` — first stable support: Chrome 111 (2023-03), Safari 18 (2024-09), Firefox not supported as of 2026-05 (source: caniuse).
    - Proposed alternatives:
        1. Implement the animation with CSS transitions on enter/leave classes (supported since 2015).
        2. Use a small library such as `auto-animate` (~3 KB) if the team accepts the dependency.
        3. Keep the View Transitions API as a progressive enhancement guarded by `if ('startViewTransition' in document)`, with the CSS-transition path as the baseline.
    - If the user still wants to proceed with the View Transitions-only approach: explicit acknowledgement required before producing code, since it excludes Firefox users entirely.

---

## Related Skills

| Skill file | Relationship |
|---|---|
| `SKILL_green_code_review.md` | Runs this skill's checks during a broader green/eco code review. |
| `SKILL_dependency_audit.md` | Verifies that third-party dependencies themselves respect the declared compatibility window. |

---

## Notes

- The 2-year and 5-year windows are rolling: re-evaluate every project at least once per year.
- For LTS-driven ecosystems (Node, Java, Python), prefer the oldest LTS still within the window over the newest release.
- This skill enforces compatibility; it does not optimize bundle size, payload, or energy consumption — those belong to sibling skills.

---

## Changelog

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-20 | Initial version, restructured from the legacy free-form SKILL.md against `SKILL_TEMPLATE.md`. |
