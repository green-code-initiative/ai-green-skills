---
name: compliance-rgs
description: Ensures information security and compliance with French security standards
category: Security & Governance
keywords: RGS, security, encryption, authentication, authorization, incident response, vulnerability management, ANSSI, French security framework
license: MIT
---

# SKILL: RGS — Référentiel Général de Sécurité

## 📖 What is RGS?

**Règles de Gouvernance de Sécurité** (Rules for Security Governance) — Official French Government Security Framework

- **Governing Body**: ANSSI (Agence nationale de la sécurité des systèmes d'information) + SGMAP
- **Standard**: Décret n° 2010-112 du 2 février 2010, Arrêté du 13 juin 2014
- **Scope**: Information security standards for public services and electronic exchanges
- **Applies to**: Administrative authorities' information systems, electronic exchanges with citizens
- **Current Version**: RGS v2.0 (2014), v3.0 in development
- **Official Reference**: https://www.ssi.gouv.fr/uploads/2014/11/RGS_v2_0.pdf
- **Implementation Guidance**: https://www.ssi.gouv.fr/fr/reglementation-ssi/referentiel-general-de-securite/

## 🎯 Core Objectives

The RGS framework is built on **5 security domains**:

1. **Confidentiality** — Ensure data is protected and accessed only by authorized parties
2. **Integrity** — Guarantee data and system cannot be modified unauthorized
3. **Availability** — Ensure systems and data are accessible when needed
4. **Authentication** — Verify that entities claiming an identity are genuine
5. **Traceability** — Associate all actions to the person/system that performed them

## 🎯 Key Implementation Pillars

1. **Risk Analysis & Management** — Systematic identification and mitigation of security risks
2. **Authentication & Authorization** — Identity verification and access control (3 security levels: \*, **, \***)
3. **Encryption & Data Protection** — TLS 1.3+ in-transit, AES-256 at-rest, certificate management
4. **Electronic Certificates & Signatures** — X.509 certificates, electronic signatures with legal proof
5. **Audit & Logging** — Comprehensive event logging, security monitoring, incident response
6. **Vulnerability Management** — Patch management, security updates, threat monitoring
7. **Third-party & Supply Chain Security** — Contract clauses, qualified products/services, vendor assessment
8. **Continuity & Incident Response** — Business continuity plans, incident response procedures, crisis management

---

## 🚀 Quick Start for Compliance Analysis

**Purpose**: Identify which RGS phases are applicable to your specific project

### Step 1: Answer Diagnostic Questions

**1. What is the primary architecture type?**

- [ ] Web application (frontend + backend)
- [ ] REST API / Microservices
- [ ] Command-line tool or batch process
- [ ] Background service / Queue processor
- [ ] Infrastructure/DevOps tool

**2. What type of data does it handle?**

- [ ] Public information only → Phase 1, 6 essential
- [ ] User profiles / Personal data → All phases critical (RGPD applies)
- [ ] Financial/Payment data → Phases 2, 3, 5, 7 critical (PCI-DSS + RGS)
- [ ] Health or sensitive government data → Phases 1-8 critical (highest security)
- [ ] Authentication credentials → Phases 2, 3, 5 critical

**3. Who accesses this system?**

- [ ] General public (no authentication) → Phase 1, 4, 6 essential
- [ ] Registered users (login required) → Phases 2, 3, 4, 5 critical
- [ ] Administrative staff only → Phases 2, 5, 6, 7 critical (admin audit trail essential)
- [ ] Machine-to-machine (API tokens) → Phases 2, 3, 6 critical
- [ ] Mix of above → All phases important

**4. What is the required security level?**

- [ ] **Level \* (Basic)** — Public services, non-regulated → Standard protections
- [ ] **Level ** (Intermediate)\*\* — Sensitive operations, employee data → Stronger protections
- [ ] **Level \*** (Maximum)\*\* — Legal commitments, financial transactions → Maximum protections

### Step 2: Check the Applicability Matrix (Below)

Based on your project type, find which phases are critical (⭐⭐⭐) and important (⭐⭐).

Then jump to: "Phase Navigation Index" → "RGS Implementation Phases"

### Before You Start

⚠️ **Critical Prerequisite**: Make sure you've reviewed the **project architecture** at:

- [`copilot-instructions.md`](/../.github/copilot-instructions.md) — Architecture overview
- [`docs/compliance/RGS-IMPLEMENTATION.md`](/../../docs/compliance/RGS-IMPLEMENTATION.md) — project-specific patterns

---

### Project Applicability Matrix

| Project Type       | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 | Phase 6 | Phase 7 | Phase 8 |
| ------------------ | ------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| **Web App**        | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐    | ⭐⭐    | ⭐⭐    |
| **REST API**       | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐    | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  |
| **Microservice**   | ⭐⭐    | ⭐⭐⭐  | ⭐⭐⭐  | ⭐      | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐    |
| **Background Job** | ⭐⭐    | ⭐⭐    | ⭐⭐⭐  | ⭐      | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐    | ⭐⭐    |
| **CLI Tool**       | ⭐      | ⭐⭐    | ⭐⭐    | ⭐⭐    | ⭐⭐    | ⭐⭐    | ⭐      | ⭐      |
| **Infrastructure** | ⭐⭐    | ⭐      | ⭐⭐⭐  | ⭐⭐    | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐  |

**Legend**: ⭐⭐⭐ = Critical | ⭐⭐ = Important | ⭐ = Secondary

---

## 🛠️ RGS 5-Step Compliance Process (Décret n° 2010-112)

Organizations must follow a **structured 5-step approach** to achieve RGS compliance:

### Step 1: Risk Analysis (Analyse des risques)

- Identify threats affecting the system
- Assess potential impacts and consequences
- Evaluate likelihood and severity
- **Framework**: ISO/IEC 27005 + EBIOS 2010 methodology
- **Output**: Documented risk assessment report with mitigation strategy

### Step 2: Define Security Objectives (Définition des objectifs de sécurité)

- Establish targets for the 5 security domains (C.I.A.A.T)
- Determine required security levels (\*, **, \***)
- Define protection AND defense mechanisms
- Align with business requirements
- **Output**: Formal security objectives document

### Step 3: Choose & Implement Security Measures (Choix et mise en œuvre)

- Select appropriate technical controls (products, cryptography, IDS/IPS)
- Implement organizational measures (roles, access control, training)
- Use qualified products when available
- Document implementation decisions
- **Output**: Security measures implementation plan

### Step 4: Security Accreditation (Homologation de Sécurité)

- **Authority**: Designated security accreditation official
- **Attestation**: Formal authorization that system meets security objectives
- **Requirement**: Must be done BEFORE production deployment
- **Documentation**: Formal accreditation dossier + residual risk acceptance
- **Publication**: For e-services, accreditation decision accessible to users

### Step 5: Operational Security Monitoring (Suivi opérationnel)

- Daily collection and analysis of event logs and alarms
- Regular security audits and penetration testing
- Immediate incident detection and response
- Continuous threat and vulnerability monitoring
- Personnel security awareness and training
- Maintenance of continuity and recovery plans

---

## ✅ RGS Implementation Phases (Click to Jump)

> **Agent Workflow**: Identify your project type from quick start above → Select applicable phases → Work through checklists → Reference detailed annex files

### Phase Navigation Index

| Phase       | Focus Area                           | Applicable To              | Key Deliverable          |
| ----------- | ------------------------------------ | -------------------------- | ------------------------ |
| **Phase 1** | Risk Management                      | All projects               | Risk assessment report   |
| **Phase 2** | Authentication & Authorization       | All user-facing systems    | Auth architecture        |
| **Phase 3** | Encryption & Cryptography            | All projects handling data | Crypto/TLS configuration |
| **Phase 4** | Input Validation & Attack Prevention | Web apps, APIs             | Validation rules         |
| **Phase 5** | Audit Logging & Monitoring           | All production systems     | Log strategy             |
| **Phase 6** | Vulnerability Management & Patch     | All projects               | Patch policy             |
| **Phase 7** | Third-Party Risk Management          | Projects with integrations | Vendor assessment        |
| **Phase 8** | Incident Response & Continuity       | All production systems     | IR procedure             |

---

### Phase 1: Risk Management

**Focus Area**: Foundational - Required for ALL projects  
**Why This Matters**: Without risk analysis, you don't know what you're protecting or why  
**Quick Assessment**: Do you have a documented risk register? Have threats been identified?

- [ ] **Risk Analysis Complete**: Documented threats, impacts, and mitigation strategy
- [ ] **ISO/IEC 27005**: Risk management methodology defined and documented
- [ ] **EBIOS 2010**: Security objectives clearly expressed using EBIOS framework
- [ ] **Residual Risks**: Accepted by authorized decision-maker
- [ ] **Risk Register**: Maintained and reviewed regularly

---

### Phase 2: Authentication & Authorization (RGS Annex B3)

**Focus Area**: Critical for Web Apps, APIs, Microservices (⭐⭐⭐)  
**Why This Matters**: This is where users prove they are who they claim to be. Failures here = all other protections useless  
**Quick Assessment**: Can an unauthenticated user access any protected resource? Are passwords stored in plain text?

**Focus**: Verify entity identity and control access per RGS security levels

#### Actionable Requirements

- [ ] **Cryptographic Authentication Protocol** (Machine-to-Machine):

  - Interactive protocol required (not just password transmission)
  - Proof of private key possession via signature
  - Protection against replay & man-in-the-middle attacks
  - Full certificate chain validation to trusted root

- [ ] **Security Level Selection** (Choose one per use case):

  - **Level \* (Basic)**: Public info, non-regulated services, single-factor OK
  - **Level ** (Intermediate)\*\*: Sensitive operations, hardware token preferred, MFA recommended
  - **Level \*** (Maximum)\*\*: Legal commitments, HSM required, strong MFA mandatory

- [ ] **Person Unlock Mechanism** (How user proves identity):

  - **Passwords**: 12+ chars, uppercase+lowercase+number+special, no dictionary words
  - **Multi-Factor**: Combine: Password + Hardware Token, TOTP + PIN, Biometric + Card
  - **Hardware Tokens**: Smart cards, USB security keys, hardware wallets
  - **Biometrics**: Fingerprint, face, iris (local processing preferred)

- [ ] **Authentication Credentials Protection**:

  - Never in code, config files, or logs
  - Encrypted at rest: AES-256-GCM minimum
  - Password hashing: bcrypt, Argon2, or PBKDF2 (100k+ iterations with SHA-256+)
  - Salted hashing mandatory (minimum 16 bytes random salt)
  - Separate encryption keys per credential type

- [ ] **Session Lifecycle**:

  - **Automatic timeout**: Inactivity logout after 15-30 minutes
  - **Token generation**: Cryptographically random (CSRNG only)
  - **Token binding**: Optional but recommended (IP, user-agent, device fingerprint)
  - **Session termination**: Explicit logout, token revocation
  - **Secure session storage**: Server-side only, signed with HMAC-SHA256+

- [ ] **Multi-Factor Authentication** (For Level **, \***):

  - **Combine factors from different categories**:
    - Knowledge: Password, PIN, security question
    - Possession: Smart card, USB token, authenticator app
    - Biometric: Fingerprint, face, iris (local processing)
  - **Recovery codes**: If MFA device lost, have backup (encrypted, one-time use)
  - **Re-authentication**: For sensitive operations (password change, privilege request)

- [ ] **Certificate-Based Authentication** (If implementing digital certificates):

  - **X.509 v3 format** from qualified PSCE (Prestataire de Services de Certification Électronique)
  - **Revocation checking**: OCSP stapling or CRL validation
  - **Certificate pinning**: For critical API clients
  - **Chain validation**: Leaf → Intermediate → Root (IGC/A for French admin)

- [ ] **Brute Force & Attack Protection**:

  - **Account lockout**: 5 failed attempts → 15-min lockout
  - **Rate limiting**: Max 10 login attempts per IP per hour
  - **CAPTCHA**: Optional for high-risk scenarios
  - **Anomaly detection**: Unusual location/device logins require MFA re-verification
  - **Timestamping**: Failed attempts with UTC timestamp for audit

- [ ] **Audit & Logging**:

  - Log all authentication events (success, failure, timeout)
  - Include: User ID, timestamp, source IP, device ID, mechanism used
  - **Immutable logs**: Cannot be modified/deleted
  - **Log retention**: 1+ year (per RGS §2.5)
  - **PII handling**: Mask passwords, tokens; log only hash or ID
  - **Analysis**: Regular review for suspected fraud

- [ ] **Session State Management**:

  - Clear transitions: Initial → Connected → Authenticated → Disconnected
  - Error handling: Failed transitions generate audit alarms
  - **No downgrade**: Always use strongest available mechanism
  - **Hijacking mitigation**: Token rotation, session binding, re-authentication on sensitive ops

- [ ] **Trusted Infrastructure** (If using third-party auth):
  - Document trust chains explicitly
  - Validate third-party security qualifications (ISO 27001, SOC 2)
  - Ensure authentication level maintained through delegation
  - Audit third-party authentication logs

📌 **Reference Documentation**: See [RGS-ANNEX-B3-DETAILED.md](./RGS-ANNEX-B3-DETAILED.md) for authentication models, machine-to-machine protocols, person unlock mechanisms, session lifecycle, third-party trust, and comprehensive audit requirements.

````

### Phase 3: Encryption & Cryptography (RGS Chapter 3)

**Focus Area**: Critical for ALL projects (⭐⭐⭐)
**Why This Matters**: Encryption is the only thing that stops attackers from reading your data even if they breach you
**Quick Assessment**: Is all traffic using TLS 1.3? Are database passwords encrypted at rest? **See [RGS-ANNEX-B2-DETAILED.md](./RGS-ANNEX-B2-DETAILED.md)**

**Focus**: Protect data in transit and at rest per RGS Annex B2 requirements

#### Actionable Requirements

- [ ] **TLS 1.3+** for all communications (TLS 1.2 minimum with strong ciphers)
  - Perfect Forward Secrecy (PFS) via ECDHE
  - HSTS header: `max-age=31536000; includeSubDomains`

- [ ] **Approved Algorithms** (RGS Annex B2):
  - Symmetric: **AES-256** (preferred), AES-192, AES-128
  - Asymmetric: **RSA-2048+** or **ECDSA (P-256/384/521)**
  - Hashing: **SHA-256+** (never MD5, SHA-1)
  - Key derivation: **PBKDF2** (100k+ iterations), bcrypt, Argon2

- [ ] **Key Management Lifecycle**:
  - Generate: Cryptographically secure RNG only
  - Store: Level * = encrypted software; Level ** = hardware token; Level *** = HSM
  - Rotate: Annual minimum (monthly for critical systems)
  - Destroy: Secure deletion per NIST 800-88

- [ ] **Data Protection**:
  - Database: Encrypt sensitive fields (PII, credentials) with AES-256-GCM
  - Full-disk encryption where applicable
  - Backups encrypted with separate keys
  - Keys never in code, logs, or config files

- [ ] **Certificates** (if implementing signature/authentication):
  - X.509 v3 from qualified PSCE (Prestataire de Services de Certification Électronique)
  - Proper revocation checking (OCSP/CRL)
  - Certificate chain validation to trusted root (IGC/A for French admin systems)

📌 **Reference Documentation**: See [RGS-ANNEX-B2-DETAILED.md](./RGS-ANNEX-B2-DETAILED.md) for comprehensive implementation guide covering algorithms, certificate types, timestamping, key management phases, and security level mappings.

---

```typescript
// ✅ AES-256-GCM encryption (RGS-compliant) — Framework-agnostic pseudocode
// Implementation varies by language (Node.js, Python, Java, Go, etc.)

const encryptData = (plaintext: string, key: Buffer): string => {
  // 1. Generate random IV (initialization vector) 16 bytes
  const iv = generateRandomBytes(16)

  // 2. Create AES-256-GCM cipher with key
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  // 3. Encrypt data
  const encrypted = cipher.update(plaintext, 'utf-8', 'hex') + cipher.final('hex')

  // 4. Get authentication tag (ensures integrity)
  const authTag = cipher.getAuthTag()

  // 5. Return IV:AuthTag:Ciphertext (needed for decryption)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

const decryptData = (ciphertext: string, key: Buffer): string => {
  const [ivHex, tagHex, encrypted] = ciphertext.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(tagHex, 'hex')

  // 1. Create AES-256-GCM decipher
  const decipher = createDecipheriv('aes-256-gcm', key, iv)

  // 2. Set authentication tag (validates integrity)
  decipher.setAuthTag(authTag)

  // 3. Decrypt
  return decipher.update(encrypted, 'hex', 'utf-8') + decipher.final('utf-8')
}

// ✅ PBKDF2 for password hashing (RGS-compliant)
// Pseudocode - use standard library or library like bcrypt
const hashPassword = (password: string): string => {
  const salt = generateRandomBytes(32)
  // PBKDF2 with SHA-256, 100,000+ iterations
  const hash = pbkdf2(password, salt, 100000, 64, 'sha256')
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

// ✅ TLS 1.3 configuration (framework-agnostic)
// Example: ExpressJS, NestJS, FastAPI, Spring, etc.
const serverConfig = {
  keyFile: '/etc/ssl/private/server.key',           // Private key
  certFile: '/etc/ssl/certs/server.crt',            // Certificate
  minVersion: 'TLSv1.3',                            // Minimum TLS 1.3
  ciphers: 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256', // Strong ciphers
  enableHSTS: true,                                 // HTTP Strict Transport Security
}
````

### Phase 4: Input Validation & Attack Prevention

### Phase 4: Input Validation & Attack Prevention

**Focus Area**: Critical for Web Apps & APIs (⭐⭐⭐)  
**Why This Matters**: Most attacks enter through input (SQL injection, XSS, CSRF). Validation stops them at the door  
**Quick Assessment**: Are all user inputs validated against a whitelist? Is CSRF token check implemented?

- [ ] **SQL Injection Prevention**:

  - Always use parameterized queries (prepared statements)
  - ORM with proper query builders (TypeORM, Sequelize, Prisma)
  - Input validation against expected schema
  - Principle: Never concatenate user input into SQL

- [ ] **XSS (Cross-Site Scripting) Prevention**:

  - Output encoding for HTML, JavaScript, CSS contexts
  - Content Security Policy (CSP) header enforced
  - Template frameworks with auto-escaping
  - Input validation: reject scripts in user input

- [ ] **CSRF (Cross-Site Request Forgery) Protection**:

  - Unique CSRF tokens on all state-changing operations (POST, PUT, DELETE)
  - Tokens validated on server before processing
  - SameSite cookie attribute: Strict or Lax
  - Double-submit cookie pattern (secure alternative)

- [ ] **Input Validation** (RGS recommendation):

  - Validate all inputs against strict whitelist schema
  - Length limits, format validation, type checking
  - Reject unexpected parameters
  - Logging of validation failures

- [ ] **File Upload Security**:

  - Validate file type (magic bytes, not just extension)
  - Size limits enforced
  - Scan for malware (if applicable)
  - Store outside web root
  - Disable script execution in upload directory

- [ ] **Rate Limiting & DoS Prevention**:
  - API rate limits (e.g., 100 requests/minute)
  - Login rate limiting (5 attempts/15 min)
  - DDoS protection at perimeter (CDN, WAF)

```typescript
// ✅ Input validation (RGS-compliant) — Framework-agnostic example
// Following principle: validate ALL inputs against strict whitelist schema

class UserInput {
  // Schema validation examples:
  email: string // Must be valid email format
  username: string // 3-50 chars, alphanumeric + underscore only
  age: number // 18-120
  country: string // Max 2 chars, uppercase only

  validate(): ValidationErrors {
    const errors = []

    // ✅ Format validation
    if (!isValidEmailFormat(this.email)) {
      errors.push('Invalid email format')
    }

    // ✅ Length validation
    if (this.username.length < 3 || this.username.length > 50) {
      errors.push('Username must be 3-50 characters')
    }

    // ✅ Pattern validation (whitelist allowed chars)
    if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      errors.push('Username can only contain letters, numbers, underscore')
    }

    // ✅ Range validation
    if (this.age < 18 || this.age > 120) {
      errors.push('Age must be 18-120')
    }

    return errors
  }
}

// ✅ CSRF token validation (framework-agnostic)
// On every state-changing request (POST, PUT, DELETE):
const validateCSRFToken = (requestToken: string, sessionToken: string): boolean => {
  // Token must match - prevents cross-site attacks
  return requestToken === sessionToken && requestToken !== null
}

// ✅ XSS prevention - output encoding (framework-agnostic)
// Encode output based on context:
const encodeHTML = (text: string): string => {
  // Replace special chars: < > & " '
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

const encodeJavaScript = (text: string): string => {
  // Escape for JavaScript strings
  return JSON.stringify(text)
}

// ✅ File upload validation (framework-agnostic)
const validateFileUpload = (file: UploadedFile): ValidationErrors => {
  const errors = []

  // Check file type (magic bytes, not just extension)
  const expectedMagic = { jpg: 'FFD8FF', png: '89504E47' }
  if (!hasMagicBytes(file.data, expectedMagic[file.type])) {
    errors.push('Invalid file type')
  }

  // Check file size
  const maxSize = 5 * 1024 * 1024 // 5 MB
  if (file.size > maxSize) {
    errors.push('File too large')
  }

  // Check allowed extensions (whitelist)
  const allowedExt = ['jpg', 'jpeg', 'png', 'gif']
  if (!allowedExt.includes(file.extension)) {
    errors.push('File type not allowed')
  }

  return errors
}
```

### Phase 5: Audit Logging & Monitoring (RGS Chapter 2.5)

### Phase 5: Audit Logging & Monitoring (RGS Chapter 2.5)

**Focus Area**: Critical for ALL production systems (⭐⭐⭐)  
**Why This Matters**: You cannot detect or investigate attacks without logs. Logs are your evidence  
**Quick Assessment**: Are all login attempts logged? Can logs be tampered with? Are they retained 1+ year?

- [ ] **Audit Log Creation**:

  - Event log for all critical actions: login, data modification, admin access, config changes
  - Log includes: timestamp, user ID, action, resource, outcome (success/failure), IP address
  - Format: Structured (JSON) for easy parsing
  - Log level: INFO for normal, ERROR for failures, WARN for suspicious activities

- [ ] **Security Events Logged**:

  - Failed authentication attempts (with throttling)
  - Privilege escalation / role changes
  - Data access violations (unauthorized attempts)
  - Administrative actions (user creation, permission changes)
  - System configuration changes
  - Access to sensitive data (if applicable)
  - Unusual access patterns (alerts)

- [ ] **Log Storage & Protection**:

  - Logs stored on separate, secured server/system
  - Encrypted transmission to log aggregation system
  - Logs immutable after creation (append-only, write-once storage)
  - Read access restricted to authorized personnel
  - Backup logs encrypted and stored securely

- [ ] **Log Retention** (RGS requirement):

  - Minimum 1 year retention
  - Longer (3-7 years) for financial/sensitive systems
  - Documented retention policy
  - Secure archival and destruction procedure

- [ ] **Log Analysis & Alerting**:

  - Real-time scanning for suspicious patterns
  - Alerts on: multiple failed logins, privilege escalation, unusual data access
  - Investigation procedure documented
  - Incident response team notified immediately
  - Alert thresholds tuned to avoid false positives

- [ ] **Data Privacy in Logs**:
  - ❌ Never log: passwords, credit cards, SSNs, API keys, PII
  - ✅ Log: user IDs (not email), actions, timestamps, outcomes
  - Redaction of sensitive data if logged accidentally
  - Regular audit of log contents for PII

```typescript
// ✅ RGS-compliant structured audit logging — Framework-agnostic example
// Use JSON format for machine-parseable logs

interface AuditLogEntry {
  timestamp: string // ISO 8601 format: 2026-04-01T10:30:00Z
  eventType: string // 'authentication', 'data_access', 'admin_action', etc.
  userId: string // User ID (NOT email, NOT PII)
  resourceId?: string // What was accessed/modified
  operation?: string // READ, WRITE, DELETE, UPDATE
  outcome: 'success' | 'failure'
  ipAddress?: string
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'
  errorMessage?: string // Non-sensitive error message
}

// ✅ Authentication attempt logging
const logAuthenticationAttempt = (
  userId: string,
  success: boolean,
  ipAddress: string
) => {
  const event: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    eventType: 'authentication',
    userId: userId, // ✅ OK to log
    outcome: success ? 'success' : 'failure',
    ipAddress: ipAddress,
    severity: success ? 'INFO' : 'WARN',
  }

  // Log as JSON string (machine-readable)
  logToSecureStorage(JSON.stringify(event))

  // Alert system if failure (brute force detection)
  if (!success) {
    checkBruteForcePattern(userId)
  }
}

// ✅ Data access logging
const logDataAccess = (userId: string, resourceId: string, operation: string) => {
  const event: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    eventType: 'data_access',
    userId: userId,
    resourceId: resourceId,
    operation: operation,
    outcome: 'success',
    severity: 'INFO',
  }

  logToSecureStorage(JSON.stringify(event))
}

// ✅ Admin action logging
const logAdminAction = (adminId: string, action: string, targetId: string) => {
  const event: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    eventType: 'admin_action',
    userId: adminId,
    resourceId: targetId,
    operation: action,
    outcome: 'success',
    severity: 'WARN', // Admin actions are always important
  }

  logToSecureStorage(JSON.stringify(event))
}

// ✅ NEVER log sensitive data
// ❌ WRONG:
logToSecureStorage(
  JSON.stringify({
    userId: user.id,
    password: user.password, // ❌ NEVER
    creditCard: user.creditCard, // ❌ NEVER
    ssn: user.ssn, // ❌ NEVER
    apiKey: process.env.API_KEY, // ❌ NEVER
  })
)

// ✅ CORRECT:
logToSecureStorage(
  JSON.stringify({
    userId: user.id, // ✅ OK
    action: 'password_reset', // ✅ OK (action, not the actual password)
    timestamp: new Date().toISOString(), // ✅ OK
  })
)
```

### Phase 6: Vulnerability Management & Patch Management

**Focus Area**: Important for ALL projects (⭐⭐⭐)  
**Why This Matters**: Known vulnerabilities are exploited within days. Patches prevent this  
**Quick Assessment**: When was the last dependency scan? Do you have a patch policy? How long until critical patches are applied?

- [ ] **Dependency Scanning**:

  - Regular scan for known CVEs in dependencies
  - Tools: npm audit, Snyk, OWASP Dependency-Check, GitHub Dependabot
  - Patch policy: Critical within 48h, High within 1 week

- [ ] **Security Updates**:

  - Framework updates (NestJS, React) monitored and applied
  - Runtime updates (Node.js, Python) patched promptly
  - OS/infrastructure security patches applied monthly minimum

- [ ] **Penetration Testing & Vulnerability Assessment**:

  - Annual external security assessment (RGS recommendation)
  - Quarterly internal vulnerability scans
  - Penetration testing before major releases
  - Bug bounty program (optional but recommended)

- [ ] **Threat Monitoring** (RGS requirement):
  - Subscribe to security advisories (CVE feeds, vendor notifications)
  - Monitor ANSSI security alerts and recommendations
  - Track zero-day announcements relevant to stack

---

- [ ] **Dependency Scanning**: Regular npm audit, SonarQube scanning
- [ ] **Patch Management**: Security updates applied within 48 hours of release
- [ ] **Code Review**: All changes peer-reviewed before merge
- [ ] **Static Analysis**: SAST tools (SonarQube, ESLint security rules)
- [ ] **Dynamic Testing**: DAST tools and penetration testing
- [ ] **Responsible Disclosure**: Security vulnerability reporting process

### Phase 7: Third-Party Risk Management

**Focus Area**: Important for projects with integrations (⭐⭐⭐)  
**Why This Matters**: Your security is only as strong as your weakest vendor. A vendor breach can compromise you  
**Quick Assessment**: Do you have vendor security requirements? Are third-party services audited?

- [ ] **Vendor Assessment**: Verify third-parties are secure
- [ ] **Data Processing Agreements**: All vendors have DPA signed
- [ ] **Penetration Testing**: External security testing annually
- [ ] **Supply Chain Security**: Verify dependencies are from trusted sources
- [ ] **API Security**: External integrations use OAuth2/API keys, not passwords

```typescript
// ✅ Vendor/Third-party security assessment (framework-agnostic)
interface VendorSecurityAssessment {
  vendorName: string

  // Certifications
  securityCertifications: string[] // ISO 27001, SOC 2, etc.
  certificationExpiry: Date

  // Compliance
  dataProcessingAgreement: Date // When DPA signed?
  dpaStatus: 'signed' | 'pending' | 'rejected'

  // Security testing
  lastPenetrationTest: Date
  lastSecurityAudit: Date

  // Incident history
  pastBreaches: boolean
  breachDetails?: string

  // Responsiveness
  vulnerabilityResponsiveness: 'FAST' | 'MEDIUM' | 'SLOW' | 'UNKNOWN'

  // Decision
  approved: boolean
  approvalDate: Date
  nextReviewDate: Date
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}
```

### Phase 8: Incident Response & Business Continuity

**Focus Area**: Critical for production systems (⭐⭐⭐)  
**Why This Matters**: Attacks will happen. Well-prepared teams recover faster and suffer less damage  
**Quick Assessment**: Do you have an incident response plan? Who calls the response? How do you resume operations?

- [ ] **Incident Response Plan**: Documented step-by-step procedure
- [ ] **Detection**: Monitor for security anomalies
- [ ] **Containment**: Isolate affected systems
- [ ] **Eradication**: Remove threat
- [ ] **Recovery**: Restore normal operations
- [ ] **Post-Mortem**: Document lessons learned

```typescript
// ✅ Incident response tracking (framework-agnostic)
interface IncidentResponse {
  id: string // Unique incident ID
  reportedAt: Date
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

  // Detection phase
  detectionMethod: string // How detected? (log analysis, user report, IDS, etc.)
  detectionTime: Date

  // Initial response
  containmentStarted: Date
  containedSystems: string[] // Systems isolated

  // Remediation
  shortTermMeasures: string[] // Temporary fixes applied
  permanentFix: string // Long-term solution
  fixDeployedAt: Date

  // Review (mandatory after every incident)
  rootCauseAnalysis: string // Why did it happen?
  preventionMeasures: string[] // How to prevent recurrence?
  postMortemDate: Date
  resolutionTime: number // Time to resolve (hours)
}
```

---

## 🤖 Agent Workflow Guide

**If you are an RGS compliance agent analyzing a project, follow this workflow:**

### Step 1: Understand the Project (2 min)

1. Open [copilot-instructions.md](/../.github/copilot-instructions.md) - Get architecture context
2. Identify the **project type** (Web App / API / Microservice / etc.)
3. Identify **security level** (_//\*\* /_)

### Step 2: Check Applicable Phases (1 min)

- Refer to **Project Applicability Matrix** above
- Identify which phases are marked ⭐⭐⭐ (critical) for your project type
- Mark the others for reference only

### Step 3: Analyze Each Phase (5-30 min per phase)

For each applicable phase:

1. **Read focus area** — Why this matters for your project
2. **Review quick assessment** — Check if the project passes basic criteria
3. **Work through checklist** — Verify each requirement
4. **Reference detailed annex** — If needed, read the `-DETAILED.md` file for context

### Step 4: Report Findings

- List completed ✅ items
- Identify gaps ⚠️ (items not done)
- Assign severity:
  - 🔴 **Critical** = Breaks compliance (RGS rule, not recommendation)
  - 🟠 **High** = Should be fixed soon (recommendation, best practice)
  - 🟡 **Medium** = Nice to have (optimization)

### Step 5: Get Detailed Guidance

- For **Phase 2** (Authentication): → [RGS-ANNEX-B3-DETAILED.md](./RGS-ANNEX-B3-DETAILED.md)
- For **Phase 3** (Encryption): → [RGS-ANNEX-B2-DETAILED.md](./RGS-ANNEX-B2-DETAILED.md)
- For **Project-specific patterns**: → [/docs/compliance/RGS-IMPLEMENTATION.md](/../../docs/compliance/RGS-IMPLEMENTATION.md)

---

## 🎯 When to Apply This SKILL

- ✅ Implementing authentication flows
- ✅ Designing authorization models
- ✅ Reviewing API security
- ✅ Planning incident response procedures
- ✅ Conducting security audits
- ✅ Building authentication/authorization systems
- ✅ Handling sensitive data (passwords, tokens, encryption keys)
- ✅ API endpoint design
- ✅ Incident response and breach management
- ✅ Vendor/third-party risk assessment

## ⚠️ Common Pitfalls

| Pitfall                         | Risk                              | Fix                                   |
| ------------------------------- | --------------------------------- | ------------------------------------- |
| Weak password policy            | Easily guessed passwords          | Enforce 12+ chars, complexity         |
| No MFA                          | Account compromise                | Require MFA for sensitive accounts    |
| Storing passwords in plain-text | Immediate compromise if breached  | Hash with bcrypt, argon2              |
| Logging sensitive data          | Exposure in logs                  | Sanitize logs, no PII                 |
| No rate limiting                | Brute force attacks               | Throttle failed login attempts        |
| Hardcoded secrets in code       | Secrets leaked in git history     | Use environment variables             |
| No audit logging                | Can't detect/investigate breaches | Log all critical actions              |
| Outdated dependencies           | Known vulnerabilities             | Update regularly, scan with npm audit |

## 🛠️ Tools & Resources

### Official RGS Documentation

- **RGS v2.0 Official PDF**: https://www.ssi.gouv.fr/uploads/2014/11/RGS_v2_0.pdf
- **ANSSI Website**: https://www.ssi.gouv.fr/
- **Implementation Guidance**: https://www.ssi.gouv.fr/fr/reglementation-ssi/referentiel-general-de-securite/
- **EBIOS 2010 Methodology**: Recommended for risk analysis (from ANSSI)
- **ANSSI Cryptography Guidelines**: Rules for cryptographic algorithms (Annex B1/B2)
- **RGS Annex B3**: Authentication mechanisms & best practices
- **Recommended Products**: https://www.ssi.gouv.fr/administration/qualifications/

### Security Frameworks & References

- **ISO/IEC 27001**: Information security management systems
- **ISO/IEC 27005**: Information security risk management
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CWE/SANS Top 25**: https://cwe.mitre.org/top25/

### Security Scanning Tools

- **npm audit**: https://docs.npmjs.com/cli/audit (for Node.js dependencies)
- **Snyk**: https://snyk.io/ (continuous vulnerability detection)
- **SonarQube**: https://www.sonarqube.org/ (static code analysis)
- **OWASP Dependency-Check**: https://owasp.org/www-project-dependency-check/
- **GitHub Dependabot**: Automated dependency updates and alerts
- **Trivy**: Vulnerability scanner for containers and dependencies

### Encryption & Secrets Management

- **bcrypt** (password hashing): https://www.npmjs.com/package/bcrypt
- **Argon2** (modern password hashing): https://www.npmjs.com/package/argon2
- **jsonwebtoken**: https://www.npmjs.com/package/jsonwebtoken
- **dotenv** (environment variables): https://www.npmjs.com/package/dotenv
- **Azure Key Vault**: Cloud-based secret management
- **HashiCorp Vault**: Open-source secret management

### Logging & Monitoring

- **Winston** (structured logging): https://www.npmjs.com/package/winston
- **ELK Stack** (Elasticsearch, Logstash, Kibana): Log aggregation & analysis
- **Splunk**: Enterprise logging platform
- **Sentry** (error & security tracking): https://sentry.io/
- **Datadog**: APM and security monitoring

---

## 📚 How to Use This Document Effectively

### For Human Developers

1. **Quick assessment** (5 min): Answer the diagnostic questions in "Quick Start"
2. **Identify gaps** (10-30 min): Work through checklists for applicable phases
3. **Get implementation guidance**: Reference detailed annex files (RGS-ANNEX-B\*.md)
4. **Check Project-specific patterns**: See [/docs/compliance/RGS-IMPLEMENTATION.md](/../../docs/compliance/RGS-IMPLEMENTATION.md) for NestJS/React examples

### For Compliance Agents

1. **Understand the project** → Check copilot-instructions.md for architecture
2. **Identify project type** → Web app / API / Microservice / etc.
3. **Check applicability matrix** → See which phases are critical (⭐⭐⭐)
4. **Work systematically** → Phase by phase, following the checklist
5. **Report findings** → Gaps with severity (🔴 Critical / 🟠 High / 🟡 Medium)
6. **Reference annexes for context** → When you need deeper understanding
7. **Check Project implementation** → For project-specific patterns (NestJS Passport guards, bcrypt usage, etc.)

### Document Structure Map

```
SKILL.md (THIS FILE)
├─ Definition & Objectives
├─ Quick Start (diagnostic questions + matrix)
├─ 5-Step RGS Process
├─ 8 Implementation Phases (checklists)
│  ├─ Phase 1: Risk Management
│  ├─ Phase 2: Authentication → See RGS-ANNEX-B3-DETAILED.md
│  ├─ Phase 3: Encryption → See RGS-ANNEX-B2-DETAILED.md
│  ├─ Phase 4: Input Validation
│  ├─ Phase 5: Audit Logging
│  ├─ Phase 6: Vulnerability Management
│  ├─ Phase 7: Third-Party Risk
│  └─ Phase 8: Incident Response
├─ Common Pitfalls
├─ Tools & Resources
└─ This Summary

RGS-ANNEX-B2-DETAILED.md
├─ Comprehensive cryptography reference
├─ Algorithm requirements
├─ Key lifecycle
├─ Certificate management
└─ ~2000 lines of detailed context

RGS-ANNEX-B3-DETAILED.md
├─ Comprehensive authentication reference
├─ Authentication models
├─ Session lifecycle
├─ Unlock mechanisms
├─ Audit requirements
└─ ~2000 lines of detailed context

/docs/compliance/RGS-IMPLEMENTATION.md
├─ Project-specific patterns (NestJS, React, PostgreSQL)
├─ Code examples (Passport.js, JWT, bcrypt)
├─ Database schema (User, Session, AuditLog tables)
├─ API endpoint examples
└─ Project-specific best practices
```

### Reading Paths by Role

**Security Officer**:

- Start with "RGS 5-Step Compliance Process"
- Check "Project Applicability Matrix"
- Review "Agent Workflow Guide" for team coordination

**Developer (Implementing Auth)**:

- Quick diagnosis → Phase 2 checklist → RGS-ANNEX-B3-DETAILED.md (Session Lifecycle section)
- Check Project implementation for NestJS Passport patterns

**Developer (Handling Encryption)**:

- Quick diagnosis → Phase 3 checklist → RGS-ANNEX-B2-DETAILED.md (Algorithm Requirements)
- See Project implementation for bcrypt/AES-256-GCM examples

**Compliance Agent**:

- Follow "Agent Workflow Guide" above
- Use "Phase Navigation Index" to prioritize by project type
- Reference annexes for detailed explanations
- Check Project implementation for patterns

---

**Last Updated**: 1 April 2026 | **RGS Version**: v2.0 (2014), v3.0 guidance emerging  
**Maintained by**: ANSSI Reference | **For**: Project Compliance Framework

- **Grafana**: Metrics visualization and alerting

### Web Application Security

- **CloudFlare WAF**: https://www.cloudflare.com/waf/
- **ModSecurity**: Open-source WAF
- **helmet**: Security headers for Express: https://www.npmjs.com/package/helmet
- **express-rate-limit**: Rate limiting middleware: https://www.npmjs.com/package/express-rate-limit
- **OWASP ZAP**: Dynamic security testing tool

---

## 📋 Phase 7: Business Continuity & Disaster Recovery (RGS Chapter 2.5)

Organizations must ensure continuity and recovery capability in case of security incidents or disasters:

### Business Continuity Planning

- [ ] **BCP Document**: Business continuity plan developed and maintained
- [ ] **Critical Functions**: Identified and prioritized
- [ ] **Recovery Time Objective (RTO)**: Defined (e.g., 4 hours max downtime)
- [ ] **Recovery Point Objective (RPO)**: Defined (e.g., hourly backups)
- [ ] **Disaster Recovery Site**: Secondary location identified for failover
- [ ] **Data Backup**: Regular backups (daily minimum for critical systems)
- [ ] **Backup Testing**: Backups tested monthly to ensure recoverability

### Incident Response Plan

- [ ] **IR Team**: Designated and trained
- [ ] **Communication Plan**: Escalation procedures, notification templates
- [ ] **Containment Procedures**: Steps to isolate affected systems
- [ ] **Investigation Tools**: Forensic tools available and documented
- [ ] **Recovery Procedures**: Step-by-step guides for each critical system
- [ ] **Post-Incident Review**: Formal lessons-learned process

### Personnel Training & Awareness

- [ ] **Security Awareness**: Annual training for all personnel (RGS requirement)
- [ ] **Role-Specific Training**: Specialized training for security roles
- [ ] **Password and MFA Training**: Proper credential management
- [ ] **Phishing Simulation**: Regular phishing exercises to test user awareness
- [ ] **Incident Response Drills**: Annual tabletop exercises

---

## 📋 Phase 8: Compliance Verification & Accreditation

Before deploying to production, verify that the system meets all RGS requirements:

### Pre-Deployment Checklist

- [ ] **Security Objectives Met**: All requirements from Step 2 achieved
- [ ] **Security Measures Implemented**: All controls from Step 3 in place
- [ ] **Security Testing Complete**: Penetration tests, vulnerability scans passed
- [ ] **Documentation Complete**: Security plan, accreditation dossier prepared
- [ ] **Residual Risks Accepted**: Risk acceptance signed by authorized official
- [ ] **Compliance Verification**: Independent audit completed (recommended)

### Formal Accreditation

- [ ] **Accreditation Authority**: Designated official reviews dossier
- [ ] **Accreditation Decision**: Formal written authorization to operate
- [ ] **Scope Definition**: Clearly defined what is and isn't included
- [ ] **Conditions**: Any limitations or special conditions documented
- [ ] **Duration**: Accreditation validity period (typically 2-3 years)
- [ ] **Publication**: For e-services, accreditation decision published

### Post-Accreditation Monitoring

- [ ] **Security Metrics**: Monitored continuously (uptime, patch lag, log volumes)
- [ ] **Periodic Reviews**: Annual accreditation review minimum
- [ ] **Change Management**: Any significant changes trigger re-evaluation
- [ ] **Incident Tracking**: All security incidents documented and trended
- [ ] **Compliance Audits**: Internal audits at least annually
- [ ] **External Audits**: Third-party audits recommended every 2-3 years

---

## 📌 Project-Specific Implementation

> ⚠️ **Project-specific guidance** (e.g., Project NestJS/React implementation) is **NOT** in this skill file.
>
> Instead, see **Project Documentation** for implementation details:
>
> - [`docs/compliance/Project-RGS-IMPLEMENTATION.md`](../../../docs/compliance/RGS-IMPLEMENTATION.md) — Project's specific RGS requirements & code examples
>
> This skill focuses on **RGS reference knowledge** only, not project-specific implementation.

---

## 📚 RGS Reference Structure

The RGS framework is organized into 10 chapters + annexes:

1. **Compliance Requirements** — Who must comply, when
2. **Implementation Steps** — The 5-step process detailed above
3. **Cryptography Rules** — Technical requirements (Annex B1/B2)
4. **Acknowledgements & Receipts** — Non-repudiation mechanisms
5. **Product/Service Qualification** — Qualified products list
6. **Certificate Validation** — State-managed certificate validation
7. **Implementation Recommendations** — 13 recommendation categories
8. **V1 to V2 Transition** — Migration guidance
9. **Annexes** — Technical details
10. **References** — Regulatory, technical standards

### Key Annexes

- **RGS A1**: Certificate policies (person, service)
- **RGS A2**: Qualified signature requirements
- **RGS A3**: Service applicative certificates
- **RGS B1**: Cryptographic mechanisms (general)
- **RGS B2**: Cryptographic sizing rules
- **RGS B3**: Authentication mechanisms

---
