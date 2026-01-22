interface UserPasswordChangedData {
  changedAt: Date;
  ipAddress?: string;
}

export const generateUserPasswordChangedEmail = (
  data: UserPasswordChangedData,
): string => {
  const { changedAt, ipAddress } = data;
  const formattedDate = new Date(changedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const ipHtml = ipAddress
    ? `<p style="margin:15px 0 0;font-size:15px;color:#5C665C;">From IP: <strong>${ipAddress}</strong></p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journi Password Changed</title>
  <style>
    body { margin:0; padding:0; background:#F9F7F0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .container { max-width:600px; margin:40px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 20px 40px rgba(95,122,90,0.15); }
    .header { background:linear-gradient(135deg,#A3B18A,#5F7A5A); padding:50px 30px; text-align:center; }
    .content { padding:50px 40px; color:#5C665C; line-height:1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.EMAIL_LOGO_URL}" alt="Journi" style="height:70px;margin-bottom:20px;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Password Changed</h1>
    </div>

    <div class="content">
      <p>Your Journi account password was changed on <strong>${formattedDate}</strong>${ipHtml ? "<br>" + ipHtml : ""}</p>

      <div style="margin-top:40px;background:#FFF4E5;padding:30px;border-radius:12px;border-left:5px solid #D4A017;">
        <p style="color:#B37A00;font-size:16px;font-weight:600;">If you did not make this change, your account may be compromised.<br>Contact support immediately.</p>
      </div>

      <div style="margin-top:40px;background:#F0F4EB;padding:25px;border-radius:12px;">
        <p style="margin:0 0 12px;font-weight:600;color:#2C3A2C;">Security recommendations</p>
        <ul style="margin:0;padding-left:20px;color:#5C665C;line-height:1.7;">
          <li>Use strong, unique passwords</li>
          <li>Enable two-factor authentication</li>
          <li>Check active sessions regularly</li>
        </ul>
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
