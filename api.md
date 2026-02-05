# API LIST

Base URL: `/api/v1`

---

# 🔐 AUTH — OWNER

POST /api/v1/owner/login  
POST /api/v1/owner/logout

GET /api/v1/owner/me

GET /api/v1/owner/:ownerId # single owner  
PUT /api/v1/owner/:ownerId # update owner  
DELETE /api/v1/owner/:ownerId # delete owner

---

# 🔐 AUTH — USERS (ADMIN / SUP / THERAPIST)

POST /api/v1/users/login  
POST /api/v1/users/logout  
GET /api/v1/users/me

GET /api/v1/users/:userId # single user profile  
PUT /api/v1/users/:userId # update profile  
DELETE /api/v1/users/:userId # delete profile

---

# 🏥 PRACTICE / ORGANIZATION

POST /api/v1/practices # create practice  
GET /api/v1/practices # get all practices  
GET /api/v1/practices/:practiceId # get single practice  
PUT /api/v1/practices/:practiceId # update practice  
DELETE /api/v1/practices/:practiceId # delete practice

---

# 👤 CREATE USERS BY PRACTICE

POST /api/v1/practices/:practiceId/admins  
POST /api/v1/practices/:practiceId/supervisors  
POST /api/v1/practices/:practiceId/therapists

---

# 👤 UPDATE USERS BY PRACTICE

PUT /api/v1/practices/:practiceId/admins/:adminId  
PUT /api/v1/practices/:practiceId/supervisors/:supervisorId  
PUT /api/v1/practices/:practiceId/therapists/:therapistId

---

# 👤 DELETE USERS BY PRACTICE

DELETE /api/v1/practices/:practiceId/admins/:adminId  
DELETE /api/v1/practices/:practiceId/supervisors/:supervisorId  
DELETE /api/v1/practices/:practiceId/therapists/:therapistId

---

# 👤 GET USERS (ALL + SINGLE)

GET /api/v1/practices/:practiceId/admins # all admins by practice  
GET /api/v1/practices/:practiceId/supervisors # all supervisors by practice  
GET /api/v1/practices/:practiceId/therapists # all therapists by practice

GET /api/v1/admins/:adminId # single admin  
GET /api/v1/supervisors/:supervisorId # single supervisor  
GET /api/v1/therapists/:therapistId # single therapist

---

# 🔗 ASSIGNMENT

PUT /api/v1/practices/:practiceId/assign-therapist-to-supervisor  
PUT /api/v1/practices/:practiceId/unassign-therapist-from-supervisor

PUT /api/v1/practices/:practiceId/assign-patient-to-therapist  
PUT /api/v1/practices/:practiceId/unassign-patient-from-therapist

---

# 🧍 PATIENT

POST /api/v1/practices/:practiceId/patients # create patient  
GET /api/v1/practices/:practiceId/patients # all patients by practice  
GET /api/v1/therapists/:therapistId/patients # all patients by therapist  
GET /api/v1/patients/:patientId # single patient

PUT /api/v1/patients/:patientId # update patient  
DELETE /api/v1/patients/:patientId # delete patient

---

# 📝 SESSION NOTES (CRUD)

POST /api/v1/practices/:practiceId/sessions # create session  
GET /api/v1/sessions/:sessionId # single session  
PUT /api/v1/sessions/:sessionId # update session  
DELETE /api/v1/sessions/:sessionId # delete session

---

# 📝 SESSION FETCH (ALL + SINGLE)

GET /api/v1/practices/:practiceId/sessions # all sessions by practice  
GET /api/v1/therapists/:therapistId/sessions # all sessions by therapist  
GET /api/v1/patients/:patientId/sessions # all sessions by patient

GET /api/v1/patients/:patientId/sessions/history # full history  
GET /api/v1/patients/:patientId/sessions/latest # latest session

---

# 📝 SESSION STATES

GET /api/v1/practices/:practiceId/therapists/:therapistId/sessions/draft  
GET /api/v1/practices/:practiceId/therapists/:therapistId/sessions/upcoming  
GET /api/v1/practices/:practiceId/supervisors/:supervisorId/sessions/pending-review

PUT /api/v1/sessions/:sessionId/send-for-review  
PUT /api/v1/sessions/:sessionId/approve  
PUT /api/v1/sessions/:sessionId/reject

---

# 📊 DASHBOARD APIs

GET /api/v1/practices/:practiceId/dashboard/admin  
GET /api/v1/practices/:practiceId/dashboard/supervisor/:supervisorId  
GET /api/v1/practices/:practiceId/dashboard/therapist/:therapistId
