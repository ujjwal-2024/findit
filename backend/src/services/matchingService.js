import Anthropic from '@anthropic-ai/sdk'
import fetch from 'node:http'
import prisma from '../lib/prisma.js'
import { sendMatchNotification } from './emailService.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const THRESHOLD = Number(process.env.MATCH_THRESHOLD) || 70

// Fetch an image URL and return it as base64
async function imageUrlToBase64(url) {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

// Compare two items using Claude Vision
export async function compareItems(lostItem, foundItem) {
  try {
    const [lostBase64, foundBase64] = await Promise.all([
      imageUrlToBase64(lostItem.imageUrl),
      imageUrlToBase64(foundItem.imageUrl),
    ])

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an AI assistant helping match lost and found items.

Compare these two item images and determine if they could be the same item.

Lost item details: "${lostItem.title}" — ${lostItem.description}
Found item details: "${foundItem.title}" — ${foundItem.description}

Analyse both images carefully for: colour, shape, size, brand/logo, text, material, condition, and any unique features.

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "match_score": <integer 0-100>,
  "confidence": "<low|medium|high>",
  "matching_features": ["feature1", "feature2"],
  "differences": ["diff1", "diff2"],
  "reasoning": "<2-3 sentence explanation of why these do or do not match>"
}`,
            },
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: lostBase64 },
            },
            {
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: foundBase64 },
            },
          ],
        },
      ],
    })

    const text = message.content[0].text.trim()
    const result = JSON.parse(text)
    return result
  } catch (err) {
    console.error('[AI] Failed to compare items:', err.message)
    return null
  }
}

// Run matching for a specific newly added item
export async function matchNewItem(newItem) {
  const oppositeType = newItem.type === 'lost' ? 'found' : 'lost'

  // Get all active items of the opposite type
  const candidates = await prisma.item.findMany({
    where: { type: oppositeType, status: 'active' },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  const newItemWithUser = await prisma.item.findUnique({
    where: { id: newItem.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  for (const candidate of candidates) {
    // Skip if a match already exists between these two
    const existing = await prisma.match.findFirst({
      where: {
        OR: [
          { lostItemId: newItem.id, foundItemId: candidate.id },
          { lostItemId: candidate.id, foundItemId: newItem.id },
        ],
      },
    })
    if (existing) continue

    const lostItem = newItem.type === 'lost' ? newItemWithUser : candidate
    const foundItem = newItem.type === 'found' ? newItemWithUser : candidate

    console.log(`[AI] Comparing "${lostItem.title}" (lost) vs "${foundItem.title}" (found)...`)
    const result = await compareItems(lostItem, foundItem)
    if (!result) continue

    console.log(`[AI] Score: ${result.match_score}`)

    if (result.match_score >= THRESHOLD) {
      // Save the match
      const match = await prisma.match.create({
        data: {
          lostItemId: lostItem.id,
          foundItemId: foundItem.id,
          score: result.match_score / 100,
          aiReasoning: result.reasoning,
        },
      })

      // Create notifications for both users
      await prisma.notification.createMany({
        data: [
          { userId: lostItem.user.id, matchId: match.id },
          { userId: foundItem.user.id, matchId: match.id },
        ],
        skipDuplicates: true,
      })

      // Send emails
      await sendMatchNotification({
        match,
        lostItem,
        foundItem,
        score: result.match_score,
        reasoning: result.reasoning,
      })

      // Update match as notified
      await prisma.match.update({ where: { id: match.id }, data: { notified: true } })

      console.log(`[AI] Match saved! Score: ${result.match_score}`)
    }
  }
}

// Cron job: scan all unmatched active items
export async function runMatchingJob() {
  const recentItems = await prisma.item.findMany({
    where: {
      status: 'active',
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  })

  for (const item of recentItems) {
    await matchNewItem(item)
  }
}
