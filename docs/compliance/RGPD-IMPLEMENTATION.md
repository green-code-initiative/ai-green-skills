# Project-RGPD Implementation Guide

This guide explains how to implement GDPR/RGPD data protection standards in Project's full stack.

> **Prerequisites**:
>
> - Read [`@skill compliance-rgpd`](../../.agents/skills/compliance-rgpd/) for general data protection knowledge
> - Review [`ADR-009: RGPD Compliance Infrastructure`](../adr/ADR-009-RGPD-compliance-infrastructure.md) for governance requirements & 4-phase roadmap
> - See [`COMPLIANCE-MATRIX.md`](COMPLIANCE-MATRIX.md) for cross-standard dependencies & consolidated timeline
> - Cross-reference: [`RGS-IMPLEMENTATION.md`](RGS-IMPLEMENTATION.md) (security controls needed for RGPD compliance) and [`RGI-IMPLEMENTATION.md`](RGI-IMPLEMENTATION.md) (API design for user rights)

**Current Status**: This document covers **Technical Implementation** of RGPD principles. **CRITICAL GOVERNANCE PHASE (ADR-009 Phase 1)** is separate and must be completed in Q2 2026 (see "Phase 0" below).

## 🔐 Project Data Protection Architecture

### Stack

- **Framework**: NestJS 9.x backend + React frontend
- **Database**: PostgreSQL with TypeORM
- **Encryption**: bcrypt for passwords, field-level encryption available
- **Logging**: Pino (structured, sanitized)
- **User Management**: User + Profile entities with cascade deletion
- **Data Export**: JSON/CSV endpoints for portability

### Key Locations

- **User & Profile Entities**: `libs/server/entities/src/lib/user/`
- **User Service**: `apps/api/src/modules/user/user.service.ts`
- **Anonymization**: `apps/api/src/modules/anonymizationRequest/`
- **Data Access**: `apps/api/src/modules/*/[resource].repository.ts`

---

## ⚠️ Phase 0: Governance & Legal Documentation (Q2 2026 — CRITICAL)

**Status**: 🔴 **MISSING** — Blocks GDPR compliance accreditation  
**Timeline**: By May 31, 2026  
**Owner**: Legal Team + CTO

### Required Documents (Per ADR-009 Phase 1)

This technical implementation assumes **legal foundation documents** exist. If they do not, **Project is not GDPR compliant** regardless of code quality.

> **🔴 CRITICAL WARNING**: Organizations implementing GDPR without these documents face fines up to €20M.

#### 1. Privacy Policy (`docs/PRIVACY-POLICY.md`)

**What it is**: Plain-language explanation of how Project processes personal data  
**Status**: ❌ NOT CREATED (Due: May 15, 2026)  
**Contents required**:

```markdown
# Project Privacy Policy

## 1. Data Controller & DPO

- Who is responsible? (Company name, legal address)
- DPO contact: [email]

## 2. Data We Collect

- User registration (email, name)
- Workshop attendance
- Learning recommendations
- Azure Graph sync (if applicable)
- Degreed integrations (if applicable)

## 3. Why We Collect It (Lawful Basis)

See Lawful Basis Matrix below

## 4. Who We Share With

- Internal teams (engineers, support)
- Third-party services: Azure, Degreed, Mailpit
- (Link to DPAs)

## 5. How Long We Keep It

See Data Retention Schedule below

## 6. Your Rights

- Access your data: GET /api/v1/profiles/me/export
- Delete your data: DELETE /api/v1/users/me
- Restrict processing: (Feature in Q3)
- Object to processing: (Feature in Q3)

## 7. Contact Us

Privacy questions: privacy@Project.fr
```

**Ownership**: Legal/Compliance Officer  
**Template**: Available from [CNIL](https://www.cnil.fr/en)

---

#### 2. Lawful Basis Matrix (`docs/compliance/Project-LAWFUL-BASIS-MATRIX.md`)

**What it is**: Formal mapping of each data processing purpose to GDPR Article 6 legal basis  
**Status**: ❌ NOT CREATED (Due: May 15, 2026)  
**Contents required**:

```markdown
# Project Lawful Basis Matrix

| Data Type             | Purpose                  | Legal Basis                              | Justification                             | Retention                    |
| --------------------- | ------------------------ | ---------------------------------------- | ----------------------------------------- | ---------------------------- |
| Email, password       | User authentication      | **Contract** (Art. 6.1.b)                | Necessary to provide service              | Until deletion request       |
| Firstname, lastname   | Personalize UI           | **Contract** or **Consent** (Art. 6.1.a) | Improves experience OR explicit agreement | Until deletion request       |
| Workshop attendance   | Course recommendations   | **Legitimate Interest** (Art. 6.1.f)     | Improve platform (with LIA)               | 2 years for analytics        |
| Azure Graph sync      | Sync corporate directory | **Contract** OR **Legal Obligation**     | Employer policy OR regulatory requirement | 30 days after sync           |
| Degreed learning data | Sync credentials         | **Legitimate Interest** (Art. 6.1.f)     | Platform integration                      | As configured by Degreed DPA |
| Login timestamps      | Audit trail              | **Legal Obligation** (Art. 6.1.c)        | Regulatory compliance + security          | 90 days                      |
| IP address            | Detect fraud             | **Legitimate Interest** (Art. 6.1.f)     | Prevent unauthorized access               | 30 days                      |

**Note**: For Legitimate Interest (Art. 6.1.f), a **Legitimate Interest Assessment (LIA)** must be documented.
```

**Ownership**: Legal + Tech Lead  
**Dependencies**: Requires Privacy Policy first

---

#### 3. Data Retention Schedule (`docs/compliance/Project-DATA-RETENTION-SCHEDULE.md`)

**What it is**: Formal schedule of how long each data type is kept  
**Status**: ❌ NOT CREATED (Due: May 15, 2026)  
**Contents required**:

```markdown
# Project Data Retention Schedule

| Data Type                               | Entity               | Retention Period          | Justification                            | Auto-Deletion?                   |
| --------------------------------------- | -------------------- | ------------------------- | ---------------------------------------- | -------------------------------- |
| User credentials (email, password hash) | `User`               | Until DELETION REQUEST    | Contract requirement                     | YES (CASCADE)                    |
| User profile (name, preferences)        | `Profile`            | Until DELETION REQUEST    | Contract requirement                     | YES (CASCADE)                    |
| Workshop attendance                     | `SessionAttendee`    | 2 YEARS                   | Statistical analysis + legal requirement | YES (auto-delete after 2y)       |
| Audit logs (login, API calls)           | `AuditLog`           | 90 DAYS                   | Regulatory compliance + fraud detection  | YES (scheduled job)              |
| Deleted user backups                    | `DeletedUserArchive` | 30 DAYS                   | Legal hold period for disputes           | YES (after 30d)                  |
| System backups (full DB)                | Database snapshots   | 30 DAYS (latest 5 copies) | Disaster recovery RTO                    | NO (but oldest purged)           |
| Application logs (Pino)                 | Loki / CloudWatch    | 30 DAYS                   | Debugging + operational monitoring       | YES (scheduled retention policy) |
| Deleted user PII                        | Anonymized tables    | NEVER (pseudonymized)     | Statistical analysis                     | NO (kept anonymous forever)      |

**Implementation**:

- Retention policies enforced in `apps/api/src/scheduled-tasks/deletion.task.ts` (CREATE THIS FILE)
- Configure: `apps/api/src/config/retention.config.ts` (CREATE THIS FILE)
```

**Ownership**: Legal + DevOps  
**Dependencies**: Requires Privacy Policy + Lawful Basis Matrix

---

#### 4. DPIA (Data Protection Impact Assessment) (`docs/compliance/Project-DPIA-REPORT.md`)

**What it is**: Formal assessment of data protection risks and mitigation measures  
**Status**: ❌ NOT CREATED (Due: May 30, 2026)  
**Contents required** (executive summary):

```markdown
# Project DPIA (Data Protection Impact Assessment)

## 1. Overview

- Processing activity: User engagement platform with AI recommendations
- Data subjects: Employees of partner organizations
- Processor/Controller relationships: Project (controller) + Azure/Degreed (processors)

## 2. Risks Identified

| Risk                                   | Severity | Likelihood | Impact                               | Mitigation                                     |
| -------------------------------------- | -------- | ---------- | ------------------------------------ | ---------------------------------------------- |
| **Unauthorized access to user data**   | HIGH     | MEDIUM     | Breach of confidentiality            | Encryption (TLS 1.3, AES-256), access controls |
| **Unauthorized sync with Azure Graph** | HIGH     | LOW        | Data leakage to corp directory       | Minimal scope, consent, logging                |
| **Retention of deleted user data**     | MEDIUM   | MEDIUM     | GDPR "right to erasure" violation    | Auto-delete cascade, backup purge (30d)        |
| **Profiling without consent**          | MEDIUM   | MEDIUM     | Discrimination, Article 22 violation | Consent + transparency in Privacy Policy       |
| **Third-party data breaches**          | HIGH     | LOW        | Processor responsibility             | DPA signed, audit rights, incident response    |

## 3. Mitigation Measures Already In Place

- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ Field-level encryption (AES-256)
- ✅ User deletion with cascade
- ✅ Consent tracking (marketing, analytics)
- ✅ Audit logging (Pino)
- ✅ TLS 1.3 in transit

## 4. Outstanding Mitigations (Q2-Q3 2026)

- [ ] CSP header (prevents XSS exfiltration)
- [ ] CSRF protection (prevents unauthorized actions)
- [ ] DPA with Microsoft + Degreed (third-party accountability)
- [ ] Right to Restrict + Right to Object endpoints
- [ ] Automated retention job (delete old audit logs)
- [ ] Incident response playbook

## 5. Consultation with Supervisory Authority

- If high-risk processing (Art. 36): Consult CNIL (French DPA)
- **Assessment**: MEDIUM risk → No mandatory consultation, but recommended

## 6. Decision

✅ **DPIA Approves** processing with outstanding mitigations (Phase Q2-Q3)
```

**Ownership**: Privacy Officer + DPO  
**Regulatory Reference**: GDPR Article 35

---

### Summary: Phase 0 Deliverables

| Document                | Status | Due Date     | Owner      | Blocks                             |
| ----------------------- | ------ | ------------ | ---------- | ---------------------------------- |
| Privacy Policy          | ❌     | May 15, 2026 | Legal      | Lawful Basis, DPIA, DPA            |
| Lawful Basis Matrix     | ❌     | May 15, 2026 | Legal/Tech | DPIA                               |
| Data Retention Schedule | ❌     | May 15, 2026 | Legal/Tech | Implementation (Phase 1)           |
| DPIA Report             | ❌     | May 30, 2026 | DPO        | Supervisory authority consultation |

**Without Phase 0 complete by May 31, 2026: Project is not GDPR-compliant regardless of code implementation.**

---

## ✅ Data Minimization

### 1. Minimal User Registration

```typescript
// libs/shared/dto/src/lib/user/create-user.dto.ts
export class CreateUserDto {
  @IsEmail()
  email: string // ✅ Needed for authentication

  @IsString()
  @MinLength(12)
  password: string // ✅ Required for security

  @IsString()
  firstname: string // ✅ For personalization

  @IsString()
  lastname: string // ✅ For personalization

  // ❌ Don't collect phone unless needed
  // ❌ Don't collect date of birth unless needed
  // ❌ Don't collect address unless needed
}
```

### 2. Field-Level Encryption (Optional)

For sensitive fields like SSN, medical data:

```typescript
// libs/server/entities/src/lib/user/profile.entity.ts
import { crypto } from '@Project/server/config/crypto'

@Entity('profile')
export class Profile {
  @Column()
  firstname: string // Regular field

  @Column()
  lastname: string // Regular field

  // ✅ Encrypted field example (optional, for high-sensitivity data)
  @Column({
    transformer: {
      to: (value: string) => {
        if (!value) return null
        return crypto.encrypt(value)
      },
      from: (encrypted: string) => {
        if (!encrypted) return null
        return crypto.decrypt(encrypted)
      },
    },
  })
  ssnEncrypted?: string // Only store if absolutely necessary
}
```

---

## 🗑️ User Deletion (Right to be Forgotten)

### 1. Cascade Deletion in TypeORM

```typescript
// libs/server/entities/src/lib/user/profile.entity.ts
@Entity('profile')
export class Profile extends GenericEntity implements IProfile {
  @PrimaryColumn()
  id: string

  @OneToOne(() => User, {
    primary: true,
    onDelete: 'CASCADE', // ✅ Delete Profile when User deleted
  })
  @JoinColumn({ name: 'id', referencedColumnName: 'id' })
  user: IUser

  // Relations that cascade
  @OneToMany(() => Workshop, (w) => w.creator, {
    onDelete: 'CASCADE', // ✅ Handle creator's workshops
  })
  createdWorkshops: IWorkshop[]

  @OneToMany(() => Feedback, (f) => f.creator, {
    onDelete: 'CASCADE', // ✅ Handle creator's feedback
  })
  createdFeedback: IFeedback[]

  // Many-to-many: Handle gracefully
  @ManyToMany(() => Workshop, (w) => w.attendees, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'session_attendee',
    joinColumn: { name: 'profile_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'workshop_id', referencedColumnName: 'id' },
  })
  workshops: IWorkshop[]
}
```

### 2. User Deletion Service

```typescript
// apps/api/src/modules/user/user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @InjectRepository(ProfileRepository)
    private profileRepository: ProfileRepository,
    @InjectRepository(ProfileStrengthRepository)
    private profileStrengthRepository: ProfileStrengthRepository,
    @InjectRepository(ProfilePreferenceRepository)
    private profilePreferenceRepository: ProfilePreferenceRepository,
    @InjectPinoLogger(UserService.name) private logger: PinoLogger
  ) {}

  /**
   * Delete user account (Right to be Forgotten)
   * Cascades to automatically delete related data
   *
   * @param userId The user ID to delete
   * @returns {Promise<void>}
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      // ✅ Verify user exists
      await this.userRepository.findOneOrFail(userId)

      // ✅ Create entities to delete (TypeORM will cascade)
      const user = new User({ id: userId })
      const profile = new Profile({ id: userId })
      const profilePreference = new ProfilePreference({ profileId: userId })
      const profileStrength = new ProfileStrength({ profileId: userId })

      // ✅ Delete in order (profile first due to FK constraints)
      await this.profileRepository.remove(profile)
      await this.profilePreferenceRepository.remove(profilePreference)
      await this.profileStrengthRepository.remove(profileStrength)
      await this.userRepository.remove(user)

      // ✅ Log deletion for audit trail
      this.logger.info(
        { userId, timestamp: new Date() },
        'User and all associated data deleted (GDPR right to be forgotten)'
      )
    } catch (e) {
      this.logger.error({ error: e, userId }, `Failed to delete user data`)

      if (e instanceof EntityNotFoundError) {
        throw new NotFoundException('User not found')
      }

      throw new InternalServerErrorException()
    }
  }
}
```

### 3. User Deletion Endpoint

```typescript
// apps/api/src/modules/user/user.controller.ts
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  /**
   * Delete own user account
   * Only authenticated user can delete their own account
   */
  @Delete('me')
  async deleteOwnAccount(@Req() req: Request) {
    const userId = req.user.id

    // ✅ Verify user is deleting their own account
    if (userId !== req.params.userId) {
      throw new ForbiddenException('Cannot delete other users')
    }

    return this.userService.deleteUser(userId)
  }

  /**
   * Admin deletion (with logging)
   */
  @Delete(':userId')
  @Admin()
  async deleteUserAsAdmin(@Param('userId') userId: string, @Req() req: Request) {
    const adminId = req.user.id

    // ✅ Log admin action
    this.logger.info(
      {
        adminId,
        targetUserId: userId,
        action: 'DELETE_USER',
        reason: 'Admin initiated deletion',
      },
      'User deletion by admin'
    )

    return this.userService.deleteUser(userId)
  }
}
```

---

## 📥 User Rights Implementation

### 1. Right of Access (Download Your Data)

```typescript
// apps/api/src/modules/profile/profile.controller.ts
@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  /**
   * Export user's personal data in JSON format
   * Implements GDPR "Right of Access"
   */
  @Get('me/export')
  async exportPersonalData(@Req() req: Request): Promise<any> {
    const userId = req.user.id

    // ✅ Fetch all user data
    const profile = await this.profileRepository.findOne(userId)
    const user = await this.userRepository.findOne(userId)
    const preferences = await this.preferenceRepository.find({ profileId: userId })
    const workshops = await this.workshopRepository.find({ creatorId: userId })
    const feedback = await this.feedbackRepository.find({ creatorId: userId })

    // ✅ Return comprehensive data export
    return {
      exportDate: new Date().toISOString(),
      profile: {
        id: profile.id,
        firstname: profile.firstname,
        lastname: profile.lastname,
        email: user.email,
        createdAt: user.createdAt,
      },
      preferences,
      createdWorkshops: workshops,
      feedback,
      // ✅ Include any other PII
    }
  }

  /**
   * Export user data as CSV (for Excel import)
   */
  @Get('me/export/csv')
  async exportAsCSV(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id
    const data = await this.exportPersonalData(req)

    // ✅ Convert to CSV format
    const csv = this.convertToCSV(data)

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Project-export-${userId}-${Date.now()}.csv"`
    )
    res.send(csv)
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion (use csv-writer for production)
    const lines = [
      ['Field', 'Value'],
      ['ID', data.profile.id],
      ['Name', `${data.profile.firstname} ${data.profile.lastname}`],
      ['Email', data.profile.email],
      ['Created', data.profile.createdAt],
    ]
    return lines.map((line) => line.join(',')).join('\n')
  }
}
```

### 2. Right to Rectification (Update Data)

```typescript
// apps/api/src/modules/profile/profile.controller.ts
@Patch('me')
async updateOwnProfile(
  @Req() req: Request,
  @Body() updateDto: UpdateProfileDto
) {
  const userId = req.user.id

  // ✅ Allow users to update their own data
  const profile = await this.profileRepository.findOne(userId)

  if (updateDto.firstname) profile.firstname = updateDto.firstname
  if (updateDto.lastname) profile.lastname = updateDto.lastname
  // ❌ But don't allow ID or creation date changes

  // ✅ Log the change
  this.logger.info(
    { userId, changes: Object.keys(updateDto) },
    'User updated their profile'
  )

  return this.profileRepository.save(profile)
}
```

### 3. Right to Restrict Processing

```typescript
// libs/server/entities/src/lib/user/profile.entity.ts
@Entity('profile')
export class Profile {
  @Column({ default: false })
  processingRestricted: boolean // ✅ Flag for restricted processing

  @Column({ nullable: true })
  processingRestrictedUntil?: Date // ✅ Time-bound restriction
}

// In controllers/services:
const canProcessData = !profile.processingRestricted

if (!canProcessData) {
  throw new ForbiddenException('User has restricted processing')
}
```

---

## 📝 Consent Management

### 1. Consent Tracking

```typescript
// libs/server/entities/src/lib/user/profile-preference.entity.ts
@Entity('profile_preference')
export class ProfilePreference {
  @Column()
  profileId: string

  @Column({ default: false })
  marketingConsent: boolean // ✅ Explicit opt-in

  @Column({ nullable: true })
  marketingConsentDate?: Date // ✅ When given

  @Column({ default: false })
  analyticsConsent: boolean // ✅ Separate consent

  @Column({ nullable: true })
  analyticsConsentDate?: Date

  @Column({ default: false })
  thirdPartyConsent: boolean // ✅ Third-party data sharing

  @Column({ nullable: true })
  thirdPartyConsentDate?: Date
}
```

### 2. Consent Form (React Frontend)

```typescript
// libs/web/shared/components/src/lib/consent-banner/consent-banner.tsx
import React, { useState } from 'react'

export const ConsentBanner: React.FC = () => {
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [analyticsConsent, setAnalyticsConsent] = useState(false)

  const handleSubmit = async () => {
    // ✅ Send to backend
    await api.post('/profiles/me/preferences', {
      marketingConsent,
      analyticsConsent,
      // ✅ Backend records timestamp
    })
  }

  return (
    <div>
      {/* ✅ NOT pre-checked (explicit consent) */}
      <input
        type="checkbox"
        id="marketing"
        checked={marketingConsent}
        onChange={(e) => setMarketingConsent(e.target.checked)}
      />
      <label htmlFor="marketing">
        I agree to receive marketing emails <span aria-label="required">*</span>
      </label>

      <input
        type="checkbox"
        id="analytics"
        checked={analyticsConsent}
        onChange={(e) => setAnalyticsConsent(e.target.checked)}
      />
      <label htmlFor="analytics">
        Help us improve by tracking analytics (optional)
      </label>

      <button onClick={handleSubmit}>Save Preferences</button>
    </div>
  )
}
```

### 3. Withdraw Consent

```typescript
// apps/api/src/modules/profile/profile.controller.ts
@Patch('me/preferences')
async updatePreferences(
  @Req() req: Request,
  @Body() dto: UpdatePreferencesDto
) {
  const userId = req.user.id
  const preference = await this.preferenceRepository.findOne({ profileId: userId })

  // ✅ Allow users to withdraw consent anytime
  if (dto.marketingConsent === false) {
    this.logger.info(
      { userId, consent: 'marketing', action: 'withdrawn' },
      'User withdrew marketing consent'
    )
    preference.marketingConsent = false
    preference.marketingConsentDate = null
  }

  return this.preferenceRepository.save(preference)
}
```

---

## 🔍 Data Subject Rights Verification

| Right             | Project Implementation | Endpoint                         |
| ----------------- | ------------------- | -------------------------------- |
| **Access**        | Export JSON/CSV     | `GET /profiles/me/export`        |
| **Rectification** | Update profile      | `PATCH /profiles/me`             |
| **Erasure**       | Delete account      | `DELETE /users/me`               |
| **Restrict**      | Flag in DB          | Controlled by service logic      |
| **Portability**   | JSON export         | `GET /profiles/me/export`        |
| **Object**        | Preference toggle   | `PATCH /profiles/me/preferences` |

---

## 🈲 Never Log PII

```typescript
// ✅ Correct
this.logger.info({ userId: user.id, email: user.email }, 'User logged in')

// ❌ Never log full objects with password/SSN
this.logger.info(user, 'User created') // Contains password!

// ❌ Never log sensitive parameters
this.logger.info({ password: credentials.password }, 'Auth attempt')

// ✅ Sanitize before logging
const sanitized = {
  userId: user.id,
  email: user.email.substring(0, 3) + '***@***',
  // ✅ Omit password, SSN, credit card, etc.
}
this.logger.info(sanitized, 'User action')
```

---

## 🚀 GDPR Compliance Checklist

- [ ] **Data Minimization**: Collect only necessary fields
- [ ] **Consent Forms**: Not pre-checked, separate from T&Cs
- [ ] **Consent Logging**: Track dates of consent/withdrawal
- [ ] **Data Access**: Export endpoint (JSON/CSV) works
- [ ] **Data Rectification**: Users can update own data
- [ ] **Data Deletion**: Cascade delete removes all related data
- [ ] **Deletion Logging**: Audit trail of deletions
- [ ] **No PII in Logs**: All logs sanitized
- [ ] **Encryption**: Passwords encrypted, TLS for transport
- [ ] **DPIA Completed**: Document risk assessment
- [ ] **Third-party Agreements**: DPA signed with vendors
- [ ] **Retention Policies**: Define how long data kept
- [ ] **Breach Notification**: Process for notifying users within 72h

---

## 📚 References

- User Service: `apps/api/src/modules/user/user.service.ts`
- Profile Entity: `libs/server/entities/src/lib/user/profile.entity.ts`
- GDPR Article 17 (Right to Erasure): https://gdpr-info.eu/art-17-gdpr/
- GDPR Art. 15 (Right of Access): https://gdpr-info.eu/art-15-gdpr/
- Data Protection Authority: https://www.cnil.fr/ (French DPA)
