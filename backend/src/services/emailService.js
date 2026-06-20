const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendMatchNotification({ lostItem, foundItem, match, lostOwner, foundOwner }) {
  const appUrl = process.env.FRONTEND_URL;
  const matchUrl = `${appUrl}/matches/${match.id}`;
  const score = Math.round(match.score);

  const emailHtml = (recipientName, theirItemType, otherItem) => `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <div style="background: #2563EB; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 22px;">FindIt</h1>
        <p style="color: #BFDBFE; margin: 4px 0 0;">AI-Powered Lost & Found</p>
      </div>
      <div style="border: 1px solid #E2E8F0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0F172A; margin-top: 0;">Potential match found! 🎉</h2>
        <p style="color: #475569;">Hi ${recipientName},</p>
        <p style="color: #475569;">Our AI has found a <strong>${score}% match</strong> for your ${theirItemType} item.</p>
        <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #166534; font-weight: bold;">AI Match Score: ${score}%</p>
          <p style="margin: 8px 0 0; color: #15803D; font-size: 14px;">${match.aiReasoning}</p>
        </div>
        <p style="color: #475569;"><strong>Matched with:</strong> ${otherItem.title}</p>
        <a href="${matchUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 8px;">
          View Match Details →
        </a>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"FindIt" <${process.env.GMAIL_USER}>`,
    to: lostOwner.email,
    subject: `FindIt: ${score}% match found for your lost "${lostItem.title}"`,
    html: emailHtml(lostOwner.name, 'lost', foundItem),
  });

  await transporter.sendMail({
    from: `"FindIt" <${process.env.GMAIL_USER}>`,
    to: foundOwner.email,
    subject: `FindIt: Your found item "${foundItem.title}" may have an owner`,
    html: emailHtml(foundOwner.name, 'found', lostItem),
  });
}

async function sendPasswordResetEmail(email, resetUrl) {
  await transporter.sendMail({
    from: `"FindIt" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'FindIt — Reset your password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0F172A;">Reset your FindIt password</h2>
        <p style="color: #475569;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #94A3B8; font-size: 12px;">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendMatchNotification, sendPasswordResetEmail };