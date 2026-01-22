interface OwnerPasswordResetSuccessData {
  changedAt: Date;
}

export const generateOwnerPasswordResetSuccessEmail = (
  data: OwnerPasswordResetSuccessData,
): string => {
  const { changedAt } = data;
  const formattedDate = new Date(changedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journi Password Reset Successful</title>
  <style>
    body { margin:0; padding:0; background:#F9F7F0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .container { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(95,122,90,0.15); }
    .header { background:linear-gradient(135deg,#A3B18A,#5F7A5A); padding:50px 30px; text-align:center; }
    .content { padding:50px 40px; color:#5C665C; line-height:1.6; text-align:center; }
    .button { display:inline-block; padding:18px 40px; background:linear-gradient(135deg,#A3B18A,#5F7A5A); color:#fff; text-decoration:none; border-radius:12px; font-weight:600; font-size:18px; box-shadow:0 10px 20px rgba(95,122,90,0.25); margin:40px auto; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.EMAIL_LOGO_URL}" alt="Journi" style="height:70px;margin-bottom:20px;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Password Reset Successful ✅</h1>
    </div>

    <div class="content">
      <p style="font-size:18px;color:#2C3A2C;">Your Journi account password was successfully reset on</p>
      <p style="font-size:28px;font-weight:700;color:#4A7043;margin:20px 0;">${formattedDate}</p>

      <a href="${process.env.OWNER_FRONTEND_URL}/login" class="button">Login Now</a>

      <div style="margin:50px auto;max-width:480px;background:#F0F4EB;padding:30px;border-radius:12px;border-left:5px solid #E07A5F;">
        <p style="color:#C44C2F;font-size:16px;">If you did not make this change, your account may be compromised.<br>Please contact support immediately.</p>
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
