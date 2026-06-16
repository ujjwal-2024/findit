const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { compareImages } = require('./aiMatcher');
const { sendMatchNotification } = require('./emailService');

const prisma = new PrismaClient();
const THRESHOLD = parseInt(process.env.MATCH_THRESHOLD || '70');

/**
 * Run matching for a single newly uploaded item
 * Called immediately after an item is created
 */
async function runMatchingForItem(newItem) {
  const oppositeType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';

  // Get all active items of the opposite type in the same category
  const candidates = await prisma.item.findMany({
    where: { type: oppositeType, status: 'ACTIVE', category: newItem.category },
    include: { user: true },
  });

  console.log(`🤖 Matching "${newItem.title}" against ${candidates.length} candidates...`);

  for (const candidate of candidates) {
    // Skip if already matched
    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { lostItemId: newItem.id, foundItemId: candidate.id },
          { lostItemId: candidate.id, foundItemId: newItem.id },
        ],
      },
    });
    if (existing) continue;

    try {
      const lostItem = newItem.type === 'LOST' ? newItem : candidate;
      const foundItem = newItem.type === 'FOUND' ? newItem : candidate;

      const result = await compareImages(
        lostItem.imageUrl, foundItem.imageUrl, lostItem, foundItem
      );

      console.log(`  Score: ${result.score} for "${lostItem.title}" ↔ "${foundItem.title}"`);

      if (result.score >= THRESHOLD) {
        // Save match
        const match = await prisma.match.create({
          data: {
            lostItemId: lostItem.id,
            foundItemId: foundItem.id,
            score: result.score,
            aiReasoning: result.reasoning,
          },
        });

        // Create in-app notifications
        await prisma.notification.createMany({
          data: [
            { userId: lostItem.userId, matchId: match.id },
            { userId: foundItem.userId, matchId: match.id },
          ],
        });

        // Update item statuses
        await prisma.item.updateMany({
          where: { id: { in: [lostItem.id, foundItem.id] } },
          data: { status: 'MATCHED' },
        });

        // Send emails
        const lostOwner = await prisma.user.findUnique({ where: { id: lostItem.userId } });
        const foundOwner = await prisma.user.findUnique({ where: { id: foundItem.userId } });

        await sendMatchNotification({ lostItem, foundItem, match, lostOwner, foundOwner });

        // Mark as notified
        await prisma.match.update({ where: { id: match.id }, data: { notified: true } });

        console.log(`  ✅ Match saved and notifications sent! Score: ${result.score}`);
      }
    } catch (err) {
      console.error(`  ❌ Error comparing with ${candidate.id}:`, err.message);
    }
  }
}

/**
 * Scheduled job — runs every 30 minutes to catch any unmatched items
 */
function startMatchingJob() {
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Running scheduled matching job...');
    const unmatched = await prisma.item.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    for (const item of unmatched) {
      await runMatchingForItem(item);
    }
  });
  console.log('⏰ Matching job scheduled (every 30 mins)');
}

module.exports = { startMatchingJob, runMatchingForItem };
