# RGI Compliance Fix Tracker

**Status**: 🟡 **74% Compliant** → Target: ✅ **90%+**  
**Last Updated**: April 1, 2026  
**Owner**: Technical Lead + Compliance Officer

---

## 🎯 Critical Path (Must Fix Before Production)

### ✅ Week 1: Error Response Standardization

**Epic**: Implement global error handling for standardized responses

**Tasks**:

- [ ] **TASK-001**: Create HttpExceptionFilter class

  - **File**: `apps/api/src/common/filters/http-exception.filter.ts`
  - **Implementation**:
    - Catch all `HttpException`
    - Map HTTP status → error codes (400→BAD_REQUEST, 404→NOT_FOUND, etc.)
    - Generate traceId (UUID v4) for request tracing
    - Return standardized JSON: `{ code, message, timestamp, traceId, httpStatus, path }`
  - **Effort**: 4 hours
  - **PR Check**: All error tests pass

- [ ] **TASK-002**: Register filter in main.ts

  - **File**: `apps/api/src/main.ts`
  - **Implementation**: Add `app.useGlobalFilters(new HttpExceptionFilter())`
  - **Effort**: 30 mins
  - **PR Check**: Swagger still loads, error endpoint returns new format

- [ ] **TASK-003**: Create error code mapping reference

  - **File**: `docs/compliance/ERROR-CODES.md`
  - **Implementation**: Document all error codes (BAD_REQUEST, NOT_FOUND, etc.)
  - **Effort**: 1 hour
  - **PR Check**: All 24 modules reference this doc

- [ ] **TASK-004**: Test error responses across all modules

  - **Files**: `apps/api/**/*.spec.ts` (24 modules)
  - **Implementation**: Jest tests verify error format consistency
  - **Test Cases**:
    - `GET /api/v1/unknown` → 404 with RESOURCE_NOT_FOUND code
    - `POST /api/v1/sessions {}` → 400 with BAD_REQUEST code
    - All modules return same structure
  - **Effort**: 8 hours
  - **PR Check**: 100% of error paths tested

- [ ] **TASK-005**: Update RGI-IMPLEMENTATION.md with error examples
  - **File**: `docs/compliance/RGI-IMPLEMENTATION.md`
  - **Update**: Add error response section with examples
  - **Effort**: 1 hour
  - **PR Check**: Documentation matches implementation

**Subtotal Week 1**: ~14 hours (2 sprint days for 1 engineer)

---

### 🟡 Week 2: GDPR Data Export Enhancement

**Epic**: Enable complete data portability under GDPR Article 20

**Tasks**:

- [ ] **TASK-006**: Analyze all entities for personal data

  - **Scope**: Review all 45+ DTOs and entities
  - **Output**: Map what data belongs to each user
  - **Entities to include**:
    - User (profile, preferences, authentication)
    - Sessions (attended workshops)
    - Feedback (submitted reviews)
    - Recommendations (AI-generated suggestions)
    - Requests (created support tickets)
  - **Effort**: 2 hours
  - **Deliverable**: Checklist of what to export

- [ ] **TASK-007**: Implement bundleAllPersonalData() in userService

  - **File**: `apps/api/src/modules/user/user.service.ts`
  - **Implementation**:
    ```typescript
    async bundleAllPersonalData(userId: string) {
      return {
        user: await this.userRepo.findOne(userId),
        sessions: await this.sessionRepo.find({ userId }),
        feedback: await this.feedbackRepo.find({ userId }),
        recommendations: await this.recommendationRepo.find({ userId }),
        requests: await this.requestRepo.find({ userId })
      }
    }
    ```
  - **Effort**: 3 hours
  - **Unit Tests**: All queries return data for user ID

- [ ] **TASK-008**: Create GDPR export endpoint

  - **File**: `apps/api/src/modules/user/user.controller.ts`
  - **Endpoint**: `GET /api/v1/users/:id/gdpr-export?format=json|csv`
  - **Implementation**:
    - Guard: JwtAuthGuard (only user can export own data)
    - Response includes: data + exportedAt + schemaVersion: "1.0"
    - Format param determines JSON vs CSV
  - **Effort**: 2 hours
  - **Integration Tests**: Export returns all data, properly formatted

- [ ] **TASK-009**: Implement CSV export formatter

  - **File**: `libs/shared/utils/src/lib/csv-export.ts`
  - **Implementation**: Convert data to CSV with proper escaping
  - **Requirements**:
    - Handle nested objects (flatten or serialize)
    - Escape quotes, commas, newlines
    - Add headers
  - **Effort**: 2 hours
  - **Unit Tests**: Special characters properly escaped

- [ ] **TASK-010**: Add endpoint to OpenAPI docs

  - **File**: `apps/api/src/modules/user/user.controller.ts`
  - **Swagger Decorators**:
    - `@ApiOperation` with description
    - `@ApiResponse` with example response
    - `@ApiQuery` for format parameter
  - **Effort**: 45 mins
  - **Verification**: Swagger displays clean documentation

- [ ] **TASK-011**: Update GDPR documentation
  - **File**: `docs/compliance/RGI-IMPLEMENTATION.md`
  - **Update**: Add "Legal Level → GDPR Section" with export example
  - **Effort**: 1 hour

**Subtotal Week 2 (Part 1)**: ~11.75 hours (1.5 sprint days)

---

### 🟡 Week 2-3: Data Retention & Cleanup

**Epic**: Enforce data retention policy with automated cleanup

**Tasks**:

- [ ] **TASK-012**: Write Data Retention Policy document

  - **File**: `docs/compliance/DATA-RETENTION-POLICY.md`
  - **Contents**:
    - Table: Entity → Retention Period → Legal Basis
    - User profiles: 90 days after deletion
    - Sessions: 2 years (learning analytics)
    - Feedback: 2 years (quality improvement)
    - Recommendations: 1 year (personalization)
    - Audit logs: 5 years (security)
  - **Effort**: 2 hours
  - **Review**: Legal/Compliance officer sign-off

- [ ] **TASK-013**: Create cleanup scheduled job module

  - **File**: `apps/api/src/modules/cleanup/`
  - **Implementation**:
    ```typescript
    @Cron('0 2 * * 0') // 2 AM Sunday weekly
    async purgeExpiredData() {
      const ninetyDaysAgo = subDays(new Date(), 90)
      await this.userRepo.delete({ deletedAt: LessThan(ninetyDaysAgo) })
      // Similar for sessions, feedback, etc.
    }
    ```
  - **Effort**: 3 hours
  - **Unit Tests**: Verify correct rows deleted, undeleted rows preserved

- [ ] **TASK-014**: Add logging to cleanup job

  - **Implementation**: Log rows deleted per entity, timestamp
  - **File**: `apps/api/src/modules/cleanup/cleanup.service.ts`
  - **Effort**: 1 hour
  - **Monitoring**: Check logs weekly to ensure job runs

- [ ] **TASK-015**: Add database indexes for efficient cleanup

  - **File**: `libs/server/entities/src/lib/**/**.entity.ts`
  - **Implementation**: Index on `deletedAt` column for faster queries
    ```typescript
    @Index()
    @DeleteDateColumn()
    deletedAt?: Date
    ```
  - **Effort**: 1 hour
  - **Performance**: DELETE queries complete in <1s

- [ ] **TASK-016**: Create migration for index creation
  - **File**: `libs/api/typeorm-migrations/src/`
  - **Implementation**: TypeORM migration to add indexes
  - **Effort**: 1 hour
  - **Testing**: Migration runs successfully in dev/staging

**Subtotal Week 2-3 (Part 2)**: ~8 hours

---

### 🟢 Week 3: Data Dictionary & Documentation

**Epic**: Centralize data governance documentation

**Tasks**:

- [ ] **TASK-017**: Create DATA-DICTIONARY.md template

  - **File**: `docs/compliance/DATA-DICTIONARY.md`
  - **Structure**:

    ```markdown
    | Entity | Field | Type   | PII? | Classification | Retention | Owner       |
    | ------ | ----- | ------ | ---- | -------------- | --------- | ----------- |
    | User   | id    | UUID   | No   | Public         | Lifecycle | @UserModule |
    | User   | email | String | YES  | Confidential   | 90d       | @UserModule |

    ...
    ```

  - **Effort**: 2 hours
  - **Completeness**: All 45+ fields documented

- [ ] **TASK-018**: Populate dictionary with all entities

  - **Source**: Review `libs/server/entities/`, `libs/shared/dto/`
  - **Classification Guide**:
    - PII: email, phone, name, location, education, salary
    - Partial PII: bio, feedback, recommendations
    - Non-PII: titles, IDs, timestamps, categories
  - **Effort**: 3 hours
  - **Validation**: Each field has owner assignment

- [ ] **TASK-019**: Document data lineage flows

  - **File**: Same as TASK-017 (DATA-DICTIONARY.md)
  - **Add Section**: "Data Flows"
    ```
    User enrolls in Workshop
      → Creates Session record
      → Generates Feedback
      → Triggers Recommendation
      → Updates Analytics
    ```
  - **Effort**: 1.5 hours
  - **Stakeholder Review**: Business & compliance agree with flows

- [ ] **TASK-020**: Update CONTRIBUTING.md with RGI guidelines
  - **File**: `CONTRIBUTING.md`
  - **Add Section**: "RGI Compliance Checklist"
    - APIs must use standardized error format
    - Data export must include new fields
    - Data retention policy must be documented
  - **Effort**: 1 hour

**Subtotal Week 3 (Part 3)**: ~7.5 hours

---

## 📊 Roll-up by Week

| Week       | Epic                           | Hours     | FTE Days | Status   |
| ---------- | ------------------------------ | --------- | -------- | -------- |
| **Week 1** | Error Standardization          | 14        | 2        | 🔴 To Do |
| **Week 2** | GDPR Export + Retention Start  | 19.75     | 2.5      | 🔴 To Do |
| **Week 3** | Data Dictionary + Final Polish | 7.5       | 1        | 🔴 To Do |
| **TOTAL**  | All Critical Fixes             | **41.25** | **5.5**  | 🔴 To Do |

**Estimated Sprint Duration**: 3-4 weeks (1-2 engineers)

---

## 🔧 Technical Debt / Nice-to-Have (Backlog)

- [ ] Production-safe Swagger (disable in prod, role-based access in staging)
- [ ] API rate limiting & quota documentation
- [ ] Response envelope pattern (optional for RGI, but good practice)
- [ ] CSV/XML content negotiation (currently JSON only)
- [ ] HATEOAS links in responses
- [ ] API versioning deprecation policy (formally documented)
- [ ] Formal RGI compliance audit (by external auditor)

---

## ✅ Definition of Done (Per Task)

Each task is done when:

1. **Code**: Implementation matches specification
2. **Tests**: Unit + integration tests written & passing (80%+ coverage)
3. **Documentation**: README/code comments added, ADR updated
4. **Peer Review**: Code reviewed, approved by senior engineer
5. **Integration**: Merged to main, deployed to staging
6. **Acceptance**: Compliance officer verifies against QUICK-ASSESSMENT.md

---

## 📈 Tracking Tools

- **Jira/Linear**: Create epics + tasks matching this document
- **GitHub Issues**: Link PRs to tasks (Closes #TASK-001)
- **Slack**: Daily standup on progress
- **QUICK-ASSESSMENT.md**: Run weekly to track compliance score

---

## 🎯 Success Celebration Criteria

**Week 4 Completion Checklist**:

- [ ] All 20 tasks completed & merged
- [ ] Error response tests: 100% consistent format ✅
- [ ] GDPR export: All data exported successfully ✅
- [ ] Data retention: CRON job ran weekly without errors ✅
- [ ] Data dictionary: All fields documented & classified ✅
- [ ] RGI Compliance Score: **90%+** (verified via QUICK-ASSESSMENT.md)
- [ ] Team: All engineers trained on new error format ✅
- [ ] Partners: Notified of API stability improvements ✅

**Outcome**: Project is now **RGI-Compliant ✅ + GDPR-Compliant ✅ + Production-Ready ✅**

---

## 📞 Owner Assignments (Template)

| Epic                           | Owner | Backup | Status  |
| ------------------------------ | ----- | ------ | ------- |
| Error Standardization (Week 1) | [TBD] | [TBD]  | Pending |
| GDPR Export (Week 2)           | [TBD] | [TBD]  | Pending |
| Data Retention (Week 2-3)      | [TBD] | [TBD]  | Pending |
| Data Dictionary (Week 3)       | [TBD] | [TBD]  | Pending |

---

**Next Step**: Copy this into Jira/Linear, assign owners, schedule sprints 🚀
