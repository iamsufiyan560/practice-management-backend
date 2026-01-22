interface UserForgotPasswordData {
  otp: string;
  token: string;
  otpExpiry: Date;
  expiryMinutes: number;
}

export const generateUserForgotPasswordEmail = (
  data: UserForgotPasswordData,
): string => {
  const { otp, token, otpExpiry, expiryMinutes } = data;
  const formattedExpiry = new Date(otpExpiry).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const resetUrl = `${process.env.USER_FRONTEND_URL}/reset-password?token=${token}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journi Password Reset Request</title>
  <style>
    body { margin:0; padding:0; background:#F9F7F0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .container { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(95,122,90,0.15); }
    .header { background:linear-gradient(135deg,#A3B18A,#5F7A5A); padding:50px 30px; text-align:center; }
    .content { padding:50px 40px; color:#5C665C; line-height:1.6; text-align:center; }
    .otp-box { font-size:52px; font-weight:700; letter-spacing:12px; color:#4A7043; background:#F0F4EB; padding:30px; border-radius:16px; margin:40px auto; max-width:320px; border:4px dashed #A3B18A; }
    .button { display:inline-block; padding:18px 40px; background:linear-gradient(135deg,#A3B18A,#5F7A5A); color:#fff; text-decoration:none; border-radius:12px; font-weight:600; font-size:18px; box-shadow:0 10px 20px rgba(95,122,90,0.25); margin:40px auto; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.EMAIL_LOGO_URL}" alt="Journi" style="height:70px;margin-bottom:20px;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Password Reset</h1>
    </div>

    <div class="content">
      <p style="font-size:18px;">You requested a password reset for your Journi account.</p>
      
      <div class="otp-box">${otp}</div>

      <p style="font-size:18px;color:#2C3A2C;">This code expires in <strong>${expiryMinutes} minutes</strong></p>
      <p style="color:#5C665C;font-size:14px;">Expires ${formattedExpiry}</p>

      <a href="${resetUrl}" class="button">Reset Password</a>

      <div style="background:#FFF4E5;padding:25px;border-radius:12px;border-left:5px solid #D4A017;margin:40px auto;max-width:480px;">
        <p style="margin:0;color:#B37A00;font-size:15px;">If you did not request this, ignore this email and contact support immediately.</p>
        <p style="margin:15px 0 0;color:#5C665C;font-size:14px;">Never share this code with anyone.</p>
      </div>
    </div>

    <div style="background:#F9F7F0;padding:30px;text-align:center;font-size:14px;color:#5C665C;border-top:1px solid #E5E9E0;">
      Questions? <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color:#5F7A5A;text-decoration:none;">${process.env.SUPPORT_EMAIL}</a><br>
      © MySafeSpaces • Journi • All rights reserved.
    </div>
  </div>
</body>
</html>`;
};
