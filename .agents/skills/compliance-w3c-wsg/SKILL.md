---
name: compliance-w3c-wsg
description: Ensures sustainable web design and minimizes environmental impact (W3C guidelines)
category: Sustainability & Environment
keywords: W3C, sustainability, green web, energy efficiency, carbon footprint, performance, accessibility
license: MIT
---

# SKILL: W3C Web Sustainability Guidelines

## 📖 What are the W3C Sustainability Guidelines?

**W3C Web Sustainability Guidelines (WSG)**

- **Standard**: W3C Web Sustainability Guidelines 1.0
- **Scope**: Practical guidance for sustainable web design across all web products
- **Impact**: Reduces carbon footprint, energy consumption, server load, network traffic
- **Version**: 1.0 (published 2024)
- **Reference**: https://www.w3.org/TR/2024/WD-sustyweb-1-20240429/

## 🎯 Key Principles

1. **Perception of Performance** — Users perceive speed faster than actual performance
2. **Energy & Emissions** — Minimize electricity consumption and carbon footprint
3. **Network** — Reduce data transfer and network requests
4. **Alignment** — Ensure alignment with user needs and availability
5. **Measurement** — Monitor and optimize environmental impact
6. **Materials & Waste** — Design for hardware longevity and digital waste reduction
7. **Hardware Life Extension** — Support older devices and slow networks
8. **Culturally Appropriate Design** — Adapt to local contexts and connectivity
9. **Inclusive Design** — Accessibility + sustainability = better for all
10. **Unkillable Design** — Resilient, works offline, graceful degradation
11. **Monitoring & Management** — Track sustainability metrics over time

---

## ✅ Implementation Checklist

### Perception of Performance

- [ ] **Perceived Performance**: Use perceived performance techniques (skeleton screens, progressive loading)
- [ ] **Visual Feedback**: Show users visual feedback during loading (spinners, progress bars)
- [ ] **Time to Interactive**: Critical content loads first, non-critical deferred
- [ ] **Lazy Loading**: Images/components load only when visible
- [ ] **Code Splitting**: Bundle code split by route, loaded on demand
- [ ] **Caching Strategy**: Effective client-side / server-side caching
- [ ] **Minimized Rendering Blocks**: No render-blocking resources in critical path

```typescript
// ✅ Perceived performance: Show loading state first
import { Suspense } from 'react'

const Dashboard = () => (
  <Suspense fallback={<SkeletonLoader />}>
    <HeavyDataComponent />
  </Suspense>
)

// ✅ Progressive image loading
<picture>
  <source srcSet="image-small.webp" media="(max-width: 480px)" />
  <source srcSet="image-medium.webp" media="(max-width: 1024px)" />
  <source srcSet="image-large.webp" />
  <img src="image-fallback.jpg" loading="lazy" alt="..." />
</picture>

// ✅ Code splitting by route
const AdminDashboard = lazy(() => import('./admin/dashboard'))
const UserProfile = lazy(() => import('./user/profile'))
```

### Energy & Emissions

- [ ] **Energy Consumption**: Minimize CPU usage, reduce processing overhead
- [ ] **Carbon Emissions**: Calculate and track carbon footprint per page
- [ ] **Server Efficiency**: Efficient algorithms, database queries, caching
- [ ] **Green Hosting**: Use providers with renewable energy commitments
- [ ] **CDN Usage**: Distribute content geographically to reduce hop count
- [ ] **Compression**: gzip/brotli for all text assets
- [ ] **Minification**: Remove unnecessary code and whitespace

```typescript
// ✅ Energy-efficient algorithms (pagination vs loading all)
// ❌ Avoid: Loading 10,000 items
const allItems = await repository.find()

// ✅ Use: Pagination
const items = await repository.find({
  skip: (page - 1) * pageSize,
  take: pageSize,
})

// ✅ Compress responses
app.use(compression({ level: 6 })) // brotli at level 6

// ✅ Cache expensive computations
const cachedData = await cache.get('expensive-calc')
if (!cachedData) {
  const result = expensiveCalculation()
  await cache.set('expensive-calc', result, 3600) // 1 hour
}
```

### Network

- [ ] **Data Transfer Minimization**: Reduce payload size (images, bundles, API responses)
- [ ] **HTTP Keepalive**: Reuse TCP connections
- [ ] **Eliminate Redirects**: Minimize redirect chains (301, 302)
- [ ] **DNS Lookups**: Minimize number of unique domains
- [ ] **Unused Assets**: Remove unused CSS, JS, fonts, images
- [ ] **Image Optimization**: Modern formats (WebP, AVIF), size for context
- [ ] **Font Loading**: System fonts or optimized font stacks, avoid long font lists

```typescript
// ✅ Minimal API payload (only needed fields)
// ❌ Avoid: Sending entire object
select: '*'

// ✅ Use: Select only needed fields
select: ['id', 'name', 'email'] // Reduce by 70%+

// ✅ Image optimization
<picture>
  <source srcSet="image.avif" type="image/avif" />
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="..." sizes="(max-width: 480px) 100vw, 50vw" />
</picture>

// ✅ Font optimization
@font-face {
  font-family: 'Efficient';
  src: url('font-subset.woff2') format('woff2');
  font-display: swap; // Show fallback immediately
}

// ✅ Reduce DNS lookups
// Have fewer external domains (CDN, fonts, analytics)
```

### Alignment

- [ ] **Content Relevance**: Eliminate clutter, show only needed content
- [ ] **Navigation Clarity**: Users find what they need quickly
- [ ] **Accessibility**: Content usable by everyone (WCAG standards)
- [ ] **Offline Support**: Service workers enable offline functionality
- [ ] **Error Handling**: Graceful degradation, don't crash on errors
- [ ] **Progressive Enhancement**: Core features work without JS

```typescript
// ✅ Progressive enhancement: Form works without JS
;<form action="/api/submit" method="POST" noValidate>
  <input name="email" type="email" required />
  <button type="submit">Subscribe</button>
</form>

// Enhanced with JS for instant feedback (no page reload)
form.addEventListener('submit', (e) => {
  e.preventDefault()
  fetch('/api/submit', { method: 'POST', body: new FormData(form) })
})

// ✅ Service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

### Measurement

- [ ] **Carbon Reporting**: Track carbon emissions per page/user
- [ ] **Performance Metrics**: Measure LCP, FID, CLS (Core Web Vitals)
- [ ] **Energy Metrics**: Monitor CPU usage, network activity
- [ ] **User Behavior**: Track sustainability impact of user actions
- [ ] **Reporting**: Regular sustainability reports (monthly, quarterly)
- [ ] **Benchmarking**: Compare against industry standards

```typescript
// ✅ Monitor Core Web Vitals
import { getMetrics } from 'web-vitals'

getMetrics((metric) => {
  console.log(`${metric.name}: ${metric.value}`)

  // Send to analytics
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      timestamp: new Date(),
    }),
  })
})

// ✅ Carbon tracking (using API)
const carbonFootprint = await fetch('https://api.websustainability.org/carbon', {
  body: JSON.stringify({ pageSize, requests, energy }),
}).then((r) => r.json())
```

### Materials & Waste

- [ ] **E-waste Prevention**: Design to last (avoid unnecessary updates)
- [ ] **Hardware Compatibility**: Support older devices (5+ years old)
- [ ] **Feature Detection**: Graceful degradation for older browsers
- [ ] **Digital Waste**: Remove broken links, outdated content
- [ ] **Sustainable Hosting**: Choose data centers with renewable energy

```typescript
// ✅ Feature detection for older browsers
const supportsWebP = () => {
  const canvas = document.createElement('canvas')
  return canvas.toDataURL('image/webp').indexOf('webp') === 5
}

// Fallback for older browsers
const imageFormat = supportsWebP() ? 'webp' : 'jpg'

// ✅ CSS for older devices
@supports (display: grid) {
  .container {
    display: grid
    grid-template-columns: repeat(3, 1fr)
  }
}

@supports not (display: grid) {
  .container {
    display: flex
    flex-wrap: wrap
  }
}
```

### Hardware Life Extension

- [ ] **Low Power Mode**: Support device power-saving modes
- [ ] **Static Content**: Cache aggressively, reduce server load
- [ ] **Media Optimization**: Smaller file sizes for mobile devices
- [ ] **Efficient Animations**: Use CSS transforms over repaints
- [ ] **Battery Awareness**: Reduce animations when battery low

```typescript
// ✅ Detect low power mode
if (navigator.deviceMemory < 4) {
  // Disable heavy animations for low-memory devices
  document.body.classList.add('low-memory')
}

// ✅ Detect high contrast mode (uses less battery)
if (window.matchMedia('(prefers-contrast: more)').matches) {
  // Simplify colors, reduce complexity
}

// ✅ Use CSS transforms (GPU accelerated, less battery)
// ❌ Avoid: left/top (causes repaints)
animation: slide 0.3s ease-in-out

// ✅ Use: transform
@keyframes slide {
  from { transform: translateX(0) }
  to { transform: translateX(100px) }
}
```

### Culturally Appropriate Design

- [ ] **Language Support**: Multiple languages for global reach
- [ ] **Localization**: Adapt text, images, currency to region
- [ ] **Connectivity Context**: Support slow networks (2G, 3G)
- [ ] **Time Zones**: Display correct times for user's region
- [ ] **Cultural Sensitivity**: Avoid assumptions about user background

```typescript
// ✅ Accept slow networks
const img = new Image()
img.src = 'large-image.jpg'
img.style.loadingStrategy = 'lazy'

// ✅ Detect network speed
if (navigator.connection?.effectiveType === '4g') {
  loadHighResAssets()
} else {
  loadCompressedAssets()
}

// ✅ Localize currency and time
const formatter = new Intl.NumberFormat(userLocale, {
  style: 'currency',
  currency: userCurrency,
})
```

### Inclusive Design

- [ ] **Semantic HTML**: Proper structure for accessibility
- [ ] **ARIA Labels**: Description for assistive technologies
- [ ] **Keyboard Navigation**: All features usable via keyboard
- [ ] **Color Contrast**: Text readable for colorblind users
- [ ] **Focus Indicators**: Clear focus for keyboard navigation
- [ ] **Alternative Text**: Descriptive alt text for images
- [ ] **Captions**: Video captions for deaf/hard-of-hearing

### Unkillable Design

- [ ] **Offline Functionality**: Core features work without connection
- [ ] **Graceful Degradation**: App degrades gracefully when features fail
- [ ] **Error Recovery**: Users can recover from error states
- [ ] **Data Persistence**: Service workers cache critical data
- [ ] **No Dependencies**: Don't rely on always-online third parties
- [ ] **Fallback UIs**: Alternative UI for failed components

```typescript
// ✅ Service worker caching
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(['/', '/styles.css', '/offline.html'])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
```

### Monitoring & Management

- [ ] **Analytics Dashboard**: Track sustainability metrics
- [ ] **Alerts**: Alert on performance/energy regressions
- [ ] **Regular Audits**: Monthly sustainability audits
- [ ] **Continuous Improvement**: Iterative optimization
- [ ] **Team Awareness**: Educate team on sustainability impact
- [ ] **Supplier Assessment**: Evaluate hosting/CDN sustainability

---

## 🔗 Relationship with Other Standards

| Standard        | Overlap                               | Distinction                                   |
| --------------- | ------------------------------------- | --------------------------------------------- |
| **RGESN**       | ~80% overlap                          | WSG more detailed, RGESN more French-specific |
| **WCAG**        | ~40% (accessibility = sustainability) | WSG broader (energy, emissions, hardware)     |
| **RGI**         | ~20% (API efficiency)                 | WSG focused on user-facing sustainability     |
| **Performance** | ~60% (perf = lower energy)            | WSG adds carbon/emissions tracking            |

---

## 📚 Common Pitfalls

| Pitfall                        | Problem                          | Solution                                     |
| ------------------------------ | -------------------------------- | -------------------------------------------- |
| **Ignoring slow networks**     | 40% of users on slow connections | Test on 3G/4G, mobile devices                |
| **Large images**               | 50% of page weight often images  | Optimize: WebP, AVIF, responsive srcset      |
| **Heavy JS framework**         | Modern frameworks 300KB+         | Use lightweight alternatives, code splitting |
| **No caching**                 | Repeated downloads waste energy  | Implement server + client-side caching       |
| **Bundling all code**          | Users download unused JS         | Code splitting, tree-shaking, lazy loading   |
| **No offline support**         | App breaks without connection    | Service workers, offline-first design        |
| **Autoplaying videos**         | Drains battery, wastes data      | Play on user interaction, not autoplay       |
| **Font loading blocks render** | Font requests block page display | Use `font-display: swap`, system fonts       |

---

## 🛠️ Tools & Resources

- **WebPageTest**: Measure sustainability metrics https://www.webpagetest.org/
- **Google Lighthouse**: Audits performance, accessibility, best practices https://developers.google.com/web/tools/lighthouse
- **Website Carbon Calculator**: Estimate page carbon footprint https://www.websitecarbon.com/
- **Ecograder**: Full sustainability grading https://ecograder.com/
- **Green Coding Berlin**: Open registry of sustainable practices https://greencoding.berlin/
- **Ecoindex**: Audit web pages for environmental impact https://www.ecoindex.fr/
- **Creedengo**: Measure carbon footprint and green metrics https://github.com/green-code-initiative/creedengo-rules-specifications
- **CO2.js**: JavaScript library to estimate carbon emissions from data transfer https://developers.thegreenwebfoundation.org/co2js/overview/
- **Hublo Scaphandre**: Measure energy consumption of software https://hubblo-org.github.io/scaphandre/
- **W3C Sustainability**: Official guidelines https://www.w3.org/TR/2024/WD-sustyweb-1-20240429/
- **Sustainable Web Design**: Book by Tom Greenwood https://www.mightybytes.com/blog/sustainable-web-design/

---

## 📖 Summary

The **W3C Web Sustainability Guidelines** provide a holistic framework for building web applications that:

1. ✅ Perform well (perceived + actual)
2. ✅ Use less energy and produce less carbon
3. ✅ Minimize network transmission
4. ✅ Support older devices and slow networks
5. ✅ Are accessible and inclusive
6. ✅ Work offline and degrade gracefully
7. ✅ Are measured and continuously optimized

By following these guidelines, teams build applications that are **better for users, better for the environment, and better for society**.
