# Project — RGI Implementation Guide

This guide explains how to apply **Référentiel Général d'Interopérabilité (RGI)** standards in the **Project engagement platform**, considering its specific architecture (NestJS 9.x API, React SPA, microservices).

> **Prerequisites**:
>
> - Read [`@skill compliance-rgi`](../../.agents/skills/compliance-rgi/) for general RGI knowledge and compliance assessment workflows
> - Review [`ADR-010: RGI Interoperability Compliance`](../adr/ADR-010-rgi-interoperability-compliance.md) for current assessment (74% compliant) & critical technical issues
> - See [`COMPLIANCE-MATRIX.md`](COMPLIANCE-MATRIX.md) for cross-standard dependencies & timeline with RGPD + RGS
> - Cross-reference: [`RGPD-IMPLEMENTATION.md`](RGPD-IMPLEMENTATION.md) (user rights & data export), [`RGS-IMPLEMENTATION.md`](RGS-IMPLEMENTATION.md) (security controls for API)

## 🏗️ Project Architecture & RGI Levels

### Current State

```
┌─────────────────────────────────────────────────────────┐
│                    Project Platform                         │
├──────────────┬──────────────────┬───────────┬──────────┤
│  Web         │  API             │  Services │  External│
│  (React SPA) │  (NestJS 9.x)    │           │          │
│  Port 3000   │  Port 3001       │           │          │
└──────────────┴──────────────────┴───────────┴──────────┘
       ↓              ↓               ↓           ↓
   HTTPS        HTTPS/REST      AMQP/Events  OAuth/SAML
  (CORS)     (Swagger @docs)  (RabbitMQ)    (Degreed API)
```

### Stack

- **API Framework**: NestJS 9.x with TypeORM 8.x
- **API Style**: RESTful + OpenAPI/Swagger
- **Documentation**: Auto-generated via @nestjs/swagger decorators
- **Versioning**: URL-based (`/api/v1/...`)
- **Authentication**: JWT tokens + OAuth 2.0 (Degreed, internal)
- **Response Format**: JSON-based DTOs with class-validator
- **Data Exports**: CSV, JSON formats (RGPD portability)

### RGI Compliance by Component

| Component               | Political | Legal | Organizational | Semantic | Technical |
| ----------------------- | --------- | ----- | -------------- | -------- | --------- |
| **Web (React SPA)**     | ✅        | 🟡    | 🟡             | ✅       | 🟡        |
| **API (NestJS)**        | ✅        | ✅    | ✅             | ✅       | 🟡        |
| **Mailer service**      | ✅        | ✅    | ✅             | ✅       | 🟡        |
| **Degreed integration** | 🟡        | 🟡    | 🟡             | 🟡       | 🟡        |

**Legend**: ✅ = Compliant | 🟡 = Partial | ❌ = Non-compliant

### Key Module Locations

- **API Controllers**: `apps/api/src/modules/*/[resource].controller.ts`
- **Entities**: `libs/server/entities/src/` (data models)
- **DTOs**: `libs/shared/dto/src/` (request/response schemas)
- **OpenAPI Config**: `apps/api/src/main.ts` (Swagger setup)
- **Repositories**: `libs/server/repositories/src/` (database access)

---

## 1️⃣ Political Level — Project Strategy

**Current State**: ✅ Addressed in copilot-instructions.md and README

**What's in place**:

- ✅ Public commitment to French regulatory frameworks (RGAA, RGPD, RGS, RGESN, RGI)
- ✅ Architecture documentation in `docs/ARCHITECTURE.md`
- ✅ Compliance roadmap in CI/compliance reports

**Actions needed**:

- [ ] Publish formal RGI conformance statement on website/README
- [ ] Quarterly compliance reports (see [@skill compliance-rgi](../../.agents/skills/compliance-rgi/CONFORMANCE-CHECKLIST.md))
- [ ] Document RGI in CONTRIBUTING.md developer guidelines

---

## 2️⃣ Legal Level — Project Compliance

**Current State**: 🟡 Partially addressed

**RGPD/GDPR Data Protection**:

- ✅ Personal data is encrypted and protected
- ✅ User authentication via JWT
- 🟡 Data export feature needs completion
- 🟡 Data retention policy not documented

**Action item — Add user data export**:

```typescript
// apps/api/src/modules/user/controllers/user.controller.ts

@Get(':id/export')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Export user data (GDPR right)' })
@ApiResponse({
  status: 200,
  description: 'User data export',
  content: { 'application/json': { schema: UserExportDto } }
})
async exportUserData(@Param('id') userId: string) {
  // Bundle all user data in standard format
  return this.userService.exportUserData(userId)
}

// Returns:
{
  "user": { /* profile */ },
  "workshops": [ /* attended */ ],
  "sessions": [ /* participated */ ],
  "recommendations": [ /* received */ ],
  "exportDate": "2024-04-01T10:30:00Z",
  "format": "1.0"
}
```

---

## 3️⃣ Organizational Level — Project Teams & Processes

**Current State**: ✅ Documented

**Data Governance**:

- ✅ Clear entity definitions (User, Workshop, Session, Recommendation)
- ✅ Data owners (module leads)
- 🟡 Need formal data dictionary

**Team Structure**:

```
RGI Compliance Lead (Project Product Manager)
├── Technical Lead (API architect)
├── Frontend Lead (React)
├── DevOps Lead (infrastructure)
└── Legal/Compliance (RGPD officer)
```

**Actions**:

- [ ] Create `docs/DATA-DICTIONARY.md`
- [ ] Define data retention policies per entity type
- [ ] Document API change management for versions

---

## 4️⃣ Semantic Level — Project Data Model

**Current State**: ✅ Well-defined

**Core Entities** (in `@Project/server/entities`):

- **User**: Person using the platform
- **Workshop**: Training/engagement event
- **Session**: Instance of a workshop
- **Recommendation**: AI-generated suggestion
- **Keyword**: Topic for recommendation engine

**Standards Already Applied**:

- ✅ UUID for primary keys
- ✅ ISO 8601 dates (TypeORM: `@CreateDateColumn()`)
- ✅ Consistent naming (camelCase in API, snake_case in DB)

**Enhancement — Add schema versioning to base entity**:

```typescript
// libs/server/entities/src/lib/base.entity.ts

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date // ISO 8601 format

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date

  // For semantic interoperability
  @Column({ type: 'varchar', length: 50, default: '1.0' })
  schemaVersion: string // Allow future schema evolution

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> // For extensibility
}
```

---

## 5️⃣ Technical Level — Project APIs & Interfaces

### 5.1 | Network & Transport

**Current state**: ✅ HTTPS/TLS configured

```bash
# apps/api/src/main.ts
app.use(helmet()) // Security headers
app.enableCors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
})
```

**Verification**:

- ✅ HTTPS in production: `curl -I https://api.Project.fr`
- ✅ TLS 1.2+ only (disable older versions in nginx)
- ✅ Strong cipher suites: `sslscan api.Project.fr`

### 5.2 | Authentication & Authorization

**Current state**: ✅ JWT authentication + ✅ OAuth 2.0 (Degreed integration)

```typescript
// apps/api/src/modules/auth
├── auth.service.ts      // Login, token generation
├── jwt.strategy.ts      // JWT validation
└── jwt-auth.guard.ts    // Route protection

// Usage:
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Req() req: Request) {
  return req.user // Already authenticated
}
```

**✅ OAuth 2.0 — Already Implemented for Degreed Integration**:

Project has **production-ready OAuth 2.0** support deployed with the Degreed integration:

- **OAuth2-proxy v7.14.2**: Deployed in Kubernetes (production, 21+ days uptime)
- **Degreed API Integration**: `libs/svc-degreed/http` with auto token refresh
- **Path**: User → Traefik → oauth2-proxy → Project API
- **Features**:
  - Auto token refresh with retry logic
  - Secure credential handling via environment variables
  - Error recovery mechanisms

**See**: `k8s/infra/oauth2-proxy/` for Kubernetes configuration, `libs/svc-degreed/http` for implementation

**Ready for expansion**: oauth2-proxy can authenticate external OAuth providers (GitHub, Google, Entra ID, etc.) if needed by adding configuration to identity provider settings

### 5.3 | API Design — REST & OpenAPI

**Current state**: ✅ Well-structured REST API

**Implemented Standards**:

- ✅ REST endpoints (GET, POST, PUT, DELETE)
- ✅ OpenAPI/Swagger at `/api/docs`
- ✅ Proper HTTP status codes
- ✅ Pagination with @rewiko/crud library

**Improvements Needed**:

1. **Standardize error responses**:

```typescript
// libs/shared/dto/src/lib/error.dto.ts (NEW)
export class ErrorDto {
  code: string // 'USER_NOT_FOUND', 'INVALID_EMAIL'
  message: string
  details?: string
  httpStatus: number
  timestamp: string // ISO 8601
  traceId: string // For debugging
  path?: string
}
```

2. **Document all error codes for endpoints**:

```typescript
@Get(':id')
@ApiResponse({
  status: 200,
  description: 'Workshop found',
})
@ApiResponse({
  status: 404,
  description: 'Workshop not found',
  content: {
    'application/json': {
      example: {
        code: 'WORKSHOP_NOT_FOUND',
        message: 'Workshop with ID xyz not found',
        httpStatus: 404,
        timestamp: '2024-04-01T10:30:00Z',
        traceId: 'abc123',
      },
    },
  },
})
async getWorkshop(@Param('id') id: string) {
  // ...
}
```

3. **Add data export endpoint for GDPR**:

```typescript
@Get(':id/export')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Export personal data (GDPR Article 20)' })
async exportUserData(
  @Param('id') userId: string,
  @Query('format', new DefaultValuePipe('json')) format: 'json' | 'csv',
) {
  const data = await this.userService.exportAllPersonalData(userId)

  if (format === 'csv') {
    return this.convertToCSV(data)
  }

  return {
    data,
    exported: new Date().toISOString(),
    schema_version: '1.0',
  }
}
```

### 5.4 | Data Formats & Encoding

**Current state**: ✅ JSON by default, UTF-8 encoding

**Verification**:

```bash
# Check API response
curl -i http://localhost:3001/api/v1/users | grep -i content-type
# Should show: Content-Type: application/json; charset=utf-8

# Check date format
curl http://localhost:3001/api/v1/users/1 | jq '.createdAt'
# Should show: "2024-04-01T10:30:00Z" (ISO 8601)
```

**Ensure standards** with class-transformer:

```typescript
// apps/api/src/config/serialization.ts

import { ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common'
import { plainToClass } from 'class-transformer'

// In main.ts:
app.useGlobalInterceptors(
  new ClassSerializerInterceptor(app.get(Reflector), {
    strategy: 'excludeAll',
    excludeExtraneousValues: true,
  })
)

// In entity DTOs:
export class UserDto {
  @Expose()
  id: string

  @Expose()
  email: string

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date // Automatically ISO 8601
}
```

### 5.5 | Documentation

**Current state**: ✅ Swagger at `/api/docs`

**Verify coverage**:

```bash
# Visit http://localhost:3001/api/docs and check:
# - Every controller is documented
# - Every endpoint has description
# - Response schemas are defined
# - Error codes documented (400, 401, 403, 404, 500)

# Export OpenAPI spec:
curl http://localhost:3001/api/docs-json > openapi.json
curl http://localhost:3001/api/docs-yaml > openapi.yaml
```

**Ensure all endpoints have comprehensive documentation**:

```typescript
@Get(':id')
@ApiOperation({
  summary: 'Get workshop by ID',
  description: 'Retrieves a single workshop with all details',
})
@ApiParam({
  name: 'id',
  description: 'Workshop UUID',
  example: '550e8400-e29b-41d4-a716-446655440000',
})
@ApiResponse({
  status: 200,
  description: 'Workshop found',
  type: WorkshopDto,
})
@ApiResponse({
  status: 404,
  description: 'Workshop not found',
})
@ApiResponse({
  status: 500,
  description: 'Server error',
})
async getWorkshop(@Param('id') id: string) {
  // ...
}
```

---

## ✅ RESTful API Best Practices in Project

### 1. Endpoint Design Pattern

Project follows standard REST conventions:

```typescript
// apps/api/src/modules/workshop/workshop.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { WorkshopService } from './workshop.service'
import { CreateWorkshopDto, UpdateWorkshopDto } from '@Project/shared/dto'

@ApiTags('Workshop')
@Controller('api/v1/workshops')
export class WorkshopController {
  constructor(private workshopService: WorkshopService) {}

  // ✅ GET /api/v1/workshops - List all
  @Get()
  @ApiOperation({ summary: 'List all workshops' })
  @ApiResponse({ status: 200, description: 'List of workshops' })
  findAll() {
    return this.workshopService.findAll()
  }

  // ✅ GET /api/v1/workshops/:id - Get one
  @Get(':id')
  @ApiOperation({ summary: 'Get workshop by ID' })
  @ApiResponse({ status: 200, description: 'Workshop details' })
  @ApiResponse({ status: 404, description: 'Workshop not found' })
  findOne(@Param('id') id: string) {
    return this.workshopService.findOne(id)
  }

  // ✅ POST /api/v1/workshops - Create
  @Post()
  @ApiOperation({ summary: 'Create new workshop' })
  @ApiResponse({ status: 201, description: 'Workshop created' })
  create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopService.create(createWorkshopDto)
  }

  // ✅ PUT /api/v1/workshops/:id - Update
  @Put(':id')
  @ApiOperation({ summary: 'Update workshop' })
  @ApiResponse({ status: 200, description: 'Workshop updated' })
  update(@Param('id') id: string, @Body() updateWorkshopDto: UpdateWorkshopDto) {
    return this.workshopService.update(id, updateWorkshopDto)
  }

  // ✅ DELETE /api/v1/workshops/:id - Delete
  @Delete(':id')
  @ApiOperation({ summary: 'Delete workshop' })
  @ApiResponse({ status: 204, description: 'Workshop deleted' })
  remove(@Param('id') id: string) {
    return this.workshopService.remove(id)
  }
}
```

**Conventions**:

- ✅ Nouns for resources: `/workshops`, `/users`, not `/getWorkshop`
- ✅ Plural resource names
- ✅ HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
- ✅ Version in path: `/api/v1/...`
- ✅ Standard status codes: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 404 (Not Found), 500 (Server Error)

### 2. Pagination & Filtering

```typescript
// ✅ Pagination in list endpoint
@Get()
@ApiQuery({ name: 'page', type: Number, required: false })
@ApiQuery({ name: 'limit', type: Number, required: false })
findAll(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 20
) {
  const offset = (page - 1) * limit
  return this.workshopService.findAll(offset, limit)
}

// Usage: GET /api/v1/workshops?page=2&limit=50
```

### 3. Data Transfer Objects (DTOs)

All Project APIs use strongly-typed DTOs:

```typescript
// libs/shared/dto/src/workshop.dto.ts
import { IsString, IsUUID, IsOptional } from 'class-validator'

export class CreateWorkshopDto {
  @IsString()
  title: string

  @IsString()
  description: string

  @IsOptional()
  @IsString()
  location?: string
}

export class WorkshopResponseDto {
  @IsUUID()
  id: string

  @IsString()
  title: string

  @IsString()
  createdAt: Date

  @IsString()
  updatedAt: Date
}
```

### 4. OpenAPI/Swagger Documentation

Project auto-generates API docs from NestJS decorators:

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // ✅ Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Project API')
    .setDescription('Project Engagement Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document) // Accessible at /api/docs

  await app.listen(3001)
}

bootstrap()
```

**Access Documentation**:

- JSON: `http://localhost:3001/api/docs-json`
- YAML: `http://localhost:3001/api/docs-yaml`
- Interactive UI: `http://localhost:3001/api/docs`

### 5. Standard Error Responses

```typescript
// ✅ Consistent error format across Project
interface ErrorResponse {
  statusCode: number
  message: string
  error: string
  timestamp: string
  path: string
}

// Example error response:
{
  "statusCode": 404,
  "message": "Workshop with ID 'xyz' not found",
  "error": "Not Found",
  "timestamp": "2026-03-18T10:30:00Z",
  "path": "/api/v1/workshops/xyz"
}
```

### 6. Data Export (CSV/JSON)

Project provides data portability (RGPD requirement):

```typescript
// ✅ Export user data as JSON
@Get('export/json')
@ApiOperation({ summary: 'Export user data as JSON' })
async exportJson(@Request() req) {
  const userData = await this.userService.findOne(req.user.id)
  return {
    user: userData,
    exportedAt: new Date().toISOString(),
  }
}

// ✅ Export user data as CSV
@Get('export/csv')
@ApiOperation({ summary: 'Export user data as CSV' })
async exportCsv(@Request() req, @Response() res) {
  const userData = await this.userService.findOne(req.user.id)
  const csv = this.csvService.convertToCSV(userData)
  res.set({
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="user-data.csv"',
  })
  res.send(csv)
}
```

### 7. API Versioning

Project uses URL-based versioning for forward compatibility:

```typescript
// Current: /api/v1/* (active)
// Future: /api/v2/* (when major changes needed)

// Old v1 endpoints remain available during deprecation period
// Deprecation notice in response header:
res.setHeader('Deprecation', 'true')
res.setHeader('Sunset', 'Wed, Dec 31 2026 23:59:59 GMT')
```

---

## � Implementing RGI Profiles in Project

RGI defines integration profiles for different scenarios. Project should support:

### Profile: A2A (Admin-to-Admin)

**Scenario**: Project shares user engagement data with another ministry

**Implementation**:

- ✅ OAuth 2.0 or mTLS certificates for authentication
- ✅ OpenAPI documented API
- ✅ Audit logging for all data access
- 🟡 Scheduled data export endpoint needed

```typescript
// apps/api/src/modules/admin/controllers/data-export.controller.ts (NEW)

@Controller('admin/data-export')
@UseGuards(AdminGuard)
export class AdminDataExportController {
  @Post('schedule')
  @ApiOperation({ summary: 'Schedule data export to partner' })
  async scheduleDataExport(@Body() dto: ScheduleExportDto) {
    // dto.partnerId, dto.dataType, dto.frequency
    // Create scheduled job
    // Send confirmation
  }

  @Get('logs')
  @ApiOperation({ summary: 'View data export audit logs' })
  async getExportLogs(@Query('startDate') startDate: string) {
    // Return audit trail of data access
  }
}
```

### Profile: A2B (Admin-to-Business)

**Scenario**: Companies integrate with Project to recommend training

**Implementation**:

- ✅ OAuth 2.0 for delegated auth
- ✅ OpenAPI SDK generation
- 🟡 Webhooks for recommendation notifications

```typescript
// apps/api/src/modules/webhook/controllers/webhook.controller.ts (NEW)

@Controller('webhooks')
export class WebhookController {
  @Post('recommendations/register')
  @ApiOperation({ summary: 'Register webhook for recommendation events' })
  async registerWebhook(@Body() dto: { callbackUrl: string; events: string[] }) {
    // Store webhook subscription
    // Verify endpoint is accessible
  }

  // When recommendation created, notify webhooks
  async notifyWebhooks(recommendation: Recommendation) {
    const webhooks = await this.webhookRepo.findByEvent('recommendation.created')
    for (const webhook of webhooks) {
      try {
        await fetch(webhook.callbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'recommendation.created',
            data: recommendation,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch (e) {
        // Log and retry with exponential backoff
      }
    }
  }
}
```

### Profile: A2C (Admin-to-Citizen)

**Scenario**: Citizens access workshop recommendations

**Implementation**:

- ✅ OpenID Connect federation (if available)
- ✅ WCAG 2.1 AA frontend (see [RGAA SKILL](../../.agents/skills/compliance-rgaa/))
- ✅ GDPR data export endpoints
- 🟡 Session timeout mechanism

```typescript
// apps/web/src/lib/auth/session-timeout.service.ts (NEW)

export class SessionTimeoutService {
  private inactivityTimer: NodeJS.Timeout

  constructor(private router: Router) {}

  resetTimer() {
    clearTimeout(this.inactivityTimer)
    this.inactivityTimer = setTimeout(() => {
      // 30 minutes of inactivity
      this.logout()
    }, 30 * 60 * 1000)
  }

  private logout() {
    localStorage.removeItem('token')
    this.router.navigate(['/login'])
  }
}
```

---

## 📋 Project RGI Standards Adoption

| Standard          | Project Component      | Status | Notes                                            |
| ----------------- | ------------------- | ------ | ------------------------------------------------ |
| **OpenAPI 3.0**   | API Swagger         | ✅     | Auto-generated from @nestjs/swagger              |
| **OAuth 2.0**     | Degreed integration | ✅     | ✅ Deployed (oauth2-proxy v7.14.2, auto refresh) |
| **REST**          | Public API          | ✅     | Full REST compliance                             |
| **JSON**          | API responses       | ✅     | UTF-8, ISO 8601 dates                            |
| **HTTP/TLS 1.2+** | Network transport   | ✅     | HTTPS only                                       |
| **UUID**          | Primary keys        | ✅     | All entities use UUID                            |
| **ISO 8601**      | Date formats        | ✅     | Consistent across API                            |
| **PostgreSQL**    | Data storage        | ✅     | With TypeORM                                     |
| **Docker**        | Deployment          | ✅     | Containers for all services                      |
| **Kubernetes**    | Orchestration       | 📅     | `k8s/` folder prepared                           |

---

## 📅 Implementation Roadmap

### Q2 2024 (Immediate — This Quarter)

- [ ] Complete user data export endpoint (GDPR)
- [ ] Standardize error response format with error codes
- [ ] Verify API versioning (/api/v1/ throughout)
- [ ] Document data retention policy per entity
- [ ] Verify HTTPS/TLS 1.2+ in all environments
- [ ] Update CONTRIBUTING.md with RGI guidelines

### Q3 2024

- [ ] Add webhook support for partner notifications
- [ ] Create formal data dictionary (docs/DATA-DICTIONARY.md)
- [ ] Set up quarterly RGI compliance reporting
- [ ] Publish API SDKs (JavaScript, Python)

### Q4 2024

- [ ] mTLS support for A2A integrations
- [ ] Advanced monitoring and analytics
- [ ] Multi-language API documentation
- [ ] Security audit + penetration test
- [ ] Formal RGI compliance certification

### 2025+

- [ ] GraphQL API alongside REST
- [ ] Real-time recommendations (WebSocket)
- [ ] Advanced partner analytics
- [ ] Multi-region deployment (EU-only data residency)
- [ ] AI/ML model versioning and export

---

## 🧪 Testing Project RGI Compliance

```bash
# Test 1: HTTPS Only
curl -I http://localhost:3001/api/v1/users
# Should FAIL (unencrypted)
curl -I https://localhost:3001/api/v1/users
# Should work (HTTPS required)

# Test 2: Authentication Required
curl https://localhost:3001/api/v1/users
# Should return 401 Unauthorized

# Test 3: OpenAPI Documentation
curl https://localhost:3001/api/docs
# Should return Swagger UI

# Test 4: Consistent Error Format
curl -X POST https://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{invalid}'
# Should return structured error with code, message, and traceId

# Test 5: Data Export (GDPR)
curl https://localhost:3001/api/v1/users/123/export \
  -H "Authorization: Bearer $TOKEN"
# Should return JSON with all personal data, timestamp, schema version

# Test 6: Pagination
curl "https://localhost:3001/api/v1/users?skip=0&take=20" \
  -H "Authorization: Bearer $TOKEN"
# Should return { items: [...], paging: { skip: 0, take: 20, total: X } }

# Test 7: ISO 8601 Dates
curl https://localhost:3001/api/v1/users/1 \
  -H "Authorization: Bearer $TOKEN" | jq '.createdAt'
# Should show: "2024-04-01T10:30:00Z"

# Test 8: API Versioning Header
curl -I https://localhost:3001/api/v1/users \
  -H "Authorization: Bearer $TOKEN" | grep -i "x-api-version"
# Should show current API version
```

---

## 📚 Resources

- **Project Repository**: https://github.com/amorgaut/Project
- **RGI v2.0 Official**: https://www.numerique.gouv.fr/offre-accompagnement/reference-interoperabilite-rgi/
- **@skill compliance-rgi**: [../../.agents/skills/compliance-rgi/](../../.agents/skills/compliance-rgi/)
- **NestJS Documentation**: https://docs.nestjs.com/
- **OpenAPI/Swagger**: https://swagger.io/
- **OAuth 2.0 Spec**: https://tools.ietf.org/html/rfc6749
- **REST Best Practices**: https://restfulapi.net/

---

**Last Updated**: April 1, 2026  
**RGI Version**: v2.0  
**NestJS Version**: 9.x  
**Compliance Status**: 🟡 Partial (see QUICK-ASSESSMENT.md for scoring)
