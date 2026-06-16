const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send match notification email to both the item owner and the finder
 */
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
        <p style="color: #475569;">
          Our AI has found a <strong>${score}% match</strong> for your ${theirItemType} item.
        </p>
        <div style="background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #166534; font-weight: bold;">AI Match Score: ${score}%</p>
          <p style="margin: 8px 0 0; color: #15803D; font-size: 14px;">${match.aiReasoning}</p>
        </div>
        <p style="color: #475569;"><strong>Matched with:</strong> ${otherItem.title}</p>
        <p style="color: #64748B; font-size: 14px;">${otherItem.description}</p>
        <a href="${matchUrl}" style="display: inline-block; background: #2563EB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 8px;">
          View Match Details →
        </a>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 12px; margin: 0;">
          You're receiving this because you posted an item on FindIt.
        </p>
      </div>
    </div>
  `;

  await Promise.all([
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: lostOwner.email,
      subject: `FindIt: ${score}% match found for your lost "${lostItem.title}"`,
      html: emailHtml(lostOwner.name, 'lost', foundItem),
    }),
    resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: foundOwner.email,
      subject: `FindIt: Your found item "${foundItem.title}" may have an owner`,
      html: emailHtml(foundOwner.name, 'found', lostItem),
    }),
  ]);
}

module.exports = { sendMatchNotification };
