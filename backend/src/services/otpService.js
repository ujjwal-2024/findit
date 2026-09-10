const prisma = new (require('@prisma/client').PrismaClient)()

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function sendOTPEmail(email, otp, name) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_FROM_NAME, email: process.env.BREVO_FROM_EMAIL },
      to: [{ email, name }],
      subject: 'FindIt — Your OTP for password reset',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <div style="background: #2563EB; padding: 20px 24px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">FindIt</h1>
          </div>
          <div style="border: 1px solid #E2E8F0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #0F172A;">Password Reset OTP</h2>
            <p style="color: #475569;">Hi ${name}, use the OTP below to reset your password. It expires in 10 minutes.</p>
            <div style="background: #F8FAFC; border: 2px dashed #2563EB; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563EB; margin: 0;">${otp}</p>
            </div>
            <p style="color: #94A3B8; font-size: 12px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || 'Failed to send OTP email')
  }

  return true
}

async function createOTP(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('No account found with that email')

  const otp = generateOTP()
  const expiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.user.update({
    where: { email },
    data: { otpCode: otp, otpExpiry: expiry }
  })

  await sendOTPEmail(email, otp, user.name)
  return true
}

async function verifyOTP(email, otp) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('No account found with that email')
  if (!user.otpCode || !user.otpExpiry) throw new Error('No OTP requested')
  if (new Date() > user.otpExpiry) throw new Error('OTP has expired')
  if (user.otpCode !== otp) throw new Error('Invalid OTP')

  // Clear OTP after successful verification
  await prisma.user.update({
    where: { email },
    data: { otpCode: null, otpExpiry: null }
  })

  return user
}

module.exports = { createOTP, verifyOTP }