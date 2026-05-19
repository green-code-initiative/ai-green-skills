# RGI Skill Documents — Complete Index

## Quick Start for Compliance Agents

Use this index to navigate RGI documents efficiently.

---

## 📋 Document Structure

### **1. SKILL.md** (This is your starting point)

- **Purpose**: Agent-optimized checklist and quick reference
- **Read time**: 10-15 minutes
- **Contents**:
  - Definition (1 para)
  - How to use SKILL (5 resource links)
  - Decision matrix (identify what applies to your project)
  - Essential checklists (compressed, testable items only)
  - Technical standards (quick test commands + cheat sheet)
  - Code examples (REST, error responses, OAuth, webhooks)
  - Common pitfalls

**When to use**: First read this. Use quick checks to assess compliance.

---

### **2. QUICK-ASSESSMENT.md** (5-minute evaluation)

- **Purpose**: Rapid compliance scoring for any project
- **Read time**: 5 minutes to run assessment
- **Contents**:
  - Step 1: Determine project type
  - Step 2: Technical standards (8 checks)
  - Step 3: Data structure (3 checks)
  - Step 4: Legal & organizational (5 checks)
  - Final score + next steps

**When to use**: Run this first to quickly determine if project is compliant.

---

### **3. CONFORMANCE-CHECKLIST.md** (Detailed assessment)

- **Purpose**: Exhaustive checklist for formal compliance audit
- **Read time**: 30-45 minutes to complete
- **Contents**:
  - 6 sections (Political, Legal, Organizational, Semantic, Technical, Testing)
  - 50+ detailed items per level
  - Scoring guide
  - Roadmap template
  - Monthly progress tracking
  - Formal compliance report template

**When to use**: After quick assessment, use this for detailed evaluation and documenting compliance plan.

---

### **4. STANDARDS-REFERENCE.md** (Technical deep-dive)

- **Purpose**: Complete list of RGI-approved standards with explanations
- **Read time**: Variable (reference document)
- **Contents**:
  - Selection criteria (6 criteria that make a standard "RGI-approved")
  - Standards by layer:
    - Network (IPv6, IPSec)
    - Transport (TCP, UDP, TLS 1.2+)
    - Session (SSH)
    - Application APIs (HTTP, OAuth 2.0, OpenAPI)
    - Authentication (SAML, OpenID Connect)
    - Messaging (SMTP, AMQP)
    - Data formats (JSON, XML, CSV, RDF)
    - Identifiers (UUID, ISO standards)
  - Common mistakes
  - Implementation patterns

**When to use**: Look up specific standards, understand why a standard is/isn't RGI-approved.

---

### **5. INTEROPERABILITY-PROFILES.md** (Scenario-based guidance)

- **Purpose**: 5 pre-configured integration patterns with their specific standards
- **Read time**: 10 minutes per profile
- **Contents**:
  - **Profile 1 — A2A** (Admin-to-Admin): Inter-ministry data exchange
  - **Profile 2 — A2B** (Admin-to-Business): Government services for companies
  - **Profile 3 — A2C** (Admin-to-Citizen): Citizen-facing portals
  - **Profile 4 — M2M** (Machine-to-Machine): Backend integrations
  - **Profile 5 — OpenData** (Public data distribution)
  - For each: characteristics, standards table, implementation checklist, example flow

**When to use**: Identify your integration scenario and follow the pre-configured profile.

---

### **6. Project RGI-IMPLEMENTATION.md** (Project-specific)

- **Location**: `docs/compliance/RGI-IMPLEMENTATION.md` in your codebase
- **Purpose**: How RGI applies specifically to your project/platform
- **Read time**: 15-20 minutes
- **Contents**:
  - Project architecture overview + RGI compliance by component
  - Implementation details per level (Political, Legal, Organizational, Semantic, Technical)
  - Code examples in your platform's language/framework
  - Profile recommendations relevant to your project
  - Standards adoption table
  - Testing procedures for your project
  - Roadmap and next steps

**When to use**: If you're assessing your specific project, start here after understanding generic RGI concepts.

---

## 🎯 Recommended Workflows

### Workflow A: Quick Compliance Check (10 minutes)

1. Read **SKILL.md** intro + decision matrix
2. Run **QUICK-ASSESSMENT.md**
3. Get score → done

### Workflow B: Detailed Compliance Audit (2-3 hours)

1. Read **SKILL.md**
2. Run **QUICK-ASSESSMENT.md**
3. Open **CONFORMANCE-CHECKLIST.md**, complete all sections
4. Reference **STANDARDS-REFERENCE.md** for specific standards
5. Create compliance report from template

### Workflow C: Planning Integration (1-2 hours)

1. Read **SKILL.md** decision matrix
2. Find your scenario in **INTEROPERABILITY-PROFILES.md**
3. Follow profile-specific checklist
4. Reference **STANDARDS-REFERENCE.md** for implementation details
5. Check your project's **RGI-IMPLEMENTATION.md** if available

### Workflow D: Project-Specific Implementation (90 minutes)

1. Read your project's **RGI-IMPLEMENTATION.md**
2. Run **QUICK-ASSESSMENT.md** on your project
3. Use **CONFORMANCE-CHECKLIST.md** for detailed audit
4. Reference **STANDARDS-REFERENCE.md** as needed
5. Follow your project's roadmap recommendations

---

## 📊 Document Relationship Map

```
User asks: "Is this system RGI compliant?"
              ↓
        SKILL.md (overview)
              ↓
     QUICK-ASSESSMENT.md (5-min check)
              ↓
        If FAILED, use:
    ┌─────────────┬──────────────┬──────────────┐
    ↓             ↓              ↓              ↓
For Technical → STANDARDS-      For Integration → For IMPL.md
Issues          REFERENCE.md    Issues            
                Understand      INTEROP-
                which           PROFILES.md
                standards       See your
                are required    specific
                              pattern

For Detailed Audit →
CONFORMANCE-CHECKLIST.md
(50+ items, formal report)
```

---

## 🔍 Finding Specific Information

| I need to...                          | Go to...                                   | Section                                |
| ------------------------------------- | ------------------------------------------ | -------------------------------------- |
| Quickly assess if my API is compliant | QUICK-ASSESSMENT.md                        | Step 2 (Technical)                     |
| Understand OAuth 2.0 requirements     | SKILL.md                                   | Code Examples                          |
| Know what standards are RGI-approved  | STANDARDS-REFERENCE.md                     | By category (Network, Transport, etc.) |
| Integrate my system with government   | INTEROPERABILITY-PROFILES.md               | Find A2A/A2B/A2C profile               |
| Implement RGI in your project         | docs/compliance/RGI-IMPLEMENTATION.md      | Your platform-specific section         |
| Conduct formal compliance audit       | CONFORMANCE-CHECKLIST.md                   | All sections                           |
| Understand why something is required  | SKILL.md                                   | "Common Pitfalls"                      |
| See official RGI text                 | Referentiel_General_Interoperabilite_V2.md | Section number from SKILL              |

---

## ✅ Completeness Check: No Criteria Lost

All RGI criteria are covered somewhere:

| Level                   | Criteria                                         | Location                                  |
| ----------------------- | ------------------------------------------------ | ----------------------------------------- |
| **Political**           | Governance, timeline, commitment                 | CONFORMANCE-CHECKLIST.md § Political      |
| **Legal**               | GDPR, contracts, IP, retention                   | CONFORMANCE-CHECKLIST.md § Legal          |
| **Organizational**      | Roles, processes, training, change mgmt          | CONFORMANCE-CHECKLIST.md § Organizational |
| **Semantic**            | Data dictionary, taxonomy, standards, versioning | CONFORMANCE-CHECKLIST.md § Semantic       |
| **Technical (Network)** | IPv6, IPSec, TLS                                 | STANDARDS-REFERENCE.md § Network          |
| **Technical (APIs)**    | REST, OpenAPI, OAuth, pagination                 | SKILL.md § Checklists + Code Examples     |
| **Technical (Data)**    | JSON, UTF-8, UUID, ISO standards                 | SKILL.md § Standards Cheat Sheet          |
| **Profiles**            | A2A, A2B, A2C, M2M, OpenData                     | INTEROPERABILITY-PROFILES.md              |

**✅ No criteria excluded, all relocated to specific docs**

---

## 📞 For Compliance Agents (LLM Assistance)

When evaluating a project, follow this logic:

1. **Ask project type** → Consult SKILL decision matrix
2. **Identify applicable criteria** → Map to specific checklist
3. **Run quick assessment** → QUICK-ASSESSMENT.md
4. **If failed or uncertain** → Consult CONFORMANCE-CHECKLIST.md
5. **For specific standards** → STANDARDS-REFERENCE.md
6. **For implementation help** → Code examples in SKILL.md + project's RGI-IMPLEMENTATION.md if available
7. **For formal audit** → Use CONFORMANCE-CHECKLIST.md + create report
