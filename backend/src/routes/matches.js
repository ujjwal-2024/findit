const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/matches — get all matches for current user's items
router.get('/', authenticate, async (req, res) => {
  const userItems = await prisma.item.findMany({
    where: { userId: req.user.id },
    select: { id: true },
  });
  const itemIds = userItems.map((i) => i.id);

  const matches = await prisma.match.findMany({
    where: { OR: [{ lostItemId: { in: itemIds } }, { foundItemId: { in: itemIds } }] },
    include: {
      lostItem: { include: { user: { select: { id: true, name: true } } } },
      foundItem: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { score: 'desc' },
  });

  res.json(matches);
});

// GET /api/matches/:id
router.get('/:id', authenticate, async (req, res) => {
  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
    include: {
      lostItem: { include: { user: { select: { id: true, name: true, email: true } } } },
      foundItem: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Only allow users involved in the match to see it
  const userId = req.user.id;
  if (match.lostItem.userId !== userId && match.foundItem.userId !== userId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(match);
});

module.exports = router;
