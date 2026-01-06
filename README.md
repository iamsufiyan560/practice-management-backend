# Practice Management API

Backend service for a multi-practice management system with secure authentication, role-based access, and structured session workflows.  
Built as a serverless-ready Express backend with fast local development support.

API reference → **api.md**

---

## Tech Stack

### Core

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="22"/> Node.js
  &nbsp;&nbsp;&nbsp;
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-V5LcH5U7RKfkRED6sF9bt-xSzNtAs5KUYa5P3ZwiT-TW288fF5pEtI_695EVau1g48c&usqp=CAU" width="22" /> Express
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="22"/> TypeScript
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" width="22"/> AWS Lambda (Serverless)
</p>

### Database

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" width="22"/> MySQL
  &nbsp;&nbsp;&nbsp;
  <img src="https://avatars.githubusercontent.com/u/108468352?s=200&v=4" width="22"/> Drizzle ORM
</p>

### Auth, Security & Validation

<p>
  <img src="https://avatars.githubusercontent.com/u/22194067?v=4" width="22"/> bcrypt
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/colinhacks/zod/master/logo.svg" width="22"/> Zod
  &nbsp;&nbsp;&nbsp;
<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXTGNNg4iV7eyjNtMiCJYw6KGRFhA4D84-Zw&s" width="20"/> Cookie Sessions
  &nbsp;&nbsp;&nbsp;
  <img src="https://avatars.githubusercontent.com/u/117689732?s=200&v=4" width="20"/> Rate Limiting
  &nbsp;&nbsp;&nbsp;
  <img src="https://cdn-icons-png.flaticon.com/512/2433/2433469.png" width="20"/> Field Encryption
</p>

### Infra & Utilities

<p>
  <img src="https://www.vectorlogo.zone/logos/serverless/serverless-icon.svg" width="22"/> Serverless Framework
  &nbsp;&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/nodemailer/nodemailer/master/assets/nm_logo_200x136.png" width="22"/> Nodemailer (SMTP)
  &nbsp;&nbsp;&nbsp;
  <img src="https://avatars.githubusercontent.com/u/9682013?v=4" width="22"/> Winston Logger
</p>

---

## What This Backend Handles

- Multi-practice architecture
- Owner → Admin → Supervisor → Therapist hierarchy
- Patient management
- Therapist session lifecycle + supervisor review flow
- Role-based dashboards
- Assignment system
  - Therapist → Supervisor
  - Patient → Therapist
- Secure cookie-based authentication
- Email flows (account created, reset, password change)
- Field-level encryption for sensitive data
- Strong validation + middleware architecture

---

## Project Structure

Main backend lives inside **src/**

```
src
├── config
├── controllers
├── db
├── mail
├── middleware
├── routes
├── script
├── utils
├── validations
├── app.ts
├── dev.ts
└── handler.ts
```

Other important files:

- `api.md` → endpoint reference
- `serverless.yml` → deployment config

---

## Environment Variables

Create `.env` in root:

```
DATABASE_URL=

FIELD_ENCRYPTION_KEY=

LOCAL_FRONTEND_URL=
OWNER_FRONTEND_URL=
USER_FRONTEND_URL=
EMAIL_LOGO_URL=

SUPPORT_EMAIL=
TEST_EMAIL=

SMTP_HOST=
SMTP_PORT=
SMTP_MAIL=
SMTP_PASSWORD=

OWNER_GENERATION_CODE=
```

---

## Install

```
npm install
```

---

## Development

### Fast Local Dev (recommended)

Runs directly with Express (no Lambda).  
Much faster locally — avoids Lambda cold start delay.

```
npm run dev:local
```

### Serverless Offline (Lambda simulation)

Runs same as AWS Lambda locally.

```
npm run dev
```

---

## Build

```
npm run build
```

---

## Database (Drizzle)

Generate migration:

```
npm run db:generate
```

Run migration:

```
npm run db:migrate
```

Open studio:

```
npm run db:studio
```

---

## Email Testing

```
npm run test:email
```

---

## Deployment

Deploy to AWS Lambda:

```
serverless deploy
```

---

## Architecture Notes

- Cookie-based auth sessions stored in DB
- AES-256 encryption for sensitive fields
- Multi-practice scoped APIs via `x-practice-id`
- Global users + practice role mapping
- Soft delete system (`isDeleted`)
- Central response utils (no raw res.json)
- Zod validation on all write APIs
- Winston logging for audit & debugging
