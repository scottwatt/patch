#!/usr/bin/env node
/**
 * Bulk lookup of Google place IDs for every partner in src/data/partners.ts.
 *
 * Reads each partner's name + phone, queries the Google Places "Text Search"
 * endpoint with "<name> Bakersfield CA", and writes the resulting place ID into
 * src/data/place-ids.json keyed by partner ID.
 *
 * Skips partners that already have an entry in place-ids.json (so re-runs are
 * safe and only fill in the missing ones).
 *
 * Phone matching: if the search returns multiple results and one matches the
 * partner's phone number, that one wins. Otherwise the top result is used and
 * marked with `~` in the output (worth eyeballing).
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=AIza... npm run find-place-ids
 *
 * Or with the key already in your shell env:
 *   npm run find-place-ids
 *
 * Cost: ~$0.005 per Text Search call (Essentials field mask), so 187 partners
 * costs about $0.94. Free tier covers it many times over.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config as dotenv } from 'node:process';

// Load .env if present (Node 20.6+ supports --env-file flag, but we do it manually here).
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENV_PATH = join(ROOT, '.env');
const PARTNERS_PATH = join(ROOT, 'src/data/partners.ts');
const PLACE_IDS_PATH = join(ROOT, 'src/data/place-ids.json');

function loadEnv() {
  if (!existsSync(ENV_PATH)) return;
  const lines = readFileSync(ENV_PATH, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
}
loadEnv();

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) {
  console.error('GOOGLE_PLACES_API_KEY not set. Add it to .env or export it in your shell.');
  process.exit(1);
}

function parsePartners(src) {
  const partners = [];
  const idRegex = /id:\s*'([^']+)'/g;
  let m;
  while ((m = idRegex.exec(src)) !== null) {
    const startIdx = m.index;
    // Find the end of this object literal by walking braces
    let depth = 0;
    let openIdx = src.lastIndexOf('{', startIdx);
    let closeIdx = openIdx;
    for (let i = openIdx; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') {
        depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }
    const block = src.slice(openIdx, closeIdx + 1);
    const nameMatch = block.match(/name:\s*'((?:[^'\\]|\\.)*?)'/);
    const phoneMatch = block.match(/phone:\s*'([^']*)'/);
    const placeIdMatch = block.match(/googlePlaceId:\s*'([^']+)'/);
    partners.push({
      id: m[1],
      name: nameMatch ? nameMatch[1].replace(/\\'/g, "'") : '',
      phone: phoneMatch ? phoneMatch[1] : '',
      googlePlaceId: placeIdMatch ? placeIdMatch[1] : null,
    });
  }
  return partners;
}

async function findPlace(query, phone) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.nationalPhoneNumber,places.formattedAddress',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ textQuery: query }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  if (!data.places?.length) return null;

  const ourDigits = phone.replace(/[^0-9]/g, '');
  if (ourDigits) {
    const phoneMatch = data.places.find(
      (p) => p.nationalPhoneNumber?.replace(/[^0-9]/g, '') === ourDigits
    );
    if (phoneMatch) {
      return { id: phoneMatch.id, address: phoneMatch.formattedAddress, matched: 'phone' };
    }
  }

  return {
    id: data.places[0].id,
    address: data.places[0].formattedAddress,
    matched: 'first',
  };
}

async function main() {
  const partners = parsePartners(readFileSync(PARTNERS_PATH, 'utf8'));
  console.log(`Found ${partners.length} partners in partners.ts`);

  const existing = existsSync(PLACE_IDS_PATH)
    ? JSON.parse(readFileSync(PLACE_IDS_PATH, 'utf8'))
    : {};

  let added = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of partners) {
    if (p.googlePlaceId) {
      // Inline override on the partner record; honor it.
      if (!existing[p.id]) existing[p.id] = p.googlePlaceId;
      skipped++;
      continue;
    }
    if (existing[p.id]) {
      skipped++;
      continue;
    }

    const query = `${p.name} Bakersfield CA`;
    try {
      const result = await findPlace(query, p.phone);
      if (!result) {
        console.log(`✗ ${p.id.padEnd(15)} no match for "${p.name}"`);
        failed++;
      } else {
        const tag = result.matched === 'phone' ? '✓' : '~';
        console.log(`${tag} ${p.id.padEnd(15)} ${p.name} → ${result.id}`);
        if (result.address) console.log(`    ${result.address}`);
        existing[p.id] = result.id;
        added++;
        // Save incrementally so a crash doesn't lose progress.
        writeFileSync(PLACE_IDS_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf8');
      }
    } catch (err) {
      console.error(`✗ ${p.id.padEnd(15)} fetch error: ${err.message}`);
      failed++;
    }

    // Rate limit: ~10 req/sec is safe.
    await new Promise((r) => setTimeout(r, 100));
  }

  // Final write
  writeFileSync(PLACE_IDS_PATH, JSON.stringify(existing, null, 2) + '\n', 'utf8');

  console.log('');
  console.log(`Done. Added: ${added}, skipped (already had): ${skipped}, failed: ${failed}`);
  console.log(`Wrote: ${PLACE_IDS_PATH}`);
  console.log('');
  console.log('Legend: ✓ = matched by phone (high confidence)');
  console.log('        ~ = first search result (worth eyeballing if the name is generic)');
  console.log('        ✗ = no match found (look up manually for these few)');
  console.log('');
  console.log('Commit place-ids.json, push, and the next Vercel deploy will populate hours/reviews on every contractor with a place ID.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
