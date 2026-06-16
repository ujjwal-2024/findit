require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const { startMatchingJob } = require('./services/matchingJob');

const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const matchRoutes = require('./routes/matches');
const notificationRoutes = require('./routes/notifications');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);

// Test matching trigger
app.get('/api/test-match', async (req, res) => {
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  const { runMatchingForItem } = require('./services/matchingJob')
  const items = await prisma.item.findMany({ where: { status: 'ACTIVE' }, take: 5 })
  for (const item of items) await runMatchingForItem(item)
  res.json({ message: 'Matching triggered', items: items.length })
})

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ FindIt backend running on port ${PORT}`);
  startMatchingJob();
});