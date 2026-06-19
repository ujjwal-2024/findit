// ADD THIS to backend/src/routes/auth.js
// Add at the top with other requires:
// const { Resend } = require('resend');
// const crypto = require('crypto');
// const resend = new Resend(process.env.RESEND_API_KEY);

// Also add these fields to your Prisma User model:
// resetToken    String?   @map("reset_token")
// resetTokenExp DateTime? @map("reset_token_exp")

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success even if email not found (security best practice)
  if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

  // Generate reset token
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExp: expiry }
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
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

  res.json({ message: 'If that email exists, a reset link has been sent.' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExp: { gt: new Date() } }
  });

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExp: null }
  });

  res.json({ message: 'Password reset successfully. You can now log in.' });
});