# BACKEND TODO

## Core API

- Create all route files
- Create all controller files (empty logic)
- Map every route to controller
- Add requireAuth middleware on protected routes
- Use clean controller naming

## Email System

- Create reusable sendEmail utility
- Configure email provider (Resend/SES/SMTP)
- Add env configs for email credentials
- Support HTML + text emails
- Add try/catch logging for email

## Email Templates

- Create welcome email template
- Create forgot password email template
- Create reset password email template
- Create change password confirmation email
- Add security warning in change password email
- Include login + temp password in welcome email

## Password Generator

- Create secure password generator utility
- Ensure uppercase lowercase number symbol
- Ensure 12–16 char length
- Use crypto secure random
- Send generated password in welcome email
