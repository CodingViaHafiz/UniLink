import nodemailer from "nodemailer";

/**
 * Creates a nodemailer transporter.
 * If EMAIL_USER / EMAIL_PASS are not configured, falls back to console logging
 * (useful during local development without an SMTP server).
 */
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use an App Password for Gmail
    },
  });
};

// ─── Templates ───────────────────────────────────────────────────────────────

const passwordSetupHtml = (fullName, setupLink) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
              UniLink
            </h1>
            <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">University Resource Portal</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;">
              Welcome to UniLink, ${fullName}!
            </h2>
            <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
              Your faculty account has been created by the university administrator.
              Please click the button below to set your password and activate your account.
            </p>
            <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">
              This link is valid for <strong>24 hours</strong>.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${setupLink}"
                 style="display:inline-block;padding:14px 32px;background:#2563eb;color:#fff;
                        text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
                Set Your Password
              </a>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              If you did not expect this email, please ignore it — no action is needed.
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin:8px 0 0;word-break:break-all;color:#2563eb;font-size:12px;">
              ${setupLink}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              © ${new Date().getFullYear()} UniLink — This is an automated message, please do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const emailVerificationHtml = (fullName, verifyLink) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
              UniLink
            </h1>
            <p style="margin:6px 0 0;color:#bae6fd;font-size:13px;">University Resource Portal</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;">
              Verify your email, ${fullName}!
            </h2>
            <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
              Thanks for registering on UniLink. Please click the button below to verify your
              email address and activate your student account.
            </p>
            <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">
              This link is valid for <strong>24 hours</strong>.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${verifyLink}"
                 style="display:inline-block;padding:14px 32px;background:#0ea5e9;color:#fff;
                        text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
                Verify Email Address
              </a>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              If you did not create an account, please ignore this email.
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin:8px 0 0;word-break:break-all;color:#0ea5e9;font-size:12px;">
              ${verifyLink}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              &copy; ${new Date().getFullYear()} UniLink — This is an automated message, please do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Password Reset Email Template ────────────────────────────────────────────

const passwordResetHtml = (fullName, resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <!-- Header -->
        <tr>
          <td style="background:#dc2626;padding:28px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
              UniLink
            </h1>
            <p style="margin:6px 0 0;color:#fecaca;font-size:13px;">University Resource Portal</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px;">
              Reset your password, ${fullName}
            </h2>
            <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
              We received a request to reset your UniLink password. Click the button below to create a new password.
            </p>
            <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">
              This link is valid for <strong>1 hour</strong>. For security reasons, it can only be used once.
            </p>
            <div style="text-align:center;margin:28px 0;">
              <a href="${resetLink}"
                 style="display:inline-block;padding:14px 32px;background:#dc2626;color:#fff;
                        text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">
                Reset Password
              </a>
            </div>
            <p style="margin:0 0 16px;color:#94a3b8;font-size:12px;line-height:1.6;">
              If you did not request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin:8px 0 0;word-break:break-all;color:#dc2626;font-size:12px;">
              ${resetLink}
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #f1f5f9;">
            <p style="margin:0;color:#94a3b8;font-size:11px;">
              © ${new Date().getFullYear()} UniLink — This is an automated message, please do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

// ─── Exported functions ───────────────────────────────────────────────────────

/**
 * Sends the "Set Your Password" email to a newly-invited faculty member.
 * In dev mode (no SMTP config), prints the link to the console instead.
 */
export const sendPasswordSetupEmail = async ({ to, fullName, setupLink }) => {
  const transporter = createTransporter();

  if (!transporter) {
    // Development fallback — print to console so the dev can test the flow
    console.log("\n──────────────────────────────────────────────────");
    console.log("📧  [EMAIL SERVICE — DEV MODE, no SMTP configured]");
    console.log(`    To:      ${to}`);
    console.log(`    Name:    ${fullName}`);
    console.log(`    Link:    ${setupLink}`);
    console.log("──────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"UniLink" <no-reply@unilink.edu>`,
    to,
    subject: "Set Your UniLink Password — Action Required",
    html: passwordSetupHtml(fullName, setupLink),
  });
};

/**
 * Sends email verification link to a newly-registered student.
 * In dev mode (no SMTP config), prints the link to the console instead.
 */
export const sendVerificationEmail = async ({ to, fullName, verifyLink }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("\n──────────────────────────────────────────────────");
    console.log("📧  [EMAIL SERVICE — DEV MODE, no SMTP configured]");
    console.log(`    To:      ${to}`);
    console.log(`    Name:    ${fullName}`);
    console.log(`    Link:    ${verifyLink}`);
    console.log("──────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"UniLink" <no-reply@unilink.edu>`,
    to,
    subject: "Verify Your UniLink Account",
    html: emailVerificationHtml(fullName, verifyLink),
  });
};

/**
 * Sends password reset link to a user who requested password reset.
 * In dev mode (no SMTP config), prints the link to the console instead.
 */
export const sendPasswordResetEmail = async ({ to, fullName, resetLink }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("\n──────────────────────────────────────────────────");
    console.log("📧  [EMAIL SERVICE — DEV MODE, no SMTP configured]");
    console.log(`    To:      ${to}`);
    console.log(`    Name:    ${fullName}`);
    console.log(`    Link:    ${resetLink}`);
    console.log("──────────────────────────────────────────────────\n");
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"UniLink" <no-reply@unilink.edu>`,
    to,
    subject: "Reset Your UniLink Password",
    html: passwordResetHtml(fullName, resetLink),
  });
};
