import "dotenv/config";

import { logger } from "../config/index.js";
import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

let transporter: nodemailer.Transporter | null = null;

// create transporter once (singleton)
function getTransporter() {
  if (transporter) return transporter;

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_MAIL ||
    !process.env.SMTP_PASSWORD
  ) {
    throw new Error("SMTP env not configured");
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  return transporter;
}

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailParams) => {
  try {
    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: `"Journi Pro" <${process.env.SMTP_MAIL}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });

    logger.info("Email sent", {
      to,
      subject,
      messageId: info.messageId,
    });

    return true;
  } catch (error: any) {
    logger.error("Email send failed", {
      error: error?.message,
      stack: error?.stack,
      to,
      subject,
    });

    return false;
  }
};
