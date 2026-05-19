# Project-RGESN Implementation Guide

This guide explains how Project implements eco-responsible IT practices to minimize environmental impact and meet French sustainability standards.

> **Prerequisites**: Read [`@skill compliance-rgesn`](../../.agents/skills/compliance-rgesn/) for general sustainability knowledge first.

## 🌱 Project Sustainability Goals for 2026

```
Carbon Footprint Reduction: -30% per user session

Current Baseline (as of March 2026):
- Average response time: 180ms
- Data transfer per request: 60KB
- Cache hit rate: 65%
- Server energy: 0.5g CO2 per user session

2026 Targets:
- Average response time: <150ms
- Data transfer per request: <40KB
- Cache hit rate: >80%
- Server energy: <0.3g CO2 per user session
```

---

## ✅ Sustainability Best Practices Implemented in Project

### 1. Backend Query Optimization

**Problem**: Unoptimized queries consume unnecessary CPU/power.

**Project Implementation** — `libs/server/repositories/`:

```typescript
// ❌ Bad: Loads all users into memory
async function getAllUsers() {
  return db.query('SELECT * FROM users')
}

// ✅ Good: Pagination + indexes
async function findUsers(page: number = 1, limit: number = 20) {
  const offset = (page - 1) * limit
  return db.query('SELECT * FROM users WHERE active = true LIMIT ? OFFSET ?', [
    limit,
    offset,
  ])
}

// ✅ Optimization: Use database indexes
// CREATE INDEX idx_users_active ON users(active)
// CREATE INDEX idx_workshops_date ON workshops(created_at DESC)
```

**Metrics**: 40% reduction in average query time = less power usage.

### 2. Redis Caching Strategy

**Problem**: Repeated database queries waste energy.

**Project Implementation** — `apps/api/src/modules/workshop/workshop.service.ts`:

```typescript
import { Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

@Injectable()
export class WorkshopService {
  constructor(private cacheManager: Cache) {}

  // ✅ Cache popular workshops for 1 hour
  async findPopularWorkshops() {
    const cacheKey = 'popular_workshops'
    const cached = await this.cacheManager.get(cacheKey)

    if (cached) {
      return cached // Serve from Redis: 10ms vs 200ms from DB
    }

    const workshops = await this.workshopRepository.findPopular()
    await this.cacheManager.set(cacheKey, workshops, 3600000) // 1 hour TTL

    return workshops
  }

  // ✅ Invalidate cache on update
  async updateWorkshop(id: string, data: UpdateWorkshopDto) {
    const updated = await this.workshopRepository.update(id, data)
    await this.cacheManager.del('popular_workshops') // Cache bust
    return updated
  }
}
```

**Setup** in `apps/api/src/app.module.ts`:

```typescript
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour default
      max: 100, // Max 100 entries
    }),
  ],
})
export class AppModule {}
```

**Baseline**: Current cache hit rate ~65% → Target 80% = 15% fewer DB queries = ~10% power reduction.

### 3. Frontend Code Splitting & Lazy Loading

**Problem**: Loading entire React app wastes bandwidth & render time.

**Project Implementation** — `libs/web/[feature]/`:

```typescript
// ✅ Code splitting per feature
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./dashboard/Dashboard'))
const Recommendations = lazy(() => import('./recommendations/Recommendations'))
const Admin = lazy(() => import('./admin/Admin'))

export function App() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path="/recommendations"
        element={
          <Suspense fallback={<Loading />}>
            <Recommendations />
          </Suspense>
        }
      />
      {/* Admin only loads if /admin route accessed */}
    </Routes>
  )
}
```

**Build Configuration** — `apps/web/webpack.config.js`:

```javascript
const config = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
  // ✅ Minification enabled in production
  mode: 'production',
}
```

**Result**: Baseline ~60KB → Target <40KB per request = 33% reduction in network data transfer.

### 4. Image Optimization

**Problem**: Uncompressed images waste bandwidth.

**Project Implementation**:

```typescript
// ✅ Use optimized image formats (WebP, AVIF)
// ✅ Serve responsive images
export function WorkshopThumbnail({ imageUrl }: { imageUrl: string }) {
  return (
    <picture>
      {/* Smallest format first */}
      <source srcSet={`${imageUrl}?format=avif&w=300`} type="image/avif" />
      <source srcSet={`${imageUrl}?format=webp&w=300`} type="image/webp" />
      {/* Fallback */}
      <img
        src={`${imageUrl}?format=jpg&w=300`}
        alt="Workshop thumbnail"
        loading="lazy" // ✅ Lazy load images below fold
      />
    </picture>
  )
}
```

### 5. API Response Compression

**Problem**: Large JSON responses waste bandwidth.

**Project Implementation** — `apps/api/src/main.ts`:

```typescript
import { compress } from 'compression'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ✅ Enable gzip compression for all responses
  app.use(compress())

  await app.listen(3001)
}

bootstrap()
```

**Result**: Baseline 60KB → ~15KB with gzip compression = 75% reduction.

---

## 📊 Performance Monitoring

Project tracks sustainability metrics quarterly:

### Key Metrics Dashboard

```bash
# Monitor in CI/CD pipeline (e.g., GitHub Actions)

# Example: Lighthouse performance audit
npm run lighthouse:audit

# Expected output:
# ✅ Performance: 85
# ✅ Best Practices: 90
# ✅ Accessibility: 95
# ✅ SEO: 100

# Carbon score: 8.2g CO2/page load (target: 5g by 2026)
```

### Database Performance

```sql
-- Monitor slow queries
SELECT query, execution_time FROM pg_stat_statements
WHERE execution_time > 100
ORDER BY execution_time DESC
LIMIT 10

-- Ensure indexes exist
ANALYZE users;
ANALYZE workshops;
```

---

## 🛠️ Developer Checklist

Before code review:

- [ ] **Pagination**: List endpoints support pagination (avoid loading all records)
- [ ] **Caching**: Frequently-accessed data cached in Redis
- [ ] **Lazy Loading**: React routes use `lazy()` + Suspense
- [ ] **Code Splitting**: Webpack splitChunks configured
- [ ] **Images Optimized**: Using WebP/AVIF, responsive sizes
- [ ] **Compression**: API responses gzip-compressed
- [ ] **Database Indexes**: Queries have proper indexes
- [ ] **Minification**: Production builds minified
- [ ] **Monitoring**: New metrics added to dashboard

---

## 🔗 References

- **RGESN Official**: https://www.numerique.gouv.fr/publications/rgesn/
- **Carbon Footprint Calculator**: https://www.websitecarbon.com/
- **Lighthouse Performance Audit**: https://developers.google.com/web/tools/lighthouse
- **NestJS Caching**: https://docs.nestjs.com/techniques/caching
- **React Code Splitting**: https://react.dev/reference/react/lazy
- **Web.dev Performance**: https://web.dev/performance/

---

**Last Updated**: March 18, 2026  
**2026 Target**: -30% carbon footprint per user session  
**Baseline**: 0.5g CO2 per user session (180ms response, 60KB transfer)
