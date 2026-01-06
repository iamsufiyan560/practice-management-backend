# API LIST

**Base URL:** `/api/v1`

---

# 🔐 OWNER (owner.routes.ts)

### Auth

POST `/owner/generate-first-owner` — Generate first owner

Validation:

- generateFirstOwnerSchema

POST `/owner/create-owner` — Create owner  
Requires: `requireAuth`

Validation:

- createOwnerSchema

POST `/owner/login` — Owner login

Validation:

- loginSchema

POST `/owner/logout` — Owner logout  
Requires: `requireAuth`

GET `/owner/me` — Get logged-in owner  
Requires: `requireAuth`

---

### Profile

GET `/owner/profile/:ownerId` — Get owner profile  
Requires: `requireAuth`

PUT `/owner/profile/:ownerId` — Update owner profile  
Requires: `requireAuth`

Validation:

- updateOwnerSchema

DELETE `/owner/profile/:ownerId` — Delete owner profile  
Requires: `requireAuth`

---

### Dashboard

GET `/owner/dashboard` — Owner dashboard  
Requires: `requireAuth`

---

### Password

POST `/owner/forgot-password` — Forgot password

Validation:

- forgotPasswordSchema

POST `/owner/reset-password` — Reset password

Validation:

- resetPasswordSchema

PUT `/owner/change-password` — Change password  
Requires: `requireAuth`

Validation:

- changePasswordSchema

---

# 🔐 AUTH (auth.routes.ts)

POST `/auth/login` — User login

Validation:

- loginSchema

POST `/auth/logout` — User logout  
Requires: `requireAuth`

GET `/auth/me` — Get logged-in user  
Requires: `requireAuth`

POST `/auth/forgot-password` — Forgot password

Validation:

- forgotPasswordSchema

POST `/auth/reset-password` — Reset password

Validation:

- resetPasswordSchema

PUT `/auth/change-password` — Change password  
Requires: `requireAuth`

Validation:

- changePasswordSchema

---

# 🏥 PRACTICES (practices.routes.ts)

All routes require: `requireAuth`

POST `/practices/create` — Create practice

Validation:

- createPracticeSchema

GET `/practices/list` — Get all practices

GET `/practices/:practiceId` — Get practice by ID

PUT `/practices/:practiceId` — Update practice

Validation:

- updatePracticeSchema

DELETE `/practices/:practiceId` — Delete practice

---

# 👨‍💼 ADMINS (admins.routes.ts)

All routes require: `requireAuth + practiceContext`

Uses:

```
req.practiceId
```

POST `/admins/create` — Create admin

Validation:

- createAdminSchema

PUT `/admins/:adminId` — Update admin

Validation:

- updateAdminSchema

DELETE `/admins/:adminId` — Delete admin

GET `/admins/list` — Get all admins by practice  
GET `/admins/inactive` — Get inactive admins  
GET `/admins/:adminId` — Get admin by ID

---

# 🧑‍⚕️ SUPERVISORS (supervisors.routes.ts)

All routes require: `requireAuth + practiceContext`

Uses:

```
req.practiceId
```

POST `/supervisors/create` — Create supervisor

Validation:

- createSupervisorSchema

PUT `/supervisors/:supervisorId` — Update supervisor

Validation:

- updateSupervisorSchema

DELETE `/supervisors/:supervisorId` — Delete supervisor

GET `/supervisors/list` — Get all supervisors  
GET `/supervisors/inactive` — Get inactive supervisors  
GET `/supervisors/:supervisorId` — Get supervisor by ID

---

# 🧑‍⚕️ THERAPISTS (therapists.routes.ts)

All routes require: `requireAuth + practiceContext`

Uses:

```
req.practiceId
```

POST `/therapists/create` — Create therapist

Validation:

- createTherapistSchema

PUT `/therapists/:therapistId` — Update therapist

Validation:

- updateTherapistSchema

DELETE `/therapists/:therapistId` — Delete therapist

GET `/therapists/list` — Get all therapists  
GET `/therapists/inactive` — Get inactive therapists  
GET `/therapists/:therapistId` — Get therapist by ID

---

# 🧍 PATIENTS (patients.routes.ts)

All routes require: `requireAuth + practiceContext`

Uses:

```
req.practiceId
```

POST `/patients/create` — Create patient

Validation:

- createPatientSchema

POST `/patients/create-by-therapist` — Create patient by therapist

Validation:

- createPatientSchema

PUT `/patients/:patientId` — Update patient

Validation:

- updatePatientSchema

DELETE `/patients/:patientId` — Delete patient

GET `/patients/list` — Get all patients  
GET `/patients/therapist/:therapistId` — Get patients by therapist  
GET `/patients/:patientId` — Get patient by ID

---

# 🔗 ASSIGNMENTS (assignments.routes.ts)

All routes require: `requireAuth + practiceContext`

Uses:

```
req.practiceId
```

PUT `/assignments/therapist-to-supervisor` — Assign therapist to supervisor

Validation:

- assignTherapistToSupervisorSchema

PUT `/assignments/patient-to-therapist` — Assign patient to therapist

Validation:

- assignPatientToTherapistSchema

---

# 📝 SESSIONS (sessions.routes.ts)

All routes require: `requireAuth + practiceContext`

Uses:

```
req.practiceId
```

### Session CRUD

POST `/sessions/create` — Create session

Validation:

- createSessionSchema

GET `/sessions/:sessionId` — Get session by ID

PUT `/sessions/:sessionId` — Update session

Validation:

- updateSessionSchema

DELETE `/sessions/:sessionId` — Delete session

---

### Patient Session

GET `/sessions/patient/:patientId/history` — Patient session history  
GET `/sessions/patient/:patientId/latest` — Latest patient session

---

### Therapist

GET `/sessions/my-drafts` — Therapist draft sessions  
GET `/sessions/my-upcoming` — Therapist upcoming sessions

---

### Supervisor Review Flow

GET `/sessions/pending-review` — Pending review sessions

PUT `/sessions/send-for-review/:sessionId` — Send session for review

PUT `/sessions/approve/:sessionId` — Approve session

Validation:

- reviewSessionSchema

PUT `/sessions/reject/:sessionId` — Reject session

Validation:

- reviewSessionSchema

---

# 📊 DASHBOARD (dashboard.routes.ts)

All routes require: `requireAuth + practiceContext`

Uses:

```
req.practiceId
```

GET `/dashboard/admin` — Admin dashboard  
GET `/dashboard/supervisor` — Supervisor dashboard  
GET `/dashboard/therapist` — Therapist dashboard
