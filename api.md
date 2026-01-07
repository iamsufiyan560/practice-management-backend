# API LIST

Base URL: `/api/v1`

---

# 🔐 OWNER ROUTES (owner.routes.ts)

### Auth

POST `/owner/generate-first-owner` - Generate First owner
POST `/owner/login` — ownerLogin
POST `/owner/logout` — ownerLogout
GET `/owner/me` — getOwnerMe

### Profile

GET `/owner/profile/:ownerId` — getOwnerProfile
PUT `/owner/profile/:ownerId` — updateOwnerProfile
DELETE `/owner/profile/:ownerId` — deleteOwnerProfile

### Dashboard

GET `/owner/dashboard` — getOwnerDashboard

### Password

POST `/owner/forgot-password` — ownerForgotPassword
POST `/owner/reset-password` — ownerResetPassword
PUT `/owner/change-password` — ownerChangePassword

---

# 🔐 USER AUTH (auth.routes.ts)

POST `/auth/login` — userLogin
POST `/auth/logout` — userLogout
GET `/auth/me` — getLoggedInUser

POST `/auth/forgot-password` — userForgotPassword
POST `/auth/reset-password` — userResetPassword
PUT `/auth/change-password` — userChangePassword

---

# 🏥 PRACTICES (practices.routes.ts)

POST `/practices/create` — createPractice
GET `/practices/list` — getAllPractices
GET `/practices/:practiceId` — getPracticeById
PUT `/practices/:practiceId` — updatePractice
DELETE `/practices/:practiceId` — deletePractice

---

# 👨‍💼 ADMINS (admins.routes.ts)

POST `/admins/create` — createAdmin
PUT `/admins/:adminId` — updateAdmin
DELETE `/admins/:adminId` — deleteAdmin

GET `/admins/list` — getAllAdminsByPractice
GET `/admins/:adminId` — getAdminById
GET `/admins/inactive` — get all inactive admin

Uses:

```
req.practiceId
```

---

# 🧑‍⚕️ SUPERVISORS (supervisors.routes.ts)

POST `/supervisors/create` — createSupervisor
PUT `/supervisors/:supervisorId` — updateSupervisor
DELETE `/supervisors/:supervisorId` — deleteSupervisor

GET `/supervisors/list` — getAllSupervisorsByPractice
GET `/supervisors/:supervisorId` — getSupervisorById

Uses:

```
req.practiceId
```

---

# 🧑‍⚕️ THERAPISTS (therapists.routes.ts)

POST `/therapists/create` — createTherapist
PUT `/therapists/:therapistId` — updateTherapist
DELETE `/therapists/:therapistId` — deleteTherapist

GET `/therapists/list` — getAllTherapistsByPractice
GET `/therapists/:therapistId` — getTherapistById
GET `/therapists/inactive` — getAllInactiveTherapistsByPractice

Uses:

```
req.practiceId
```

---

# 🔗 ASSIGNMENTS (assignments.routes.ts)

PUT `/assign/therapist-to-supervisor` — assignTherapistToSupervisor

PUT `/assign/patient-to-therapist` — assignPatientToTherapist

Uses:

```
req.practiceId
```

---

# 🧍 PATIENTS (patients.routes.ts)

POST `/patients/create` — createPatient
POST `/create-by-therapist` — createPatientByTherapist
GET `/patients/list` — getAllPatientsByPractice
GET `/patients/:patientId` — getPatientById
PUT `/patients/:patientId` — updatePatient
DELETE `/patients/:patientId` — deletePatient

GET `/therapists/:therapistId/patients` — getPatientsByTherapist

Uses:

```
req.practiceId
```

---

# 📝 SESSIONS CORE (sessions.routes.ts)

All session routes require:

```
requireAuth + practiceContext
```

Uses:

```
req.practiceId
```

---

## 🔹 SESSION CRUD

POST `/sessions/create` — createSession  
Create a new therapy session

GET `/sessions/:sessionId` — getSessionById  
Get single session by ID

PUT `/sessions/:sessionId` — updateSession  
Update session details

DELETE `/sessions/:sessionId` — deleteSession  
Delete a session

---

## 🔹 PATIENT SESSION APIs

GET `/sessions/patient/:patientId/history` — getPatientSessionHistory  
Get full session history for a patient

GET `/sessions/patient/:patientId/latest` — getLatestPatientSession  
Get latest session of a patient

---

## 🔹 THERAPIST SESSION STATES

GET `/sessions/my-drafts` — getDraftSessionsByTherapist  
Get all draft sessions of logged-in therapist

GET `/sessions/my-upcoming` — getUpcomingSessionsByTherapist  
Get upcoming sessions of logged-in therapist

---

## 🔹 SUPERVISOR REVIEW FLOW

GET `/sessions/pending-review` — getPendingReviewSessions  
Get sessions pending for supervisor review

PUT `/sessions/send-for-review/:sessionId` — sendSessionForReview  
Therapist sends session for supervisor review

PUT `/sessions/approve/:sessionId` — approveSession  
Supervisor approves session

PUT `/sessions/reject/:sessionId` — rejectSession  
Supervisor rejects session (with note)

Validation used:

- `createSessionSchema`
- `updateSessionSchema`
- `reviewSessionSchema`

---

# 📊 DASHBOARD (dashboard.routes.ts)

GET `/dashboard/admin` — getAdminDashboard
GET `/dashboard/supervisor/:supervisorId` — getSupervisorDashboard
GET `/dashboard/therapist/:therapistId` — getTherapistDashboard

Uses:

```
req.practiceId
```
