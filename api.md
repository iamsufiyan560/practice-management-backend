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

# 👤 USER PROFILE (users.routes.ts)

GET `/users/:userId` — getUserProfile
PUT `/users/:userId` — updateUserProfile
DELETE `/users/:userId` — deleteUserProfile

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

POST `/sessions/create` — createSession
GET `/sessions/:sessionId` — getSessionById
PUT `/sessions/:sessionId` — updateSession
DELETE `/sessions/:sessionId` — deleteSession

GET `/sessions/list` — getAllSessionsByPractice
GET `/therapists/:therapistId/sessions` — getSessionsByTherapist
GET `/patients/:patientId/sessions` — getSessionsByPatient

GET `/patients/:patientId/sessions/history` — getPatientSessionHistory
GET `/patients/:patientId/sessions/latest` — getLatestPatientSession

Uses:

```
req.practiceId
```

---

# 📝 SESSION STATES

GET `/sessions/draft/:therapistId` — getDraftSessionsByTherapist
GET `/sessions/upcoming/:therapistId` — getUpcomingSessionsByTherapist
GET `/sessions/pending-review/:supervisorId` — getPendingReviewSessions

PUT `/sessions/send-for-review/:sessionId` — sendSessionForReview
PUT `/sessions/approve/:sessionId` — approveSession
PUT `/sessions/reject/:sessionId` — rejectSession

Uses:

```
req.practiceId
```

---

# 📊 DASHBOARD (dashboard.routes.ts)

GET `/dashboard/admin` — getAdminDashboard
GET `/dashboard/supervisor/:supervisorId` — getSupervisorDashboard
GET `/dashboard/therapist/:therapistId` — getTherapistDashboard

Uses:

```
req.practiceId
```
