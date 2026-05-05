import type { Partner, Review } from './partners';

export type PlaceData = {
  hours?: string[];
  reviews?: Review[];
  source: 'manual' | 'google' | 'none';
};

// Per-build cache so we don't re-fetch the same place_id during prerender of multiple pages.
const cache = new Map<string, PlaceData>();

/**
 * Returns hours and reviews for a partner, in priority order:
 *   1. Manual hours/reviews on the partner record (always win).
 *   2. Google Places API live data (if googlePlaceId set + GOOGLE_PLACES_API_KEY env var).
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

  if (!partner.googlePlaceId) {
    return { source: 'none' };
  }

  if (cache.has(partner.googlePlaceId)) {
    return cache.get(partner.googlePlaceId)!;
  }

  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { source: 'none' };
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(partner.googlePlaceId)}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'regularOpeningHours.weekdayDescriptions,reviews',
        },
      }
    );

    if (!res.ok) {
      console.warn(`Google Places fetch failed for ${partner.id} (${partner.googlePlaceId}): ${res.status}`);
      const empty: PlaceData = { source: 'none' };
      cache.set(partner.googlePlaceId, empty);
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

    cache.set(partner.googlePlaceId, result);
    return result;
  } catch (err) {
    console.warn(`Google Places fetch error for ${partner.id}:`, err);
    return { source: 'none' };
  }
}
