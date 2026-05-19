# Project-W3C Sustainability Implementation Guide

This guide explains how to implement W3C Web Sustainability Guidelines in Project's React/NestJS stack.

> **Prerequisites**: Read [`@skill compliance-w3c-wsg`](../../.agents/skills/compliance-w3c-wsg/) for general W3C sustainability guidelines first.

## 🌱 Project Sustainability Architecture

### Current Stack Analysis

- **Frontend**: React 18.x with Material-UI (relatively efficient)
- **Backend**: NestJS with PostgreSQL (good for caching)
- **Hosting**: Docker containerized (supports green hosting)
- **Build**: Webpack (supports code splitting)
- **Performance**: Already targets <150ms response time (RGESN)
- **Caching**: Redis available

### Key Locations

- **React Components**: `libs/web/[feature]/ui/` and `apps/web/src/`
- **NestJS Controllers**: `apps/api/src/modules/*/[resource].controller.ts`
- **Webpack Config**: `apps/web/webpack.config.js`
- **Performance Config**: `ormconfig.ts`, `apps/api/project.json`

---

## ✅ Perception of Performance

### 1. Skeleton Loaders (Early Feedback)

Project can enhance perceived performance with skeleton screens:

```typescript
// libs/web/shared/components/src/lib/skeleton-loader.tsx
import React from 'react'
import { Skeleton, Box } from '@mui/material'

export const WorkshopSkeleton: React.FC = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="circular" width={40} height={40} />
  </Box>
)

// Usage in workshop list:
const WorkshopList = () => {
  const [workshops, setWorkshops] = useState(null)
  const [loading, setLoading] = useState(true)

  return (
    <Box>
      {loading ? (
        <WorkshopSkeleton />
      ) : (
        workshops.map((w) => <WorkshopCard key={w.id} {...w} />)
      )}
    </Box>
  )
}
```

### 2. Progressive Content Loading

Load critical content first, defer secondary content:

```typescript
// apps/web/src/index.tsx
import { lazy, Suspense } from 'react'

// ✅ Load critical paths eagerly
import Dashboard from './pages/dashboard'
import Profile from './pages/profile'

// ✅ Lazy load less-critical routes
const AdminPanel = lazy(() => import('./pages/admin'))
const Settings = lazy(() => import('./pages/settings'))

<Routes>
  <Route path="/" element={<Dashboard />} /> {/* Critical */}
  <Route path="/profile" element={<Profile />} /> {/* Critical */}
  <Route
    path="/admin"
    element={
      <Suspense fallback={<LoadingSpinner />}>
        <AdminPanel />
      </Suspense>
    }
  />
</Routes>
```

### 3. Lazy Loading Images

In workshops list, user profiles, etc.:

```typescript
// libs/web/shared/components/src/lib/workshop-card.tsx
<picture>
  {/* WebP for modern browsers (smaller) */}
  <source
    srcSet={`${workshopImage}.webp`}
    type="image/webp"
  />
  {/* Fallback to JPEG */}
  <img
    src={`${workshopImage}.jpg`}
    alt={workshop.name}
    loading="lazy" {/* ✅ Native lazy loading */}
    sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
    style={{ width: '100%', height: 'auto' }}
  />
</picture>
```

---

## ⚡ Energy & Emissions Optimization

### 1. Query Optimization (Database Energy)

Reduce database load through efficient queries:

```typescript
// apps/api/src/modules/workshop/workshop.service.ts
@Injectable()
export class WorkshopService {
  // ❌ Avoid: Fetching all fields
  async getWorkshops() {
    return this.workshopRepository.find()
  }

  // ✅ Better: Select only needed fields
  async getWorkshops(page: number = 1, limit: number = 20) {
    return this.workshopRepository
      .createQueryBuilder('workshop')
      .select(['workshop.id', 'workshop.name', 'workshop.date']) // Only needed fields
      .take(limit)
      .skip((page - 1) * limit)
      .getMany()
  }

  // ✅ Add indexes in migration
  // CREATE INDEX idx_workshop_date ON workshop(date DESC)
  // CREATE INDEX idx_workshop_status ON workshop(status)
}
```

### 2. Redis Caching (Energy-Intensive Queries)

Cache expensive computations:

```typescript
// apps/api/src/modules/recommendation/recommendation.service.ts
import { CACHE_MANAGER, Inject } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class RecommendationService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private workshopRepository: WorkshopRepository
  ) {}

  async getRecommendedWorkshops(userId: string): Promise<Workshop[]> {
    // ✅ Check cache first (Redis)
    const cached = await this.cacheManager.get(`recommendations:${userId}`)
    if (cached) return cached

    // ✅ Compute recommendations (energy-intensive)
    const recommendations = await this.workshopRepository
      .createQueryBuilder('workshop')
      .where('workshop.difficulty = :diff', { diff: user.level })
      .andWhere('workshop.category IN (:...categories)', {
        categories: user.interests,
      })
      .limit(10)
      .getMany()

    // ✅ Cache for 1 hour (saves re-computation)
    await this.cacheManager.set(
      `recommendations:${userId}`,
      recommendations,
      3600000 // 1 hour in ms
    )

    return recommendations
  }
}
```

### 3. Algorithm Efficiency

Choose efficient algorithms for critical paths:

```typescript
// ✅ Efficient workshop matching
async findCompatibleWorkshops(userId: string): Promise<Workshop[]> {
  const user = await this.getUserWithPreferences(userId)

  // ✅ Single query with JOIN (not N+1)
  return this.workshopRepository
    .createQueryBuilder('workshop')
    .leftJoin('workshop.sessions', 'session')
    .leftJoin('session.attendees', 'attendee')
    .where('workshop.difficulty = :difficulty', {
      difficulty: user.level
    })
    .andWhere('workshop.category IN (:...categories)', {
      categories: user.interests
    })
    .andWhere('COUNT(attendee.id) < workshop.capacity')
    .groupBy('workshop.id')
    .getMany()
}
```

---

## 🌐 Network Optimization

### 1. Response Compression

All API responses compressed (already in NestJS config):

```typescript
// apps/api/src/main.ts
import * as compression from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ✅ Enable gzip/brotli compression
  app.use(compression({ level: 6 })) // gzip at level 6

  await app.listen(3001)
}
```

### 2. API Response Minimization

Return only necessary fields in API responses:

```typescript
// libs/shared/dto/src/lib/workshop/workshop-list.dto.ts
export class WorkshopListDto {
  id: number
  name: string
  date: Date
  image: string // Thumbnail, not full-res
  difficulty: string
  // ❌ Don't include: description, full attendees list, all metadata
}

// Controller returns minimal DTO
@Get()
async getWorkshops(): Promise<WorkshopListDto[]> {
  return this.workshopService.getWorkshops()
}

// For detailed view, separate endpoint
@Get(':id')
async getWorkshop(@Param('id') id: number): Promise<WorkshopDetailDto> {
  return this.workshopService.getWorkshopDetail(id)
}
```

### 3. Image Optimization

Already implemented in RGI guide, but emphasize:

```typescript
// ✅ Responsive images with WebP/AVIF
<picture>
  <source srcSet={img.avif} type="image/avif" />
  <source srcSet={img.webp} type="image/webp" />
  <img
    src={img.jpg}
    alt={workshop.name}
    sizes="(max-width: 480px) 100vw, 50vw"
    loading="lazy"
  />
</picture>

// ✅ Image dimensions set (prevents reflow)
<img width={400} height={300} src="..." alt="..." />
```

---

## 🔄 Alignment (Content Relevance)

### 1. Progressive Enhancement

Core Project features work without JavaScript:

```typescript
// ✅ Form works without JS (POST to /api/workshops)
;<form action="/api/workshops" method="POST">
  <input type="text" name="name" required />
  <input type="date" name="date" required />
  <input type="submit" value="Create Workshop" />
</form>

// Enhanced with instant feedback via JS
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const response = await fetch('/api/workshops', {
    method: 'POST',
    body: new FormData(form),
  })
  if (response.ok) showSuccess()
})
```

### 2. Offline Support (Service Worker)

Project can support basic offline functionality:

```typescript
// apps/web/public/sw.js
const CACHE_VERSION = 'v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/offline.html',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached

        return fetch(event.request)
          .then((response) => {
            // Cache successful responses
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, response.clone())
            })
            return response
          })
          .catch(() => {
            // Fallback to offline page
            return caches.match('/offline.html')
          })
      })
    )
  }
})

// apps/web/src/index.tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}
```

---

## 📊 Measurement

### 1. Core Web Vitals Tracking

Monitor for performance regression:

```typescript
// apps/web/src/lib/metrics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export const initMetrics = () => {
  getFCP((metric) => sendMetric(metric))
  getLCP((metric) => sendMetric(metric))
  getTTFB((metric) => sendMetric(metric))
  getCLS((metric) => sendMetric(metric))
  getFID((metric) => sendMetric(metric))
}

const sendMetric = (metric: Metric) => {
  // ✅ Send to backend for tracking
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating, // 'good', 'needs-improvement', 'poor'
      timestamp: new Date(),
    }),
  })
}
```

### 2. Carbon Footprint Calculation

Track estimated carbon per page view:

```typescript
// apps/api/src/modules/metrics/metrics.service.ts
@Injectable()
export class MetricsService {
  /**
   * Estimate carbon footprint based on energy metrics
   * Formula: (data_transferred_kb * 0.81 + cpu_time_ms * 0.10) / 1000 = grams CO2
   */
  calculateCarbonFootprint(dataTransferredKB: number, cpuTimeMs: number): number {
    // ✅ Web Sustainability Guidelines calculation
    const networkEmissions = dataTransferredKB * 0.81 // grams CO2
    const serverEmissions = cpuTimeMs * 0.1 // grams CO2

    return (networkEmissions + serverEmissions) / 1000 // Convert to grams
  }

  async recordPageView(userId: string, pageviewData: any) {
    const carbon = this.calculateCarbonFootprint(
      pageviewData.dataTransferredKB,
      pageviewData.cpuTimeMs
    )

    // ✅ Store for reporting
    await this.repository.save({
      userId,
      carbon,
      timestamp: new Date(),
      page: pageviewData.page,
    })
  }
}
```

### 3. Sustainability Dashboard

Track trends over time:

```typescript
// apps/api/src/modules/admin/sustainability.controller.ts
@Controller('admin/sustainability')
@UseGuards(AdminGuard)
export class SustainabilityController {
  @Get('dashboard')
  async getDashboard() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const metrics = await this.metricsRepository
      .createQueryBuilder('metric')
      .select('DATE(metric.timestamp)', 'date')
      .addSelect('AVG(metric.carbon)', 'avgCarbon')
      .addSelect('AVG(metric.responseTime)', 'avgResponseTime')
      .addSelect('COUNT(*)', 'pageviews')
      .where('metric.timestamp >= :date', { date: thirtyDaysAgo })
      .groupBy('DATE(metric.timestamp)')
      .orderBy('metric.timestamp', 'DESC')
      .getRawMany()

    return {
      totalCarbon: metrics.reduce((sum, m) => sum + parseFloat(m.avgCarbon), 0),
      averageCarbon: metrics[0]?.avgCarbon,
      trend: this.calculateTrend(metrics),
      metrics,
    }
  }
}
```

---

## 🛠️ Code Splitting (Performance)

### 1. Route-Based Code Splitting

Already implemented, emphasize optimization:

```typescript
// apps/web/webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // ✅ Extract vendor code
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        // ✅ Extract common code across routes
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: 'common',
        },
      },
    },
  },
}
```

### 2. Dynamic Imports (Lazy Routes)

```typescript
// apps/web/src/app.tsx
const Dashboard = lazy(() => import('./pages/dashboard'))
const Recommendations = lazy(() => import('./pages/recommendations'))
const AdminPanel = lazy(() => import('./pages/admin'))

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route
      path="/recommendations"
      element={
        <Suspense fallback={<LoadingBar />}>
          <Recommendations />
        </Suspense>
      }
    />
  </Routes>
)
```

---

## 🌍 Sustainable Hosting Alignment

Project hosting recommendations:

```yaml
# Production environment considerations
- Choose hosting with renewable energy commitment
- Use CDN for global distribution (reduce latency)
- Implement auto-scaling (pay for what you use)
- Database: Use managed services with backup redundancy
- Redis: Cache frequently accessed data
# Providers supporting sustainability:
# - AWS: 100% renewable energy goal by 2025
# - Google Cloud: Carbon neutral, 100% renewable
# - Netlify: Uses 100% renewable energy
# - Vercel: Green hosting with carbon-aware deployment
```

---

## ✅ W3C Sustainability Checklist for Project

- [ ] **Perception**: Skeleton loaders, progressive loading, early feedback
- [ ] **Energy**: Efficient queries, Redis caching, algorithm optimization
- [ ] **Network**: gzip compression, minimal API payloads, image optimization
- [ ] **Alignment**: Progressive enhancement, forms work without JS
- [ ] **Measurement**: Core Web Vitals tracked, carbon calculated, dashboard available
- [ ] **Offline**: Service workers cache critical assets
- [ ] **Hardware**: Support for older browsers (feature detection)
- [ ] **Culture**: Multi-language support, works on slow networks
- [ ] **Inclusive**: WCAG AA compliance (see Project-RGAA-IMPLEMENTATION.md)
- [ ] **Monitoring**: Sustainability metrics in admin dashboard
- [ ] **Green Hosting**: Choose providers with renewable commitment
- [ ] **Continuous Improvement**: Monthly sustainability audits

---

## 🚀 Quick Wins for Project

**Easy to implement** (< 1 week):

1. ✅ Add Web Vitals tracking
2. ✅ Enable gzip compression
3. ✅ Add lazy loading to images
4. ✅ Implement skeleton loaders
5. ✅ Optimize API responses (select specific fields)

**Medium effort** (1-2 weeks):

1. 🔄 Code splitting by route
2. 🔄 Redis caching for recommendations
3. 🔄 Service worker for offline support
4. 🔄 Carbon footprint dashboard

**Long-term** (ongoing):

1. 📊 Sustainability monitoring & reporting
2. 📊 Green hosting migration
3. 📊 Continuous performance optimization

---

## 📚 References

- W3C Sustainability Guidelines: https://www.w3.org/TR/2024/WD-sustyweb-1-20240429/
- Website Carbon Calculator: https://www.websitecarbon.com/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- Green Coding: https://greencoding.berlin/
- Sustainable Web Design: https://www.mightybytes.com/blog/sustainable-web-design/
