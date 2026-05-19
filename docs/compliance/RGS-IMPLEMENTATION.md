# Project-RGS Implementation Guide

This guide explains how to implement security governance (RGS) standards in Project's NestJS backend.

> **Prerequisites**:
>
> - Read [`@skill compliance-rgs`](../../.agents/skills/compliance-rgs/) for general security governance framework (quick-start + 8-phase roadmap)
> - Review [`ADR-011: RGS Compliance Roadmap`](../adr/ADR-011-rgs-compliance-roadmap.md) for Project's current state assessment & gap analysis by phase
> - Reference [`RGS-ANNEX-B2-DETAILED.md`](../../.agents/skills/compliance-rgs/RGS-ANNEX-B2-DETAILED.md) for cryptographic requirements
> - Reference [`RGS-ANNEX-B3-DETAILED.md`](../../.agents/skills/compliance-rgs/RGS-ANNEX-B3-DETAILED.md) for authentication & session lifecycle details
> - See [`COMPLIANCE-MATRIX.md`](COMPLIANCE-MATRIX.md) for cross-standard dependencies & timeline with RGPD + RGI
> - Cross-reference: [`RGPD-IMPLEMENTATION.md`](RGPD-IMPLEMENTATION.md) (encryption controls needed), [`RGI-IMPLEMENTATION.md`](RGI-IMPLEMENTATION.md) (API security)

**Current Status**: This document covers **Phase 2 (Authentication & Authorization)**, **Phase 3 (Encryption)**, and **Phase 5 (Audit Logging)** implementation in Project. See ADR-011 for complete 8-phase roadmap and missing phases (1, 4, 6, 7, 8).

## 🔐 Project Security Architecture

### Stack

- **Framework**: NestJS 9.x with Passport.js
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Role-Based Access Control (RBAC)
- **Password Hashing**: bcrypt (industry standard)
- **Logging**: Pino (structured logging)
- **Infrastructure**: PostgreSQL avec TypeORM
- **Secrets Management**: Environment variables only

### Key Module Locations

- **Auth Module**: `apps/api/src/modules/auth/`
- **Guards**: `libs/server/guards/src/lib/` (reusable)
- **Decorators**: `apps/api/src/modules/auth/decorators/`
- **Logging**: `@Project/server/config/logger` (Pino setup)

---

## ✅ Authentication Implementation

### 1. JWT Strategy & Configuration

Project uses Passport.js JWT strategy for stateless authentication:

```typescript
// apps/api/src/modules/auth/strategies/jwt-strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { JwtPayload } from '../interfaces/jwt-payload.interface'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // ✅ Enforce token expiration
      secretOrKey: configService.get<string>('NX_JWT_SECRET'),
    })
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // ✅ Payload validated by JWT signature
    return payload
  }
}
```

### 2. JWT Guard (Global)

All endpoints protected by `JwtAuthGuard` by default:

```typescript
// apps/api/src/modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super(reflector)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())

    // ✅ Public endpoints marked with @Public() decorator
    if (isPublic) return true

    // ✅ All other endpoints require valid JWT
    return (await super.canActivate(context)) as boolean
  }
}

// Register as global guard in app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
]
```

### 3. Token Generation with Short Expiration

```typescript
// apps/api/src/modules/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(dto: LoginUserDto): Promise<LoginResponse> {
    const user = await this.userService.findByEmail(dto.username)

    // ✅ Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.hashedPassword)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // ✅ Generate JWT with SHORT expiration (15-30 min)
    const token = await this.jwtService.signAsync(
      {
        id: user.id,
        email: user.email,
        roles: user.roles, // ✅ Include roles for RBAC
      },
      {
        secret: process.env.NX_JWT_SECRET,
        expiresIn: '15m', // ✅ Short-lived token
      }
    )

    return {
      token,
      username: user.id,
      expiry: Math.floor(Date.now() / 1000) + 900, // 15 min in seconds
    }
  }
}
```

### 4. Password Policy

```typescript
// libs/shared/dto/src/lib/user/create-user.dto.ts
import { IsEmail, MinLength, Matches, IsString } from 'class-validator'

export class CreateUserDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(12) // ✅ Minimum 12 characters (RGS requirement)
  @Matches(/[A-Z]/, { message: 'Password must contain uppercase' })
  @Matches(/[a-z]/, { message: 'Password must contain lowercase' })
  @Matches(/[0-9]/, { message: 'Password must contain number' })
  @Matches(/[!@#$%^&*]/, { message: 'Password must contain special character' })
  password: string
}
```

### 5. Prevent Brute Force Attacks

```typescript
// apps/api/src/modules/auth/auth.service.ts
async validateUser(dto: LoginUserDto): Promise<LoginResponse> {
  const user = await this.userService.findByEmail(dto.username)

  // ✅ Track failed login attempts
  if (user.failedLoginAttempts >= 5) {
    if (Date.now() - user.lastFailedLogin.getTime() < 15 * 60 * 1000) {
      throw new TooManyRequestsException(
        'Account locked. Try again in 15 minutes.'
      )
    }
    // Reset counter after 15 min
    user.failedLoginAttempts = 0
  }

  const isPasswordValid = await bcrypt.compare(
    dto.password,
    user.hashedPassword
  )

  if (!isPasswordValid) {
    user.failedLoginAttempts += 1
    user.lastFailedLogin = new Date()
    await this.userRepository.save(user)
    throw new UnauthorizedException('Invalid credentials')
  }

  // ✅ Reset on successful login
  user.failedLoginAttempts = 0
  user.lastLoginDate = new Date()
  await this.userRepository.save(user)

  return this.generateToken(user)
}
```

---

## 🔑 Authorization (RBAC)

### 1. Role-Based Guards

```typescript
// apps/api/src/modules/shared/guards/admin.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler())

    if (!requiredRole) {
      return true // No role requirement
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    // ✅ Check if user has required role
    return user?.roles?.includes(requiredRole) ?? false
  }
}
```

### 2. Admin Decorator

```typescript
// apps/api/src/modules/auth/decorators/admin.decorator.ts
import { UseGuards, applyDecorators } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AdminGuard } from '../guards/admin.guard'

export function Admin() {
  return applyDecorators(
    UseGuards(AdminGuard),
    SetMetadata('role', 'ADMIN') // ✅ Set required role
  )
}
```

### 3. Protected Endpoints

```typescript
// apps/api/src/modules/headband/headband.controller.ts
import { Controller, Get, Post, Delete } from '@nestjs/common'
import { Admin } from '../auth/decorators/admin.decorator'

@Controller('headbands')
export class HeadbandController {
  // ✅ Public - no auth needed
  @Get()
  findAll() {}

  // ✅ Admin only
  @Post()
  @Admin()
  create(@Body() dto: CreateHeadbandDto) {}

  // ✅ Admin only
  @Delete(':id')
  @Admin()
  delete(@Param('id') id: string) {}
}
```

### 4. Creator-Level Authorization

```typescript
// libs/server/guards/src/lib/creator.guard.ts
@Injectable()
export class CreatorGuard implements CanActivate {
  constructor(private reflector: Reflector, private connection: Connection) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user
    const entityId = request.params.id

    const metadata = this.reflector.get('entity', context.getHandler())
    if (!metadata) return true

    const repository = this.connection.getRepository(metadata.entity)
    const entity = await repository.findOneOrFail(entityId)

    // ✅ Only allow if user is creator
    return entity.creatorId === user.id
  }
}
```

---

## 🔒 Encryption & Secrets Management

### 1. No Hardcoded Secrets

```typescript
// ✅ Correct: Load from environment
const jwtSecret = process.env.NX_JWT_SECRET
const dbPassword = process.env.NX_DATABASE_PASSWORD

// ❌ Never do this:
const secret = 'my-super-secret-key'
```

### 2. Password Hashing (bcrypt)

```typescript
// apps/api/src/modules/user/user.service.ts
import * as bcrypt from 'bcrypt'

async createUser(dto: CreateUserDto): Promise<User> {
  // ✅ Hash password with salt rounds = 10 (default)
  const hashedPassword = await bcrypt.hash(dto.password, 10)

  return this.userRepository.save({
    email: dto.email,
    hashedPassword, // ✅ Store hash, never plain-text
  })
}

async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}
```

### 3. TLS/HTTPS

```yaml
# docker-compose.yml
environment:
  NX_API_URL: https://api.Project.local # ✅ Always HTTPS
  NODE_ENV: production
```

---

## 📊 Audit Logging

### 1. Structured Logging with Pino

```typescript
// apps/api/src/modules/auth/auth.controller.ts
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino'

@Controller('auth')
export class AuthController {
  constructor(@InjectPinoLogger(AuthController.name) private logger: PinoLogger) {}

  @Post('login')
  async login(@Body() dto: LoginUserDto, @Req() req: Request) {
    // ✅ Log login attempt (but NOT the password)
    this.logger.info({ username: dto.username, ip: req.ip }, 'User login attempt')

    try {
      const result = await this.authService.validateUser(dto)

      // ✅ Log successful authentication
      this.logger.info(
        { userId: result.username, ip: req.ip },
        'User authenticated successfully'
      )

      return result
    } catch (e) {
      // ✅ Log failed authentication
      this.logger.warn(
        { username: dto.username, ip: req.ip, error: e.message },
        'Authentication failed'
      )

      throw e
    }
  }
}
```

### 2. Admin Action Logging

```typescript
// apps/api/src/modules/admin/admin.controller.ts
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string, @Req() req: Request) {
    const adminId = req.user.id

    // ✅ Log admin action with WHO, WHAT, WHEN, WHY
    this.logger.info(
      {
        adminId,
        targetUserId: userId,
        action: 'DELETE_USER',
        timestamp: new Date(),
        reason: 'Admin deletion',
      },
      'Admin action executed'
    )

    return this.userService.deleteUser(userId)
  }
}
```

### 3. Never Log Sensitive Data

```typescript
// ✅ Correct
this.logger.info({ userId: user.id }, 'User updated')

// ❌ Never log passwords or sensitive data
this.logger.info({ password: user.password }, 'User updated')
this.logger.info({ ssn: user.ssn }, 'User updated')
this.logger.info({ creditCard: user.creditCard }, 'User updated')
```

---

## 🛡️ Common RGS Requirements Checklist

- [ ] **JWT Configuration**: Short expiration (15 min), proper signing
- [ ] **Password Policy**: Min 12 chars, uppercase, lowercase, number, special char
- [ ] **Brute Force Protection**: Lock after 5 failed attempts
- [ ] **Role-Based Authorization**: Guards + decorators on all protected endpoints
- [ ] **No Hardcoded Secrets**: All in environment variables or .env
- [ ] **Password Hashing**: bcrypt with salt rounds ≥ 10
- [ ] **TLS/HTTPS**: All communication encrypted
- [ ] **Audit Logging**: All auth, admin, data modification events logged
- [ ] **No PII in Logs**: Never log passwords, SSN, credit cards, tokens
- [ ] **Admin Overrides Tracked**: Admin access to other users logged
- [ ] **Dependency Scanning**: `npm audit`, SonarQube, OWASP checks in CI/CD

---

## 🔍 Verification in Project

### Run Security Checks

```bash
# Check dependencies for known vulnerabilities
npm audit

# Run SonarQube analysis for security hotspots
nx run api:sonar

# Static security scanning
npx snyk test

# Check secret patterns in code
npx detect-secrets scan
```

### Auth E2E Tests

```bash
# Test auth flows
nx run api-e2e:e2e --include='**/auth/**'

# Example: JWT validation, expired token handling, brute force protection
```

---

## 🚀 Integration with Project Modules

| Module       | Security Pattern | Example                                      |
| ------------ | ---------------- | -------------------------------------------- |
| **Auth**     | JWT + Passport   | `LoginUserDto` → hashed password → JWT token |
| **Admin**    | AdminGuard       | `@Admin()` on sensitive endpoints            |
| **Workshop** | CreatorGuard     | Only creator can modify workshop             |
| **Profile**  | User ownership   | Only user can see/modify own profile data    |
| **User**     | Role-based       | Different endpoints for ADMIN vs USER roles  |

---

## 📚 References

- Project Auth Module: `apps/api/src/modules/auth/`
- Guards: `libs/server/guards/src/lib/`
- Pino Logger: `@Project/server/config/logger`
- passport-jwt docs: https://www.passportjs.org/packages/passport-jwt/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
