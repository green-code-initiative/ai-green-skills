---
name: ecodesign-backend
description: Write an eco-designed backend: REST/GraphQL APIs, SQL queries, caching, pagination, compression, async processing. Mobilize whenever the user asks for server code (Node.js, Python, PHP, Go, Ruby...), API endpoints, data models, database queries, caching (Redis, in-memory, HTTP cache), response compression, queued tasks, or server optimizations. Trigger also for questions about payload size, N+1 queries, pagination, or expensive business logic. The backend directly influences the datacenter footprint — mobilize this skill for any server code, even a simple endpoint.
metadata:
   tag: ecoconception, backend, api
   version: 1.0.0
   last-updated: 20/05/2026
   referentiel: RGESN
---

# Ecodesign — Backend

Practices to reduce server-side footprint: energy consumed by datacenter CPU/RAM, data transferred over the network, request frequency.

## Frameworks covered

- **RGESN 2024**: family 8 (Backend), criteria 8.1 to 8.6 and family 9 (Hosting) in part
- **AFNOR SPEC 2201**: §12 (Back-end), §13 (Server architecture)
- **WSG**: Web Development 4.x (4.2, 4.3), Hosting/Infrastructure 5.x

## Guiding principles

### 1. Compute as little as possible, transfer as little as possible

Every CPU cycle in the datacenter and every byte transferred has a direct energy cost. Golden rule: **only compute or transfer a piece of data if strictly necessary for the current request**.

### 2. Prefer static over dynamic

- Page that changes rarely → generated at build time (SSG), not dynamic per hit.
- Stable data → cached, not recomputed.
- Transformed image → generated once, served via CDN, not regenerated per view.

### 3. Caching at every layer

Cache levels to exploit, in order:
1. **HTTP cache** (browser via `Cache-Control`)
2. **CDN / edge cache** (Cloudflare, Bunny, etc.)
3. **Reverse proxy** (Varnish, Nginx)
4. **Application cache** (Redis, Memcached, in-memory)
5. **Database cache** (materialized views, query cache)

## Sober API design

### Response format
- **Minimal JSON**: no verbose keys, no useless fields.
- **Server-side filtering**: implement `?fields=id,name,price` (sparse fieldsets, JSON:API). Never return the full entity if the client wants 3 fields.
- **GraphQL** is a good tool for this but has overhead — weigh against REST + sparse fields.
- **Compression**: Brotli (preferred) or gzip on all responses > 1 KB.

### Mandatory pagination
- Any potentially long list **must** be paginated.
- Cursor-based preferred (more efficient for DB than offset).
- Reasonable default page size (20-50), max capped (e.g. 100).
- No `GET /users` returning 50,000 rows.

### HTTP methods and status codes
- Use `GET` for pure reads (cacheable).
- `HEAD` to check existence without transferring body.
- 304 (Not Modified) codes with `ETag` or `Last-Modified` to avoid resending.
- 410 Gone for deleted resources (lets clients stop retrying).

### Batch endpoints
- Allow fetching multiple resources in one call (`GET /users?ids=1,2,3`) rather than N requests.

## Database

### Anti-patterns to eliminate
- **N+1 queries**: use eager loading (JOIN, `include`, `select_related`).
- **`SELECT *`**: select only necessary columns.
- **No index on frequent WHERE/JOIN columns**: audit with `EXPLAIN`.
- **Tables without archival**: plan archival of historical data (RGESN 3.2).

### Good practices
- **Cursor-based pagination** on large tables.
- **Thoughtful soft delete**: don't accumulate tombstones if unused.
- **Prepared statements** to reuse execution plans.
- **Connection pooling** to avoid connection-creation cost per request.
- **Read replicas** to offload reads from the primary.

### DBMS choice
- SQLite suffices for many sites < 100k visits/day.
- PostgreSQL for the majority of cases.
- Don't reach for heavy artillery (Cassandra, Elasticsearch) without real usage justification.

## HTTP cache

### Headers to configure
```http
Cache-Control: public, max-age=31536000, immutable   # versioned assets
Cache-Control: public, max-age=3600                  # semi-dynamic pages
Cache-Control: private, no-cache                     # user content
ETag: "abc123"                                       # conditional validation
Vary: Accept-Encoding, Accept-Language               # variants
```

### Strategies by resource type

| Type | `Cache-Control` |
|---|---|
| JS/CSS bundles with hash | `public, max-age=31536000, immutable` |
| Static images | `public, max-age=2592000` (30 days) |
| HTML pages | `public, max-age=300, s-maxage=3600` (5 min client, 1 h CDN) |
| Public API GET | `public, max-age=60, stale-while-revalidate=300` |
| User content | `private, max-age=0, must-revalidate` |

## Compression

- **Brotli level 4-6** for dynamic responses (CPU/size balance).
- **Brotli level 11** for pre-compressed static assets.
- **Gzip level 6** as fallback.
- Compress: HTML, CSS, JS, JSON, SVG, XML.
- Don't compress: raster images (already compressed), videos, binary files.

## Async and batch tasks

### When to use a queue
- Any task > 100 ms that doesn't need synchronous response: email, image generation, indexing, outgoing webhook.
- Tools: Bull (Redis), RabbitMQ, AWS SQS, or simple DB table for small volumes.

### Batching
- Group similar operations: send 100 emails in one job, not 100 single-email jobs.
- `INSERT INTO ... VALUES (...), (...), (...)` rather than N inserts.
- Grouped webhooks when API allows.

### Poll frequency
- Webhook > Server-Sent Events > polling.
- If polling is essential: > 30 s unless strongly justified.

## Logs and observability

- **Structured logs** (JSON), appropriate level in prod (INFO, not DEBUG).
- **Rotation and archival** of logs: don't keep 10 years of hot logs.
- **Sampling** on APM traces (1-10% often suffice).
- **No full-payload log** on every request.

## Expensive computation

### Strategies
- **Memoization** of frequent pure functions.
- **Pre-computation**: daily aggregates computed at night, not on demand.
- **Lazy computation**: don't compute what isn't displayed.
- **Pagination of heavy results** rather than computing all at once.

### Anti-patterns
- Computing complex aggregates per request without cache.
- Sort/filter in server memory on 10,000 rows instead of using the DB.
- Generating images / PDF on the fly without result cache.

## Expected output

When this skill is activated, Claude must:

1. **Check cache-ability** of each endpoint produced (can it return `Cache-Control`?).
2. **Specify the indexes** needed if SQL is produced.
3. **Paginate** any list.
4. **Compress** text responses.
5. **Filter response fields** based on client needs.
6. **Document the decisions**: caches, TTL, indexes, batch sizes.

## Endpoint checklist

- [ ] Is the HTTP verb correct (GET for read, etc.)?
- [ ] Is the response compressed?
- [ ] Is pagination implemented if it's a list?
- [ ] Are fields filterable (`?fields=...`)?
- [ ] Is HTTP cache configured (`Cache-Control`, `ETag`)?
- [ ] No N+1 query in the logic?
- [ ] Do DB indexes cover the WHERE/JOIN?
- [ ] No `SELECT *`?
- [ ] Are long tasks async?

## Key criteria reference

- **RGESN 8.1** (priority): "Does the service cache stable data server-side?"
- **RGESN 8.2**: "Does the service use browser cache capabilities?"
- **RGESN 8.3**: "Does the service use pagination?"
- **RGESN 8.4**: "Does the service use server-side compression?"
- **RGESN 8.5**: "Does the service limit server requests?"
- **AFNOR SPEC 2201 §12.4**: Optimize database queries
- **WSG 4.2**: Optimize back-end processes
- **WSG 4.3**: Use efficient database queries and caching strategies
