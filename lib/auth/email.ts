import nodemailer from "nodemailer";
import { config } from "@/lib/config";

// Create reusable transporter with strict timeouts to prevent hanging requests
function createTransporter() {
  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
}

export async function sendOTPEmail(
  to: string,
  otp: string
): Promise<void> {
  const transporter = createTransporter();

  const expiryMinutes = config.auth.otpExpiryMinutes;

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject: "Your UniVault Login Code",
    text: `
Your UniVault login code is: ${otp}

This code expires in ${expiryMinutes} minutes.

If you did not request this code, please ignore this email.

— UniVault
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;padding:40px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <h1 style="margin:0;color:#2dd4bf;font-size:28px;font-weight:700;">UniVault</h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">University Academic Resource Platform</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="margin:0;color:#f1f5f9;font-size:16px;">Your login code is:</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="background:#0f172a;border:2px solid #2dd4bf;border-radius:8px;padding:20px 40px;display:inline-block;">
                <span style="color:#2dd4bf;font-size:36px;font-weight:700;letter-spacing:8px;">${otp}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <p style="margin:0;color:#94a3b8;font-size:14px;">
                This code expires in <strong style="color:#f1f5f9;">${expiryMinutes} minutes</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center">
              <p style="margin:0;color:#64748b;font-size:12px;">
                If you did not request this code, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
