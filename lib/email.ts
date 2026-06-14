export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  type: "verification" | "reset"
): Promise<void> {
  // Development: log to console
  // Production: replace with Resend, Nodemailer, etc.
  if (process.env.NODE_ENV === "development") {
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📧  OTP Email → ${email}`);
    console.log(`    Type : ${type}`);
    console.log(`    OTP  : ${otp}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  }

  // TODO: wire up real email provider
  // Example (Resend):
  // await resend.emails.send({
  //   from: "noreply@singapurprobashi.com",
  //   to: email,
  //   subject: type === "verification" ? "Verify your email" : "Reset your password",
  //   html: `<p>Your OTP is: <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
  // });
}
