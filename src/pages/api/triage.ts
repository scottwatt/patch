import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';
import { trades, tradeBySlug } from '../../data/trades';
import { partnersByTrade } from '../../data/partners';

export const prerender = false;

const tradeSummaries = trades
  .map((t) => `* ${t.slug}: ${t.name}. ${t.tagline}. Common: ${t.commonProblems.join('; ')}.`)
  .join('\n');

const SYSTEM_PROMPT = `You are a triage agent for Patch, a Bakersfield home services directory. A homeowner describes a problem (and may attach photos); you decide which trade should handle it.

Available trades:
${tradeSummaries}

Respond ONLY with JSON in this exact shape, no markdown, no prose outside the JSON:
{"trade": "<slug>", "reasoning": "<one short sentence about what you noticed and why this trade>", "secondary": "<another slug if it might be relevant, else null>"}

The trade value MUST be one of: ${trades.map((t) => t.slug).join(', ')}.
Keep reasoning under 25 words. Speak directly to the homeowner ("Sounds like..." or "That points to..."). If a photo is attached, mention what you see in it briefly.
IMPORTANT: do NOT use any dashes, em dashes, en dashes, or hyphens in your reasoning. Use periods or commas instead. "Same day calls" not "same-day calls".`;

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024; // 4 MB per photo (Anthropic limit is 5 MB; leave headroom)
const ALLOWED_MEDIA = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type AllowedMedia = (typeof ALLOWED_MEDIA)[number];

type ParsedPhoto = { mediaType: AllowedMedia; data: string };

function parseDataUrl(url: string): ParsedPhoto | null {
  const match = url.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mediaType = match[1] as AllowedMedia;
  if (!ALLOWED_MEDIA.includes(mediaType)) return null;
  const data = match[2];
  // Each base64 char is 6 bits, so byte length = data.length * 3 / 4 (approx)
  if (data.length * 3 / 4 > MAX_PHOTO_BYTES) return null;
  return { mediaType, data };
}

export const POST: APIRoute = async ({ request }) => {
  let problem: string;
  let rawPhotos: string[] = [];
  try {
    const body = await request.json();
    problem = (body.problem || '').toString().trim();
    if (Array.isArray(body.photos)) {
      rawPhotos = body.photos.slice(0, MAX_PHOTOS).filter((p: any) => typeof p === 'string');
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  if (!problem || problem.length < 5) {
    return new Response(JSON.stringify({ error: 'Tell us a bit more about the problem.' }), { status: 400 });
  }

  const photos = rawPhotos.map(parseDataUrl).filter((p): p is ParsedPhoto => p !== null);

  const apiKey = import.meta.env.ANTHROPIC_API_KEY;

  // Graceful fallback: keyword match if no API key set yet
  if (!apiKey) {
    const fallback = keywordTriage(problem);
    const trade = tradeBySlug(fallback);
    return new Response(
      JSON.stringify({
        trade: fallback,
        tradeName: trade?.name,
        reasoning: 'Matched on keywords from your description.',
        partners: partnersByTrade(fallback),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const client = new Anthropic({ apiKey });

    const userContent: Anthropic.ContentBlockParam[] = [];
    for (const photo of photos) {
      userContent.push({
        type: 'image',
        source: { type: 'base64', media_type: photo.mediaType, data: photo.data },
      });
    }
    userContent.push({ type: 'text', text: problem });

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 250,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const text = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    const parsed = parseJsonLoose(text);
    if (!parsed || !parsed.trade || !tradeBySlug(parsed.trade)) {
      const fallback = keywordTriage(problem);
      const trade = tradeBySlug(fallback);
      return new Response(
        JSON.stringify({
          trade: fallback,
          tradeName: trade?.name,
          reasoning: parsed?.reasoning || 'Matched on keywords.',
          partners: partnersByTrade(fallback),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const trade = tradeBySlug(parsed.trade);
    return new Response(
      JSON.stringify({
        trade: parsed.trade,
        tradeName: trade?.name,
        reasoning: parsed.reasoning,
        secondary: parsed.secondary || null,
        partners: partnersByTrade(parsed.trade),
        photoCount: photos.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Triage error:', err);
    const fallback = keywordTriage(problem);
    const trade = tradeBySlug(fallback);
    return new Response(
      JSON.stringify({
        trade: fallback,
        tradeName: trade?.name,
        reasoning: 'Matched by keywords. Try again in a moment for better matching.',
        partners: partnersByTrade(fallback),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function parseJsonLoose(s: string): any | null {
  try {
    return JSON.parse(s);
  } catch {
    const match = s.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

const KEYWORDS: Record<string, string[]> = {
  plumbing: ['leak', 'water', 'drain', 'toilet', 'pipe', 'faucet', 'sink', 'sewer', 'water heater', 'clog', 'pressure', 'disposal'],
  hvac: ['ac', 'air condition', 'cooling', 'heating', 'heater', 'furnace', 'thermostat', 'duct', 'vent', 'cold air', 'hot', 'temperature'],
  electrical: ['outlet', 'breaker', 'panel', 'wiring', 'electric', 'light', 'switch', 'fan', 'charger', 'power', 'flicker', 'spark'],
  roofing: ['roof', 'shingle', 'tile', 'leak in ceiling', 'attic', 'gutter', 'flashing', 'storm damage'],
  handyman: ['mount', 'tv', 'shelf', 'drywall', 'patch', 'paint', 'cabinet', 'caulk', 'small fix', 'odd job', 'punch list'],
  'garage-door': ['garage door', 'garage opener', 'garage spring', 'garage track', 'garage panel', 'garage remote', 'garage sensor'],
  'pest-control': ['ants', 'termite', 'roach', 'rodent', 'mouse', 'mice', 'rats', 'scorpion', 'spider', 'wasp', 'bees', 'infestation', 'exterminator', 'pest control'],
  concrete: ['concrete', 'cement', 'driveway', 'patio', 'slab', 'foundation crack', 'walkway', 'sidewalk crack'],
};

function keywordTriage(problem: string): string {
  const text = problem.toLowerCase();
  let best = 'handyman';
  let bestScore = 0;
  for (const [trade, keywords] of Object.entries(KEYWORDS)) {
    const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      best = trade;
      bestScore = score;
    }
  }
  return best;
}
