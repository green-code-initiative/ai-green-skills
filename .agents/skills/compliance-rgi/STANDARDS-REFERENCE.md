# RGI Standards Reference & Adoption Criteria

## Overview

This document details the **standards referenced in RGI v2.0** organized by technical level and provides the **adoption criteria** for evaluating standards in your own systems.

---

## RGI Standard Selection Criteria

Every standard in the RGI meets these 6 criteria:

### 1. **Open** 🔓

- Specification is **public and accessible** at low/zero cost
- Maintained by **non-profit organization** (W3C, IETF, ISO, OASIS)
- **Transparent decision process** for evolution
- **Royalty-free licensing** compatible with open-source

### 2. **Relevant** ✅

- **Widely adopted** by market leaders
- **Recognized necessity** for interoperability
- **Active user community** providing feedback

### 3. **Mature** 🔧

- **Proven in production** environments
- **Backward-compatible** evolution path
- **Stable** (not experimental)
- **Multiple implementations** available

### 4. **Independent** 🆕

- **No vendor lock-in** — works with multiple vendors
- **No proprietary dependencies** — uses other open standards
- **Multilingual support** by default

### 5. **Easy to Deploy** 📦

- **Reasonable implementation costs** (human + material)
- **Available in solutions** (both open-source and proprietary)
- **Documented** with guides and examples

### 6. **Industry Supported** 🏢

- **Multiple vendor implementations** available
- **Professional consulting/support** from many providers
- **Scientific/research backing** (universities, labs)

---

## Technical Layer Standards

### Network Level

| Standard  | Status         | Purpose                                 | RFC/Reference |
| --------- | -------------- | --------------------------------------- | ------------- |
| **IPv6**  | ✅ Recommended | Next-gen IP with expanded address space | RFC 2460      |
| **IPv4**  | 🕐 End-of-Life | Legacy IP (32-bit addresses)            | RFC 791       |
| **IPSec** | ✅ Recommended | Network-level encryption and auth       | RFC 4301-4309 |

**Implementation Notes**:

- Deploy **IPv6 with IPv4 fallback** for maximum compatibility
- Use IPSec for **VPN and site-to-site security**

---

### Transport Level

| Standard     | Status         | Purpose                          | RFC/Reference |
| ------------ | -------------- | -------------------------------- | ------------- |
| **TCP**      | ✅ Recommended | Reliable, ordered delivery       | RFC 793       |
| **UDP**      | ✅ Recommended | Fast, connectionless (DNS, VoIP) | RFC 768       |
| **NTP**      | ✅ Recommended | Clock synchronization            | RFC 5905      |
| **RTP**      | ✅ Recommended | Real-time media (audio/video)    | RFC 3550      |
| **SRTP**     | ✅ Recommended | Secure RTP                       | RFC 3711      |
| **RTCP**     | ✅ Recommended | RTP control/monitoring           | RFC 3550      |
| **TLS 1.2+** | ✅ Recommended | Encrypted transport              | RFC 5246      |
| **SSL 3.0**  | ❌ Retired     | Legacy encryption (DO NOT USE)   | —             |

**Implementation Guidelines**:

- **Always use TLS 1.2 or higher** for encryption
- **TCP** for reliable transfer (HTTP, SMTP, FTP)
- **UDP** for real-time (VoIP, gaming, streaming)
- **NTP** for server clock sync (1-2 minute accuracy)

---

### Session Level

| Standard | Status         | Purpose              | RFC/Reference |
| -------- | -------------- | -------------------- | ------------- |
| **SSH**  | ✅ Recommended | Secure remote access | RFC 4251-4254 |

**Implementation Notes**:

- Use **SSH for system administration** (never telnet)
- Enforce **key-based auth** (disable password)
- Rotate keys **annually**

---

## Application Layer Standards

### Transfer & Transport

| Standard     | Status         | Purpose                          | RFC/Reference        |
| ------------ | -------------- | -------------------------------- | -------------------- |
| **HTTP/1.1** | ✅ Recommended | Web transfer protocol            | RFC 7230-7237        |
| **HTTPS**    | ✅ Recommended | Secure HTTP over TLS             | RFC 2818             |
| **HTTP/2**   | 📊 Observation | Multiplexed, faster HTTP         | RFC 7540             |
| **CORS**     | ✅ Recommended | Cross-origin resource sharing    | W3C Spec             |
| **FTP**      | 🕐 End-of-Life | File transfer (use SFTP instead) | RFC 959              |
| **SFTP**     | ✅ Recommended | Secure file transfer             | RFC 4251 (SSH-based) |
| **AMQP**     | ✅ Recommended | Message queue protocol           | ISO/IEC 19464        |
| **AS2**      | ✅ Recommended | Secure EDI messaging             | IETF RFC 4130        |

**Implementation Checklist**:

- ✅ Use **HTTPS everywhere** (TLS 1.2+)
- ✅ Set **CORS headers** for legitimate cross-domain access
- ✅ Never use **FTP** (use SFTP instead)
- ✅ Use **AMQP** for async message queues (RabbitMQ, etc.)

---

### DNS & Domain

| Standard   | Status         | Purpose                | RFC/Reference |
| ---------- | -------------- | ---------------------- | ------------- |
| **DNS**    | ✅ Recommended | Domain name resolution | RFC 1035      |
| **DNSSEC** | ✅ Recommended | DNS security extension | RFC 4033      |

**Implementation Notes**:

- Enable **DNSSEC** to prevent DNS spoofing
- Use **DNS over HTTPS (DoH)** for privacy when needed

---

### Authentication & Authorization

| Standard           | Status         | Purpose                     | RFC/Reference     |
| ------------------ | -------------- | --------------------------- | ----------------- |
| **OpenPGP**        | ✅ Recommended | Email encryption/signing    | RFC 4880          |
| **SAML v2.0**      | ✅ Recommended | Enterprise federation (SSO) | OASIS             |
| **OAuth 2.0**      | ✅ Recommended | Delegated authorization     | RFC 6749          |
| **OpenID Connect** | ✅ Recommended | OAuth 2.0 + identity        | OpenID Foundation |
| **JWT**            | ✅ Recommended | Stateless token format      | RFC 7519          |

**Implementation Guide**:

- **OAuth 2.0** for third-party integrations (web, mobile)
- **OpenID Connect** for federated identity (SSO)
- **SAML 2.0** for enterprise/government federations
- **JWT** for stateless authentication (inside OAuth 2.0)

```typescript
// ✅ OpenID Connect flow
POST /oauth/authorize?
  client_id=my-app&
  response_type=code&
  scope=openid%20profile%20email&
  redirect_uri=https://myapp.fr/callback

// User authenticates at identity provider (FranceConnect)
// Returns with authorization code

POST /oauth/token
  code=auth_code&
  client_id=my-app&
  client_secret=secret

// Receive ID token (JWT) with user claims
// Use to set up session
```

---

### Web Services

| Standard        | Status         | Purpose                            | RFC/Reference      |
| --------------- | -------------- | ---------------------------------- | ------------------ |
| **SOAP v1.2**   | ✅ Recommended | XML-based web services             | W3C                |
| **WSDL**        | ✅ Recommended | Service description language       | W3C                |
| **UDDI**        | 📊 Observation | Service registry (declining usage) | OASIS              |
| **REST**        | ✅ Recommended | Architectural style (not standard) | Fielding 2000      |
| **OpenAPI 3.0** | ✅ Recommended | REST API specification             | OpenAPI Initiative |
| **JSON-LD**     | ✅ Recommended | Linked data in JSON                | W3C                |

**Implementation Notes**:

- **REST + OpenAPI 3.0** is modern choice for new APIs
- **SOAP** primarily for enterprise/legacy systems
- Consider **GraphQL** as complement to REST (not yet in RGI)

---

### Service Orchestration

| Standard    | Status         | Purpose                     | RFC/Reference |
| ----------- | -------------- | --------------------------- | ------------- |
| **WS-BPEL** | ✅ Recommended | Business process automation | OASIS         |
| **WS-CDL**  | ✅ Recommended | Choreography description    | W3C           |

---

### Geospatial

| Standard | Status         | Purpose                 | RFC/Reference |
| -------- | -------------- | ----------------------- | ------------- |
| **WMS**  | ✅ Recommended | Web Map Service         | OGC           |
| **WFS**  | ✅ Recommended | Web Feature Service     | OGC           |
| **WMTS** | ✅ Recommended | Web Map Tile Service    | OGC           |
| **CSW**  | ✅ Recommended | Catalog Service for Web | OGC           |
| **WCS**  | ✅ Recommended | Web Coverage Service    | OGC           |
| **WPS**  | ✅ Recommended | Web Processing Service  | OGC           |

---

## Syntactic Layer Standards

### Encoding

| Standard        | Status         | Purpose                      | RFC/Reference |
| --------------- | -------------- | ---------------------------- | ------------- |
| **UTF-8**       | ✅ Recommended | Unicode text encoding        | RFC 3629      |
| **UTF-16**      | ✅ Recommended | Unicode with surrogate pairs | Unicode Std   |
| **ISO 8859-15** | 🕐 End-of-Life | Western European (Latin-9)   | ISO/IEC 8859  |
| **GZIP**        | ✅ Recommended | Compression                  | RFC 1952      |
| **DEFLATE**     | ✅ Recommended | Compression                  | RFC 1951      |

**Recommendation**: Use **UTF-8 exclusively** for all new systems

---

### Document Formats

| Standard  | Status         | Purpose                | RFC/Reference       |
| --------- | -------------- | ---------------------- | ------------------- |
| **HTML5** | ✅ Recommended | Web markup             | W3C Living Standard |
| **PDF**   | ✅ Recommended | Document format        | ISO 32000-1         |
| **ODF**   | ✅ Recommended | Office document format | ISO/IEC 26300       |
| **OOXML** | ✅ Recommended | Microsoft Office XML   | ISO/IEC 29500       |

---

### Data Structuring & Exchange

| Standard        | Status         | Purpose                  | RFC/Reference             |
| --------------- | -------------- | ------------------------ | ------------------------- |
| **JSON**        | ✅ Recommended | Lightweight data format  | RFC 7158                  |
| **JSON Schema** | ✅ Recommended | JSON validation          | draft-bhutton-json-schema |
| **XML**         | ✅ Recommended | Structured data markup   | W3C XML Spec              |
| **XSD**         | ✅ Recommended | XML schema/validation    | W3C XSD Spec              |
| **CSV**         | ✅ Recommended | Tabular data exchange    | RFC 4180                  |
| **RDF**         | ✅ Recommended | Semantic web data model  | W3C RDF Spec              |
| **Turtle**      | ✅ Recommended | RDF triple serialization | W3C Turtle Spec           |
| **SPARQL**      | ✅ Recommended | RDF query language       | W3C SPARQL Spec           |
| **OWL**         | ✅ Recommended | Web ontology language    | W3C OWL Spec              |

**Data Format Selection**:

```
New APIs              → JSON (lightweight, widely supported)
Enterprise legacy     → XML (mature tooling, strict validation)
Data export/import    → CSV (universal, user-friendly)
Semantic/linked data  → RDF/JSON-LD (ontologies, reasoning)
```

---

### Identifiers & Standards

| Standard       | Status         | Purpose                   | RFC/Reference |
| -------------- | -------------- | ------------------------- | ------------- |
| **UUID**       | ✅ Recommended | Unique identifiers        | RFC 4122      |
| **URN**        | ✅ Recommended | Uniform Resource Name     | RFC 3986      |
| **ISO 3166-1** | ✅ Recommended | Country codes (2-letter)  | ISO           |
| **ISO 639-1**  | ✅ Recommended | Language codes (2-letter) | ISO           |
| **ISO 4217**   | ✅ Recommended | Currency codes (EUR, USD) | ISO           |
| **ISO 8601**   | ✅ Recommended | Date/time format          | ISO           |

**Implementation Example**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000", // UUID
  "country": "FR", // ISO 3166-1
  "language": "fr", // ISO 639-1
  "currency": "EUR", // ISO 4217
  "created": "2024-04-01T10:30:00Z" // ISO 8601
}
```

---

### Multimedia

| Standard       | Status         | Purpose                         | RFC/Reference  |
| -------------- | -------------- | ------------------------------- | -------------- |
| **H.264/AVC**  | ✅ Recommended | Video codec                     | ITU-T          |
| **H.265/HEVC** | ✅ Recommended | Next-gen video                  | ITU-T          |
| **WebM**       | ✅ Recommended | Open video format               | Google/VP8-VP9 |
| **AAC**        | ✅ Recommended | Audio codec                     | ISO/IEC        |
| **Vorbis**     | ✅ Recommended | Open audio codec                | Xiph           |
| **MP3**        | 🕐 End-of-Life | Legacy audio (licensing issues) | —              |
| **PNG**        | ✅ Recommended | Lossless image                  | W3C PNG Spec   |
| **JPEG**       | ✅ Recommended | Lossy image                     | ISO/IEC 10918  |
| **WebP**       | ✅ Recommended | Modern image format             | Google         |

---

### Signature & Security

| Standard  | Status         | Purpose                      | RFC/Reference |
| --------- | -------------- | ---------------------------- | ------------- |
| **CMS**   | ✅ Recommended | Cryptographic Message Syntax | RFC 5652      |
| **PKIX**  | ✅ Recommended | Public Key Infrastructure    | RFC 5280      |
| **X.509** | ✅ Recommended | Digital certificates         | ITU-T         |
| **CAdES** | ✅ Recommended | EU digital signatures        | ETSI          |

---

## Common Mistakes When Implementing RGI

❌ **Don't**:

- Use custom binary formats instead of JSON/XML
- Neglect error response standardization
- Create APIs without OpenAPI documentation
- Use sequential IDs (security/privacy risk)
- Hardcode ISO dates instead of parsing properly
- Ignore pagination (slow queries on large datasets)
- Deploy non-HTTPS endpoints
- Forget CORS for legitimate cross-domain needs

✅ **Do**:

- Use **JSON for REST APIs**, XML for enterprise
- Document **all error codes and meanings**
- Publish **OpenAPI 3.0 schema** at `/api/docs`
- Use **UUID v4 for identifiers**
- Always **parse dates as ISO 8601** (timezone aware)
- Implement **pagination from day one**
- Enforce **HTTPS everywhere** (TLS 1.2+)
- Enable **CORS headers** consciously

---

## References

- **RGI v2.0**: https://www.numerique.gouv.fr/offre-accompagnement/reference-interoperabilite-rgi/
- **RFC Standards**: https://tools.ietf.org/
- **W3C Standards**: https://www.w3.org/
- **OGC Geospatial**: https://www.ogc.org/
- **OASIS Enterprise Standards**: https://www.oasis-open.org/
