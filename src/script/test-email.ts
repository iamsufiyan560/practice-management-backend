import {
  generateOwnerAccountCreatedEmail,
  generateOwnerForgotPasswordEmail,
  generateOwnerPasswordChangedEmail,
  generateOwnerPasswordResetSuccessEmail,
  generateUserAccountCreatedEmail,
  generateUserForgotPasswordEmail,
  generateUserPasswordChangedEmail,
  generateUserPasswordResetSuccessEmail,
} from "@/mail/templates";
import { sendEmail } from "@/mail/send-mail";

const TEST_EMAIL = process.env.TEST_EMAIL;

if (!TEST_EMAIL) {
  console.error("Missing TEST_EMAIL in .env");
  process.exit(1);
}

if (!process.env.SMTP_HOST || !process.env.SMTP_MAIL) {
  console.error("SMTP settings missing in .env");
  process.exit(1);
}

const now = new Date();

const dummyData = {
  // account created
  account: {
    email: TEST_EMAIL,
    tempPassword: "TempPass123!",
    firstName: "Sufiyan",
    createdAt: now,
  },

  // forgot password
  forgot: {
    otp: "483920",
    token: "fake-reset-token-abc123xyz",
    otpExpiry: new Date(now.getTime() + 15 * 60 * 1000),
    expiryMinutes: 15,
  },

  // password changed / reset success
  change: {
    changedAt: now,
    ipAddress: "103.21.244.123", // example IP from Mumbai region
  },
};

async function sendAllTestEmails() {
  console.log(`Sending test emails to → ${TEST_EMAIL}\n`);

  const tests = [
    {
      name: "Owner Account Created",
      subject: "Welcome to Your Journi Owner Account",
      html: generateOwnerAccountCreatedEmail(dummyData.account),
    },
    {
      name: "User Account Created",
      subject: "Welcome to Your Journi Account",
      html: generateUserAccountCreatedEmail(dummyData.account),
    },
    {
      name: "Owner Forgot Password",
      subject: "Journi Password Reset Request",
      html: generateOwnerForgotPasswordEmail(dummyData.forgot),
    },
    {
      name: "User Forgot Password",
      subject: "Journi Password Reset Request",
      html: generateUserForgotPasswordEmail(dummyData.forgot),
    },
    {
      name: "Owner Password Reset Success",
      subject: "Journi Password Reset Successful",
      html: generateOwnerPasswordResetSuccessEmail(dummyData.change),
    },
    {
      name: "User Password Reset Success",
      subject: "Journi Password Reset Successful",
      html: generateUserPasswordResetSuccessEmail(dummyData.change),
    },
    {
      name: "Owner Password Changed",
      subject: "Journi Password Changed",
      html: generateOwnerPasswordChangedEmail(dummyData.change),
    },
    {
      name: "User Password Changed",
      subject: "Journi Password Changed",
      html: generateUserPasswordChangedEmail(dummyData.change),
    },
  ];

  for (const test of tests) {
    console.log(`→ Sending: ${test.name}`);

    const success = await sendEmail({
      to: TEST_EMAIL!,
      subject: test.subject,
      html: test.html,
    });

    console.log(success ? "   OK" : "   FAILED");
    await new Promise((r) => setTimeout(r, 1400)); // small delay to avoid rate limits
  }

  console.log("\nAll test emails attempted.");
}

sendAllTestEmails().catch((err) => {
  console.error("Test script crashed:", err);
  process.exit(1);
});
