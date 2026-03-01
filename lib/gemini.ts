import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiPredictionResult, PhotoAnalysisResult } from '@/types';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  return new GoogleGenerativeAI(apiKey);
}

function parseGeminiJson<T>(rawText: string, context: string): T {
  const withoutFenceStart = rawText.trim().replace(/^```(?:json)?\s*/i, '');
  const withoutFences = withoutFenceStart.replace(/\s*```$/, '').trim();
  const firstBrace = withoutFences.indexOf('{');
  const lastBrace = withoutFences.lastIndexOf('}');
  const candidate = firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFences.slice(firstBrace, lastBrace + 1)
    : withoutFences;

  try {
    return JSON.parse(candidate) as T;
  } catch (error) {
    console.error(`Gemini JSON parse error (${context}):`, error);
    throw new Error(`Invalid JSON returned by AI (${context})`);
  }
}

// ─── Waste Prediction ─────────────────────────────────────────────────────────

export async function predictWaste(
  history: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    created_at: string;
    status: string;
  }>
): Promise<GeminiPredictionResult> {
  const model = getGeminiClient().getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });
  const tomorrow = new Date(Date.now() + 86_400_000);

  const prompt = `
You are a food waste prediction engine for GreenBridge, a food rescue platform.

Given a restaurant's surplus food history from the past 30 days, predict what food
they are likely to have as surplus tomorrow. Focus on recurring patterns and categories.

Return ONLY valid JSON in this exact shape — no markdown, no explanation:
{
  "predictions": [
    {
      "category": string,
      "item_name": string,
      "estimated_qty": number,
      "unit": string,
      "risk_level": "low" | "medium" | "high",
      "confidence": number,
      "reason": string
    }
  ],
  "summary": string
}

Rules:
- confidence is a float between 0.0 and 1.0
- risk_level "high" means >70% chance of waste
- reason is one concise sentence
- summary is 1-2 sentences max
- Return 3-5 predictions only

Restaurant surplus history (last 30 days):
${JSON.stringify(history, null, 2)}

Today: ${new Date().toDateString()}
Tomorrow (predict for): ${tomorrow.toDateString()} (${tomorrow.toLocaleDateString('en-US', { weekday: 'long' })})
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseGeminiJson<GeminiPredictionResult>(text, 'waste_prediction');
}

// ─── Photo Analysis ───────────────────────────────────────────────────────────

export async function analyzeFoodPhoto(
  base64Image: string,
  mimeType: string
): Promise<PhotoAnalysisResult> {
  const genAI = getGeminiClient();
  // Vision model (same flash, it supports images natively)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const result = await model.generateContent([
    {
      inlineData: { data: base64Image, mimeType },
    },
    `You are a food identification assistant for a food rescue platform.
     Analyze this food image and return ONLY valid JSON, no markdown:
     {
       "name": string (specific food name),
       "category": "Produce" | "Meat" | "Dairy" | "Bakery" | "Cooked Meals" | "Beverages" | "Other",
       "estimated_quantity": string (e.g. "2-3 kg" or "~20 pieces"),
       "dietary_tags": string[] (e.g. ["vegan", "gluten-free", "halal"] — only include if clearly identifiable)
     }`,
  ]);

  const text = result.response.text();
  return parseGeminiJson<PhotoAnalysisResult>(text, 'photo_analysis');
}

// ─── Impact Summary ───────────────────────────────────────────────────────────

export async function generateImpactInsight(stats: {
  total_meals: number;
  total_co2: number;
  total_water: number;
  active_restaurants: number;
}): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
  });

  const result = await model.generateContent(
    `Write one inspiring 2-sentence summary for a food rescue platform dashboard.
     Stats: ${stats.total_meals} meals rescued, ${stats.total_co2}kg CO2 saved,
     ${stats.total_water}L water saved, ${stats.active_restaurants} partner restaurants.
     Be specific with the numbers. Tone: warm and motivating. No markdown.`
  );

  return result.response.text().trim();
}
