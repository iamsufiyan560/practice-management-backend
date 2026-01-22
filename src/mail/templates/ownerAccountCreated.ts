interface OwnerAccountCreatedData {
  email: string;
  tempPassword: string;
  firstName: string | null;
  createdAt: Date;
}

export const generateOwnerAccountCreatedEmail = (
  data: OwnerAccountCreatedData,
): string => {
  const { email, tempPassword, firstName, createdAt } = data;
  const name = firstName || "there";
  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Your Journi Owner Account</title>
  <style>
    body { margin:0; padding:0; background:#F9F7F0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .container { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(95,122,90,0.15); }
    .header { background:linear-gradient(135deg,#A3B18A,#5F7A5A); padding:50px 30px; text-align:center; }
    .content { padding:50px 40px; color:#5C665C; line-height:1.6; }
    .box { background:#F0F4EB; padding:24px; border-radius:12px; margin-bottom:30px; }
    .button { display:inline-block; padding:18px 40px; background:linear-gradient(135deg,#A3B18A,#5F7A5A); color:#fff; text-decoration:none; border-radius:12px; font-weight:600; font-size:18px; box-shadow:0 10px 20px rgba(95,122,90,0.25); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.EMAIL_LOGO_URL}" alt="Journi" style="height:70px;margin-bottom:20px;">
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">Welcome to Journi</h1>
    </div>

    <div class="content">
      <h2 style="color:#2C3A2C;font-size:26px;margin:0 0 20px;">Hi ${name},</h2>
      <p>Your owner account has been created by an Administrator.</p>

      <div class="box">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#5C665C;margin-bottom:8px;">Your Email</div>
        <div style="font-size:20px;font-weight:600;color:#2C3A2C;">${email}</div>
      </div>

      <div class="box">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#5C665C;margin-bottom:8px;">Temporary Password</div>
        <div style="font-size:28px;font-weight:700;color:#4A7043;letter-spacing:3px;">${tempPassword}</div>
      </div>

      <a href="${process.env.OWNER_FRONTEND_URL}/login" class="button">Login to Owner Portal</a>

      <div style="margin-top:40px;padding:25px;background:#F0F4EB;border-radius:12px;border-left:5px solid #5F7A5A;">
        <div style="font-size:14px;color:#5C665C;">Account created by: <strong style="color:#2C3A2C;">Administrator</strong></div>
        <div style="font-size:14px;color:#5C665C;margin-top:8px;">Created on: <strong style="color:#2C3A2C;">${formattedDate}</strong></div>
      </div>
    </div>

    <div style="background:#F9F7F0;padding:30px;text-align:center;font-size:14px;color:#5C665C;border-top:1px solid #E5E9E0;">
      Questions? Reach us at <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color:#5F7A5A;text-decoration:none;">${process.env.SUPPORT_EMAIL}</a><br>
      © MySafeSpaces • Journi • All rights reserved.
    </div>
  </div>
</body>
</html>`;
};
