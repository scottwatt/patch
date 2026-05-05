import type { Partner, Review } from './partners';
import placeIdsRaw from './place-ids.json' with { type: 'json' };

const PLACE_IDS = placeIdsRaw as Record<string, string>;

export type PlaceData = {
  hours?: string[];
  reviews?: Review[];
  source: 'manual' | 'google' | 'none';
};

// Per-build cache so we don't re-fetch the same place_id during prerender of multiple pages.
const cache = new Map<string, PlaceData>();

// Resolve place ID from inline partner field OR the bulk JSON map (npm run find-place-ids writes the JSON).
function resolvePlaceId(partner: Partner): string | undefined {
  return partner.googlePlaceId || PLACE_IDS[partner.id];
}

/**
 * Returns hours and reviews for a partner, in priority order:
 *   1. Manual hours/reviews on the partner record (always win).
 *   2. Google Places API live data (if a place ID is known via partner field or place-ids.json,
 *      and GOOGLE_PLACES_API_KEY env var is set).
 *   3. Empty.
 *
 * Called at build time during page prerender. Failures are silent (returns empty).
 */
export async function getPlaceData(partner: Partner): Promise<PlaceData> {
  const hasManualHours = partner.hours && partner.hours.length > 0;
  const hasManualReviews = partner.reviews && partner.reviews.length > 0;

  // Manual override path: if either hours OR reviews are manually set, use those for both
  // (we don't mix manual reviews with Google hours; keep it consistent).
  if (hasManualHours || hasManualReviews) {
    return {
      hours: partner.hours,
      reviews: partner.reviews,
      source: 'manual',
    };
  }

  const placeId = resolvePlaceId(partner);
  if (!placeId) {
    return { source: 'none' };
  }

  if (cache.has(placeId)) {
    return cache.get(placeId)!;
  }

  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { source: 'none' };
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'regularOpeningHours.weekdayDescriptions,reviews',
        },
      }
    );

    if (!res.ok) {
      console.warn(`Google Places fetch failed for ${partner.id} (${placeId}): ${res.status}`);
      const empty: PlaceData = { source: 'none' };
      cache.set(placeId, empty);
      return empty;
    }

    const data: any = await res.json();

    const hours: string[] | undefined = data.regularOpeningHours?.weekdayDescriptions;

    const reviews: Review[] | undefined = data.reviews?.slice(0, 3).map((r: any) => ({
      author: r.authorAttribution?.displayName || 'Anonymous',
      rating: r.rating || 0,
      date: r.publishTime?.slice(0, 10) || '',
      text: r.text?.text || r.originalText?.text || '',
    }));

    const result: PlaceData = {
      hours,
      reviews,
      source: 'google',
    };

    cache.set(placeId, result);
    return result;
  } catch (err) {
    console.warn(`Google Places fetch error for ${partner.id}:`, err);
    return { source: 'none' };
  }
}
