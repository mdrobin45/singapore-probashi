import nodemailer from "nodemailer";

// Create lazily so env vars are always read at call time, not at module load
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getFrom() {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "";
  // If SMTP_FROM already has the "Name <addr>" format, use as-is
  return from.includes("<") ? from : `Singapur Probashi <${from}>`;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  type: "verification" | "reset"
): Promise<void> {
  const isVerification = type === "verification";
  const subject = isVerification
    ? "Verify your Singapur Probashi account"
    : "Reset your password";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:#2563eb;padding:28px 32px;text-align:center;">
                    <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                      Singapur Probashi
                    </p>
                    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1px;">
                      ${isVerification ? "Email Verification" : "Password Reset"}
                    </p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:36px 32px 28px;">
                    <p style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">
                      ${isVerification ? "Verify your email address" : "Reset your password"}
                    </p>
                    <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
                      ${
                        isVerification
                          ? "Enter the code below to complete your registration. The code expires in 10 minutes."
                          : "Use the code below to reset your password. The code expires in 10 minutes."
                      }
                    </p>
                    <!-- OTP box -->
                    <div style="background:#f0f4ff;border:1.5px dashed #2563eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Your OTP code</p>
                      <p style="margin:0;font-size:40px;font-weight:700;color:#2563eb;letter-spacing:10px;">${otp}</p>
                    </div>
                    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.5;">
                      If you didn't request this, you can safely ignore this email.
                      Never share this code with anyone.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:16px 32px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Singapur Probashi Community. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await getTransporter().sendMail({ from: getFrom(), to: email, subject, html });
}
