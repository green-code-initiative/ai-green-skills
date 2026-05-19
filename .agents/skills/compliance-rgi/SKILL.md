---
name: compliance-rgi
description: Ensures system interoperability via open standards, documented APIs, and standardized data exchange
category: Interoperability & Standards
keywords: RGI, interoperability, APIs, REST, OpenAPI, OAuth 2.0, standards, integration
license: MIT
---

# SKILL: RGI — Référentiel Général d'Interopérabilité

## 📖 What is RGI?

**Référentiel Général d'Interopérabilité** (v2.0, December 2015)

- **Scope**: System interoperability across political, legal, organizational, semantic, and technical levels
- **Applies to**: French administrative authorities, public services, and their integrations
- **Key requirement**: All systems must use open standards and be verifiably interoperable
- **Details on levels/standards**: See `STANDARDS-REFERENCE.md` and `INTEROPERABILITY-PROFILES.md`
- **Reference**: https://www.numerique.gouv.fr/offre-accompagnement/reference-interoperabilite-rgi/

## ⚡ How to Use This SKILL

**First time?** → Read `INDEX.md` for complete document navigation
**Quick eval?** → Use `QUICK-ASSESSMENT.md` (5 minutes)
**Detailed audit?** → Use `CONFORMANCE-CHECKLIST.md` (1-2 hours)
**Learning standards?** → Use `STANDARDS-REFERENCE.md` (reference)

### Quick Navigation:

1. `QUICK-ASSESSMENT.md` — 5-minute compliance scoring
2. `CONFORMANCE-CHECKLIST.md` — 50+ detailed items (formal audit)
3. `STANDARDS-REFERENCE.md` — All RGI-approved standards
4. `INTEROPERABILITY-PROFILES.md` — 5 integration patterns (A2A, A2B, A2C, M2M, OpenData)
5. `INDEX.md` — Document index and workflows
6. Project-specific: See `docs/compliance/RGI-IMPLEMENTATION.md` in your codebase

## 🎯 Quick: Identify Applicable RGI Criteria

**Answer these questions to determine what applies:**

1. **Does your project expose APIs to other systems?** → Apply **Technical Standards** (REST, OAuth 2.0, OpenAPI)
2. **Does your project share data with other organizations?** → Apply **Semantic**, **Legal**, **Organizational** criteria
3. **Are you integrating with external systems (government, business, partners)?** → Apply **all levels** (see decision matrix below)
4. **Is this only internal company code?** → Only apply **Technical Standards** (no inter-org requirements)

### Decision Matrix: What to Check

| Scenario                                      | Political | Legal | Organizational | Semantic | Technical |
| --------------------------------------------- | --------- | ----- | -------------- | -------- | --------- |
| Internal API (no external callers)            | ✓         | ✓     | ✓              | ✓        | ✓✓        |
| Public-facing API (third-party integrations)  | ✓         | ✓     | ✓              | ✓        | ✓✓        |
| Inter-org data exchange (A2A, A2B, A2C)       | ✓✓        | ✓✓    | ✓✓             | ✓✓       | ✓✓        |
| Microservice integration (internal, same org) | —         | —     | —              | ✓        | ✓         |

(✓ = verify, ✓✓ = critical)

## ✅ Essential Checklists (Compressed)

### For APIs (Public or Inter-organizational)

**Must have**:

- [ ] **HTTPS/TLS 1.2+** enabled on all endpoints
- [ ] **OpenAPI 3.0** schema documented and published
- [ ] **REST design**: Resources (nouns), proper HTTP verbs/statuses
- [ ] **Versioning**: API version in URL (`/api/v1/`)
- [ ] **Pagination**: List endpoints support `skip`/`take`/`total`
- [ ] **Error response**: Standard format with `code`, `message`, `traceId`
- [ ] **Authentication**: OAuth 2.0 or JWT tokens (if multi-org access)
- [ ] **Data formats**: JSON default, UTF-8, ISO 8601 dates

**Should have** (if data is sensitive/shared):

- [ ] **Data export**: Users can export personal data (JSON/CSV)
- [ ] **GDPR compliance**: See `compliance-rgpd` SKILL
- [ ] **Audit logging**: Track who accessed what, when
- [ ] **Rate limiting**: Headers indicate limits
- [ ] **Deprecation policy**: 6-month notice before breaking changes

### For Data Ownership & Structure

**Must have**:

- [ ] **Data dictionary**: Each field documented (name, type, unit)
- [ ] **Identifiers**: UUID v4, not sequential IDs
- [ ] **Standard codes**: ISO 3166 (countries), ISO 639 (languages), ISO 8601 (dates)
- [ ] **Relationships**: Defined between entities (user→organization→address)

**Should have**:

- [ ] **Schema versioning**: Backward-compatible evolution
- [ ] **Metadata**: `createdAt`, `updatedAt`, `schemaVersion` fields

### For Organizational Readiness (If Inter-org)

**Must have**:

- [ ] **Responsibility assigned**: Named person/team for interoperability
- [ ] **Legal agreements**: SLA/contract defines data access rights
- [ ] **Data retention**: Policy documented (how long data kept)
- [ ] **Incident response**: Breach notification procedures

### For Political Commitment (If Inter-org)

**Must have**:

- [ ] **Public timeline**: Compliance roadmap published
- [ ] **Resource allocation**: Budget/team assigned

## 🔌 Technical Standards Verification

### Quick Test: Is This API RGI-Compliant?

```bash
# 1. HTTPS/TLS 1.2+ required
curl -i https://api.example.fr/api/v1/users
# ✓ Should respond (not redirect to HTTP)

# 2. OpenAPI documented?
curl https://api.example.fr/api/docs
# ✓ Should show Swagger UI

# 3. Proper status codes?
curl -H "Authorization: Bearer INVALID" https://api.example.fr/api/v1/users
# ✓ Should return 401 (not 500)

# 4. Standard error format?
curl -X POST https://api.example.fr/api/v1/users -d '{invalid json}'
# ✓ Should return: { "error": { "code": "...", "message": "...", "traceId": "..." } }

# 5. Pagination?
curl https://api.example.fr/api/v1/users?skip=0&take=20
# ✓ Should return: { "items": [...], "paging": { "skip": 0, "take": 20, "total": N } }
```

### Standards Cheat Sheet

| Need                           | Standard        | Example                                |
| ------------------------------ | --------------- | -------------------------------------- |
| **Secure transport**           | TLS 1.2+        | `https://` (not http)                  |
| **API documentation**          | OpenAPI 3.0     | `/api/docs` endpoint                   |
| **Auth (external APIs)**       | OAuth 2.0       | Bearer token (JWT)                     |
| **User identity (federation)** | OpenID Connect  | FranceConnect integration              |
| **Data format**                | JSON            | UTF-8, ISO 8601 dates                  |
| **Unique IDs**                 | UUID v4         | `550e8400-e29b-41d4-a716-446655440000` |
| **Countries/languages**        | ISO standards   | `FR`, `fr`                             |
| **DateTime**                   | ISO 8601        | `2024-04-01T10:30:00Z`                 |
| **Async messaging**            | AMQP            | RabbitMQ, SMTP, webhooks               |
| **Geospatial**                 | GeoJSON, WGS 84 | If location data used                  |

**For exhaustive standards list, see `STANDARDS-REFERENCE.md`**

## 💾 Code Examples: RGI Requirements

### ✅ REST API with OpenAPI (NestJS)

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  HttpCode,
  Body,
} from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('Resources')
@Controller('api/v1/resources')
export class ResourceController {
  @Get()
  @ApiOperation({ summary: 'List resources' })
  @ApiResponse({ status: 200, description: 'List with pagination' })
  async list(@Query('skip') skip = 0, @Query('take') take = 20) {
    return { items: [], paging: { skip, take, total: 0 } }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiResponse({ status: 200, description: 'Found' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async getOne(@Param('id') id: string) {
    // Must use UUID, not sequential ID
    return this.service.findById(id)
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create resource' })
  @ApiResponse({ status: 201, description: 'Created' })
  async create(@Body() dto: CreateResourceDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update resource' })
  @ApiResponse({ status: 200, description: 'Updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateResourceDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete resource' })
  async delete(@Param('id') id: string) {}
}
```

### ✅ Standard Error Response

```typescript
// All endpoints should return this format on error
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",           // Machine-readable code
    "message": "Resource with ID 123...",   // User-readable message
    "httpStatus": 404,                      // HTTP status
    "timestamp": "2024-04-01T10:30:00Z",   // ISO 8601
    "traceId": "abc-123-def"                // For support/debugging
  }
}
```

### ✅ Data with Standard Formats

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000", // UUID v4
  "createdAt": "2024-04-01T10:30:00Z", // ISO 8601
  "firstName": "Jean",
  "country": "FR", // ISO 3166-1 (2-letter)
  "language": "fr", // ISO 639-1 (2-letter)
  "amount": 100.5,
  "currency": "EUR" // ISO 4217
}
```

### ✅ Data Export (GDPR Article 20)

```typescript
@Get(':userId/export')
@UseGuards(AuthGuard)
async exportPersonalData(@Param('userId') userId: string) {
  const data = await this.service.getAllPersonalData(userId)
  return {
    data,
    exported: new Date().toISOString(),
    schema_version: '1.0'
  }
}
```

### ✅ OAuth 2.0 Token (for external APIs)

```typescript
// Client requests token
POST /oauth/token
  client_id=my-app&
  client_secret=secret&
  grant_type=client_credentials&
  scope=read:resources

// Response
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:resources"
}

// Usage: Authorization: Bearer eyJhbGc...
```

### ✅ Webhook Notification (Async Events)

```typescript
// Event occurs → POST to registered webhooks
POST https://partner-system.fr/webhooks/resource
  Authorization: Bearer signature="..."
  Content-Type: application/json

{
  "event": "resource.created",
  "data": { /* resource object */ },
  "timestamp": "2024-04-01T10:30:00Z",
  "deliveryAttempt": 1
}

// Partner responds with 2xx = success
// Otherwise: retry with exponential backoff (max 3 attempts)
```

## 🗂️ Reference Documents

- **`STANDARDS-REFERENCE.md`**: Complete list of all RGI standards by category (network, transport, APIs, data formats, identifiers)
- **`INTEROPERABILITY-PROFILES.md`**: 5 integration patterns (A2A, A2B, A2C, M2M, OpenData) with specific standards for each
- **`CONFORMANCE-CHECKLIST.md`**: 50+ detailed checklist items by level (use for exhaustive assessment)
- **Project Implementation Guide**: Check `docs/compliance/RGI-IMPLEMENTATION.md` in your codebase for platform-specific guidance
- **Official RGI v2.0**: https://www.numerique.gouv.fr/offre-accompagnement/reference-interoperabilite-rgi/

## 🎯 How to Use This SKILL

1. **Identify your scenario** using the Decision Matrix above
2. **Check the essential checklist** for your API/data type
3. **Run the quick tests** to verify compliance
4. **Reference code examples** for implementation
5. **Consult detailed docs** (`STANDARDS-REFERENCE.md`, etc.) for exhaustive requirements
6. **Use `CONFORMANCE-CHECKLIST.md`** for formal assessment

## ⚠️ Common Pitfalls

❌ **Don't**:

- Use HTTP (must be HTTPS)
- Create undocumented APIs
- Use sequential IDs (privacy risk)
- Return generic error messages
- Mix data formats (stick to JSON)
- Skip pagination on large endpoints

✅ **Do**:

- Use **UUID v4** for identifiers
- Publish **OpenAPI 3.0** schema
- Return **structured error responses**
- Use **ISO 8601** for dates
- Support **pagination** from day 1
- Add **deprecation notice** 6 months before breaking changes
