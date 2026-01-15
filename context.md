setAuthCookie(res,sessionId) → sets httpOnly secure strict 7d auth cookie {sessionId}; use after login/session create; return:void  
clearAuthCookie(res) → clears auth cookie; use logout/delete/change password/session invalid; return:void
encryptField(value) → AES-256-GCM encrypt using FIELD_ENCRYPTION_KEY; pass string|null; return base64|string|null; use for sensitive DB fields  
decryptField(value) → decrypt encrypted base64 field; pass string|null; return string|null; use when reading sensitive fields
logoutUser(req,res) → revoke session in authSessions via sessionId then clear cookie and response.ok; always safe logout even on error
hashPassword(password) → bcrypt hash (salt10); always hash before save user/admin/therapist; return hashed string  
comparePassword(plain,hash) → bcrypt compare for login/change password; return boolean
generateSecurePassword({minLength?,maxLength?}) → crypto strong password default 12-16 must ≥8 include upper/lower/number/symbol; return string; use when creating accounts/reset
response.ok(res,data?,msg?) → 200 success standard json  
response.created(res,data?,msg?) → 201 created  
response.noContent(res) → 204 empty  
response.badRequest(res,msg?,error?) → 400  
response.unauthorized(res,msg?) → 401  
response.forbidden(res,msg?) → 403  
response.notFound(res,msg?) → 404  
response.conflict(res,msg?) → 409  
response.tooMany(res,msg?) → 429  
response.error(res,msg?) → 500; ALWAYS use response utils no manual res.json
requireAuth(req,res,next) → middleware reads auth cookie.sessionId verify in authSessions (not revoked & not expired) attach req.user{userId,email,role ADMIN|SUPERVISOR|THERAPIST|OWNER} and req.sessionId; else unauthorized
sendEmail({to,subject,html}) → async mail sender using SMTP templates; returns boolean/success; usually DO NOT block critical response if slow; use for account created/forgot/reset/changed notifications
email templates generators → generateOwnerAccountCreatedEmail generateUserAccountCreatedEmail generateOwnerForgotPasswordEmail generateUserForgotPasswordEmail generateOwnerPasswordResetSuccessEmail generateUserPasswordResetSuccessEmail generateOwnerPasswordChangedEmail generateUserPasswordChangedEmail; pass required data and use html in sendEmail
logger.warn(msg|msg,obj?) → warning logs missing fields/edge cases  
logger.info(msg|msg,obj?) → info logs login/email/db events  
logger.error(msg|msg,obj?) → error logs  
logger supports multiple params + metadata object and writes console + files; use across controllers/services for audit/debug
TABLES --> authSessions: id,userId,email,role(USER,OWNER),ipAddress,userAgent,device,expiresAt,lastActivityAt,isRevoked,createdAt  
owners: id,email,passwordHash,firstName,lastName,createdBy,updatedBy,isDeleted,createdAt,updatedAt  
users: id,email,passwordHash,createdAt,updatedAt
passwordResets: id,userId,email,otp,otpType(FORGOT_PASSWORD|CHANGE_PASSWORD),otpExpiry,token,tokenExpiry,isUsed,createdAt
practices: id,name,legalName,taxId,npiNumber,phone,email,website,addressLine1,addressLine2,city,state,postalCode,country,createdBy,updatedBy,isDeleted,createdAt,updatedAt
userPracticeRoles: id,userId,practiceId,role(ADMIN|SUPERVISOR|THERAPIST),status(ACTIVE|INACTIVE),createdAt
supervisors: id,userId,practiceId,email,firstName,lastName,phone,licenseNumber,licenseState,licenseExpiry,specialty(json[]),isDeleted,createdAt,updatedAt  
therapists: id,userId,practiceId,supervisorId,email,firstName,lastName,phone,licenseNumber,licenseState,licenseExpiry,specialty(json[]),isDeleted,createdAt,updatedAt
patients: id,practiceId,therapistId,firstName,lastName,email,phone,gender,dob,address(json),emergencyContact(json),status(ACTIVE|INACTIVE),isDeleted,createdBy,updatedBy,createdAt,updatedAt
patientSessions: id,practiceId,patientId,therapistId,scheduledStart,scheduledEnd,sessionType(INITIAL|FOLLOW_UP|CRISIS),subjective,objective,assessment,plan,additionalNotes,aiSummary,reviewStatus(DRAFT|PENDING|APPROVED|REJECTED),reviewComment,isDeleted,createdBy,updatedBy,createdAt,updatedAt
FLOW RULE → owner separate table only for platform owner; normal users stored in users table and when creating any user always insert into users + userPracticeRoles + therapists or supervisors table based on role
GLOBAL RULES → always try/catch controllers; always use response.\* utils; use drizzle db; clearAuthCookie on logout/delete/password change/session invalid; use hashPassword/comparePassword only for auth; use generateSecurePassword for new accounts; use encryptField/decryptField for sensitive fields; requireAuth for protected routes; logger for important actions/errors; avoid custom responses or direct cookie handling outside utils
IMPORT RULE→ Always import using relative ../ path and MUST end with .js extension (example: import { db } from "../db/index.js")
REQUEST USER RULE → When requireAuth middleware used get logged user via req.user?.userId! req.user?.email! req.user?.role! always use ?. and ! together to avoid TS null error
practiceContext middleware → reads x-practice-id header and attaches req.practiceId for multi-practice APIs; use in routes needing practice scope; access via req.practiceId!
DATE RULE → always use new Date() (JS server time) for all date compare/store (expiry, createdAt, updatedAt, token checks, session checks) keep backend as single source of time consistency across all tables
