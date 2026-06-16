const express = require('express');
const Joi = require('joi');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../services/cloudinary');
const { runMatchingForItem } = require('../services/matchingJob');

const router = express.Router();
const prisma = new PrismaClient();

const itemSchema = Joi.object({
  type: Joi.string().valid('LOST', 'FOUND').required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(2000).required(),
  category: Joi.string().valid(
    'ELECTRONICS', 'CLOTHING', 'DOCUMENTS', 'PETS', 'JEWELLERY', 'BAGS', 'KEYS', 'OTHER'
  ).required(),
  location: Joi.string().min(2).max(255).required(),
  dateOccurred: Joi.date().required(),
});

// GET /api/items — list with filters
router.get('/', async (req, res) => {
  const { type, category, status, search, page = 1, limit = 12 } = req.query;
  const where = {};
  if (type) where.type = type;
  if (category) where.category = category;
  if (status) where.status = status;
  else where.status = { not: 'CLOSED' };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.item.count({ where }),
  ]);

  res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  const item = await prisma.item.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
});

// POST /api/items — create new item
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image is required' });

  const { error, value } = itemSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // Upload to Cloudinary
  const { url, publicId } = await uploadImage(req.file.buffer, 'findit/items');

  const item = await prisma.item.create({
    data: {
      ...value,
      userId: req.user.id,
      imageUrl: url,
      imagePublicId: publicId,
      dateOccurred: new Date(value.dateOccurred),
    },
    include: { user: { select: { id: true, name: true } } },
  });

  // Trigger AI matching asynchronously (don't await — respond immediately)
  runMatchingForItem(item).catch(console.error);

  res.status(201).json(item);
});

// PATCH /api/items/:id/status
router.patch('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['ACTIVE', 'MATCHED', 'RETURNED', 'CLOSED'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const item = await prisma.item.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (item.userId !== req.user.id) return res.status(403).json({ error: 'Not your item' });

  const updated = await prisma.item.update({ where: { id: req.params.id }, data: { status } });
  res.json(updated);
});

// DELETE /api/items/:id
router.delete('/:id', authenticate, async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (item.userId !== req.user.id) return res.status(403).json({ error: 'Not your item' });

  await deleteImage(item.imagePublicId);
  await prisma.item.delete({ where: { id: req.params.id } });
  res.json({ message: 'Item deleted' });
});

module.exports = router;
