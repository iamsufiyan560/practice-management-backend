# Backend Utilities, Rules & DB Reference

## 🔐 Auth & Cookie Utils

- `setAuthCookie(res,sessionId)` → sets httpOnly secure strict 7d auth cookie `{sessionId}`; use after login/session create; return:void
- `clearAuthCookie(res)` → clears auth cookie; use logout/delete/change password/session invalid; return:void
- `logoutUser(req,res)` → revoke session in authSessions via sessionId then clear cookie and response.ok; always safe logout even on error

## 🔒 Encryption Utils

- `encryptField(value)` → AES-256-GCM encrypt using FIELD_ENCRYPTION_KEY; pass string|null; return base64|string|null; use for sensitive DB fields
- `decryptField(value)` → decrypt encrypted base64 field; pass string|null; return string|null; use when reading sensitive fields

## 🔑 Password Utils

- `hashPassword(password)` → bcrypt hash (salt10); always hash before save user/admin/therapist; return hashed string
- `comparePassword(plain,hash)` → bcrypt compare for login/change password; return boolean
- `generateSecurePassword({minLength?,maxLength?})` → crypto strong password default 12-16 must ≥8 include upper/lower/number/symbol; return string; use when creating accounts/reset

## 📦 Response Utils (ALWAYS use these)

- `response.ok(res,data?,msg?)` → 200 success standard json
- `response.created(res,data?,msg?)` → 201 created
- `response.noContent(res)` → 204 empty
- `response.badRequest(res,msg?,error?)` → 400
- `response.unauthorized(res,msg?)` → 401
- `response.forbidden(res,msg?)` → 403
- `response.notFound(res,msg?)` → 404
- `response.conflict(res,msg?)` → 409
- `response.tooMany(res,msg?)` → 429
- `response.error(res,msg?)` → 500  
  **Rule:** ALWAYS use response utils. No manual `res.json`.

## 🛡️ Middleware

- `requireAuth(req,res,next)` → reads auth cookie.sessionId verify in authSessions (not revoked & not expired) attach `req.user{userId,email}` and `req.sessionId`; else unauthorized
- `requireRole(...roles)` → verify logged-in user role within current practice using userId + practiceId; blocks access if role missing; use after requireAuth + practiceContext

## 📧 Email System

- `sendEmail({to,subject,html})` → async SMTP mail sender; returns boolean/success; DO NOT block response if slow; use for account created/forgot/reset/changed

### Email template generators

- generateOwnerAccountCreatedEmail
- generateUserAccountCreatedEmail
- generateOwnerForgotPasswordEmail
- generateUserForgotPasswordEmail
- generateOwnerPasswordResetSuccessEmail
- generateUserPasswordResetSuccessEmail
- generateOwnerPasswordChangedEmail
- generateUserPasswordChangedEmail
- userAddedToPracticeEmail

Pass required data → use returned HTML in sendEmail.

## 🧾 Logger

- `logger.warn(msg|msg,obj?)` → warning logs
- `logger.info(msg|msg,obj?)` → info logs
- `logger.error(msg|msg,obj?)` → error logs

Logger supports metadata object + writes console + files. Use across controllers/services.

---

# 🗄️ Database Tables

### authSessions

id,userId,email,role(USER|OWNER),ipAddress,userAgent,device,expiresAt,lastActivityAt,isRevoked,createdAt

### owners

id,email,passwordHash,firstName,lastName,createdBy,updatedBy,isDeleted,createdAt,updatedAt

### users

id,email,passwordHash,createdAt,updatedAt

### passwordResets

id,userId,email,otp,otpType(FORGOT_PASSWORD|CHANGE_PASSWORD),otpExpiry,token,tokenExpiry,isUsed,createdAt

### practices

id,name,legalName,taxId,npiNumber,phone,email,website,addressLine1,addressLine2,city,state,postalCode,country,createdBy,updatedBy,isDeleted,createdAt,updatedAt

### userPracticeRoles

id,userId,practiceId,email,firstName,lastName,phone,role(ADMIN|SUPERVISOR|THERAPIST),status(ACTIVE|INACTIVE),createdAt,updatedAt,isDeleted

### supervisors

id,userId,practiceId,email,firstName,lastName,phone,licenseNumber,licenseState,licenseExpiry,specialty(json[]),isDeleted,createdAt,updatedAt

### therapists

id,userId,practiceId,supervisorId,email,firstName,lastName,phone,licenseNumber,licenseState,licenseExpiry,specialty(json[]),isDeleted,createdAt,updatedAt

### patients

id,practiceId,therapistId,firstName,lastName,email,phone,gender,dob,address{addressLine1,addressLine2,city,state,postalCode,country},emergencyContact{name,relationship,phone,email,authorized},isDeleted,createdBy,updatedBy,createdAt,updatedAt

### patientSessions

id,practiceId,patientId,therapistId,scheduledStart,scheduledEnd,sessionType(INITIAL|FOLLOW_UP|CRISIS),subjective,objective,assessment,plan,additionalNotes,aiSummary,reviewStatus(DRAFT|PENDING|APPROVED|REJECTED),reviewComment,isDeleted,createdBy,updatedBy,createdAt,updatedAt

---

# ⚙️ Core System Rules

### FLOW RULE

Owner separate table only for platform owner.  
Normal users stored in users table.  
While creating user always insert into:

- users
- userPracticeRoles
- therapists/supervisors table based on role  
  Admin → only userPracticeRoles  
  Supervisor/Therapist → both role table + userPracticeRoles

### GLOBAL RULES

- Always try/catch controllers
- Always use response.\* utils
- Use drizzle db only
- clearAuthCookie on logout/delete/password change/session invalid
- Use hashPassword/comparePassword only for auth
- Use generateSecurePassword for new accounts
- Use encryptField/decryptField for sensitive fields
- requireAuth for protected routes
- Use logger for important actions/errors
- Avoid custom responses or manual cookie handling

### IMPORT RULE

Always import using relative path and MUST end with `.js`  
Example:

```
import { db } from "../db/index.js"
```

### REQUEST USER RULE

When requireAuth used:

```
req.user?.userId!
req.user?.email!
```

Always use `?.` + `!` together to avoid TS null error.

### REQUEST ROLE RULE

When requireRole middleware used:

```
req.practiceRole!
```

Always use `req.practiceRole!` for role-based checks inside controllers. Middleware already validates access based on role.

### practiceContext middleware

Reads `x-practice-id` header and attaches `req.practiceId`  
Access via:

```
const practiceId = req.practiceId!
```

### VALIDATION RULE

Whenever creating any API that requires request body:

- Always create Zod schema inside `validations/` folder
- File naming: `<feature>.validation.ts`
- Example:

```
admin.validation.ts
patient.validation.ts
session.validation.ts
```

- Export schema and use via `validate(schema)` middleware in routes
- Never write validation inside controller

### RATE LIMIT RULE

Centralized rate limiters available:

- `globalIpLimiter` → protects entire API by IP (use globally)
- `userLimiter` → per logged-in user limiter (use on heavy user APIs)
- `authLimiter` → strict limiter for login/forgot/reset password routes

Always import from `middleware` and attach in routes where abuse risk exists (auth, public, heavy-read APIs).
Uses real client IP via `x-forwarded-for` and always returns `response.tooMany`.

### DATE RULE

Always use:

```
new Date()
```

Backend is single source of truth for time.

### USER ARCH RULE

users table = global auth only  
Every created user MUST:

1. Insert into users
2. Insert into userPracticeRoles
3. Insert into therapists/supervisors based on role  
   Keep all tables in sync on update/delete.

### PRACTICE CONTEXT RULE

Whenever API is practice-scoped:

- Must use practiceContext middleware
- Always filter by `practiceId + isDeleted=false`

### CONSISTENCY RULE

Always update:

1. userPracticeRoles first
2. then therapists/supervisors table

### UNIQUE ROLE RULE

Before inserting userPracticeRoles check:

```
(userId + practiceId + role)
```

Prevent duplicate role in same practice.

### SESSION REVOKE RULE

If user removed from practice or set INACTIVE → optionally revoke sessions immediately.

### SOFT DELETE RULE

Tables with `isDeleted`:

- Always filter `isDeleted=false`
- Never hard delete role data

### MULTI PRACTICE RULE

Same user can exist in multiple practices with different roles.  
Always:

- Check existing global user by email
- Never duplicate global user
- Only create new practice role entry
