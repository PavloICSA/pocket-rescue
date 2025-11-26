/**
 * Weather Forecast Integration Module for PocketRescue
 * Fetches 3-day weather forecast from Open-Meteo API with offline fallback
 *
 * PRIVACY GUARANTEE:
 * - Only latitude and longitude are sent to Open-Meteo API
 * - No photo data, photo dataURI, or other sensitive information is transmitted
 * - The API call is read-only (GET request) and does not store user data
 * - Open-Meteo is a privacy-respecting weather service that does not track users
 * - See: https://open-meteo.com/en/features#privacy
 */

/**
 * Fetch 3-day weather forecast from Open-Meteo API
 * Falls back to cached sample forecast if API unavailable or offline
 *
 * PRIVACY NOTE:
 * This function sends ONLY latitude and longitude to the Open-Meteo API.
 * No photo data, crop type, or other sensitive information is transmitted.
 *
 * @param {number} lat - Latitude coordinate (required, no photo data)
 * @param {number} lon - Longitude coordinate (required, no photo data)
 * @returns {Promise<{precipitationMm: number, tempMin: number, tempMax: number, source: string, timestamp: string}>}
 */
export async function fetchForecast(lat, lon) {
  const cacheKey = 'pocketRescue_forecast_cache';

  try {
    // Try to fetch from Open-Meteo API
    // PRIVACY: Only lat/lon are sent in the URL query parameters
    // No photo data, crop type, or other sensitive information is included
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto`,
      { signal: AbortSignal.timeout(5000) } // 5 second timeout
    );

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();

    // Extract 3-day forecast data
    const daily = data.daily;
    if (!daily || !daily.precipitation_sum || daily.precipitation_sum.length < 3) {
      throw new Error('Invalid API response format');
    }

    // Sum precipitation over 3 days
    const precipitationMm =
      daily.precipitation_sum[0] +
      daily.precipitation_sum[1] +
      daily.precipitation_sum[2];

    // Get temperature range over 3 days
    const tempMin = Math.min(
      daily.temperature_2m_min[0],
      daily.temperature_2m_min[1],
      daily.temperature_2m_min[2]
    );
    const tempMax = Math.max(
      daily.temperature_2m_max[0],
      daily.temperature_2m_max[1],
      daily.temperature_2m_max[2]
    );

    const forecast = {
      precipitationMm: Math.round(precipitationMm * 10) / 10, // Round to 1 decimal
      tempMin: Math.round(tempMin),
      tempMax: Math.round(tempMax),
      source: 'openMeteo',
      timestamp: new Date().toISOString(),
    };

    // Cache the forecast
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        ...forecast,
        cachedAt: Date.now(),
      })
    );

    return forecast;
  } catch (error) {
    // API failed or offline - use cached forecast
    console.warn('Open-Meteo API failed, using cached forecast:', error.message);

    // Try to get cached forecast
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const cached = JSON.parse(cachedData);
        return {
          precipitationMm: cached.precipitationMm,
          tempMin: cached.tempMin,
          tempMax: cached.tempMax,
          source: 'cached',
          timestamp: cached.timestamp,
        };
      } catch (parseError) {
        console.warn('Failed to parse cached forecast:', parseError);
      }
    }

    // No cache available - use sample forecast
    return getSampleForecast();
  }
}

/**
 * Get sample forecast for demo/offline mode
 * @returns {{precipitationMm: number, tempMin: number, tempMax: number, source: string, timestamp: string}}
 */
function getSampleForecast() {
  return {
    precipitationMm: 12.5,
    tempMin: 8,
    tempMax: 18,
    source: 'cached',
    timestamp: new Date().toISOString(),
  };
}
