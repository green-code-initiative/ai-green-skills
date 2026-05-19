# RGI Quick Assessment — 5-Minute Evaluation

Use this checklist to quickly assess RGI compliance of any project.

---

## Step 1: Determine Project Type (1 min)

**Does this project expose APIs or exchange data with other organizations?**

- [ ] **A) No** → Apply only **Technical Standards** section below
- [ ] **B) Yes, internal APIs only** → Apply **Technical Standards** + **Data Structure**
- [ ] **C) Yes, publicly accessible API** → Apply **FULL checklist** (all sections)
- [ ] **D) Yes, inter-organizational data exchange** → Apply **FULL checklist** (all sections)

If A: Stop here, use only "Technical Standards" section.
If B-D: Continue to Step 2.

---

## Step 2: Technical Standards (2 min)

**Quick checks** — Answer yes/no:

| Item                             | Check                                                          | Result |
| -------------------------------- | -------------------------------------------------------------- | ------ |
| HTTPS/TLS 1.2+ on all endpoints? | `curl -i https://api.example.fr/api/v1/test` → should work     | ✅/❌  |
| OpenAPI 3.0 documented?          | Visit `https://api.example.fr/api/docs` → should show Swagger  | ✅/❌  |
| Uses UUID v4 for IDs?            | Check code: `uuid()` not `++counter`                           | ✅/❌  |
| REST design (no verb endpoints)? | Endpoints like `/users` not `/getUsers`                        | ✅/❌  |
| Standard error responses?        | 404 returns `{ error: { code, message, traceId } }`            | ✅/❌  |
| Pagination on lists?             | `/api/v1/resources?skip=0&take=20` returns `{ items, paging }` | ✅/❌  |
| ISO 8601 dates?                  | Dates like `"2024-04-01T10:30:00Z"` not `"01/04/2024"`         | ✅/❌  |
| JSON format (UTF-8)?             | `Content-Type: application/json; charset=utf-8`                | ✅/❌  |

**Score**: Count ✅ ÷ 8 = \_\_\_ % → If <75%, FAIL

---

## Step 3: Data Structure (1 min) — If B, C, or D

| Item                      | Check                                                                   | Result |
| ------------------------- | ----------------------------------------------------------------------- | ------ |
| Data dictionary exists?   | Documented somewhere (README, PostMan, Confluence)                      | ✅/❌  |
| Standard codes used?      | Countries (ISO 3166: `FR`), languages (ISO 639: `fr`), dates (ISO 8601) | ✅/❌  |
| Relationships documented? | Schema shows how entities link (user→org, org→address)                  | ✅/❌  |

**Score**: Count ✅ ÷ 3 = \_\_\_ % → If <50%, FAIL

---

## Step 4: Legal & Organizational (1 min) — If C or D only

| Item                         | Check                                       | Result |
| ---------------------------- | ------------------------------------------- | ------ |
| Data retention documented?   | Policy exists (how long kept)               | ✅/❌  |
| GDPR/breach procedures?      | Process defined for handling data incidents | ✅/❌  |
| Responsible person assigned? | Named person/team accountable               | ✅/❌  |
| Data export capability?      | Users can export their data (JSON/CSV)      | ✅/❌  |
| Service agreement signed?    | If sharing with partners, SLA exists        | ✅/❌  |

**Score**: Count ✅ ÷ 5 = \_\_\_ % → If <50%, FAIL

---

## Final Score

| Technical | Data     | Legal    | Overall       |
| --------- | -------- | -------- | ------------- |
| \_\_\_ %  | \_\_\_ % | \_\_\_ % | **PASS/FAIL** |

**PASS** = All sections ≥ 75% (or ≥ 50% for Legal if not applicable)
**FAIL** = Any section < threshold

---

## If FAILED: Next Steps

Consult full checklists:

- **Technical failure** → See `STANDARDS-REFERENCE.md` + `SKILL.md` code examples
- **Data failure** → See `CONFORMANCE-CHECKLIST.md` section "Semantic Level"
- **Legal failure** → See `CONFORMANCE-CHECKLIST.md` sections "Legal" + "Organizational"

For context-specific help:

- **Project** → See `docs/compliance/RGI-IMPLEMENTATION.md` in the Project codebase
- **Different integration type** → See `INTEROPERABILITY-PROFILES.md` (A2A, A2B, etc.)
- **Formal assessment** → See `CONFORMANCE-CHECKLIST.md` (50+ items)
