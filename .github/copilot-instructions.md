# Project Codebase Guide for AI Agents

## 📋 Quick Links for Compliance & Security

When analyzing Project for security or compliance, refer to:

- **RGS Compliance**: [`.agents/skills/compliance-rgs/SKILL.md`](.agents/skills/compliance-rgs/SKILL.md) — 8-phase implementation framework with quick-start diagnostic
- **RGS Implementation Status**: [`docs/adr/ADR-011-rgs-compliance-roadmap.md`](docs/adr/ADR-011-rgs-compliance-roadmap.md) — Current gaps & roadmap
- **Authentication Patterns**: [`docs/compliance/RGS-IMPLEMENTATION.md`](docs/compliance/RGS-IMPLEMENTATION.md) — JWT, OAuth, LDAP implementation examples
- **All Compliance Docs**: [`docs/compliance/`](docs/compliance/) — RGPD, RGAA, RGESN, RGI, W3C-WSG

---

## Architecture Overview

Project is a **Nx monorepo** containing a full-stack engagement platform with:

- **Backend**: NestJS API (`apps/api`) exposing RESTful endpoints with OpenAPI/Swagger docs
- **Frontend**: React SPA (`apps/web`) with Material-UI components
- **Microservices**: Email service (`apps/mailer`), keyword CLI (`apps/cli-keyword`), Degreed integration (`apps/svc-degreed`)
- **Shared Libraries**: Organized under `libs/` with `@Project/*` namespace aliases (see `tsconfig.base.json`)

## Critical Developer Workflows

### Getting Started

```bash
corepack enable && corepack prepare yarn@1.22.19 --activate
cp .env.example .env
yarn install --frozen-lockfile
yarn services:up              # Starts Docker: PostgreSQL, Redis, RabbitMQ, Mailpit
yarn start api                # NestJS on port 3001, Swagger at http://localhost:3001/docs
yarn start web                # React dev server on port 3000
```

### Common Commands

- **Build**: `nx build` (all projects) or `nx build api/web/[app]` (specific)
- **Test**: `nx test` or `nx test [project] --watch`
- **E2E**: `nx e2e api-e2e` (Jest-based) or `nx e2e web-e2e` (Cypress)
- **Database**: `yarn migration:run`, `yarn migration:create -n [name]` (TypeORM via `ormconfig.ts`)
- **Lint**: `nx lint` or `nx lint [project]`
- **Docker Build**: `nx run [project]:docker:build` (uses Dockerfile in each app)

### Critical Config Files

- `nx.json`: Build targets, caching strategy (3 parallel jobs), default project (web)
- `tsconfig.base.json`: Path aliases—when adding modules, update this
- `.env.example`: Lists all environment variables (JWT, DB, Redis, LDAP, SSO)
- `ormconfig.ts`: TypeORM configuration loaded globally for migrations

## Backend Architecture

### NestJS Module Organization (`apps/api/src/modules/`)

Each business domain gets a **feature module** with controller → service → repository pattern:

- `auth/` - JWT & LDAP authentication
- `user/`, `profile/`, `admin/` - User management
- `workshop/`, `session/`, `request/` - Core business entities
- `keyword/`, `suggestion/`, `recommendation/` - AI/ML features
- `shared/` - Database entities, decorators, guards, interceptors

**Key Patterns**:

- All endpoints return **paginated, typed responses** using `@rewiko/crud` library
- Global `ValidationPipe` with auto-transform enabled
- **Swagger decorators** on controllers auto-generate OpenAPI docs—seen at startup
- **Global guards** (roles, JWT) applied via `@UseGuards()` on controllers
- **RabbitMQ events** (`@Project/server/config/rabbitmq`) for async messaging

### Data Access Layer

- **TypeORM entities** in `libs/server/entities/src/`
- **Repositories** in `libs/server/repositories/src/` with custom query methods
- **Database**: PostgreSQL (host: `0.0.0.0`, port `5432` from docker-compose)
- **Migrations**: TypeORM format in `libs/api/typeorm-migrations/src/`—run on app startup if `NX_DB_MIGRATIONS_RUN=true`

### Configuration & Infrastructure

- `@Project/server/config/typeorm` - ORM setup (entities, migrations, cache)
- `@Project/server/config/logger` - Pino-based structured logging
- `@Project/server/config/mail` - React-email templates in `libs/mailer/templates/`
- `@Project/server/infra/graph-api` - External Azure Graph API integration
- `@Project/server/guards` - Role-based & JWT guards reused across modules

## Frontend Architecture

### Feature Library Structure (`libs/web/**/`)

Following **NX monorepo conventions**:

```
libs/web/[feature]/
├── feature/        # Smart components (containers, data-fetching)
├── ui/             # Presentation components
└── data-access/    # Redux/hooks, API calls via @Project/web/shared/utils/axios
```

**Examples**: `home/feature`, `profile/feature/details`, `recommendations-list/feature`, `user-list/feature`

### Shared Code

- `@Project/web/shared/components/` - Reusable UI widgets (keyword-search, user-search)
- `@Project/web/shared/contexts/` - React context providers
- `@Project/web/shared/utils/` - axios instance, constants, i18n, URL helpers
- `@Project/web/shared/types/` - TS interfaces for API responses
- `@Project/legacy-web/*` - Pre-NX React code (for reference, refactor where possible)
- `@Project/ui` - Atomic design components (buttons, inputs, cards)

### Build & Dev Server

- **Webpack config**: `apps/web/webpack.config.js` with Babel compiler
- **Dev server**: Port 3000 with HMR enabled, proxies API requests to 3001 via `proxy.conf.json`
- **Styles**: Global SCSS in `apps/web/src/styles.scss` + legacy styles from `libs/legacy-web/src/lib`
- **Environment detection**: Check `apps/web/src/environments/environment.ts` (prod) vs `.ts` (dev)

## Library Import Patterns

**MUST** use path aliases (defined in `tsconfig.base.json`) for cross-app imports:

```typescript
// ✅ Correct
import { UserDto } from '@Project/shared/dto'
import { AppModule } from '@Project/api'
import { UserSearch } from '@Project/web/shared/components/user-search'

// ❌ Avoid relative imports for cross-workspace imports
import { UserDto } from '../../../libs/shared/dto/src'
```

Update `tsconfig.base.json` **immediately** when:

- Adding new libraries in `libs/`
- Creating new scopes (e.g., `@Project/new-scope/*`)

## Testing Strategy

- **Unit/Integration**: Jest (`jest.config.ts` root config)
  - API: `apps/api/jest.config.ts`, uses `node` environment
  - Web: `apps/web/jest.config.ts`, uses `jsdom` environment
- **E2E Backend**: `apps/api-e2e/` runs Jest tests against live API
- **E2E Frontend**: `apps/web-e2e/` runs Cypress at port 3000
- **Database for tests**: `NX_DB_TEST_NAME=Project_e2e_test` (separate from dev DB)

## External Integrations

### Authentication & Authorization

- **Internal Auth**: JWT + Passport.js strategy (NestJS) with 15-minute token expiration

  - Global `JwtAuthGuard` protects all endpoints except `@Public()`
  - Password hashing: bcrypt (salt rounds 10)
  - Brute force protection: Account lockout after 5 failed attempts + 15-min timeout
  - See: [`docs/compliance/RGS-IMPLEMENTATION.md`](docs/compliance/RGS-IMPLEMENTATION.md) for implementation details
  - Compliance: ✅ RGS Phase 2 & 3 (Authentication & Encryption)

- **External OAuth 2.0 Gateway**: `oauth2-proxy v7.14.2` (production-deployed, 21d uptime)

  - Acts as reverse proxy for external OAuth providers (if needed)
  - Path: User → Traefik → oauth2-proxy → Project API
  - Status: Ready for integration with external identity providers (GitHub, Google, Entra ID, etc.)
  - See: `k8s/infra/oauth2-proxy/` for Kubernetes configuration

- **LDAP**: For corporate authentication (config in `.env`: `NX_LDAP_URL`, `NX_LDAP_PASSWORD`)
  - Fallback option for internal enterprise deployments

### External Service Integrations

- **Degreed API**: Learning platform integration via OAuth2 client

  - Implementation: `libs/svc-degreed/http` with auto token refresh
  - Status: ✅ Production-ready
  - Features: Auto token refresh, error handling, retry logic

- **Azure Graph API**: For syncing user data from corporate directory
  - Client via `@Project/server/infra/graph-api`
  - Status: ✅ Production-ready

### Infrastructure & Messaging

- **RabbitMQ**: Message broker (localhost:5672) for async background jobs (3-node cluster in production)
- **Redis/Valkey**: In-memory cache (localhost:6379) for query caching and session storage (1 replica in production)
- **Mailpit**: Local email testing at `http://localhost:8025/` (dev only)

### Compliance Notes

- All external integrations should have Data Processing Agreements (DPA) signed (RGPD requirement)
- See `docs/adr/ADR-011-rgs-compliance-roadmap.md` for third-party risk management status (Phase 7)

## Common Gotchas

1. **TypeORM CLI**: Must use wrapper script (`yarn typeorm ...`) to load config from `ormconfig.ts`
2. **NX caching**: If build succeeds but has outdated code, run `nx reset` to clear cache
3. **Missing env vars**: Copy `.env.example` → `.env` before running services; CI builds use secret management
4. **Database migrations**: Always check `NX_DB_MIGRATIONS_RUN` setting—tests may need `--no-migrations` mode
5. **Port conflicts**: Ensure 3000 (web), 3001 (api), 5432 (postgres), 6379 (redis), 5672 (rabbitmq) are free
6. **OAuth2-proxy in production**: If using external OAuth providers, ensure redirect URIs are correctly configured
7. **Feature flags**: Check `NX_FEATURE_*` env vars in frontend for conditional module loading

## Dependency Management

- **Package manager**: Yarn v1.22.19 (enforced via corepack)
- **Monorepo scope**: All dependencies shared; `package.json` at root (no per-project package.json)
- **Key deps**:
  - NestJS 9.x, TypeORM 8.x, PostgreSQL driver
  - React, Material-UI v4, TipTap editor, FullCalendar
  - Swagger/OpenAPI, class-validator, axios
  - Jest, Cypress for testing
  - ESLint with Airbnb config

## Conventions to Maintain

✓ **Module naming**: Feature modules named after domain (e.g., `workshop.module.ts`)  
✓ **DTOs**: Suffixed `.dto.ts`, single-source in `@Project/shared/dto`  
✓ **Entities**: In `@Project/server/entities`, exported via index.ts  
✓ **API versioning**: Enabled at global level, routes prefixed `/api/v1`  
✓ **Guard/Interceptor placement**: Global guards in `libs/server/guards`, applied to modules  
✓ **Test files**: Colocated (`*.spec.ts`) in same directory as source  
✓ **Commit style**: Commitizen-friendly (see badge in README)

## French Regulatory Compliance Framework

Project adheres to five key French regulatory frameworks. An AI-powered compliance framework is available to guide development:

### Compliance Architecture

**Generic Expertise** (framework-agnostic):

- **SKILLs**: [`.agents/skills/compliance-*/SKILL.md`](../.agents/skills/) — Learn each regulatory framework
- **Agent**: [`.agents/agents/compliance/AGENT.md`](../.agents/agents/compliance/AGENT.md) — Review code against all frameworks

**Project-Specific Implementation**:

- **Guide**: [`docs/compliance/APPLYING-COMPLIANCE-AGENT-TO-Project.md`](../docs/compliance/APPLYING-COMPLIANCE-AGENT-TO-Project.md) — How to apply agent to Project context
- **Implementation Guides**: [`docs/compliance/Project-*-IMPLEMENTATION.md`](../docs/compliance/) — Code examples, architecture decisions

### Regulatory Frameworks

| Framework   | Domain             | Focus                                                                 | Generic SKILL                                                                                                                    |
| ----------- | ------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **RGAA**    | Accessibility      | WCAG 2.1 Level AA, semantic HTML, ARIA, keyboard nav                  | [compliance-rgaa](../.agents/skills/compliance-rgaa/SKILL.md)                                                                    |
| **RGPD**    | Data Protection    | Privacy by design, consent, encryption, data rights                   | [compliance-rgpd](../.agents/skills/compliance-rgpd/SKILL.md) ([Reference](../.agents/skills/compliance-rgpd/RGPD-REFERENCE.md)) |
| **RGESN**   | Sustainability     | Energy efficiency, resource optimization, green hosting               | [compliance-rgesn](../.agents/skills/compliance-rgesn/SKILL.md)                                                                  |
| **RGS**     | Security           | Authentication, authorization, encryption, audit logging              | [compliance-rgs](../.agents/skills/compliance-rgs/SKILL.md)                                                                      |
| **RGI**     | Interoperability   | RESTful APIs, OpenAPI, standard formats, data export                  | [compliance-rgi](../.agents/skills/compliance-rgi/SKILL.md)                                                                      |
| **W3C WSG** | Web Sustainability | Perception, energy, network, offline, inclusive design (W3C standard) | [compliance-w3c-wsg](../.agents/skills/compliance-w3c-wsg/SKILL.md)                                                              |

### Using Compliance Guidance in Project

**Comprehensive Review**:

```bash
@agent Compliance Officer
Review this code for compliance with RGAA, RGPD, RGS, RGESN, and RGI.
```

Then consult [`docs/compliance/APPLYING-COMPLIANCE-AGENT-TO-Project.md`](../docs/compliance/APPLYING-COMPLIANCE-AGENT-TO-Project.md) to understand how to fix issues in Project's context.

**Domain-Specific Guidance**:

- Accessibility → `@skill compliance-rgaa` (learn) + `docs/compliance/Project-RGAA-IMPLEMENTATION.md` (implement)
- Data protection → `@skill compliance-rgpd` (agent-optimized) or [REFERENCE](../.agents/skills/compliance-rgpd/RGPD-REFERENCE.md) (complete) + `docs/compliance/Project-RGPD-IMPLEMENTATION.md` (implement)
- Performance/sustainability → `@skill compliance-rgesn` (learn) + `docs/compliance/Project-RGESN-IMPLEMENTATION.md` (implement)
- Security → `@skill compliance-rgs` (learn) + `docs/compliance/Project-RGS-IMPLEMENTATION.md` (implement)
- API design → `@skill compliance-rgi` (learn) + `docs/compliance/RGI-IMPLEMENTATION.md` (implement)

### Compliance Checklist

Before marking a feature complete, verify:

- ✅ **RGAA**: Components are accessible (semantic HTML, ARIA, keyboard navigation) — see [`Project-RGAA-IMPLEMENTATION.md`](../docs/compliance/Project-RGAA-IMPLEMENTATION.md)
- ✅ **RGPD**: Data handling follows privacy principles (consent, encryption, deletion rights) — see [`Project-RGPD-IMPLEMENTATION.md`](../docs/compliance/Project-RGPD-IMPLEMENTATION.md)
- ✅ **RGESN**: Code is optimized for efficiency (queries, caching, data transfer) — see [`Project-RGESN-IMPLEMENTATION.md`](../docs/compliance/Project-RGESN-IMPLEMENTATION.md)
- ✅ **RGS**: Security measures applied (auth, authorization, validation, encryption) — see [`Project-RGS-IMPLEMENTATION.md`](../docs/compliance/Project-RGS-IMPLEMENTATION.md)
- ✅ **RGI**: APIs follow standards (RESTful, OpenAPI documented, standard formats) — see [`RGI-IMPLEMENTATION.md`](../docs/compliance/RGI-IMPLEMENTATION.md)
