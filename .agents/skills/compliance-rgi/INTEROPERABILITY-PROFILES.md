# RGI Interoperability Profiles & Use Cases

## Overview

The RGI v2.0 introduces the concept of **Interoperability Profiles** — focused sets of standards for specific use cases and domains. This document defines common profiles for different integration scenarios.

---

## Profile 1: Admin-to-Admin (A2A) Service Integration

**Context**: Information exchange between administrative authorities (ministries, municipalities, public agencies)

### Key Characteristics

- **Scope**: Inter-organizational data exchange
- **Frequency**: Regular, scheduled transfers (daily, weekly, batch)
- **Data Volume**: Medium to large
- **Real-time Requirements**: Non-critical (async acceptable)
- **Security Level**: High (government data)

### Standards (Profile A2A)

| Category           | Standard               | Notes                   |
| ------------------ | ---------------------- | ----------------------- |
| **Protocol**       | HTTPS/HTTP 1.1         | Mandatory for security  |
| **Security**       | TLS 1.2+               | Minimum encryption      |
| **Authentication** | OAuth 2.0 or SAML v2.0 | Service-to-service auth |
| **Data Format**    | JSON or XML            | OpenAPI documented      |
| **API Style**      | REST                   | Standard HTTP verbs     |
| **Documentation**  | OpenAPI 3.0            | Complete schema         |
| **Data Structure** | JSON Schema            | For validation          |
| **Identifiers**    | UUID v4                | Unique across systems   |
| **Dates**          | ISO 8601               | Always in UTC           |

### Implementation Checklist

- [ ] APIs documented in OpenAPI 3.0
- [ ] Authentication via OAuth 2.0 token (bearer in Authorization header)
- [ ] TLS 1.2+ with valid certificates
- [ ] Request/response logging for audit trail
- [ ] Rate limiting headers (RateLimit-Limit, RateLimit-Remaining)
- [ ] Error responses include request trace ID
- [ ] Pagination on all list endpoints (skip, take, total)
- [ ] Data export capability (JSON/CSV)
- [ ] Change notifications via webhooks or polling
- [ ] 6-month deprecation notice for breaking changes

### Example Flow

```
Ministry A → HTTPS/TLS → OAuth 2.0 token → Ministry B API
              JSON payload with ISO timestamps
              Audit log entry created
              Success/error notification sent
```

---

## Profile 2: Admin-to-Business (A2B) Public Services

**Context**: Administrative services accessible to businesses and enterprises

### Key Characteristics

- **Scope**: Government services for commerce/licensing/permits
- **Frequency**: On-demand (user-initiated)
- **Data Volume**: Variable
- **Real-time Requirements**: Response within minutes
- **Security Level**: Medium-High
- **Availability**: High (24/7 availability expected)

### Standards (Profile A2B)

| Category              | Standard                       | Notes                    |
| --------------------- | ------------------------------ | ------------------------ |
| **Protocol**          | HTTPS                          | Mandatory                |
| **Security**          | TLS 1.2+, CORS                 | Cross-domain access      |
| **Authentication**    | OAuth 2.0                      | Third-party integrations |
| **Authorization**     | RBAC via JWT                   | Role-based access        |
| **Data Format**       | JSON (primary), XML (fallback) | Support both             |
| **API Documentation** | OpenAPI + interactive UI       | Swagger/Redoc at `/docs` |
| **SDK**               | Client libraries               | Java, JavaScript, Python |
| **Rate Limiting**     | Per IP/token                   | Documented limits        |
| **Caching**           | ETags, Cache-Control           | Reduce server load       |

### Implementation Checklist

- [ ] Interactive API documentation at `/api/docs`
- [ ] Client SDKs in major languages
- [ ] OAuth 2.0 with refresh tokens (token expiry: 1 hour)
- [ ] CORS configured for legitimate domains
- [ ] Rate limiting: 1000 req/hour per IP
- [ ] SLA documented (99.5% uptime, <2sec response)
- [ ] Status page for operational transparency
- [ ] Versioning strategy (v1, v2, sunset old versions)
- [ ] Data export for compliance (all user data)
- [ ] Usage analytics and monitoring

### Example Flow

```
Business → HTTPS → OAuth 2.0 login → Admin API
           Bearer token in header → JSON response
           CacheControl: max-age=300 → Reduce load
           RateLimit-Remaining: 999 → Inform client
```

---

## Profile 3: Admin-to-Citizen (A2C) Public Portals

**Context**: Citizen-facing government services (permits, records, payments)

### Key Characteristics

- **Scope**: End-user services, web/mobile accessible
- **Frequency**: On-demand
- **Data Volume**: Small to medium
- **Real-time Requirements**: Immediate response (<2s)
- **Security Level**: High (personal data)
- **Accessibility**: WCAG 2.1 AA compliance required (see RGAA)

### Standards (Profile A2C)

| Category            | Standard                 | Notes                     |
| ------------------- | ------------------------ | ------------------------- |
| **Protocol**        | HTTPS only               | No HTTP                   |
| **Security**        | TLS 1.2+, CSP headers    | Content Security Policy   |
| **Authentication**  | OpenID Connect           | federated identity        |
| **MFA**             | TOTP/SMS optional        | Enhanced security         |
| **Frontend**        | HTML5, WCAG 2.1 AA       | Accessibility             |
| **API**             | REST + GraphQL           | Flexible queries          |
| **Response Format** | JSON                     | Not XML                   |
| **Rate Limiting**   | Generous (5000 req/hour) | Different from B2B        |
| **GDPR**            | Data export in 30 days   | Right to data portability |

### Implementation Checklist

- [ ] HTTPS with HSTS header (Force-HTTPS)
- [ ] Content Security Policy preventing XSS
- [ ] OpenID Connect for federated SSO
- [ ] Forms with CSRF protection
- [ ] Password hashing: bcrypt or argon2
- [ ] Personal data encrypted at rest
- [ ] GDPR data export in JSON (90 days max)
- [ ] Error messages don't expose system details
- [ ] Audit log for all user actions
- [ ] Session timeout: 30 minutes inactivity
- [ ] WCAG 2.1 AA accessibility compliance

### Example Flow

```
Citizen → HTTPS → OpenID Connect federation
          Redirects to national identity provider (FranceConnect)
          Returns to portal with identity confirmed
          Personal data retrieved from backed API
          Session expires after 30 minutes
```

---

## Profile 4: Machine-to-Machine (M2M) Data Integration

**Context**: Continuous data sync between systems (ETL, real-time replication)

### Key Characteristics

- **Scope**: Backend-to-backend integration
- **Frequency**: Scheduled (hourly, daily) or event-driven
- **Data Volume**: Large
- **Real-time Requirements**: Near real-time or eventual consistency
- **Security Level**: High
- **Availability**: 99.9% uptime expected

### Standards (Profile M2M)

| Category            | Standard                | Notes                 |
| ------------------- | ----------------------- | --------------------- |
| **Protocol**        | HTTPS or AMQP           | For queues            |
| **Security**        | mTLS (cert-based)       | Client certificates   |
| **Batch Transfer**  | SFTP or HTTPS           | Encrypted transfer    |
| **Queue Messaging** | AMQP                    | RabbitMQ, etc.        |
| **Event Format**    | JSON with schema        | Kafka/Event Streaming |
| **Compression**     | GZIP for large payloads | Reduce bandwidth      |
| **Checksum**        | SHA-256 hashes          | Verify integrity      |
| **Monitoring**      | Health checks, metrics  | Prometheus format     |

### Implementation Checklist

- [ ] mTLS with mutual certificate validation
- [ ] Batch transfer with SHA-256 verification
- [ ] Retry logic with exponential backoff
- [ ] Dead letter queue for failed messages
- [ ] Schema versioning (backward-compatible)
- [ ] Idempotent operations (same request = same result)
- [ ] Transaction logging for all transfers
- [ ] Monitoring/alerting for failures
- [ ] Disaster recovery procedures
- [ ] Regular backup validation

### Example Flow

```
System A → SFTP over HTTPS → Encrypted file transfer
           SHA-256 checksum validation
           → Received notification via webhook
           → System B processes batch
           → Success/failure response logged
```

---

## Profile 5: Open Data & Public Distribution

**Context**: Publishing public datasets for open access by anyone

### Key Characteristics

- **Scope**: Public data, no authentication needed
- **Frequency**: Updated periodically (daily, weekly, monthly)
- **Data Volume**: Large
- **Real-time Requirements**: Not critical
- **Security Level**: Low (public data only)
- **Availability**: Best-effort

### Standards (Profile Open Data)

| Category            | Standard                  | Notes                 |
| ------------------- | ------------------------- | --------------------- |
| **Protocol**        | HTTPS                     | Public accessibility  |
| **Authentication**  | None                      | Open access           |
| **Data Formats**    | JSON, CSV, XML            | Multiple formats      |
| **Linked Data**     | RDF/JSON-LD               | Semantic web          |
| **Metadata**        | DCAT-AP                   | Data catalog standard |
| **License**         | ODbL, CC-BY               | Open data license     |
| **Discoverability** | Sitemap.xml               | For search engines    |
| **Caching**         | Aggressive (HTTP caching) | CDN-friendly          |

### Implementation Checklist

- [ ] Data published in DCAT-AP format
- [ ] Multiple format downloads (JSON, CSV, XML)
- [ ] Metadata includes creation date, update frequency
- [ ] License clearly stated (CC-BY, ODbL, etc.)
- [ ] Sitemap.xml for search engine discovery
- [ ] REST API with pagination
- [ ] CORS enabled (allow all origins)
- [ ] Aggressive caching (Cache-Control: max-age=3600)
- [ ] CDN distribution for performance
- [ ] Monthly update schedule published

### Example Flow

```
Public → HTTPS (no auth) → Open Data API
         JSON/CSV/XML available
         Cache-Control: max-age=3600
         License: CC-BY
         Indexed by search engines
```

---

## How to Choose the Right Profile

| Scenario                                     | Profile       | Why                                     |
| -------------------------------------------- | ------------- | --------------------------------------- |
| Ministry A ↔ Ministry B data sync            | **A2A**       | Secure, authenticated, scheduled        |
| Business applies for business permit         | **A2B**       | OAuth, API docs, SDKs, rate limiting    |
| Citizen views tax records online             | **A2C**       | OpenID, WCAG accessible, GDPR protected |
| Real-time inventory sync (store ↔ warehouse) | **M2M**       | mTLS, batch, reliable, monitored        |
| Government publishes census data             | **Open Data** | Public, crawlable, multiple formats     |

---

## References

- **RGI v2.0**: https://www.numerique.gouv.fr/offre-accompagnement/reference-interoperabilite-rgi/
- **European Interoperability Framework (EIF)**: https://ec.europa.eu/isa2/eif/framework/
- **DCAT-AP** (Data Catalog Vocabulary): https://www.w3.org/TR/vocab-dcat-2/
- **OpenID Connect**: https://openid.net/connect/
- **OAuth 2.0**: https://tools.ietf.org/html/rfc6749
