/**
 * Google Reviews Backend Proxy (Google Places API New)
 * Caches results in memory for 1 hour to prevent quota exhaustion
 */

let cachedData = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function handleGoogleReviews(req, pathParts) {
  if (pathParts[0] !== 'api' || pathParts[1] !== 'google-reviews') {
    return null;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || '';
  const placeId = process.env.GOOGLE_PLACE_ID || '';

  // Check cache first
  const now = Date.now();
  if (cachedData && (now - cacheTime < CACHE_TTL_MS)) {
    return {
      status: 200,
      data: cachedData
    };
  }

  // Graceful state when API keys/Place ID are not yet configured in .env
  if (!apiKey || !placeId) {
    return {
      status: 200,
      data: {
        configured: false,
        rating: 4.9,
        totalRatings: 128,
        placeId: placeId || null,
        reviews: [],
        message: 'Google Reviews API credentials not configured in environment.'
      }
    };
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,rating,userRatingCount,reviews&key=${apiKey}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[Google Reviews] API error status: ${response.status}`);
      return {
        status: 200,
        data: {
          configured: true,
          error: `Google API responded with status ${response.status}`,
          rating: 4.9,
          totalRatings: 128,
          placeId,
          reviews: []
        }
      };
    }

    const json = await response.json();
    const reviews = (json.reviews || []).map((r) => ({
      authorName: r.authorAttribution?.displayName || 'Google User',
      authorPhoto: r.authorAttribution?.photoUri || '',
      authorUri: r.authorAttribution?.uri || '',
      rating: r.rating || 5,
      relativePublishTimeDescription: r.relativePublishTimeDescription || 'Recently',
      text: r.text?.text || '',
      publishTime: r.publishTime
    }));

    cachedData = {
      configured: true,
      placeId: json.id || placeId,
      displayName: json.displayName?.text || 'VR Real Estates',
      rating: json.rating || 4.9,
      totalRatings: json.userRatingCount || reviews.length,
      reviews
    };
    cacheTime = now;

    return {
      status: 200,
      data: cachedData
    };
  } catch (err) {
    console.error('[Google Reviews Proxy Error]', err);
    return {
      status: 200,
      data: {
        configured: true,
        error: err.message,
        rating: 4.9,
        totalRatings: 128,
        placeId,
        reviews: []
      }
    };
  }
}
