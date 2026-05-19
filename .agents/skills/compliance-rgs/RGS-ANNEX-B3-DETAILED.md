# RGS Annex B3: Complete Authentication Framework Reference

**Source**: RGS v1.0 (Annexe B3 du RGSv1.0 - 13 janvier 2010), "Authentification - Règles et recommandations concernant les mécanismes d'authentification"

**Authority**: ANSSI (Agence nationale de la sécurité des systèmes d'information)

**Purpose**: Comprehensive reference for implementing RGS authentication requirements across all security levels and entity types

---

## Table of Contents

1. [Introduction & Concepts](#introduction--concepts)
2. [Authentication Model](#authentication-model)
3. [Machine-to-Machine Authentication](#machine-to-machine-authentication)
4. [Person Authentication to System](#person-authentication-to-system)
5. [End-to-End Person Authentication](#end-to-end-person-authentication)
6. [Cryptographic Mechanisms](#cryptographic-mechanisms)
7. [Key Management for Authentication](#key-management-for-authentication)
8. [Connection Phase](#connection-phase)
9. [Authenticated Session Lifecycle](#authenticated-session-lifecycle)
10. [Disconnection & Cleanup](#disconnection--cleanup)
11. [Third-Party Trust](#third-party-trust)
12. [Audit & Monitoring](#audit--monitoring)
13. [Unlock Mechanisms](#unlock-mechanisms)
14. [Implementation Checklist](#implementation-checklist)

---

## Introduction & Concepts

### Definition of Authentication

**Authentication** = Verification that an entity claiming an identity is genuinely that entity

- **Identification**: Communicating a known identifier (username, email, account number)
- **Authentication**: Proving possession of the corresponding private credential (signature, knowledge, biometric)

### Two Core Concepts

**Authentication vs. Signature**:

- **Authentication**: Establishes a session with time-limited validity (15-30 min)
- **Signature**: Provides long-term proof of intent & document integrity (50+ years)

Both use cryptographic mechanisms but serve different purposes.

### Authentication Objectives

1. **Access Control** — Determine what actions a user can perform
2. **Accountability** — Associate actions on a system to a specific user identity
3. **Non-Repudiation** — User cannot deny performing an action (legal proof)

---

## Authentication Model

### General Process States

Authentication follows a **state machine** with clear transitions:

```
┌─────────────────────────────────────────────────────────────┐
│                     Error State                              │
│            Generated on any failed transition                │
│              Triggers audit alarm                            │
└─────────────────────────────────────┬───────────────────────┘
                                      ↑ ↓
                                   Error
┌───────────────┬────────────────────┴──────────────────┬──────────────┐
│ Initial State │    Connection Phase    │ Authenticated │ Disconnection│
│(Unauthented) │   (Login/Auth Proof)   │    Session    │   (Logout)   │
└───────────────┴───────────────────────┴──────────────┬──────────────┘
   ↑                                                    │
   └────────────────────────────────────────────────────┘

Transitions:
- Initial state → Connection: User provides authentication credentials
- Connection → Authenticated: System validates credentials successfully
- Authenticated → Disconnection: User logs out or session times out
- Any state → Error: Failed validation, anomaly, or attack detected
```

### Key Actors

- **Demandeur** (Requester): Entity seeking to authenticate (person or machine)
- **Receveur** (Receiver): System that authenticates and grants access
- **Canal** (Channel): Communication path between requester and receiver
- **Session Authentifiée** (Authenticated Session): Time window during which actions are permitted

### Properties of Secure Authentication

1. **Proof of Possession**: Not just identity, but proof of secret/credential
2. **Replay Protection**: Same credential cannot be reused (anti-replay)
3. **Mutual Authentication**: System proves its identity to user too (optional but recommended via TLS)
4. **Channel Confidentiality**: Protected from eavesdropping during auth exchange

---

## Machine-to-Machine Authentication

### Architecture

```
┌──────────────────────┐
│ Local Trusted        │
│ Environment          │   → Requires: Cryptographic Protocol
│ (Demandeur/Client)   │     Example: TLS 1.3, OAuth 2.0, Kerberos
└──────────┬───────────┘
           │
           ├─ Cryptographic Protocol (Unsecured Channel)
           │
           ↓
┌──────────────────────┐
│ Remote System        │
│ Receiving Auth       │
│ (Receveur/Server)    │
└──────────────────────┘

Optional Third-Party Element:
┌──────────────────────────┐
│ Trust Center/            │
│ Authentication Server    │  ← PKI, LDAP, RADIUS, OAuth Provider
│ (SI d'authentification)  │     Issues credentials, validates claims
└──────────────────────────┘
```

### Requirements

- [ ] **Interactive Cryptographic Protocol** (not just sending credentials)

  - Client proof: Possession of private key via signature/HMAC
  - Server proof: Signature from trusted CA (via certificate)
  - Both parties verify signatures cryptographically

- [ ] **Strong Cryptographic Mechanisms**:

  - Symmetric: AES-256-GCM for session encryption
  - Asymmetric: RSA-2048+, ECDSA for key exchange
  - Hash: SHA-256+ for integrity
  - HMAC-SHA256+ for message authentication

- [ ] **No Simple Credential Transmission**:

  - ❌ Sending plain password over HTTPS (vulnerable to phishing)
  - ❌ Sending password hash (can be replayed)
  - ✅ Interactive proof: Challenge-response with cryptographic signature
  - ✅ TLS 1.3 prevents eavesdropping AND man-in-the-middle

- [ ] **Proper Key Management**:
  - Private keys stored securely (HSM, encrypted storage)
  - Key rotation: Annual minimum
  - Compromised keys revoked immediately
  - Key derivation: Proper KDF (not raw password)

### Examples of Machine-to-Machine Authentication

| Type              | Mechanism                       | RGS Level    | Notes                                       |
| ----------------- | ------------------------------- | ------------ | ------------------------------------------- |
| **Web API**       | TLS 1.3 + Client Certificate    | \*, **, \*** | Mutual TLS, certificate pinning recommended |
| **OAuth 2.0**     | Authorization Code + Signed JWT | \*, \*\*     | Refresh tokens, short-lived access tokens   |
| **Kerberos**      | Ticket + HMAC-MD5+              | \*\*         | Deprecated MD5, use SHA-256+ instead        |
| **SAML 2.0**      | XML Signature + Assertion       | \*\*         | Timestamp tokens for long-term proof        |
| **Kerberos v5**   | Encrypted authenticator         | \*\*         | Session key protected by derived key        |
| **TLS with Cert** | X.509 Client Certificate        | **/\***      | Hardware storage (HSM) for Level \*\*\*     |

---

## Person Authentication to System

### Challenge: The Human Factor

**Problem**: Humans cannot directly perform cryptographic operations at scale

**Solution**: Layering

1. **Unlock Mechanism**: User-friendly proof (password, biometric, card)
2. **Trusted Local Environment**: Desktop/phone that performs cryptographic operations
3. **Machine-to-Machine Auth**: Between trusted environment and remote system

### Architecture

```
┌──────────────┐
│   Person     │
│   (User)     │  Unlock (password, PIN, biometric)
└──────┬───────┘
       │
       ↓
┌─────────────────────────────┐
│  Trusted Local Environment  │
│  (Client Computer)          │  Contains user's private keys
│  - Stores credentials       │  Performs crypto operations
│  - Enforces unlock          │
└──────────┬──────────────────┘
           │
           ├─ Machine-to-Machine Authentication (TLS 1.3)
           │
           ↓
┌─────────────────────┐
│ Remote System       │
│ (Server)            │  Grants access to authenticated user
└─────────────────────┘
```

### Key Rules

**RègleAuthentification**: Person authentication must involve:

1. Trusted local environment (demandeur) under user control
2. Unlock mechanism to activate the environment
3. Machine-to-machine auth between environment and server

- [ ] **Trusted Local Environment** must:

  - Store user's private keys/credentials securely
  - Never expose secrets to untrusted OS
  - Perform authentication on behalf of user
  - Support examples: Smart card with reader, secure enclave, hardware token

- [ ] **Unlock Mechanism** (RGS calls "déverrouillage"):

  - **Something you know**: Password, PIN, security question
  - **Something you have**: Smart card, USB token, phone
  - **Something you are**: Fingerprint, face, iris
  - **Combination (MFA)**: Multiple factors from different categories

- [ ] **Machine-to-Machine Authentication** must be:
  - Interactive cryptographic protocol
  - Replay-protected
  - Man-in-the-middle protected (via TLS, mutual auth)
  - Mutually authenticated (both parties verified)

### Why Simple Password Transmission Fails

**Attack Scenario: Phishing**

```
User visits fake email link → phishing.example.fr (attacker server)
User enters password "MyPassword123!"
Attacker stores password
Later: Attacker logs into real service as the user
  → No proof that REAL user entered the password
  → User cannot deny it (their password is on the server)
  → Fundamental problem: Simple transmission = no proof of authorization at moment of login
```

**RGS Solution: Require Proof at Time of Login**

```
Trusted environment stores private key for user
At login time:
  - User provides unlock (password)
  - Unlock opens local key storage
  - System generates challenge from server
  - Signs challenge with private key
  - Sends signature to server
  - Server verifies signature with user's public key
  → Proof of authorization at that moment
  → Attack prevention: Attacker cannot complete auth without private key
```

---

## End-to-End Person Authentication

### Two-Person Authentication

**Scenario**: Two users authenticating to each other (e.g., online meeting)

**Model**: Symmetrize the single-person model

```
Person A                                     Person B
   │                                           │
   ├─ Unlock Local Environment   ──────  Unlock Local Environment ─┤
   │                                           │
   └─ Trusted Environment A ────────────  Trusted Environment B ─┘
        (Machine-to-Machine TLS 1.3)
        (Mutual authentication via certificates)
```

**Result**: Both persons mutually authenticated through their respective trusted environments

---

## Cryptographic Mechanisms

### Required Components for Authentication

All RGS authentication mechanisms require:

1. **Cryptographic Primitives**:

   - Symmetric: AES-256-GCM for session encryption
   - Asymmetric: RSA-2048+ or ECDSA (P-256+) for key exchange/signatures
   - Hash: SHA-256+ for integrity
   - HMAC: HMAC-SHA256+ for message authentication

2. **Key Infrastructure**:

   - **Private keys**: Generated, stored, used in cryptographically secure manner
   - **Public keys**: Distributed via certificates
   - **Key rotation**: Annual minimum
   - **Key material**: Securely cleared on disconnection

3. **Protocol Design**:
   - **Challenge-response**: Prevents replay
   - **Mutual authentication**: Both parties prove identity
   - **Forward secrecy**: Session keys cannot be recovered if long-term keys compromised
   - **Confidentiality + Integrity**: Session protected after auth

### Authentication Protocols (Examples)

| Protocol                   | Type        | RGS Compliant          | Notes                                |
| -------------------------- | ----------- | ---------------------- | ------------------------------------ |
| **TLS 1.3**                | Transport   | ✅ Yes                 | Use ECDHE, AES-256-GCM, SHA-256+     |
| **OAuth 2.0**              | Application | ✅ Yes                 | Requires signed JWT, PKCE            |
| **OpenID Connect**         | Application | ✅ Yes                 | JWT-based, timestamp validation      |
| **SAML 2.0**               | Application | ✅ Yes                 | XML signatures, timestamp tokens     |
| **Kerberos v5**            | Application | ⚠️ Yes (with SHA-256+) | Avoid MD5; use SHA-256+ HMAC         |
| **Certificate PIN + HMAC** | Custom      | ✅ Yes                 | Challenge-response with signing      |
| **Password + OTP**         | Hybrid      | ✅ Yes                 | 2FA combining knowledge + possession |

---

## Key Management for Authentication

### Lifecycle for Authentication Keys

#### 1. Generation

- [ ] **Cryptographically Secure RNG** only

  - Use OS CSRNG: `/dev/urandom` (Linux/macOS), `CryptGenRandom` (Windows)
  - Crypto libraries: OpenSSL, libsodium, BoringSSL
  - ❌ Avoid: `Math.random()`, `time()`, weak PRNGs

- [ ] **Isolated Environment**
  - No network during key generation
  - Limited access (only authorized administrators)
  - Logging enabled (audit who generated keys)

#### 2. Storage

- [ ] **Level \* (Basic)**:

  - Encrypted software storage acceptable
  - Keys in protected config, database, or KMS
  - Encryption key ≠ application keys (separate storage)

- [ ] **Level ** (Intermediate)\*\*:

  - Hardware token preferred (smart card, USB security key)
  - Keys never in software memory
  - Secure readers required (prevent PIN sniffing)

- [ ] **Level \*** (Maximum)\*\*:
  - **HSM (Hardware Security Module) mandatory**
  - FIPS 140-2 Level 2+ certification
  - Keys never leave HSM
  - All crypto operations inside HSM

#### 3. Use/Operation

- [ ] **Key Access Control**:

  - Role-based: Only authorized users/systems access keys
  - Logging: Every key use logged (user, timestamp, operation, result)
  - Time-based: Access windows (e.g., 9am-5pm business hours)

- [ ] **Session Key Generation**:
  - Derived from long-term keys using secure KDF
  - One-time use (derived per session)
  - Short lifetime (15-30 min for auth sessions)

#### 4. Rotation

- [ ] **Rotation Schedule**:

  - **Minimum**: Annual rotation required by RGS
  - **Recommended**: Quarterly (3 months) for critical keys
  - **Critical**: Monthly if high-volume or high-risk

- [ ] **Rotation Process**:
  ```
  1. Generate new keypair
  2. Add new public key to distribution (certificates, truststores)
  3. Overlap period: Accept both old & new (30-90 days)
  4. Phase-out old key (stop accepting auth via old key)
  5. Archive old key (encrypted, immutable)
  ```

#### 5. Compromise/Destruction

- [ ] **Immediate Actions on Compromise**:

  - Revoke certificate (CRL, OCSP revocation)
  - Generate new keypair
  - Re-register all affected users/systems
  - Audit logs for unauthorized use

- [ ] **Secure Destruction**:
  - Not just "delete" or "format"
  - NIST 800-88: Cryptographic erasure
  - Overwrite with cryptographically secure random data
  - Certificate of destruction (date, method, witness)

---

## Connection Phase

### Authentication Initiation

The **connection phase** establishes the authenticated session.

#### 1. First Factor: Unlock the Trusted Environment

User authenticates to LOCAL system (trusted environment):

```
User interaction:
  ├─ Password: "MySecure123!" (12+ chars, complexity)
  ├─ PIN: "1234" (4-8 digits, entered on secure reader)
  ├─ Biometric: Fingerprint (compared locally, never sent to server)
  └─ Card: Smart card inserted (unclocked via PIN)

OR Multi-Factor:
  ├─ Card (possession) + PIN (knowledge) + Fingerprint (biometric)
  └─ Phone (TOTP app) + SMS (backup) + Backup codes
```

#### 2. Second Factor: Machine-to-Machine Authentication

Trusted environment authenticates to remote system:

```
Trusted Environment                   Remote Server
        │                                   │
        ├─ TLS Handshake ──────────────────┤
        │  ├─ Server sends certificate
        │  ├─ Client verifies certificate chain
        │  ├─ Establish session key (ECDHE)
        │  └─ Verify server identity (mutual auth)
        │
        ├─ Authentication Protocol ────────┤
        │  ├─ Client: "User X authenticating"
        │  ├─ Server: Challenge (random value)
        │  ├─ Client: Sign challenge with private key
        │  └─ Server: Verify signature with public key
        │
        ├─ Token/Session Issued ───────────┤
        │  └─ Server: JWT + Refresh Token
        │             (signed by server, expires 15 min)
        │
        └─ Session Active ──────────────────┘
           (subsequent requests include JWT)
```

### Connection Rules

**RègleProtocole**: Authentication between machines must use an interactive cryptographic protocol

- [ ] **Interactive** (not static):

  - Challenge-response with fresh challenge each time
  - Random nonce prevents replay
  - No hardcoded credentials

- [ ] **Cryptographic**:

  - Prove possession of private key (signature)
  - Prove knowledge of shared secret (HMAC)
  - Or combination (knowledge + card = both factors)

- [ ] **Robust**:
  - Signature verified with trusted public key
  - Certificate chain validated to root CA
  - TLS provides confidentiality and integrity

---

## Authenticated Session Lifecycle

### Session Establishment

Once connection phase succeeds:

```
Server → Client: Authenticated ✓
                 Issued: JWT access token (15-30 min expiration)
                 Issued: Refresh token (1-7 days or longer)
                 Set: Session cookie (if web app, HttpOnly + Secure flags)
```

### Session Protection

**RecomConfidentialité**: If authenticating for confidential data access:

- [ ] **Encrypt Session Channel**:

  - TLS 1.3 wraps all communication
  - No plain HTTP after authentication needed
  - All session data encrypted in transit

- [ ] **Integrity Protection**:

  - HMAC on all session messages (if not using AEAD)
  - GCM mode for authenticated encryption
  - Detect tampering or injection

- [ ] **Session Binding**:
  - Token linked to IP address (optional but recommended)
  - Token linked to user-agent (browser fingerprint)
  - Token linked to device ID (mobile device identification)
  - Prevents token theft & use from different device

### Session Actions

During authenticated session, user can:

```
┌────────────────────────────────────┐
│ Authenticated Session              │
│                                    │
│ ✓ Create/read/update/delete data  │
│ ✓ Access protected resources      │
│ ✓ Delegate to other systems       │
│ ✗ Escalate privileges (requires   │
│    re-authentication)             │
│ ✗ Change password (requires       │
│    re-authentication + current pw) │
│                                    │
│ Events triggered:                  │
│ ├─ Audit log for sensitive ops    │
│ ├─ Anomaly detection enabled      │
│ └─ Rate limiting applied          │
└────────────────────────────────────┘
```

### Session Timeout (Inactivity)

**RecomInactivité**: Automatic logout on inactivity

- [ ] **Timeout Duration**:

  - **Recommended**: 15-30 minutes
  - **Sensitive ops**: 5-15 minutes
  - **Unattended terminals**: 1-5 minutes

- [ ] **Implementation**:

  ```
  1. Start inactivity timer at session creation
  2. Reset timer on every user action (API call, page load)
  3. On timeout: Invalidate session token
  4. On next request: Return 401 Unauthorized
  5. User must re-authenticate to continue
  ```

- [ ] **Notification**:
  - Optional: Warn user at 5-min mark before logout
  - Allow "Keep alive" click to extend session
  - Log timeouts for audit

---

## Disconnection & Cleanup

### Logout Process

User explicitly logs out OR session times out:

```
1. User clicks "Logout" button
   └─ Browser sends: GET /logout (with session token)

2. Server processes logout:
   ├─ Invalidate session token
   ├─ Remove from session store (Redis, DB)
   ├─ Revoke refresh token (if applicable)
   ├─ Clear session cookies
   └─ Audit log: "User X logged out at timestamp T"

3. Server response:
   └─ Redirect to login page

4. Client (browser) cleanup:
   ├─ Clear JWT from memory
   ├─ Delete session cookies
   ├─ Clear local storage
   └─ Reset authentication context
```

### Secret Cleanup (RègleEffacement)

**Critical Rule**: Erase all temporary secrets used during authentication

- [ ] **What to Erase**:

  - Temporary keys derived during handshake
  - Challenge values
  - Nonce values
  - HMAC constants
  - IV (initialization vectors)
  - Session key material

- [ ] **How to Erase**:

  - ❌ NOT just "delete" (memory still has data)
  - ✅ Overwrite: Set memory to zeros
  - ✅ Double-overwrite: Zero → Random → Zero
  - ✅ Volatile memory only (not disk)

- [ ] **Code Example** (Framework-agnostic):

  ```
  // ✅ Correct: Zeroize sensitive memory
  const temporaryKey = derivedKey(sessionKey, salt)
  // Use temporaryKey...
  // After use:
  temporaryKey.fill(0) // Overwrite with zeros
  delete temporaryKey  // Remove reference

  // ❌ Wrong: Just delete
  delete temporaryKey // Memory might still be there

  // ❌ Wrong: Store on disk
  fs.write(diskFile, sensitiveValue) // Permanent record!
  ```

**RecomMémoireVolatile**: Secrets must live only in RAM, never on disk

- [ ] **Prevention Measures**:
  - Disable swap/virtual memory for security-sensitive processes
  - Use OS memory locking (Linux: `mlock()`, macOS: `mlock()`)
  - Prevent memory dumps (process memory constraints)

---

## Third-Party Trust

### When to Use Third-Party Authentication

Common scenarios:

- **Single Sign-On (SSO)**: Central identity provider (AD, LDAP, OAuth)
- **Federation**: Trusting external IdP (SAML 2.0, OpenID Connect)
- **API Authentication**: Delegated tokens (OAuth 2.0 for integration)

### Requirements for Third-Party Use

**RègleTiersDeConfiance-1 & 2**: If delegating authentication to third party:

- [ ] **Local-to-Tiers Authentication** must be RGS-compliant:

  - Local system (client) authenticates to third party
  - Same cryptographic standards as local-to-remote auth
  - Example: TLS 1.3 with client certificate

- [ ] **Tiers-to-Remote Authentication** must be RGS-compliant:

  - Third party authenticates to remote system
  - Even stronger security (recommended stronger than -1)
  - Example: SAML 2.0 signed assertions with timestamps

- [ ] **Trust Chain Documentation**:
  - Explicit mapping: "Who trusts whom"
  - Security requirements per link
  - Compromise scenarios (what if third party breached?)

### Trust Model Examples

#### Example 1: OAuth 2.0 Delegation

```
User           Authorization     Client App       API Server
 │              Server            (Service)
 │                                   │              │
 1. "Login with" button
    ┌────────────────────────────────┤
    │ User redirected to AuthServer
    │
 2. Login at AuthServer (MFA if configured)
    └────────── Verify password + TOTP ─────────────┤
    │
 3. AuthServer generates code (short-lived)
    ├─────────── Authorization code ──────────────┤
    │
 4. ClientApp exchanges code + secret for token
    │       POST /token (TLS 1.3, server cert verification)
    ├────────── Client ID + Client Secret ─────────┤
    │
 5. AuthServer verifies ClientApp secrets
    │
 6. AuthServer issues access token
    ├────────── Access Token (signed JWT) ────────┤
    │
 7. ClientApp uses token to access API
    │       GET /data (with JWT in header)
    ├──────────────────────────────────────────────┤ Verify token signature
                                                     Authorize access
                                                     Return /data
```

**Trust Chain**:

- User trusts AuthServer (provider of OAuth tokens)
- ClientApp trusts AuthServer (verified via TLS + client secret)
- API trusts AuthServer's signatures (token issuer)

**Critical**: If AuthServer is compromised, attacker can issue tokens → must monitor for fraud

#### Example 2: SAML 2.0 Federation

```
User              IdP                SP (Service Provider)
 │             (Identity Provider)      (Your System)
 │                                         │
 1. User accesses /login
    ├──────────────────────────────────────┤
    │
 2. SP generates AuthRequest
    ├──────── Send to IdP ────────────────┤
    │
 3. IdP authenticates user
    └──────── Challenge-response ────────┘
    │
 4. IdP creates SAML Assertion
    ├─ User attributes
    ├─ Timestamp (proof of when created)
    ├─ Digital signature (IdP certificate)
    └─ Conditions (valid until timestamp)
    │
    ├──── Signed SAML Assertion ─────────┤
    │
 5. SP verifies assertion
    ├─ Verify IdP signature (with IdP cert)
    ├─ Check timestamp validity
    ├─ Check attribute values
    └─ Grant session
    │
    └──────── User authenticated ────────┘
```

**Trust Chain**:

- User trusts IdP (knows IdP, has user account)
- SP trusts IdP (configured in metadata, certificate pinned)
- Timestamp token prevents stale assertion reuse

---

## Audit & Monitoring

### Required Logging (RègleAudit)

All errors must be logged → immutable audit trail

```
Authentication Event Log Entry:
├─ Timestamp (UTC): 2026-04-01T10:23:45Z
├─ Event type: LOGIN_ATTEMPT | LOGIN_SUCCESS | LOGIN_FAILURE | LOGOUT | TIMEOUT | ERROR
├─ User identifier: user@example.fr (or system ID for machine-to-machine)
├─ Source IP: 192.0.2.15
├─ Source device: iPhone 12 (user-agent fingerprint)
├─ Authentication method: PASSWORD | CERTIFICATE | MFA_EMAIL | HARDWARE_TOKEN
├─ Status code: 0 (success) | -1 (failed) | -2 (timeout)
├─ Failure reason: INVALID_PASSWORD | INVALID_CERT | EXPIRED_TOKEN | MFA_NOT_COMPLETED | ACCOUNT_LOCKED
├─ Session ID: abc123xyz (if login successful)
├─ Additional context: Unusual location detected? Impossible travel? Anomalies?
└─ Non-repudiation: Digitally signed by server (HMAC)
```

**Log Properties**:

- ✅ Immutable (cannot be modified/deleted after creation)
- ✅ Signed (with HMAC, not just stored)
- ✅ Retained: 1+ year (per RGS §2.5)
- ✅ Centralized (not on potentially compromised server)
- ✅ Encrypted at rest (if sensitive)

### Recommended Logging (RecomAudit)

In addition to errors, log all state transitions:

```
Recommended Events:
├─ LOGIN_ATTEMPT: User initiates login (before credentials checked)
├─ LOGIN_SUCCESS: User successfully authenticated
├─ LOGIN_FAILURE: Invalid credentials
├─ MFA_SENT: OTP/code sent to user
├─ MFA_VERIFIED: OTP/code verified successfully
├─ SESSION_TIMEOUT: Session expired due to inactivity
├─ MANUAL_LOGOUT: User clicked logout
├─ TOKEN_REFRESH: Access token refreshed using refresh token
├─ TOKEN_REVOKED: Token invalidated (logout, privilege change)
├─ PRIVILEGE_ESCALATION: Attempt to perform elevated operation
├─ RE_AUTHENTICATION: Required (e.g., for password change)
├─ PASSWORD_CHANGE: User changed password
├─ ACCOUNT_LOCKED: Too many failed attempts
├─ ACCOUNT_UNLOCKED: Admin unlocked account
├─ ANOMALY_DETECTED: Unusual login pattern flagged
└─ INVESTIGATION_REVIEW: Admin reviewed logs for audit
```

### Monitoring & Analysis

- [ ] **Real-time Alerting**:

  - Failed login spike (10+ failures in 1 min) → Alert ops
  - Multiple geographies in minutes (impossible travel) → Block & investigate
  - Known compromised IPs → Reject immediately
  - Brute force detected → Rate limit + CAPTCHA

- [ ] **Daily Review**:

  - Failed login patterns
  - Unusual times/locations
  - Privilege escalations
  - Account changes

- [ ] **Weekly Trends**:
  - Authentication success rate
  - MFA adoption rate
  - Session timeout patterns
  - Token refresh frequency

---

## Unlock Mechanisms

### Types of Unlock Mechanisms

#### 1. Knowledge-Based (Something You Know)

**Password**:

- [ ] Minimum 12 characters (RGS-recommended)
- [ ] Complexity: Uppercase + lowercase + numbers + special characters
- [ ] No dictionary words, user info, or sequential patterns
- [ ] Not stored plain; must be hashed with salt + KDF
- [ ] Hashing algorithm: bcrypt, Argon2, or PBKDF2 (100k+ iterations)

**PIN**:

- [ ] Numeric (0-9) or alphanumeric code
- [ ] Length: 4+ digits (6-8 preferred)
- [ ] Entered on secure reader (prevents shoulder surfing)
- [ ] Rate-limited (max 3 attempts before lockout)

**Security Question**:

- [ ] User-customized (not public knowledge)
- [ ] Stored hashed like passwords
- [ ] Mutually agreed upon (user sets answer)
- [ ] Less secure than password (limited entropy)
- **Not recommended** as sole authentication

#### 2. Possession-Based (Something You Have)

**Smart Card / Security Token**:

- [ ] X.509 certificate embedded
- [ ] Private key stored inside (never exposed)
- [ ] Reader required (USB, NFC, contact)
- [ ] Additional PIN or biometric to activate
- Level: ** (Intermediate) or \*** (High)

**USB Security Key** (e.g., YubiKey):

- [ ] FIDO2/U2F standard (phishing-resistant)
- [ ] WebAuthn protocol
- [ ] Cryptographic challenge-response
- [ ] No network required (offline capable)
- Level: **, \***

**Mobile Phone / Authenticator App**:

- [ ] Time-based OTP (TOTP) - e.g., Google Authenticator, Authy
- [ ] Event-based OTP (HOTP) - counter-based
- [ ] Push notifications (user approves/rejects)
- [ ] SMS OTP (weakest, phone number hijacking risk)
- Level: \*, \*\* (depending on implementation)

**Backup Codes**:

- [ ] One-time use
- [ ] Generated during MFA setup
- [ ] Stored securely (encrypted, printed)
- [ ] 10-20 codes per user
- [ ] Used when primary device unavailable

#### 3. Biometric (Something You Are)

**Fingerprint**:

- [ ] Scanned by local reader (on device)
- [ ] Template stored locally (PII protection)
- [ ] Comparison done locally (not sent to server)
- [ ] False Acceptance Rate (FAR): <1% target
- [ ] Speed: <1 second for match

**Face Recognition**:

- [ ] 3D facial structure analysis (not 2D photo)
- [ ] Anti-spoofing: Liveness detection required
- [ ] Local processing preferred (privacy)
- [ ] FAR: <0.1% target
- [ ] Work in low-light conditions (IR light)

**Iris Scan**:

- [ ] High accuracy (FAR <0.001%)
- [ ] Less convenient than fingerprint
- [ ] Requires specialized hardware
- [ ] Enrollment: Multiple scans needed
- Level: \*\*\*, sensitive applications

#### 4. Multi-Factor Combination

**Recommended Combinations**:

| Factors                    | RGS Level | Use Case                      |
| -------------------------- | --------- | ----------------------------- |
| Password + TOTP            | \*\*      | Standard MFA, good security   |
| Password + SMS OTP         | \*        | Basic MFA, phone required     |
| Password + Hardware Token  | \*\*      | Strong, phishing-resistant    |
| Smart Card + PIN           | \*\*      | Enterprise standard           |
| Smart Card + Biometric     | \*\*\*    | Maximum security              |
| Biometric + Hardware Token | \*\*\*    | Very strong (payment systems) |

**Best Practice**: "Something you know" + "Something you have"

- Avoids single point of failure
- Resistant to phishing (attacker needs multiple factors)
- Recovery possible (backup codes when device lost)

### Unlock Rule Principles

**RecomPérimètre**: Unlock mechanism must stay under user's control

- Physical environment known to user
- Desktop, laptop, phone (user's device)
- NOT: Internet cafe, shared terminal, public WiFi
- If forced into untrusted environment: Use hardware token (physical proof)

**RecomCloisonnement**: Authentication functions isolated from rest of system

- Separate credentials storage (not in application memory)
- Protected process (won't give secrets to other apps)
- Separate processor if possible (secure enclave, TPM)
- Example: OS password manager (1Password, Bitwarden) vs. browser passwords

---

## Implementation Checklist

### Architecture & Design

- [ ] **Authentication Model Documented**:

  - Person vs. machine authentication clearly identified
  - Trusted environment (local) vs. remote system defined
  - Third-party trust chains (if applicable) documented

- [ ] **Security Level Chosen**:
  - Level \* for public services
  - Level \*\* for sensitive operations
  - Level \*\*\* for legal/financial commitments
  - Documented & approved by security officer

### Mechanism Selection

- [ ] **Cryptographic Protocol Chosen**:

  - ✅ OAuthz 2.0 / OpenID Connect (modern web services)
  - ✅ SAML 2.0 (enterprise, federation)
  - ✅ TLS 1.3 with client certificates (APIs)
  - ✅ Kerberos v5 (internal networks, but use SHA-256+)
  - ❌ Basic Auth over HTTP (never)
  - ❌ Session cookies without HTTPS (never)

- [ ] **Unlock Mechanism Chosen**:

  - Level \*: Password (12+ chars, complexity)
  - Level \*\*: Password + TOTP or Hardware Token
  - Level \*\*\*: Smart Card + PIN + Biometric

- [ ] **Key Management Approach**:
  - Where are keys generated? (HSM, secure enclave, app)
  - Where are keys stored? (HSM, Hardware token, encrypted DB)
  - Key rotation schedule? (annual minimum)
  - Recovery procedure? (if HSM fails)

### Implementation & Operations

- [ ] **Connection Phase**:

  - Interactive cryptographic protocol implemented (not static)
  - Certificate chain validation working
  - Mutual authentication (server to client too)
  - TLS 1.3 with strong ciphers

- [ ] **Session Management**:

  - Session timeout implemented (15-30 min inactivity)
  - Token expiration enforced (15-30 min for access tokens)
  - Refresh token rotation (optional but recommended)
  - Session binding (IP, user-agent, device ID)

- [ ] **Disconnection**:

  - Logout triggers session invalidation
  - Secrets zeroed from memory (volatile only)
  - Logs generated
  - Session tokens revoked

- [ ] **Audit & Logging**:
  - All auth events logged
  - Timestamps in UTC
  - Immutable logs (signed/hashed)
  - Retained 1+ year
  - Central storage (not on compromised server)

### Security Testing

- [ ] **Penetration Testing**:

  - Replay attacks tested (should fail)
  - Man-in-the-middle attacks tested (TLS prevents)
  - Brute force attacks tested (rate limiting works)
  - Session hijacking tested (token binding prevents)
  - Injection attacks tested (no auth bypass)

- [ ] **Compliance Audit**:
  - All RGS rules followed (not just recommendations)
  - Third-party audit (yearly minimum)
  - Vulnerability scan (regular)

---

## References

**Official RGS Documents**:

- RGS v1.0, Annexe B3: Authentification (13 janvier 2010)
- RGS v2.0: Chapter 2 (Mise en conformité), Chapter 3 (Cryptographie)

**International Standards**:

- RFC 3161: Time Stamp Protocol
- RFC 5280: X.509v3 Certificates
- RFC 6749: OAuth 2.0 Authorization Framework
- RFC 8174: Key Words in Standards
- OASIS SAML 2.0 Standard
- OpenID Connect Core 1.0

**ANSSI Publications**:

- General RGS Guidance: https://www.ssi.gouv.fr
- Qualified Products: https://www.ssi.gouv.fr/fr/produits-et-prestataires/

**Best Practices**:

- NIST SP 800-63B: Authentication & Lifecycle
- OWASP Authentication Cheat Sheet
- Google Authentication Best Practices
