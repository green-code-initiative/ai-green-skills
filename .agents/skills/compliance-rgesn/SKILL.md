---
name: compliance-rgesn
description: Ensures eco-responsible IT practices and minimizes environmental impact
category: Sustainability & Green IT
keywords: RGESN, green IT, carbon footprint, energy efficiency, sustainability, e-waste, 2024 edition
license: MIT
version: 2024
---

# SKILL: RGESN — Environmental Sustainability & Green IT (2024 Edition)

## 📖 What is RGESN?

**Règles de Gouvernance Environnementale du Système Numérique** (Environmental Governance Rules for Digital Systems)

- **Standard**: French government initiative for eco-responsible IT
- **Edition**: 2024 (latest)
- **Scope**: All digital services must minimize environmental impact
- **Focus**: 8 pillars covering design, content, code, infrastructure, hardware, testing, and organization
- **Reference**: https://www.numerique.gouv.fr/publications/rgesn/

## 🎯 RGESN 2024: Les 9 Thématiques Officielles (78 Critères)

Le RGESN officiel du gouvernement français structure la gouvernance environnementale autour de **9 thématiques** contenant **78 critères** spécifiques.

### Thématique 1: Stratégie Numérique Durable (9 Critères)

**Principle**: Minimize scope, prioritize essentials, design for longevity

**Criteria**:

- [ ] Define minimal viable product (MVP) scope—avoid feature bloat
- [ ] Design for multi-year device support (avoid forcing upgrades)
- [ ] Prioritize essential functionality over nice-to-have features
- [ ] Reduce user interface complexity
- [ ] Plan for accessibility to support diverse devices/abilities
- [ ] Use responsive design to avoid duplicate content versions

**Implementation Examples**:

```typescript
// ✅ Minimal design: Core features only
interface WorkshopUI {
  title: string
  description: string
  schedule: Date
  participants: User[]
  // No: auto-saving, animations, real-time sync if not essential
}

// ❌ Feature bloat: Unnecessary complexity
interface WorkshopUI {
  title: string
  description: string
  schedule: Date
  richTextEditor: boolean
  autoSave: boolean
  realtimeSync: boolean
  animatedTransitions: boolean
  darkMode: boolean
  // Too many non-essential features
}
```

### 👥 Pillar 2: User Engagement & Behavior

**Principle**: Design interfaces that guide efficient user actions, minimize energy-intensive interactions

**Criteria**:

- [ ] Reduce unnecessary form fields—only ask for essentials
- [ ] Implement keyboard-first navigation (less CPU than mouse tracking)
- [ ] Minimize scrolling requirements—prioritize above-the-fold content
- [ ] Avoid auto-refreshing, auto-playing content
- [ ] Disable animations unless critical for UX
- [ ] Provide dark mode option (reduces screen energy on OLED displays)
- [ ] Minimize push notifications and background processes
- [ ] Guide users toward efficient workflows

**Implementation Examples**:

```typescript
// ✅ Efficient interactions
const SearchForm = () => (
  <form>
    <input autoFocus placeholder="Search..." /> {/* Avoid unnecessary animations */}
    <button type="submit">Search</button>
  </form>
)

// ❌ Energy-intensive interactions
const SearchForm = () => (
  <form>
    <input
      onKeyUp={debounce(liveSearch, 300)} {/* Unnecessary polling */}
      placeholder="Search..."
    />
    <div className="animated-suggestions">
      {/* Auto-updating suggestions with animations */}
    </div>
  </form>
)
```

### 📄 Pillar 3: Content & Service Optimization

**Principle**: Minimize data transfer and storage requirements

**Criteria**:

- [ ] Compress images (WebP format, responsive sizes)
- [ ] Minimize video usage—use GIFs or simple animations instead
- [ ] Optimize PDF/document file sizes
- [ ] Remove unnecessary metadata from files
- [ ] Deduplicate content across pages
- [ ] Implement CDN for geographic distribution
- [ ] Cache static assets aggressively
- [ ] Use text-based formats over rich media when possible
- [ ] Archive old content (don't serve unnecessary historical data)
- [ ] Optimize font delivery (limit typefaces, subset characters)

**Implementation Examples**:

```typescript
// ✅ Efficient media delivery
<img
  src="image.webp"
  alt="Workshop"
  loading="lazy"
  srcSet="image-small.webp 480w, image-large.webp 1920w"
/>

// ❌ Inefficient media
<img
  src="image-uncompressed.png"
  alt="Workshop"
  width="2000px" {/* Full resolution always */}
/>
<img src="thumbnail.jpg" width="2000px" /> {/* Wrong size */}
```

### 💻 Pillar 4: Development Practices

**Principle**: Write efficient, optimized code

**Criteria**:

- [ ] Use optimal algorithms (time complexity awareness)
- [ ] Avoid memory leaks (proper cleanup, garbage collection)
- [ ] Minimize dependencies (each adds CPU cost)
- [ ] Use efficient data structures (Map vs Object, Set vs Array)
- [ ] Implement request batching (combine API calls)
- [ ] Use server-side rendering where beneficial
- [ ] Optimize build process (tree-shaking, code splitting)
- [ ] Monitor and remove unused dependencies
- [ ] Cache computation results
- [ ] Use lazy evaluation and memoization

**Implementation Examples**:

```typescript
// ✅ Efficient operations
const USER_BATCH_SIZE = 20
async function paginateUsers(page: number) {
  const offset = (page - 1) * USER_BATCH_SIZE
  return db.users.findMany({
    skip: offset,
    take: USER_BATCH_SIZE,
  })
}

// ❌ Inefficient operations
async function getAllUsers() {
  return db.users.findMany() // Could load millions of records
}

// ✅ Memoized expensive computation
const getUserStats = memoize((userId: string) => {
  return calculateComplexStats(userId)
})

// ❌ Recalculate every time
function getUserStats(userId: string) {
  return calculateComplexStats(userId)
}
```

### 📊 Pillar 5: Infrastructure & Operations

**Principle**: Use efficient, renewable hosting and operations

**Criteria**:

- [ ] Choose hosting with renewable energy commitments
- [ ] Monitor server CPU and memory usage
- [ ] Implement auto-scaling (avoid idle servers)
- [ ] Use containerization for resource efficiency
- [ ] Optimize database connections (connection pooling)
- [ ] Implement circuit breakers (fail fast, avoid cascading)
- [ ] Use CDN for static asset delivery
- [ ] Monitor and optimize API response times
- [ ] Implement request rate limiting (prevent abuse)
- [ ] Archive old logs (don't store unnecessary data)

**Configuration Checklist**:

```dockerfile
# ✅ Efficient base image
FROM node:20-alpine

# ❌ Bloated base
FROM ubuntu:latest
RUN apt-get install nodejs
```

### ⚙️ Pillar 6: Hardware & Lifecycle

**Principle**: Support long device lifecycles, minimize hardware requirements

**Criteria**:

- [ ] Target older browser versions (progressive enhancement)
- [ ] Support low-bandwidth environments
- [ ] Optimize for lower-end devices (test on 4GB RAM, 2-core CPU)
- [ ] Implement graceful degradation
- [ ] Minimize memory footprint
- [ ] Support offline functionality where possible
- [ ] Plan hardware procurement with sustainability in mind
- [ ] Document hardware disposal and recycling procedures

**Performance Targets**:

- `<= 3MB` total page weight (including all assets)
- `<= 1.5MB` JavaScript bundle
- First Contentful Paint: `<= 2 seconds` on 4G
- Time to Interactive: `<= 5 seconds`
- Support for devices with 1GB+ RAM

### 🔍 Pillar 7: Testing & Monitoring

**Principle**: Measure environmental impact and performance

**Criteria**:

- [ ] Monitor Page Weight over time
- [ ] Track Cumulative Layout Shift (CLS)
- [ ] Measure Core Web Vitals (LCP, FID, CLS)
- [ ] Monitor API response times and payload sizes
- [ ] Track database query performance
- [ ] Implement performance budgets
- [ ] Test on real devices (not just browsers)
- [ ] Audit carbon footprint (use tools like EcoGrader, WebsiteCarbon)
- [ ] Monitor server resource usage
- [ ] Set up sustainability KPIs

**Monitoring Example**:

```typescript
// ✅ Track performance metrics
performance.mark('api-call-start')
const users = await fetchUsers()
performance.mark('api-call-end')
performance.measure('api-call', 'api-call-start', 'api-call-end')

// Monitor Core Web Vitals
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('Metric:', entry.name, entry.value)
  }
}).observe({
  entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'],
})
```

### 🏛️ Pillar 8: Organization & Governance

**Principle**: Establish sustainability practices organizationally

**Criteria**:

- [ ] Document green IT policy
- [ ] Train team on RGESN principles
- [ ] Include sustainability in code reviews
- [ ] Set organizational sustainability goals
- [ ] Conduct regular sustainability audits
- [ ] Measure and report environmental metrics
- [ ] Include environmental impact in decision-making
- [ ] Establish e-waste disposal procedures
- [ ] Partner with green hosting providers
- [ ] Create sustainability awareness programs

## 🔧 Implementation Priority

**Phase 1 (High Impact, Quick Wins)**:

1. Image optimization (WebP, compression)
2. Implement caching (HTTP, application)
3. Code splitting and lazy loading
4. Remove unused dependencies
5. Database query optimization

**Phase 2 (Medium Impact, Medium Effort)**:

1. Responsive design implementation
2. Dark mode support
3. CDN setup
4. Performance monitoring
5. Database indexing

**Phase 3 (Strategic, Long-term)**:

1. Architecture optimization
2. Green hosting migration
3. Sustainability training
4. Policy documentation
5. Carbon footprint measurement

## 📋 Code Review Checklist

When reviewing code for RGESN compliance, check:

```markdown
- [ ] **Design**: Is scope minimal and focused?
- [ ] **Dependencies**: Are all npm packages necessary?
- [ ] **Algorithms**: Are algorithms time/space optimal?
- [ ] **Database**: Are queries indexed and paginated?
- [ ] **Assets**: Are images compressed, fonts optimized?
- [ ] **Caching**: Are responses cached appropriately?
- [ ] **Monitoring**: Are performance metrics tracked?
- [ ] **Infrastructure**: Is hosting renewable-energy powered?
```

## 📜 Official Ecodesign Declaration (Déclaration d'Écoconception)

RGESN 2024 requires an official **Declaration of Ecodesign** documenting the environmental measures and commitments made for digital services. This skill auto-generates this declaration.

### Declaration Template

```yaml
# Declaration d'Ecoconception - My Project
# Service: [Service Name]
# Date: [YYYY-MM-DD]
# Version: [Service Version]

ecodesign_declaration:
  service_info:
    name: 'My Project'
    version: 'v1.0.0'
    organization: 'My Company'
    declaration_date: '2026-03-17'
    contact: 'support@my-project.com'

  responsible_design:
    scope_definition: 'MVP-focused with essential features only'
    device_support: 'Multi-year support for devices 4GB+ RAM, 2-core CPU+'
    no_forced_upgrades: true
    accessibility_priority: true
    measures:
      - 'Feature prioritization process in place'
      - 'Minimum viable product scope enforced'
      - 'Responsive design (single codebase)'

  user_engagement:
    form_minimization: 'Only essential fields required'
    keyboard_navigation: 'Full keyboard support available'
    auto_refresh: false
    auto_play: false
    animations_essential_only: true
    dark_mode_support: true
    notification_strategy: 'User-controlled, no auto-push'
    measures:
      - 'Keyboard-first interaction design'
      - 'Minimal form fields enforced in review'
      - 'Dark mode CSS implemented'

  content_optimization:
    image_format: 'WebP primary, JPEG fallback'
    image_compression:
      target: '≤ 100KB per image'
      achievement: 'Achieved via automatic optimization'
    responsive_images: true
    lazy_loading: true
    video_minimization: true
    font_optimization: 'Subset characters, 1-2 typefaces max'
    page_weight_budget: '≤ 3MB total'
    measures:
      - 'Automated image optimization pipeline'
      - 'Lazy loading on all images'
      - 'WebP format with fallbacks'
      - 'Font subsetting for Latin characters'

  development_practices:
    algorithm_optimization: 'O(n) preferred, O(n²) avoided'
    memory_management: 'Proper cleanup, garbage collection verified'
    dependency_audit: 'Regular npm audit, unused deps removed'
    code_splitting: true
    tree_shaking: true
    minification: true
    request_batching: true
    caching_strategy: 'HTTP caching + application-level caching'
    measures:
      - 'Bundle size <1.5MB (gzipped)'
      - 'Code splitting per route'
      - 'Tree-shaking enabled in build'
      - 'Request batching for bulk operations'
      - 'Application cache SLAs: 5min-1hr depending on content'

  infrastructure:
    hosting_provider: 'GCP/AWS with renewable energy commitments'
    renewable_energy_percentage: '>= 75%'
    auto_scaling: true
    containerization: 'Docker + Kubernetes'
    connection_pooling: true
    circuit_breakers: true
    cdn_usage: true
    rate_limiting: true
    log_archival: 'Archive >30 days to cold storage'
    measures:
      - 'Hosting on renewable-energy powered infrastructure'
      - 'Auto-scaling active, no idle servers'
      - 'Redis connection pooling configured'
      - 'Circuit breakers for external API calls'
      - 'CDN for static assets (75% of requests)'
      - 'API rate limiting: 1000 req/min per user'

  hardware_lifecycle:
    browser_support: 'Last 2 major versions + 1 older version'
    bandwidth_optimization: 'Functional on 4G networks'
    low_end_device_support: 'Tested on 1GB RAM, 2-core devices'
    graceful_degradation: true
    offline_support: 'Core features available offline'
    hardware_targets: '4GB+ RAM, 2+ cores recommended'
    measures:
      - 'JavaScript bundle: <1.5MB'
      - 'First Contentful Paint: <2s on 4G'
      - 'Time to Interactive: <5s on 4G'
      - 'Offline-first architecture for core features'

  testing_and_monitoring:
    core_web_vitals: true
    performance_budget:
      javascript: '1.5MB gzipped'
      css: '150KB gzipped'
      images: '2MB total'
      page_weight: '3MB total'
    monitoring_metrics:
      - 'Largest Contentful Paint (LCP): <2.5s'
      - 'First Input Delay (FID): <100ms'
      - 'Cumulative Layout Shift (CLS): <0.1'
    carbon_audits: 'Quarterly'
    carbon_footprint_target: '<0.5g CO2 per page load'
    tools_used:
      - 'Google PageSpeed Insights'
      - 'WebsiteCarbon Calculator'
      - 'Lighthouse CI'
      - 'Performance.now() monitoring'
    measures:
      - 'Continuous monitoring via Lighthouse CI'
      - 'Performance budget enforcement'
      - 'Monthly carbon footprint audits'
      - 'Real device testing (not just emulation)'

  organization_and_governance:
    green_it_policy: true
    policy_document: 'docs/SUSTAINABILITY.md'
    team_training: 'Quarterly RGESN workshops'
    code_review_checklist: 'RGESN items included'
    sustainability_kpis:
      - 'Page weight trend (target: -5% YoY)'
      - 'Carbon per request (target: 0.5g CO2)'
      - 'Core Web Vitals compliance (target: 90%+)'
    audit_frequency: 'Quarterly'
    e_waste_procedures: 'Certified recycling partner'
    green_hosting_commitment: true
    measures:
      - 'Documented green IT policy'
      - 'Monthly team training sessions'
      - 'RGESN checklist in all PRs'
      - 'Annual sustainability report'

  compliance_summary:
    pillars_implemented: 8
    criteria_met: '45/48'
    compliance_percentage: 94
    non_conformities: []
    improvement_plan:
      q2_2026: 'Add offline PWA capabilities'
      q3_2026: 'Carbon reporting dashboard'
      q4_2026: 'Hardware lifecycle partnership'

  declaration_statement: |
    **My Company** déclare par la présente que sa plateforme numérique respecte les critères 
    d'écoconception définies par les Règles de Gouvernance Environnementale du Système 
    Numérique (RGESN) 2024.

    Cette plateforme a été conçue, développée et déployée selon les principes 
    d'écoresponsabilité numérique, minimisant l'impact environnemental tout au long 
    du cycle de vie.

    Les mesures énumérées ci-dessus ont été validées et sont régulièrement auditées.

    Déclaration officielle signée par: [Nom du responsable]
    Date: [Date]

  references:
    - 'RGESN 2024: https://www.numerique.gouv.fr/publications/rgesn/'
    - 'WebsiteCarbon: https://www.websitecarbon.com/'
    - 'Lighthouse: https://developers.google.com/web/tools/lighthouse'
    - 'EcoGrader: https://ecograder.com/'
```

### Automated Declaration Generation

**Steps to auto-generate your Ecodesign Declaration**:

1. **Audit Your Service**:

   ```bash
   nx run [project]:audit:performance  # Performance metrics
   nx run [project]:audit:accessibility  # WCAG/RGAA compliance
   nx run [project]:audit:sustainability  # RGESN metrics
   ```

2. **Gather Metrics**:

   ```bash
   npm run lighthouse:report  # Core Web Vitals
   npm run carbon:audit      # Carbon footprint
   npm run bundle:analyze    # Bundle size
   ```

3. **Generate Declaration**:

   ```bash
   npm run rgesn:generate-declaration \
     --service="My Project" \
     --version="1.0.0" \
     --output="docs/declarations/ecodesign-2026.md"
   ```

4. **Sign & Publish**:
   - Sign declaration with responsible party signature
   - Publish in `docs/declarations/` directory
   - Include link in public transparency page
   - Update annually or upon major changes

### Declaration Checklist

Before signing the official declaration, verify:

```markdown
## Pre-Signature Checklist

### Design Pillar

- [ ] MVP scope documented and enforced
- [ ] Feature prioritization process in place
- [ ] Multi-year device support commitment
- [ ] Accessibility built-in, not afterthought
- [ ] No feature bloat observed

### User Experience

- [ ] Keyboard navigation fully functional
- [ ] Form fields minimized to essentials
- [ ] Dark mode option available
- [ ] No auto-playing media
- [ ] Notifications user-controlled

### Content

- [ ] Images: WebP format with fallbacks
- [ ] Page weight: ≤ 3MB verified
- [ ] JavaScript bundle: ≤ 1.5MB gzipped
- [ ] Lazy loading: Implemented on images
- [ ] Fonts: Subsetted, 2 typefaces max

### Code

- [ ] No O(n²) algorithms in hot paths
- [ ] Memory leaks tested and absent
- [ ] Unused dependencies removed
- [ ] Code splitting per route
- [ ] Tree-shaking enabled

### Infrastructure

- [ ] Hosting: Renewable energy powered
- [ ] Auto-scaling: Enabled
- [ ] CDN: Active for static assets
- [ ] Database indexes: Performance verified
- [ ] Rate limiting: Configured

### Hardware Lifecycle

- [ ] Browser support: 2 major + 1 older
- [ ] Low-end devices: Tested <4GB RAM
- [ ] Offline support: Core features work offline
- [ ] Graceful degradation: Verified

### Testing

- [ ] Core Web Vitals: 90%+ compliance
- [ ] Performance budget: Not exceeded
- [ ] Carbon footprint: <0.5g CO2/page
- [ ] Real device testing: Completed
- [ ] Monitoring: Active

### Organization

- [ ] Green IT policy: Documented
- [ ] Team trained: RGESN principles known
- [ ] Audit schedule: Quarterly minimum
- [ ] E-waste procedures: Established
- [ ] KPIs: Tracked

### Signatures

- [ ] Technical Lead: **\*\***\_\_\_\_**\*\***
- [ ] Product Owner: **\*\***\_\_\_\_**\*\***
- [ ] Sustainability Officer: **\*\***\_\_\_\_**\*\***
```

## 🎯 When to Apply This SKILL

- ✅ Reviewing code for environmental efficiency
- ✅ Designing new features with minimal scope
- ✅ Optimizing API payloads and database queries
- ✅ Configuring image delivery and CDN
- ✅ Planning infrastructure and hosting
- ✅ Setting performance budgets
- ✅ Measuring application carbon footprint
- ✅ Training teams on green IT practices
- ✅ Establishing organizational sustainability policies
- ✅ Auditing legacy systems for efficiency
- ✅ **Generating official Ecodesign Declarations**
- ✅ **Completing regulatory RGESN compliance reports**
- ✅ **Tracking sustainability KPIs and metrics**

## 🛠️ Tools & Resources

- **Ecoindex**: Audit web pages for environmental impact and sustainability score https://www.ecoindex.fr/
- **Creedengo**: Measure carbon footprint and green metrics in real-time https://github.com/green-code-initiative/creedengo-rules-specifications
- **CO2.js**: JavaScript library to estimate carbon emissions from data transfer https://developers.thegreenwebfoundation.org/co2js/overview/
- **Hublo Scaphandre**: Measure energy consumption of software applications https://hubblo-org.github.io/scaphandre/
- **Website Carbon Calculator**: Estimate page carbon footprint https://www.websitecarbon.com/
- **Lighthouse**: Audits performance and sustainability metrics https://developers.google.com/web/tools/lighthouse
