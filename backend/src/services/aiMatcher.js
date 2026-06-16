const Groq = require('groq-sdk');
const axios = require('axios');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function urlToBase64(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(response.data).toString('base64');
  const mimeType = response.headers['content-type'] || 'image/jpeg';
  return { base64, mimeType };
}

async function compareImages(lostImageUrl, foundImageUrl, lostItem, foundItem) {
  const [lost, found] = await Promise.all([
    urlToBase64(lostImageUrl),
    urlToBase64(foundImageUrl),
  ]);

  const prompt = `You are an AI assistant helping match lost and found items.

Compare these two images. The first is a LOST item, the second is a FOUND item.

Lost item: "${lostItem.title}" — ${lostItem.description}
Found item: "${foundItem.title}" — ${foundItem.description}

Analyse both images for colour, shape, brand, text, material, and unique features.

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "match_score": <integer 0-100>,
  "confidence": "<low|medium|high>",
  "matching_features": ["feature1", "feature2"],
  "differences": ["difference1", "difference2"],
  "reasoning": "<2-3 sentence explanation>"
}`;

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${lost.mimeType};base64,${lost.base64}` } },
          { type: 'image_url', image_url: { url: `data:${found.mimeType};base64,${found.base64}` } },
          { type: 'text', text: prompt },
        ],
      },
    ],
    max_tokens: 512,
  });

  const text = response.choices[0].message.content.trim().replace(/```json|```/g, '');
  const parsed = JSON.parse(text);

  return {
    score: parsed.match_score,
    confidence: parsed.confidence,
    matchingFeatures: parsed.matching_features || [],
    differences: parsed.differences || [],
    reasoning: parsed.reasoning,
  };
}

module.exports = { compareImages };