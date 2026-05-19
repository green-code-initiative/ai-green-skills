# RGS Annex B2: Complete Cryptographic Framework Reference

**Source**: RGS v2.0 (Arrêté du 13 juin 2014), Annex B2 "Sizing of Cryptographic Algorithms"  
**Authority**: ANSSI (Agence nationale de la sécurité des systèmes d'information)  
**Purpose**: Comprehensive reference for implementing RGS cryptographic requirements

---

## Table of Contents

1. [General Cryptographic Rules](#general-cryptographic-rules)
2. [Protected Electronic Communications](#protected-electronic-communications)
3. [Electronic Certificate Requirements](#electronic-certificate-requirements)
4. [Authentication via Electronic Certificates](#authentication-via-electronic-certificates)
5. [Digital Signatures & Seals](#digital-signatures--seals)
6. [Confidentiality via Encryption](#confidentiality-via-encryption)
7. [Electronic Timestamping](#electronic-timestamping)
8. [Public Key Infrastructure - IGC/A](#public-key-infrastructure---igca)
9. [Algorithm Requirements](#algorithm-requirements)
10. [Transport Layer Security](#transport-layer-security)
11. [Key Management Lifecycle](#key-management-lifecycle)
12. [Security Levels Mapping](#security-levels-mapping)
13. [Implementation Checklist](#implementation-checklist)

---

## General Cryptographic Rules

All cryptographic mechanisms implemented under RGS must comply with **Annex B2** covering:

- **Algorithm Selection** based on security level and threat model
- **Key Management** lifecycle (generation, storage, rotation, destruction)
- **Key Sizing** to match security levels
- **Cryptographic Implementation** standards
- **Institutional Requirements** (ANSSI validation, audits, certifications)

---

## Protected Electronic Communications

RGS Chapter 3.2 requires protection through **4 main functions**:

1. **Authentication via Electronic Certificates** — Verify identity
2. **Digital Signatures & Seals (Cachet)** — Guarantee integrity & non-repudiation
3. **Confidentiality via Encryption** — Protect data from disclosure
4. **Timestamping (Horodatage)** — Prove existence at moment in time

---

## Electronic Certificate Requirements

### Issuer

**PSCE** (Prestataire de Services de Certification Électronique) = Qualified Certification Service Provider

RGS requires:

- Official qualification by ANSSI
- Compliance with certification policies (PC Annexes A2, A3, A5)
- Regular audits by qualified auditors
- Published on ANSSI website

### Certificate Format

**X.509 v3** with proper extensions:

- Subject DN (Distinguished Name)
- Subject Alternative Names (SANs)
- Key Usage extensions (digitalSignature, keyEncipherment, etc.)
- Extended Key Usage (serverAuth, clientAuth, etc.)
- Certificate Policies extension
- Authority Information Access (AIA) with OCSP/CRL endpoints

### Available Certificate Categories

| Type                           | Single-Use | Dual-Use              | Levels       | RFC/Standard |
| ------------------------------ | ---------- | --------------------- | ------------ | ------------ |
| **Person Authentication**      | ✅ Yes     | ✅ (with Signature)   | \*, **, \*** | RFC 5280     |
| **Server Authentication**      | ✅ Yes     | ❌ No                 | \*, **, \*** | RFC 5280     |
| **Digital Signature**          | ✅ Yes     | ✅ (with Person Auth) | \*, **, \*** | RFC 5280     |
| **Seal (Cachet)**              | ✅ Yes     | ❌ No                 | \*, **, \*** | RFC 5280     |
| **Confidentiality/Encryption** | ✅ Yes     | ❌ No                 | \*, **, \*** | RFC 5280     |

### 3 Security Levels for Certificates

- **Level \* (Basic Security)**

  - Suitable for: Public information, non-sensitive transactions
  - Protection against: Passive threats
  - Examples: Public website authentication, non-regulated e-services

- **Level ** (Intermediate Security)\*\*

  - Suitable for: Sensitive business data, authenticated services
  - Protection against: Active threats, moderate attacks
  - Examples: Administrative services, user authentication, internal systems

- **Level \*** (Maximum Security)\*\*
  - Suitable for: Legal commitments, financial transactions, long-term proof
  - Protection against: Sophisticated attackers, long-term security
  - Examples: Government signing, legal documents, financial transactions

---

## Authentication via Electronic Certificates

### Purpose

Verify entity identity (person or machine) by validating digital proof of private key possession

### Implementation Requirements

**4 Components Required** (per RGS A1 annex):

1. **Keypair (bi-clé) + Certificate**

   - X.509 v3 with `digitalSignature` key usage
   - Private key securely generated & stored
   - Public key in certificate

2. **Authentication Device**

   - Smart card, USB token, trusted OS, or HSM
   - Prevents private key extraction
   - Secured against physical attacks

3. **Verification Module**

   - Validates signature from authentication device
   - Proves key possession without revealing key
   - Challenge-response protocol

4. **Authentication Application**
   - Enterprise auth system, single sign-on (SSO)
   - Integrates with directory (LDAP, Active Directory)
   - Logs authentication attempts

### Technical Requirements

- [ ] **Certificate Chain Support**: Full verification from leaf to trusted root
- [ ] **Revocation Checking**: OCSP or CRL validation required (not mandatory, but recommended)
- [ ] **Secure Key Storage**:
  - Level \*: Software (encrypted) acceptable
  - Level \*\*: Hardware token (smart card) preferred
  - Level \*\*\*: HSM or secure element mandatory
- [ ] **Identification vs Authentication** Distinction:
  - **Identification**: User communicates known identifier (username, email)
  - **Authentication**: User proves they hold the private key (signature verification)

### Validation Process

```
User → Input Identifier (Identification)
         ↓
System → Issue Challenge
         ↓
User → Sign Challenge with Private Key (Authentication)
         ↓
System → Verify Signature with Public Key
         ↓
System → Grant Access (if valid)
```

---

## Digital Signatures & Seals

### Digital Signature (Signature Électronique)

**Purpose**: Human-initiated proof of intent and authorship

**Guarantees**:

- **Identity of signer** — Certificate proves signer identity
- **Integrity of signed document** — Hash proves no modifications
- **Non-repudiation** — Signer cannot deny they signed (legal proof)

**Legal Status** (RGS + eIDAS):

- Equivalent to handwritten signature
- Legally binding in French courts
- Long-term validity with timestamp

### Seal (Cachet)

**Purpose**: Machine-initiated proof of integrity and issuer identification

**Guarantees**:

- **Integrity of exchanged information** — Hash proves no modifications
- **Identification of service** — Certificate proves system identity
- **Non-repudiation** — System cannot deny it sealed data

**Use Cases**:

- Automated API responses
- Batch document processing
- System-to-system integrity proof

### Implementation Requirements

**4 Components Required** (same as signature signing):

1. **Private Key Device**

   - Secure creation/storage of signature device
   - Protected RSA-2048+ or ECDSA keypair

2. **Signature Application**

   - Creates signature/seal
   - Hash data with SHA-256+
   - Sign hash with private key

3. **Verification Module**

   - Validates signatures
   - Recovers signer public key from certificate
   - Verifies signature cryptographically

4. **Timestamp Token**
   - Optional but strongly recommended
   - Provides non-repudiation of timestamp
   - Prevents signature stripping attacks

### Algorithm Requirements

```
Document
   ↓
Hash (SHA-256+)
   ↓
Hash Value (32+ bytes)
   ↓
Sign with Private Key (RSA-2048+ or ECDSA)
   ↓
Signature (128-256 bytes)
```

### Special Case: "Legally Presumed Reliable" Signature

**Legal Framework**: Code civil Article 1316-4

**Requirements**:

- RGS Level \*\*\* certificate (from qualified PSCE)
- Qualified timestamp from PSHE
- Specific key sizes & algorithms per RGS B2

**Consequence**:

- Automatically considered "presumed reliable" in French law
- No additional proof of authenticity needed
- Meets both eIDAS (EU) and RGS (France) standards
- Valid long-term (50+ years)

---

## Confidentiality via Encryption

### Two Protection Approaches

#### 1. Cryptographic Encryption (Primary)

- **AES-256-GCM** strongly preferred
- Field-level encryption for sensitive data
- Separate key management from data storage

#### 2. Access Control (Complementary)

- **RBAC** with "need-to-know" principle
- Database-level permissions
- Implemented near storage (HSM, encrypted disks)

### Implementation Requirements

**4 Components Required**:

1. **Keypair + Certificate**

   - X.509 v3 with `keyEncipherment` key usage
   - Public key encrypts data
   - Private key decrypts data

2. **Encryption Device**

   - Hardware or software
   - Securely generates keypair
   - Prevents key extraction

3. **Encryption Module**

   - Implements cipher algorithm
   - Handles mode of operation
   - Authentication tag generation (GCM)

4. **Decryption Module**
   - Reciprocal cipher process
   - Verifies authentication tag
   - Detects tampering

### Algorithm & Mode Selection

- [ ] **Algorithm**: **AES-256** minimum (AES-192/128 acceptable with justification)
- [ ] **Mode**: **GCM** (authenticated encryption) strongly recommended
- [ ] **Alternative Mode**: CBC with HMAC (if GCM unavailable)
- [ ] **Key Management**:
  - Separate encryption key from signing key
  - Rotate annually minimum
  - Secure storage (HSM, Key Vault)

### Data Classification & Encryption Strategy

- **High-Sensitivity** (PII, financial, medical): Full encryption

  - Patient data, health records
  - Bank account numbers, transactions
  - Social security numbers, addresses
  - Encryption key: AES-256
  - Storage: Encrypted database + encrypted backups

- **Medium-Sensitivity** (Business logic, timestamps): Field-level encryption

  - Email addresses (partially masked)
  - Phone numbers
  - Timestamps of actions
  - Encryption key: AES-192
  - Storage: Encrypted specific columns

- **Low-Sensitivity** (Public info, access logs): Access controls sufficient
  - Public website content
  - Non-sensitive error messages
  - Aggregated statistics
  - Storage: Access-controlled, no encryption needed

---

## Electronic Timestamping

### Purpose

Prove existence of data at a **specific moment in time** — non-repudiation of timestamp

### Official Term

**Horodatage Électronique** (French Government) = **Time Stamping Authority (TSA)** (International)

### Issuer

**PSHE** (Prestataire de Services d'Horodatage Électronique) = Qualified Timestamping Service Provider

RGS requires:

- Official qualification by ANSSI
- Compliance with policy in RGS Annex A5
- Published on ANSSI website

### Timestamp Token Structure

**RFC 3161 Format**:

```
Input Document
   ↓
Hash (SHA-256+)
   ↓
Send to TSA over HTTPS
   ↓
TSA Process:
   - Verify request
   - Get current time (atomic clock)
   - Create RFC 3161 TimeStampToken:
     * Hash submitted
     * Current time
     * Serial number (monotonic counter)
     * TSA certificate
     * Signature (RSA-2048+ or ECDSA)
   ↓
Return TimeStampToken to requester
   ↓
Verification Later:
   - Verify timestamp signature (TSA certificate)
   - Check certificate chain (to qualified TSA root)
   - Validate timestamp within expiration (20+ years)
   - Proves: "Document existed at timestamp T"
```

### Key Components

- **Hash Value**: Identified document for later verification
- **Timestamp**: Cryptographically signed by TSA
- **Serial Number**: Prevents duplicate timestamps
- **Chain of Custody**: Proves TSA legitimacy

### Single Security Level

Unlike certificates (\*, **, \***), timestamping has **one level only** per RGS Annex A5:

- **Maximum security requirements** apply to all
- No downgrade options
- Ensures long-term validity

### Legally Presumed Reliable Timestamp

**Legal Framework**: Code civil Articles 1369-7 & 1369-8

**Requirements**:

- PSHE qualified by ANSSI
- TSA module certified per Décret 2002-535
- Accreditation by COFRAC-qualified evaluators

**Consequence**:

- Automatically "presumed reliable" in French law
- Valid long-term (50+ years)
- Accepted in legal proceedings without proof

### Use Cases

1. **Long-Term Non-Repudiation**

   - Sign document, timestamp signature
   - Later: Prove document existed + signatures valid at time T

2. **Legal/Contractual Proof**

   - Email receipt timestamp
   - Document submission proof
   - Transaction timestamp

3. **Audit Trail**
   - Immutable proof of who did what when
   - Resistant to backdating claims

---

## Public Key Infrastructure - IGC/A

### Acronym & Definition

**IGC/A** = **Infrastructure de Gestion de la Confiance de l'Administration**  
= French Administrative Trust Infrastructure

**Role**:

- **Root Certification Authority** for French government
- Managed by **ANSSI** (per RGS §3.2.c)
- Signs intermediate CAs for administrative authorities
- Published in **Journal Officiel** (official gazette)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ ANSSI IGC/A Root CA (Trusted Root)                          │
│ - Published in Journal Officiel (JO)                        │
│ - Integrated in browsers/OS by default                      │
│ - Certificate: RSA-2048+, SHA-256+                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   Level 1 CA    Level 2 CA      PSCE CAs
   (Validated)   (Validated)   (Qualified per §5.2)
        │              │              │
        ├─[User Certs] ├─[Service]─┤ [Qualified Provider]
        │              │            │
        ▼              ▼            ▼
   Admin Agents   Service Apps   E-Services
   (People)       (Systems)      (Citizens)
```

### Certificate Validation Process (RGS Chapter 6)

**Timeline**: 3 years from RGS publication (or 3 months from issuance)

**Steps**:

1. **Authority Prepares Dossier** (2-4 weeks)

   - Certification Policy (CP) document
   - Signed by authority leadership
   - Audit report per RGS Annex C

2. **Submit to ANSSI** (official channel)

   - Email to rgs@ssi.gouv.fr
   - Include: CP, audit results, procedures document

3. **ANSSI Reviews** (2 months max)

   - Verify CP conformance to RGS A2/A3
   - Check audit quality
   - May request on-site verification

4. **Authority Publishes Certificate**

   - If no non-conformity within 2 months
   - Certificate published on ANSSI website
   - Integrated into government directories

5. **Continuous Compliance**
   - Authority maintains CP compliance
   - Annual audit required
   - Renewal upon CP changes

### Benefits

- **Automatic Browser Trust**: Root CA integrated in browsers
- **Legal Presumption**: Certificate integrity presumed valid
- **Simplified Validation**: Chain verification automatic
- **Government Endorsement**: ANSSI-backed trust

---

## Algorithm Requirements

### Symmetric Ciphers (For Encryption at Rest & Transport)

#### AES (Advanced Encryption Standard)

**Standard**: NIST FIPS 197

**Approved by RGS**: ✅ All AES variants suitable

| Key Size    | Security Strength   | Suitable For              | RGS Level    |
| ----------- | ------------------- | ------------------------- | ------------ |
| **AES-256** | 256 bits (maximum)  | All scenarios             | \*, **, \*** |
| **AES-192** | 192 bits (high)     | Most scenarios            | \*, **, \*** |
| **AES-128** | 128 bits (moderate) | Acceptable, not preferred | \*, **, \*** |

**Recommendation Hierarchy**:

1. **AES-256** — Use when performance permits, future-proof
2. **AES-192** — Balanced security/performance
3. **AES-128** — Acceptable minimum (2048-bit RSA equivalent)

**Not Approved**:

- ❌ **DES** (Data Encryption Standard) — 56-bit key, broken
- ❌ **3DES** — Deprecated, triple encryption unnecessary
- ❌ **RC4** — Proven weak stream cipher
- ❌ **Blowfish** — 64-bit blocksize too small for large volumes

### Symmetric Modes (How Encryption Happens)

#### GCM (Galois Counter Mode) — **STRONGLY RECOMMENDED**

**Standard**: NIST SP 800-38D

**Properties**:

- ✅ Authenticated encryption (AEAD - Authenticated Encryption with Associated Data)
- ✅ Detects tampering automatically
- ✅ No separate HMAC needed
- ✅ Efficient (parallel processing possible)
- ✅ Authenticated metadata (additional data not encrypted, but verified)

**Example**:

```
Plaintext + Key + IV → AES-GCM → Ciphertext + Authentication Tag

Verification:
Ciphertext + Key + IV → Decrypt & Verify → Plaintext (if tag valid)
                                         → Error (if tag invalid = tampering)
```

#### CBC (Cipher Block Chaining) — **Acceptable if necessary**

**Standard**: NIST SP 800-38A

**Properties**:

- ✅ Deterministic encryption
- ⚠️ Requires separate HMAC for authentication (not authenticated)
- ⚠️ Sequential (cannot parallelize)
- ⚠️ Requires PKCS#7 padding (variable ciphertext length)

**When to use**: Legacy systems; new implementations prefer GCM

**With HMAC**:

```
Plaintext → AES-CBC → Ciphertext
                         ↓
Ciphertext → HMAC-SHA256 → Authentication Tag

Verification:
Ciphertext → HMAC-SHA256 → Computed Tag
                              ↓
Compare: Computed Tag == Received Tag?
```

**Not Approved**:

- ❌ **ECB** (Electronic Code Book) — Never, reveals plaintext patterns

```
Example of ECB weakness:
Plaintext:  SECRETDATA SECRETDATA SECRETDATA
ECB output: XYZABC     XYZABC     XYZABC       ← Same plaintext = same ciphertext!
CBC output: XYZABC     PQRSTU     LMNOPQ       ← Different (IV randomization)
```

### Asymmetric Encryption (For Key Wrapping, Public Key Encryption)

#### RSA (Rivest-Shamir-Adleman)

**Standard**: PKCS #1 v2.2 (RFC 8017)

**Approved by RGS**:

- ✅ **RSA-2048 or larger** — 2048-bit key minimum
- ✅ **RSA-3072, RSA-4096** — Stronger alternatives
- ❌ **RSA-1024 or less** — Broken, not acceptable
- ❌ **RSA-512** — Broken decades ago

**Use Cases**:

- Certificate in X.509 format
- Key wrapping (encrypt AES key with RSA public key)
- Digital signatures (see below)

**Padding**:

- ✅ **OAEP** (Optimal Asymmetric Encryption Padding) — Recommended
- ❌ **PKCS#1 v1.5** — Legacy, has vulnerabilities

#### ECDSA (Elliptic Curve Digital Signature Algorithm)

**Standard**: FIPS 186-4

**Approved by RGS**:

- ✅ **ECDSA P-256** (secp256r1) — 256-bit security
- ✅ **ECDSA P-384** (secp384r1) — 384-bit security
- ✅ **ECDSA P-521** (secp521r1) — 521-bit security
- ❌ **ECDSA P-192** — Too weak

**Advantages over RSA**:

- Smaller key sizes (P-256 ≈ RSA-3072 security)
- Faster signature generation
- More efficient for TLS handshakes

**Use Cases**:

- Digital signatures
- TLS certificates
- Faster alternative to RSA

### Hash Functions (For Integrity, Signing, Hashing Passwords)

#### Approved Hash Functions

| Algorithm               | Output Size | RGS Status      | Notes                            |
| ----------------------- | ----------- | --------------- | -------------------------------- |
| **SHA-256**             | 256 bits    | ✅ Minimum      | FIPS 180-4 approved              |
| **SHA-384**             | 384 bits    | ✅ Recommended  | FIPS 180-4 approved              |
| **SHA-512**             | 512 bits    | ✅ Recommended  | FIPS 180-4 approved              |
| **SHA-3 (256/384/512)** | Variable    | ✅ Future-proof | NIST FIPS 202 approved           |
| **BLAKE2b**             | 512 bits    | ✅ Emerging     | Not yet official RGS, but modern |

**Not Approved**:

- ❌ **SHA-1** — Cryptographically broken (collision found)
- ❌ **MD5** — Completely insecure (collision in microseconds)
- ❌ **RIPEMD-160** — Legacy, avoid

**Recommendation Hierarchy**:

1. **SHA-256** — Standard for RGS
2. **SHA-384/SHA-512** —Stronger, recommended for long-term
3. **SHA-3** — Future-proof, newer systems

**Use Cases**:

- Digital signature (hash document, sign hash)
- Password hashing (with KDF, not alone)
- HMAC (message authentication code)
- Integrity checking

### HMAC (Hash-Based Message Authentication Code)

**Standard**: RFC 2104

**Purpose**: Authenticate message + detect tampering

**Approved by RGS**:

- ✅ **HMAC-SHA256** — Standard
- ✅ **HMAC-SHA384** — Stronger
- ✅ **HMAC-SHA512** — Even stronger
- ❌ **HMAC-MD5** — Weak

**Use Cases**:

- TLS handshake (pseudorandom function)
- API request signing
- Session token generation

### Key Derivation Functions (KDF) — For Passwords & Key Material

#### PBKDF2 (Password-Based Key Derivation Function 2)

**Standard**: RFC 2898 / PKCS #5

**Requirements**:

- **Iterations**: 100,000+ minimum (2024: use 600,000+)
- **Hash Function**: SHA-256+ (never MD5, SHA-1)
- **Salt**: Random, at least 16 bytes

**Approved by RGS**: ✅ With SHA-256+ and 100k+ iterations

**Example**:

```
Password + Random Salt → PBKDF2(iterations=100000, hash=SHA256) → 256-bit Key
```

#### bcrypt

**Standard**: OpenBSD standard

**Properties**:

- ✅ Automatic salt generation
- ✅ "Cost factor" adjustable over time
- ✅ Modern password hashing standard
- ✅ Slower by design (prevents brute force)

**Approved by RGS**: ✅

**Use Cases**:

- Password hashing (in user database)
- Automatic adaptation to faster hardware

#### Argon2 (LATEST - 2015)

**Standard**: Password Hashing Competition Winner

**Variants**:

- **Argon2i** — Cache-timing resistant (for passwords)
- **Argon2id** — Balanced (recommended)

**Properties**:

- ✅ State-of-art (2024)
- ✅ Memory-hard (resists GPU attacks)
- ✅ Time-hard (configurable iterations)
- ✅ Automatically updates as hardware improves

**Approved by RGS**: ✅ (Emerging, strong recommendation)

**Use**: Password hashing (preferred over bcrypt for new systems)

#### NOT Approved for Password Hashing

- ❌ **Plain SHA-256** — Fast = vulnerable to brute force
- ❌ **Plain MD5** — Completely broken
- ❌ **Plain bcrypt without salt** — Impossible (bcrypt always salts)
- ❌ **Salted SHA-256 (no iterations)** — Too fast for passwords

---

## Transport Layer Security (TLS/HTTPS)

### Protocol Version Requirements

#### TLS 1.3 (2018) — **PREFERRED**

**Standard**: RFC 8446

**RGS Status**: ✅ Strongly recommended

**Advantages**:

- No legacy cipher suites (eliminates RC4, DES, etc.)
- Faster handshake (1 RTT instead of 2)
- Perfect Forward Secrecy by default
- Simplified configuration

**Approved Cipher Suites** (TLS 1.3):

| Cipher Suite                     | Algorithm            | RGS Status     | Notes                 |
| -------------------------------- | -------------------- | -------------- | --------------------- |
| **TLS_AES_256_GCM_SHA384**       | AES-256-GCM + SHA384 | ✅ PREFERRED   | Strongest standard    |
| **TLS_AES_256_GCM_SHA256**       | AES-256-GCM + SHA256 | ✅ Recommended | Also strong           |
| **TLS_CHACHA20_POLY1305_SHA256** | ChaCha20 + Poly1305  | ✅ Modern      | Efficient, AEAD       |
| **TLS_AES_128_GCM_SHA256**       | AES-128-GCM + SHA256 | ⚠️ Acceptable  | Weaker, not preferred |

**Not Approved** (TLS 1.3):

- ❌ Any cipher with NULL, RC4, DES, 3DES
- ❌ Any with MD5 or SHA-1 (removed from TLS 1.3)

#### TLS 1.2 (2008) — **Minimum, If 1.3 Unavailable**

**Standard**: RFC 5246

**RGS Status**: ⚠️ Acceptable only with **strong cipher suites**

**Approved Cipher Suites** (TLS 1.2):

| Cipher Suite                      | Algorithm                   | RGS Status    |
| --------------------------------- | --------------------------- | ------------- |
| **ECDHE-RSA-AES256-GCM-SHA384**   | ECDHE (PFS) + AES-256-GCM   | ✅ Preferred  |
| **ECDHE-RSA-AES128-GCM-SHA256**   | ECDHE (PFS) + AES-128-GCM   | ✅ Acceptable |
| **ECDHE-ECDSA-AES256-GCM-SHA384** | ECDHE + AES-256-GCM (ECDSA) | ✅ Preferred  |
| **RSA-AES256-GCM-SHA384**         | RSA (no PFS) + AES-256-GCM  | ⚠️ Acceptable |

**Not Approved** (TLS 1.2):

- ❌ **RC4** — Stream cipher, broken
- ❌ **DES, 3DES** — Deprecated
- ❌ **MD5, SHA-1** — Hash functions, broken
- ❌ **NULL cipher** — No encryption

#### TLS 1.1 or Below — **NOT ACCEPTABLE**

- ❌ **TLS 1.0** — Deprecated
- ❌ **SSL 3.0** — Broken
- ❌ **SSL 2.0** — Ancient, insecure

**Recommendation**: Disable entirely; use TLS 1.2 minimum, TLS 1.3 preferred

### Certificate Requirements

For all TLS connections:

- [ ] **X.509 v3 Format** — RFC 5280
- [ ] **Subject Alternative Names (SANs)** — Domain names covered
- [ ] **CN or SAN Matches Hostname** — Prevents MITM
- [ ] **Valid Expiration** — Not self-signed (except internal CA)
- [ ] **Full Certificate Chain** — Leaf → Intermediate → Root (trusted)
- [ ] **Issuer Qualified** — PSCE recommended for government systems

### Security Headers

Send these HTTP headers with TLS:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  └─ Forces HTTPS for 1 year, all subdomains, HSTS preload list

X-Frame-Options: DENY
  └─ Prevents clickjacking

X-Content-Type-Options: nosniff
  └─ Prevents MIME type sniffing

Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
  └─ Restricts content loading

Referrer-Policy: no-referrer
  └─ Prevents URL leakage in referrers

Permissions-Policy: geolocation=(), microphone=(), camera=()
  └─ Disables unnecessary browser features
```

### Perfect Forward Secrecy (PFS)

**Requirement**: All TLS sessions must support PFS

**Mechanism**: Ephemeral Diffie-Hellman (DHE) or ECDHE

**Why**: If server private key stolen later, past sessions remain secure

**Example**:

```
TLS 1.3 (PFS by default):
  - Ephemeral keypair generated per session
  - Session key derived from ephemeral + long-term key
  - If long-term key stolen: Session key NOT compromised

TLS 1.2 (PFS only if ECDHE/DHE):
  - RSA key transport (no PFS): All sessions compromised if key stolen
  - ECDHE (PFS): Only current session compromised, past safe
```

---

## Key Management Lifecycle

### Phase 1: Generation

**Requirements**:

- [ ] **Cryptographically Secure RNG** only

  - ✅ `/dev/urandom` (Linux/macOS)
  - ✅ `CryptGenRandom` (Windows)
  - ✅ `Random()` in modern crypto libraries (OpenSSL, libsodium)
  - ❌ `rand()` (weak, predictable)
  - ❌ `time()` based (predictable)
  - ❌ `Math.random()` in JavaScript (predictable)

- [ ] **Secure Environment**

  - Generate in isolated, trusted system
  - No Network access during generation
  - Disable swap/virtual memory
  - Protect against side-channel attacks

- [ ] **Entropy Source**
  - Hardware RNG preferred (TPM, Intel RDRAND)
  - Fallback to OS `/dev/urandom`
  - Never mix weak sources

### Phase 2: Storage

**Level \* (Basic) Requirements**:

- [ ] Software storage acceptable
- [ ] Must be encrypted (at minimum)
- [ ] Encrypted configuration file
- [ ] Database column encryption
- [ ] File system encryption

**Level ** (Intermediate) Requirements\*\*:

- [ ] Hardware token strongly preferred

  - Smart card (PKCS#11 interface)
  - USB security token
  - Hardware wallet

- [ ] If software:
  - HSM (Hardware Security Module)
  - Encrypted key vault (AWS KMS, Azure Key Vault)
  - Trusted execution environment (TEE)

**Level \*** (Maximum) Requirements\*\*:

- [ ] **HSM Mandatory**
  - Physically isolated secure element
  - FIPS 140-2 Level 3+ rated
  - Military-grade protection
  - Examples: Thales Luna, Yubico, SoftHSM (for testing)

**Protection Against**:

- Physical theft (locked cabinet, monitoring)
- Memory dumps (process protection)
- Side-channel attacks (timing, power analysis)
- Unauthorized access (role-based, logging)

### Phase 3: Use / Operational Use

**Requirements**:

- [ ] **Private key never leaves storage device**

  - Signature created inside HSM/card
  - Key not exported
  - Cryptographic operation isolated

- [ ] **Access Control**

  - PIN/password protected (HSM)
  - Role-based access (only authorized users)
  - Administrative access logged

- [ ] **Audit Logging**

  - Who (user/service) used key
  - When (timestamp)
  - For what (purpose/operation)
  - Result (success/failure)

- [ ] **Session Management**
  - Timeout after inactivity
  - Automatic logout
  - Session destruction

### Phase 4: Rotation

**RGS Requirement**: **Annual rotation MINIMUM**

**Recommended Schedule**:

- **Critical keys** (root CA, signing keys): Monthly
- **Standard keys** (encryption, TLS): Quarterly (3 months)
- **Non-critical keys** (API keys): Annually
- **All keys**: At minimum annually

**Rotation Process**:

```
Step 1: Generate new keypair
Step 2: Certify new public key (if X.509)
Step 3: Update key references (in configs, databases)
Step 4: Distribute new public key to consumers
Step 5: Continue using old key (grace period: 30-90 days)
Step 6: Phase out old key (stop accepting signatures)
Step 7: Archive old key (encrypted storage)
```

**Documentation**:

- [ ] Key rotation register (date, old/new key IDs)
- [ ] Approval documentation (who authorized rotation)
- [ ] Evidence of distribution (to all systems)
- [ ] Phase-out timeline

### Phase 5: Destruction

**Requirements**:

- [ ] **Secure Deletion** (not just "delete" or format)

  - NIST 800-88 guidelines: Cryptographic erasure
  - Destroy key material, not just filesystem markers
  - Overwrite memory (multiple passes)

- [ ] **Hardware Destruction**

  - If HSM/device decommissioned: Physically destroy
  - Incinerate or crush storage media
  - Certificate of destruction

- [ ] **Cryptographic Erasure**

  - If key backup exists: Destroy with dedicated master key
  - Example: Encrypted key backup → Destroy encryption key → Backup unrecoverable

- [ ] **Documentation**
  - Destruction certificate (date, method, witness)
  - Archive key metadata (for audit trail)

### Phase 6: Backup & Recovery (If Required)

**Requirement**: Test at least annually

**Encrypted Backups**:

- [ ] Encryption key != production key

  - Different KMS, different compartment
  - Separate authorization

- [ ] Backup Location

  - Geographic separation from primary
  - Different facility
  - Different security domain

- [ ] Recovery Procedure

  - Documented step-by-step
  - Tested quarterly (dry runs)
  - Recovery time objective (RTO) defined
  - Recovery point objective (RPO) defined

- [ ] Key Escrow (If Required)
  - Only if mandated by law
  - Separate from operational keys
  - Rigorous access controls

---

## Security Levels Mapping

### Level \* (Basic Security)

**Threat Model**: Passive attackers, low-value targets

**Suitable For**:

- Public information websites
- Non-regulated e-services
- Low-sensitivity transactions

**Algorithm Selection**:

- Symmetric: AES-128 acceptable
- Asymmetric: RSA-2048, ECDSA P-256
- Hash: SHA-256
- Key Storage: Software (encrypted) acceptable

**Lifetime**: 5-10 years acceptable

**Cost**: Minimal

**Example** (Government):

- Public service portal
- General information sites
- Non-authenticated services

### Level \*\* (Intermediate Security)

**Threat Model**: Active attackers, moderate-value targets

**Suitable For**:

- Sensitive business data
- Authenticated services
- Internal systems
- User authentication services

**Algorithm Selection**:

- Symmetric: AES-192/256 preferred
- Asymmetric: RSA-2048+, ECDSA P-256/384
- Hash: SHA-256+
- Key Storage: Hardware token (smart card) preferred

**Additional Controls**:

- Multi-factor authentication
- Certificate pinning
- IP-based access controls

**Lifetime**: 3-5 years

**Cost**: Moderate

**Example** (Government):

- Administrative service (staff portals)
- User authentication
- Department internal systems

### Level \*\*\* (Maximum Security)

**Threat Model**: Sophisticated attackers, high-value targets, long-term protection

**Suitable For**:

- Legal/contractual commitments
- Financial transactions
- Long-term evidentiary value
- Classified information (if applicable)

**Algorithm Selection**:

- Symmetric: AES-256 mandatory
- Asymmetric: RSA-2048+ (or larger), ECDSA P-384/521
- Hash: SHA-384/512, SHA-3
- Key Storage: HSM mandatory

**Additional Controls**:

- Hardware security modules
- Formal legal certification
- Qualified timestamps
- Regular audits

**Lifetime**: 1-3 years (frequent rotation)

**Cost**: High (HSM, qualified services)

**Example** (Government):

- Government signed documents
- Legal contracts (e-signature)
- Financial transaction signing
- Regulatory compliance proof

---

## Implementation Checklist

### Cryptographic Inventory

- [ ] **Algorithm Documentation**

  - List all algorithms in use (encryption, hashing, signing)
  - Document purpose (TLS, database encryption, API signing)
  - Specify key size (AES-256, RSA-2048, etc.)
  - Date implemented

- [ ] **Version Tracking**

  - Library versions (OpenSSL, Boringssl, libsodium)
  - TLS protocol versions
  - Certificate versions (X.509 v3)

- [ ] **Compliance Verification**
  - All algorithms on RGS-approved list
  - All key sizes meet RGS minimums
  - All modes of operation approved (GCM, not ECB)

### Key Inventory

- [ ] **Key Register**

  - List all cryptographic keys
  - Owner/responsible person
  - Purpose (encryption, signing, authentication)
  - Storage location (HSM, KMS, vault)
  - Key ID (unique identifier)
  - Algorithm & key size
  - Generation date
  - Expiration/rotation date
  - Certificate (if applicable)

- [ ] **Access Control**
  - Who can use each key
  - Authorization requirements
  - Access logging enabled

### CSRNG Verification

- [ ] **RNG Source Documentation**

  - List all random number generators in use
  - Verify cryptographically secure
  - No weak RNG (rand(), Math.random(), etc.)

- [ ] **Entropy Testing**
  - Test RNG output (NIST SP 800-22)
  - Verify unpredictability
  - No patterns in output

### HSM/Token Usage

- [ ] **Level ** Keys\*\*

  - All in hardware token (smart card, USB token)
  - Not in software

- [ ] **Level \*** Keys\*\*

  - All in HSM
  - HSM FIPS 140-2 Level 2+ certified
  - Multiple physical protection layers

- [ ] **HSM Configuration**
  - Initialization vector (IV) protection
  - Secure recovery procedures
  - Audit logging enabled

### Rotation Schedule

- [ ] **Schedule Document**

  - Rotation frequency by key type
  - Calendar of upcoming rotations
  - Owner assignments

- [ ] **Rotation History**

  - Log of all past rotations
  - Date, old/new key IDs
  - Approval signatures
  - Distribution evidence

- [ ] **Automation** (Recommended)
  - Automated rotation triggers
  - Monitoring for overdue rotations
  - Alerts for upcoming expirations

### TLS Configuration

- [ ] **Protocol Version**

  - TLS 1.3 enabled (if possible)
  - TLS 1.2 with strong ciphers (minimum)
  - TLS 1.1 and below disabled

- [ ] **Cipher Suites**

  - Only approved suites configured
  - Server cipher suite order (not client-preferred)
  - Weak ciphers disabled

- [ ] **Certificates**

  - Valid hostname matching (CN/SAN)
  - Full chain present
  - Not self-signed (unless internal CA)
  - Revocation checking enabled (OCSP stapling)

- [ ] **Security Headers**
  - HSTS enabled (at least 31536000 seconds)
  - X-Frame-Options set
  - X-Content-Type-Options: nosniff
  - CSP configured

### Certificate Chain Verification

- [ ] **Leaf Certificate**

  - X.509 v3 format
  - Valid signature
  - Hostname matches
  - Not expired

- [ ] **Intermediate Certificates**

  - Complete chain to root
  - Proper constraints (BasicConstraints, KeyUsage)
  - Valid signatures

- [ ] **Root Certificate**

  - Trusted root anchor
  - In OS/browser trust store
  - Valid signature (self-signed)

- [ ] **Revocation Checking**
  - OCSP or CRL endpoint configured
  - Responses cached (not every request)
  - Timeout handling documented

### Disaster Recovery Testing

- [ ] **Key Backup Location**

  - Identified and documented
  - Separate geographic location
  - Climate controlled, secure storage

- [ ] **Recovery Procedure**

  - Step-by-step documentation
  - Tested at least quarterly (dry run)
  - RTO/RPO defined and achievable

- [ ] **Training**
  - Key staff trained on recovery
  - Documented contacts (on-call)
  - Succession planning

### Compliance Audit

- [ ] **Third-Party Audit**

  - Annual or bi-annual certification
  - Qualified auditor (per RGS Annex C)
  - Full crypto implementation review

- [ ] **Audit Scope**

  - Algorithm selection
  - Key management practices
  - Certificate validity
  - TLS configuration
  - Disaster recovery testing

- [ ] **Remediation**
  - Outstanding findings tracked
  - Timelines for fixes
  - Evidence of closure

---

## References

**Official RGS Documents**:

- RGS v2.0 (Arrêté du 13 juin 2014)
- Annex B1 — Cryptographic Rules
- Annex B2 — Algorithm Sizing (this document)
- Annex B3 — Authentication Mechanisms
- Annexes A2, A3, A5 — Certification/Timestamping Policies

**Regulatory Basis**:

- Décret n° 2010-112 du 2 février 2010 (RGS Decree)
- Ordonnance n° 2005-1516 du 8 décembre 2005
- Code civil Articles 1316-4 (signature), 1369-7/8 (timestamps)

**International Standards**:

- RFC 5280 — X.509v3 Certificates
- RFC 3161 — Time Stamp Protocol
- NIST FIPS 186-4 — ECDSA
- NIST FIPS 197 — AES
- NIST SP 800-38D — GCM Mode
- ISO/IEC 27001 — Information Security Management

**ANSSI Publications**:

- ANSSI website: https://www.ssi.gouv.fr
- Qualified products list: https://www.ssi.gouv.fr/fr/produits-et-prestataires/produits-qualifies/
- Qualified service providers: https://www.ssi.gouv.fr/fr/produits-et-prestataires/prestataires-de-services-de-confiance-qualifies/
