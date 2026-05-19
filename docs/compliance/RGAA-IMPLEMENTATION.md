# Project-RGAA Implementation Guide

This guide explains how to implement WCAG 2.1 Level AA accessibility in Project's React frontend and NestJS backend.

> **Prerequisites**: Read [`@skill compliance-rgaa`](../../.agents/skills/compliance-rgaa/) for general accessibility knowledge first.

## 🏗️ Project Accessibility Architecture

### Frontend Stack

- **Framework**: React 18.x
- **UI Component Library**: Material-UI v4
- **Icons**: Material Icons
- **Forms**: React Hook Form + validation
- **Testing**: Jest + jest-axe + Storybook addon-a11y

### Key Module Locations

- **UI Components**: `libs/ui/` (Atomic design)
- **Feature Components**: `libs/web/[feature]/` (React feature modules)
- **Layout Components**: `libs/legacy-web/src/lib/` (legacy, refactor as needed)

---

## ✅ Accessibility Best Practices in Project

### 1. React Form Components

The `KeywordSearch` component demonstrates proper RGAA compliance:

```typescript
// ✅ libs/web/home/feature/src/lib/keyword-search/keyword-search.tsx
export function KeywordSearch() {
  const [keyword, setKeyword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) {
      setError('Keyword is required')
      return
    }
    // Submit logic
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="keyword-input">
          Search Keywords <span aria-label="required">*</span>
        </label>
        <input
          id="keyword-input"
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          aria-required="true"
          aria-describedby={error ? 'keyword-error' : undefined}
          placeholder="Enter keyword (e.g., 'project management')"
        />
        {error && (
          <span id="keyword-error" className="error" role="alert">
            {error}
          </span>
        )}
      </div>
      <button type="submit">Search</button>
    </form>
  )
}
```

**Key Practices**:

- ✅ Form labels linked via `htmlFor` + `id`
- ✅ Required field marked with `aria-required` + text indicator
- ✅ Error messages linked via `aria-describedby`
- ✅ Error container has `role="alert"` for screen reader announcement

### 2. Material-UI Components with Accessibility

Material-UI components are accessible by default, but Project adds custom props:

```typescript
// ✅ Use MUI components with accessibility props
import { TextField, Button, Box } from '@mui/material'

export function AccessibleForm() {
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        id="user-email"
        label="Email Address"
        type="email"
        required
        error={!!error}
        helperText={error}
        fullWidth
        margin="normal"
      />
      <Button type="submit" variant="contained" fullWidth>
        Send Email
      </Button>
    </Box>
  )
}
```

**Note**: Material-UI handles accessibility (ARIA labels, focus management) automatically.

### 3. Storybook Component Testing

Project uses Storybook with axe-core addon-a11y for automated accessibility testing.

**Setup** (already in `libs/storybook-host/`):

```typescript
// .storybook/main.ts
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-a11y', // Accessibility testing
    '@storybook/addon-essentials',
  ],
}

export default config
```

**Example Story with Accessibility Parameters**:

```typescript
// libs/ui/button/src/lib/button.stories.tsx
import { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'UI/Button',
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
}

export const Primary: StoryObj<typeof Button> = {
  args: {
    label: 'Click me',
    variant: 'contained',
  },
}

export const Icon: StoryObj<typeof Button> = {
  args: {
    icon: 'delete',
    ariaLabel: 'Delete item', // ✅ Required for icon-only buttons
  },
}

export default meta
```

**Run Tests**:

```bash
# Start Storybook
nx run storybook-host:storybook

# Navigate to http://localhost:6006
# Go to any component and click "Accessibility" tab
# axe-core will list violations and fixes
```

### 4. Color Contrast in Theme

Project's Material-UI theme ensures WCAG AA compliance:

```typescript
// apps/web/src/theme.ts
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#0a0a0a', // Dark gray for contrast
    },
    secondary: {
      main: '#1976d2',
    },
    error: {
      main: '#d32f2f', // Ensure 4.5:1 contrast ratio
    },
  },
  typography: {
    body1: {
      fontSize: '16px',
      lineHeight: 1.5, // ✅ 1.5x line spacing for readability
    },
  },
})

export default theme
```

### 5. Icon Accessibility

Project uses Material Icons. Always add labels:

```typescript
// ✅ Correct: Icon button with aria-label
import { Delete as DeleteIcon } from '@mui/icons-material'
import { IconButton } from '@mui/material'

<IconButton
  onClick={handleDelete}
  aria-label="Delete workshop" // ✅ Tells screen readers what button does
>
  <DeleteIcon />
</IconButton>

// ❌ Wrong: Icon without context
<IconButton onClick={handleDelete}>
  <DeleteIcon /> {/* Screen reader sees nothing */}
</IconButton>
```

### 6. Form Validation & Error Handling

Material-UI's TextField component displays errors accessibly:

```typescript
// ✅ Material-UI handles accessibility automatically
<TextField
  error={!!validationError}
  helperText={validationError} // Linked via aria-describedby
  required
  label="Project Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

---

## 🛠️ Testing Accessibility in Project

### Unit Tests with jest-axe

```bash
# Install test dependencies
npm install axe-core jest-axe
```

```typescript
// libs/ui/button/src/lib/button.spec.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from './button'

expect.extend(toHaveNoViolations)

describe('Button', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button label="Click me" onClick={() => {}} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('icon button needs aria-label', async () => {
    const { container } = render(<Button icon="delete" ariaLabel="Delete item" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

### Manual Testing Checklist

Before merging to main:

- [ ] Tab through all interactive elements — logical order?
- [ ] Screen reader test (VoiceOver on Mac):
  - [ ] Form labels read correctly
  - [ ] Error messages announced
  - [ ] Buttons describe their action
  - [ ] Images have alt text
- [ ] Color contrast (DevTools → Lighthouse):
  - [ ] Normal text ≥ 4.5:1
  - [ ] Large text ≥ 3:1
- [ ] Zoom to 200% — layout doesn't break?
- [ ] Keyboard only (no mouse) — can submit forms?

---

## �️ Mapping RGAA 4.1.2 Criteria to Project Implementation

The generic RGAA 4.1.2 skill defines **106 criteria across 13 thematic areas** (see [`.agents/skills/compliance-rgaa/criteria.json`](../../.agents/skills/compliance-rgaa/criteria.json)):

### Theme-by-Theme Project Mapping

#### **1. Images (Critères 1.1–1.9)**

**Focus**: Alt text, descriptions, and image purpose clarity.

| Criterion                          | Project Implementation                                    |
| ---------------------------------- | ------------------------------------------------------ |
| **1.1** Alt for information images | `<img alt="descriptive text" />` in `libs/ui/image/`   |
| **1.2** Decorative images hidden   | `<img role="presentation" />` or CSS background images |
| **1.3** Alt text pertinence        | Manual review during component PR                      |
| **1.4** CAPTCHA alternatives       | Use Material-UI's `RecaptchaV3` with fallback          |
| **1.5** Alternative CAPTCHA access | Provide email verification option                      |
| **1.6** Detailed descriptions      | Use `<figure>` + `<figcaption>` or `aria-describedby`  |
| **1.7** Description pertinence     | Manual review during code review                       |
| **1.8** Text images replaced       | Use styled text via Material-UI `Typography`           |
| **1.9** Caption associations       | `<figure><img /><figcaption /></figure>` pattern       |

**Project Files**: `libs/ui/image/`, `libs/legacy-web/src/lib/*-image*`

---

#### **2. Cadres (Critères 2.1–2.2)**

**Focus**: Page titles and iframe purpose clarity.

| Criterion                 | Project Implementation                                        |
| ------------------------- | ---------------------------------------------------------- |
| **2.1** Unique page title | Set via `document.title` or Next.js Helmet (if applicable) |
| **2.2** Iframe purpose    | All iframes have `title` attribute with purpose            |

**Project Files**: `apps/web/src/main.tsx` (page title), `libs/legacy-web/*` (iframe audits)

---

#### **3. Couleurs (Critères 3.1–3.3)**

**Focus**: Contrast ratios and non-color-only information.

| Criterion                                | Project Implementation                                      |
| ---------------------------------------- | -------------------------------------------------------- |
| **3.1** Text/background contrast ≥ 4.5:1 | Enforce via Material-UI theme (see Theme section)        |
| **3.2** Large text constraint ≥ 3:1      | Typography theme enforces `fontSize` + contrast          |
| **3.3** No color-only indicators         | Always add text label, icon, or pattern to color signals |

**Project Files**: `apps/web/src/theme.ts`, `libs/ui/button/`, `libs/ui/badge/`

**Testing**: Use DevTools → Lighthouse → Accessibility; verify via Storybook a11y addon

---

#### **4. Multimédia (Critères 4.1–4.13)**

**Focus**: Audio/video, transcripts, captions, and controls.

| Criterion                                    | Project Implementation                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| **4.1–4.2** Audio/video controls             | Use HTMLMediaElement with `<audio>`/`<video>` tags + visible controls               |
| **4.3–4.4** Transcripts/captions             | Store transcripts in database, display via `<details><summary>Transcript</summary>` |
| **4.5–4.6** Subtitle sync, audio description | Enforce timing via web video player framework                                       |
| **4.7–4.8** Media-only content alternatives  | Always provide transcript or alt content                                            |
| **4.9–4.13** Codec support, fallback content | Provide multiple formats (`mp4`, `webm`)                                            |

**Project Files**: If media is used, add to `libs/web/media/feature/` or use third-party embedded players

---

#### **5. Tableaux (Critères 5.1–5.8)**

**Focus**: Table structure, headers, and associations.

| Criterion                                    | Project Implementation                    |
| -------------------------------------------- | -------------------------------------- | ----------------- |
| **5.1–5.2** Header semantics                 | Use `<thead>`, `<th scope="col         | row">`, `<tbody>` |
| **5.3** Table summary (if complex)           | Add `<caption>` or `aria-labelledby`   |
| **5.4–5.8** Accessibility for complex tables | Test with screen readers; use axe-core |

**Project Example** (if tables are used):

```typescript
// ✅ Correct table markup
<table>
  <caption>Workshop Schedule</caption>
  <thead>
    <tr>
      <th scope="col">Date</th>
      <th scope="col">Topic</th>
      <th scope="col">Instructor</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2024-03-25</td>
      <td>React Basics</td>
      <td>John Doe</td>
    </tr>
  </tbody>
</table>
```

**Project Files**: `libs/ui/data-table/` (if component exists), or Material-UI `<Table>`

---

#### **6. Liens (Critères 6.1–6.2)**

**Focus**: Link purpose and context clarity.

| Criterion                          | Project Implementation                                                   |
| ---------------------------------- | --------------------------------------------------------------------- |
| **6.1** Link text is explicit      | Never use "Click here" or "More"; use "Learn more about React basics" |
| **6.2** Title attribute redundancy | Avoid if link text already explains; if rare, ensure title ≠ href     |

**Project Pattern**:

```typescript
// ✅ Clear link text
<Link to="/workshops/advanced-react">Advanced React Workshop</Link>

// ❌ Avoid
<Link to="/workshops/advanced-react">Click here</Link>
```

**Project Files**: All links across `libs/web/`, review during code review

---

#### **7. Scripts (Critères 7.1–7.5)**

**Focus**: JavaScript accessibility and non-JavaScript fallbacks.

| Criterion                              | Project Implementation                                                   |
| -------------------------------------- | --------------------------------------------------------------------- |
| **7.1** Script accessibility           | Ensure interactive components respond to keyboard (Tab, Enter, Space) |
| **7.2** System triggering              | Use native `<button>` + `<form>`, not custom div triggers             |
| **7.3** Focus management               | After dynamic content, refocus or announce via ARIA live regions      |
| **7.4–7.5** Scripting errors, warnings | Provide visible error messages, test via jest-axe                     |

**Project Pattern**:

```typescript
// ✅ Accessible custom component
<button
  onClick={handleFilter}
  onKeyDown={(e) => { if (e.key === 'Enter') handleFilter() }}
  aria-pressed={isActive}
>
  Filter Results
</button>

// Alternative: Use Material-UI Button (handles accessibility)
<Button onClick={handleFilter}>Filter Results</Button>
```

**Project Files**: All event handlers in `libs/web/`, especially `search`, `filter`, `recommendation` features

---

#### **8. Éléments Obligatoires (Critères 8.1–8.10)**

**Focus**: HTML validity, language, and structural validity.

| Criterion                                             | Project Implementation                                                         |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| **8.1–8.2** HTML validity, DOCTYPE                    | React / Next.js auto-generates valid HTML; use `ESLint` + `jsx-a11y` plugin |
| **8.3** Language declaration                          | Set `<html lang="fr">` in `apps/web/src/index.html`                         |
| **8.4–8.8** Charset, viewport, title, valid structure | Include in main template; validate via W3C HTML validator                   |
| **8.9–8.10** Mobile viewport, license accessibility   | Ensure responsive design, license on separate accessible page               |

**Project Files**: `apps/web/public/index.html`, ESLint config

---

#### **9. Structuration de l'Information (Critères 9.1–9.4)**

**Focus**: Headings, lists, and logical structure.

| Criterion                                         | Project Implementation                                            |
| ------------------------------------------------- | -------------------------------------------------------------- |
| **9.1** Headings properly ordered                 | `<h1>` once per page, then `<h2>`–`<h6>` in hierarchical order |
| **9.2** Lists marked semantically                 | Use `<ul>`, `<ol>`, `<li>`; not `<div>` + `<br>`               |
| **9.3–9.4** Emphasis (strong, em) vs presentation | Use `<strong>`, `<em>`; avoid `<b>`, `<i>` classes             |

**Project Pattern**:

```typescript
// ✅ Correct heading hierarchy
<h1>Workshops</h1>
<section>
  <h2>Featured</h2>
  <ul>
    <li><h3>React Basics</h3></li>
    <li><h3>Vue Advanced</h3></li>
  </ul>
</section>

// Material-UI helpers
import { Typography } from '@mui/material'
<Typography variant="h1">Workshops</Typography>
<Typography variant="h2">Featured</Typography>
```

**Project Files**: All feature components across `libs/web/`, verify heading hierarchy

---

#### **10. Présentation de l'Information (Critères 10.1–10.14)**

**Focus**: Styling, spacing, readability, and responsive layout.

| Criterion                                                       | Project Implementation                                    |
| --------------------------------------------------------------- | ------------------------------------------------------ |
| **10.1–10.2** Text styling, text color adherence                | Inherit from Material-UI theme; test at 200% zoom      |
| **10.3–10.5** Line height ≥ 1.5, letter spacing, word spacing   | Material-UI `Typography` enforces `lineHeight: 1.5`    |
| **10.6–10.7** Justified text, blink avoidance                   | Use `text-align: left`; avoid CSS animations           |
| **10.8–10.9** Text visible over backgrounds, graphics justified | Use sufficient `background` / `color` contrast         |
| **10.10–10.14** Responsive design at 200% zoom, text reflow     | Media queries in `libs/web/` SCSS, test responsiveness |

**Project Testing**:

```bash
# Test 200% zoom in DevTools
# Settings → Rendering → Zoom → 200%
# Verify text reflow, no horizontal scrolling
```

**Project Files**: `apps/web/src/styles.scss`, all `*.scss` in `libs/`

---

#### **11. Formulaires (Critères 11.1–11.13)**

**Focus**: Form labels, error identifications, and field associations.

| Criterion                                      | Project Implementation                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| **11.1** Input labels present and linked       | Every `<input>` has associated `<label htmlFor="id">`                        |
| **11.2** Input associated with label           | Use `id` + `htmlFor`, not placeholder alone                                  |
| **11.3** Instructions visible near inputs      | Use Material-UI `helperText` or nearby `<small>`                             |
| **11.4–11.6** Required/disabled indicators     | Use Material-UI `required` prop + visible `*` + `aria-required`              |
| **11.7–11.9** Same inputs consistently labeled | Audit across forms; use design system                                        |
| **11.10–11.13** Grouping, error identification | Use `<fieldset>` + `<legend>` for groups; link errors via `aria-describedby` |

**Project Pattern** (react-hook-form + Material-UI):

```typescript
// ✅ Accessible form with Material-UI
<form onSubmit={handleSubmit(onSubmit)}>
  <Controller
    name="email"
    control={control}
    render={({ field, fieldState: { error } }) => (
      <TextField
        {...field}
        label="Email Address"
        type="email"
        required
        error={!!error}
        helperText={error?.message} // Linked via ARIA
        fullWidth
      />
    )}
  />
  <Button type="submit">Submit</Button>
</form>
```

**Project Files**: `libs/web/[feature]/feature/*-form*`, review during PR

---

#### **12. Navigation (Critères 12.1–12.11)**

**Focus**: Site structure, breadcrumbs, and navigation consistency.

| Criterion                                                   | Project Implementation                                          |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| **12.1** Navigation consistency across pages                | Maintain header/footer layout in all pages                   |
| **12.2** Page location clarity                              | Add breadcrumbs or current page highlight                    |
| **12.3** Navigation purpose                                 | Menu items clearly describe page purpose                     |
| **12.4–12.11** Search, sitemap, repeated content skip links | Add `<a href="#main">Skip to main content</a>` at page start |

**Project Pattern**:

```typescript
// ✅ Skip link (accessible but hidden)
<a href="#main" className="sr-only">
  Skip to main content
</a>

<nav>{/* Header nav */}</nav>

<main id="main">{/* Page content */}</main>

<footer>{/* Footer nav */}</footer>

// CSS: Hide but keep accessible
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

**Project Files**: `libs/legacy-web/src/lib/layout/`, `apps/web/src/app.tsx`

---

#### **13. Consultation (Critères 13.1–13.12)**

**Focus**: Document accessibility, readability, and downloadable content.

| Criterion                                                | Project Implementation                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| **13.1** PDF/document accessibility                      | If hosting PDFs, ensure PDF/A-1a or provide HTML version                    |
| **13.2–13.8** Readability (font size, text reflow, etc.) | React app inherits Material-UI responsive typography                        |
| **13.9–13.12** Language, abbreviations, unusual terms    | Avoid unexplained jargon; add `<abbr title="...">HTML</abbr>` for first use |

**Project Files**: If documents exist, audit separately; React app content follows Criteria 10+

---

### 📊 Criteria Query Tool

Use the included validation script to explore all 106 criteria:

```bash
# Full validation report
node .agents/skills/compliance-rgaa/scripts/validate-criteria.js

# View specific theme criteria (e.g., Theme 11: Forms)
node .agents/skills/compliance-rgaa/scripts/validate-criteria.js --theme 11

# View specific criterion (e.g., 3.1: Contrast)
node .agents/skills/compliance-rgaa/scripts/validate-criteria.js --id 3.1

# Export all criteria as JSON (for tooling)
node .agents/skills/compliance-rgaa/scripts/validate-criteria.js --json > criteria-export.json
```

See [`.agents/skills/compliance-rgaa/scripts/README.md`](../../.agents/skills/compliance-rgaa/scripts/) for full CLI documentation.

---

## �📋 Project Accessibility Checklist

Before code review:

- [ ] **Semantic HTML**: Using `<button>`, `<label>`, not `<div>` + onClick
- [ ] **Forms**: All inputs have associated `<label>`
- [ ] **ARIA**: Buttons/errors have `aria-label`, `aria-describedby`
- [ ] **Icons**: Icon-only buttons have `aria-label`
- [ ] **Keyboard**: Tab order is logical, focus visible
- [ ] **Color**: Text contrast ≥ 4.5:1, not color-only indicators
- [ ] **Errors**: Messages linked via `aria-describedby` + error text
- [ ] **Tests**: jest-axe tests added, Storybook stories have a11y addon
- [ ] **Alt Text**: Images have meaningful `alt` text

---

## 🔗 References

- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Material-UI Accessibility**: https://mui.com/material-ui/guides/accessibility/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **jest-axe**: https://github.com/nickcolley/jest-axe
- **Storybook a11y**: https://storybook.js.org/docs/react/writing-stories/accessibility-testing

---

**Last Updated**: March 18, 2026  
**WCAG Version**: 2.1 Level AA  
**Framework**: React 18.x + Material-UI v4
