require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const existing = await prisma.user.findUnique({ where: { email: value.email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(value.password, 12);
  const user = await prisma.user.create({
    data: { name: value.name, email: value.email, passwordHash },
  });

  res.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

const { createOTP, verifyOTP } = require('../services/otpService')

// POST /api/auth/forgot-password — sends OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    await createOTP(email)
    res.json({ message: 'OTP sent to your email' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/auth/verify-otp — verifies OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' })

  try {
    await verifyOTP(email, otp)
    res.json({ message: 'OTP verified successfully' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/auth/reset-password — resets password after OTP verified
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(404).json({ error: 'User not found' })

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  })

  res.json({ message: 'Password reset successfully' })
})
// GET /api/auth/public-profile/:id
router.get('/public-profile/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true }
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

// POST /api/auth/notify-owner/:id
router.post('/notify-owner/:id', async (req, res) => {
  const { finderName, finderContact, location, message } = req.body
  if (!finderName || !finderContact) return res.status(400).json({ error: 'Name and contact are required' })

  const owner = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!owner) return res.status(404).json({ error: 'Owner not found' })

  // Save as a notification in DB
  await prisma.notification.create({
    data: {
      userId: owner.id,
      matchId: null,
      message: `${finderName} found your item! Contact: ${finderContact}. Found at: ${location || 'not specified'}. Message: ${message || 'none'}`,
    }
  })

  res.json({ message: 'Owner notified successfully' })
})
module.exports = router;