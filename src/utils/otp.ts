import crypto from "crypto";

type OtpOptions = {
  otpExpiryMinutes?: number; // default 15
  tokenExpiryMinutes?: number; // default 60
  sessionExpiryDays?: number; // default 7
};

export function generateOtpBundle(options: OtpOptions = {}) {
  const otpLength = 6;
  const otpExpiryMinutes = options.otpExpiryMinutes ?? 15;
  const tokenExpiryMinutes = options.tokenExpiryMinutes ?? 60;
  const sessionExpiryDays = options.sessionExpiryDays ?? 7;

  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < otpLength; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }

  const token = crypto.randomBytes(32).toString("hex");

  const now = Date.now();

  const otpExpiry = new Date(now + otpExpiryMinutes * 60 * 1000);
  const tokenExpiry = new Date(now + tokenExpiryMinutes * 60 * 1000);
  const expiresAt = new Date(now + sessionExpiryDays * 24 * 60 * 60 * 1000); // 7 day session

  return {
    otp,
    token,
    otpExpiry,
    tokenExpiry,
    expiresAt,
  };
}
