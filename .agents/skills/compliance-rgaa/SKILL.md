---
name: compliance-rgaa
description: Ensures digital accessibility for all users (WCAG 2.1 AA compliance, French RGAA 4.1.2 standard)
category: Accessibility
keywords: accessibility, WCAG, RGAA, ARIA, keyboard-navigation, screen-readers, inclusive-design
license: MIT
---

# SKILL: RGAA 4.1.2 — Generic Accessibility Referential

**Référentiel Général d'Amélioration de l'Accessibilité** (General Accessibility Improvement Framework)

## 📋 Overview

- **Standard**: RGAA 4.1.2 (equivalent to WCAG 2.1 Level AA)
- **Version**: Stable since September 20, 2019
- **Scope**: All digital services in France
- **Total Criteria**: 106 organized into 13 thematic areas
- **Official Reference**: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
- **RGAA 5**: In development, publication planned end 2026

---

## 🏗️ The 13 Thematic Areas

### 1. **Images** (9 criteria)

Ensuring images are accessible via text alternatives, descriptions, and proper handling of decorative imagery.

- Image alternatives (alt text)
- Image descriptions (long descriptions)
- Decorative image treatment
- CAPTCHA accessibility

### 2. **Frames/Iframes** (2 criteria)

Labeling and identification of frame/iframe elements.

- Frame title presence
- Frame title relevance

### 3. **Colors** (3 criteria)

Ensuring information is not conveyed by color alone and sufficient contrast is maintained.

- Information vs. color dependency
- Text contrast ratios (WCAG AA: 4.5:1 normal, 3:1 large)
- UI component contrast

### 4. **Multimedia** (13 criteria)

Accessibility of audio, video, and interactive media.

- Transcripts and audio descriptions
- Captions for synchronized media
- Media player keyboard/pointer control
- Automatic sounds control

### 5. **Tables** (8 criteria)

Proper structure, headers, and accessibility of data tables.

- Table headers (th, scope)
- Data cell-header association
- Table summaries and titles
- Distinction between data and layout tables

### 6. **Links** (2 criteria)

Clear, explicit link text that conveys purpose.

- Link text clarity and context
- Screen reader accessible link names

### 7. **Scripts** (5 criteria)

Browser script compatibility with assistive technologies and keyboard control.

- Script/JavaScript AT compatibility
- Keyboard operability of dynamic content
- Context change management
- Status messages to AT

### 8. **Essential Elements** (10 criteria)

Foundational HTML attributes and requirements.

- DOCTYPE declaration
- HTML validity
- Language declaration (lang attribute)
- Page title presence and relevance
- Language changes marked (lang on elements)

### 9. **Information Structure** (4 criteria)

Logical heading hierarchy and document outline.

- Heading hierarchy (h1-h6 proper nesting)
- Document structure coherence
- List structure (ul, ol, li)
- Quotations properly marked

### 10. **Information Presentation** (14 criteria)

CSS-based design, text sizing, focus visibility, and responsive layout.

- CSS usage for presentation
- Content visibility without CSS
- Text zoom support (200% minimum)
- Focus indicators on all interactive elements
- Responsive design (256px height, 320px width viewports)
- Text spacing customization (line-height, letter-spacing)
- Visible hover/focus content

### 11. **Forms** (13 criteria)

Form field labeling, grouping, validation, and user control.

- Field labels (label element or aria-label)
- Consistent field labels across pages
- Label-field proximity
- Field grouping (fieldset/legend)
- Button text clarity
- Input validation and error messages
- Error recovery suggestions
- Autocomplete field purpose detection

### 12. **Navigation** (11 criteria)

Multiple navigation methods, consistent placement, keyboard operability, and logical tab order.

- Multiple navigation systems (menu + search/sitemap)
- Consistent navigation placement
- Sitemap presence and accessibility
- Landmark regions (header, main, footer)
- Skip links to main content
- Logical tab order
- Keyboard traps prevention
- Single-key shortcut control

### 13. **Consultation** (12 criteria)

Timeouts, window control, downloadable documents, and gesture alternatives.

- Session timeout control
- No unsolicited window.open()
- Accessible document downloads (PDF, Office docs)
- Cryptic content alternatives (ASCII art, emojis)
- Flash/luminosity hazards
- Motion and animation control
- Orientation support (portrait/landscape)
- Device gesture alternatives

---

## 📊 Detailed Criteria & Test Methods

All 106 criteria with **questions**, **test methods**, **WCAG references**, and **exceptions** are defined in:

📁 **[criteria.json](./criteria.json)** — Machine-readable structure for tools/scripts

Quick navigation:

```json
{
  "themes": [
    {"id": "1", "name": "Images", "criteria": [...]},
    {"id": "2", "name": "Cadres", "criteria": [...]},
    ...
    {"id": "13", "name": "Consultation", "criteria": [...]}
  ]
}
```

---

## 🔍 Testing Methodologies

### Automated Testing

- **Browser DevTools**: Lighthouse, WebAIM, Axe
- **Color Contrast**: Contrast Ratio checkers (WCAG AA/AAA)
- **HTML Validation**: W3C Validator, Axe, Jest-axe
- **Dynamic Content**: Check AT announcements (aria-live, role=status)

### Manual Testing

- **Keyboard Navigation**: Tab through entire page → all interactive elements reachable?
- **Screen Reader**: NVDA (Windows), JAWS, Apple VoiceOver (Mac/iOS)
- **Visual Inspection**: Focus indicators, color-only cues, text alternatives
- **Responsive Testing**: 256px height, 320px width viewports
- **Disable CSS**: Ensure content readable without styles

### Specific Area Tests

| Area           | Key Test                         | Tool                            |
| -------------- | -------------------------------- | ------------------------------- |
| **Images**     | Alt text presence & relevance    | DevTools, manual                |
| **Colors**     | Contrast ratio ≥ WCAG AA         | Contrast Ratio tool, Lighthouse |
| **Forms**      | Labels correctly associated      | Screen reader, DevTools         |
| **Navigation** | Keyboard operability, tab order  | Keyboard only                   |
| **Scripts**    | Dynamic content AT compatibility | Screen reader                   |
| **Tables**     | Headers associated with cells    | DevTools, screen reader         |
| **Media**      | Captions, transcripts, controls  | Manual inspection               |

---

## 🛠️ Integration in Your Project

### Step 1: Understand Your Stack

The RGAA applies universally, but implementation varies by technology:

- **Static Sites**: HTML/CSS/JS fundamentals
- **SPAs**: Focus on dynamic content, ARIA, focus management
- **Backend APIs**: Consider document formats (PDFs), error responses
- **Mobile**: Gesture alternatives, orientation handling

### Step 2: Choose Testing Tools

**Automated**:

```bash
# HTML/ARIA validation (e.g., JavaScript project)
npm install --save-dev axe-core jest-axe

# CSS color contrast (npm/yarn)
npm install --save-dev axe-core-web
```

**Manual**:

- Keyboard-only navigation (disable mouse)
- Screen reader testing (NVDA, VoiceOver)
- Browser zoom to 200%
- Mobile device orientation

### Step 3: Assess Criteria by Theme

1. Review applicable criteria for your project type
2. Test against test methods in **criteria.json**
3. Document exceptions and justifications
4. Create implementation-specific guidelines (see docs/compliance/ for examples)

### Step 4: Integrate into CI/CD

```javascript
// Example: Automated axe test in test suite
import { axe } from 'jest-axe'

test('homepage is accessible', async () => {
  const { container } = render(<Homepage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

---

## 📚 Resources & References

### Official Documents

- **RGAA Criteria & Tests**: https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/
- **RGAA Glossary**: https://accessibilite.numerique.gouv.fr/methode/glossaire/
- **WCAG 2.1 Standard**: https://www.w3.org/WAI/WCAG21/quickref/

### Tools & Standards

- **Axe DevTools**: https://www.deque.com/axe/devtools/
- **WAVE Browser Extension**: https://wave.webaim.org/
- **Contrast Ratio**: https://webaim.org/resources/contrastchecker/
- **HTML Validator**: https://validator.w3.org/
- **W3C ARIA**: https://www.w3.org/WAI/ARIA/

### Assistive Technologies (for testing)

- **NVDA** (Windows, free): https://www.nvaccess.org/
- **JAWS** (Windows, commercial): https://www.freedomscientific.com/
- **VoiceOver** (Mac/iOS, built-in)
- **Narrator** (Windows, built-in)

---

## 🚀 Common Patterns & Best Practices

### Semantic HTML

```html
<!-- ✅ Use semantic elements -->
<nav aria-label="Main">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Content here...</p>
  </article>
</main>

<footer>
  <p>&copy; 2024 Company</p>
</footer>

<!-- ❌ Avoid generic divs for structure -->
<div class="nav">...</div>
<div class="content">...</div>
```

### Form Accessibility

```html
<!-- ✅ Labels properly associated -->
<label for="email">Email:</label>
<input id="email" type="email" name="email" autocomplete="email" />

<!-- Grouped fields -->
<fieldset>
  <legend>Preferences</legend>
  <label><input type="radio" name="theme" /> Light</label>
  <label><input type="radio" name="theme" /> Dark</label>
</fieldset>

<!-- ❌ Missing label association -->
<input type="email" placeholder="Email" />
```

### Color & Contrast

```css
/* ✅ WCAG AA compliant (4.5:1 for normal text) */
color: #333333; /* Dark gray on white = 11.56:1 ratio */
background-color: #ffffff;

/* ❌ Insufficient contrast */
color: #999999; /* Light gray on white = 3.99:1 ratio */
background-color: #ffffff;
```

### Keyboard Navigation

```javascript
// ✅ All interactive elements keyboard accessible
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Click me
</button>

// ❌ Click-only, not keyboard operable
<div onClick={handleClick}>Click me</div>
```

### ARIA (when semantic HTML isn't enough)

```html
<!-- ✅ Use semantic HTML first -->
<button>Save</button>
<nav aria-label="Breadcrumb">...</nav>

<!-- ARIA only when semantic HTML unavailable -->
<div role="button" tabindex="0" onClick="{...}" onKeyDown="{...}">Save</div>
```

---

## 📋 Verification Checklist

Before considering work complete, verify:

- [ ] All 106 criteria reviewed for your use case
- [ ] Automated tests pass (axe, Lighthouse, etc.)
- [ ] Keyboard-only navigation works
- [ ] Screen reader testing completed
- [ ] Color contrast meets WCAG AA
- [ ] Text zoom to 200% readable
- [ ] Focus indicators visible on all interactive elements
- [ ] Mobile responsiveness (256px height, 320px width)
- [ ] Form labels and validation messages present
- [ ] Exceptions documented with justifications
- [ ] Tests integrated into CI/CD pipeline

---

## 🔗 Project-Specific Implementation

For implementation examples specific to your technology stack:

- **See `docs/compliance/RGAA-IMPLEMENTATION.md`** for a React + NestJS case study (optional reference)
- Each project should create its own implementation guide based on this generic RGAA referential

---

## 📞 Support & Questions

- Official French government support: https://accessibilite.numerique.gouv.fr/
- WCAG guidelines: https://www.w3.org/WAI/
- Community resources: WebAIM, TPGi, Deque, A11y Project
