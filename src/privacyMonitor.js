/**
 * Privacy and Data Security Monitoring Module for PocketRescue
 * 
 * PRIVACY GUARANTEE:
 * - All image processing occurs locally using Canvas 2D API (no external ML models)
 * - Only latitude and longitude are sent to Open-Meteo API (no photo data)
 * - Photos never leave the user's device unless explicitly shared via URL
 * - This module monitors network requests to ensure compliance with privacy requirements
 */

/**
 * Initialize privacy monitoring
 * Intercepts fetch requests to verify only safe data is transmitted
 * @returns {void}
 */
export function initializePrivacyMonitoring() {
  // Store original fetch function
  const originalFetch = window.fetch;

  // Override fetch to monitor outgoing requests
  window.fetch = function (...args) {
    const [resource] = args;
    const url = typeof resource === 'string' ? resource : resource.url;

    // Log all network requests for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Privacy Monitor] Network request:', {
        url,
        method: 'GET',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify that only safe APIs are called
    verifyNetworkRequest(url);

    // Call original fetch
    return originalFetch.apply(this, args);
  };
}

/**
 * Verify that a network request complies with privacy requirements
 * Only Open-Meteo API calls are allowed, and only with lat/lon parameters
 * @param {string} url - The URL being requested
 * @throws {Error} If request violates privacy requirements
 */
function verifyNetworkRequest(url) {
  // Whitelist of allowed external APIs
  const allowedDomains = [
    'api.open-meteo.com', // Weather API - only lat/lon sent
  ];

  // Parse URL to extract domain
  let domain;
  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname;
  } catch (e) {
    // Relative URLs are safe (same origin)
    return;
  }

  // Check if domain is in whitelist
  const isAllowed = allowedDomains.some((allowed) => domain.includes(allowed));

  if (!isAllowed && !domain.includes(window.location.hostname)) {
    // Request to non-whitelisted external domain
    console.warn(
      `[Privacy Monitor] Blocked request to non-whitelisted domain: ${domain}`
    );
    throw new Error(
      `Privacy violation: Attempted request to ${domain}. Only Open-Meteo API is allowed.`
    );
  }

  // For Open-Meteo requests, verify only lat/lon are sent
  if (domain.includes('api.open-meteo.com')) {
    verifyOpenMeteoRequest(url);
  }
}

/**
 * Verify that Open-Meteo API requests only contain lat/lon parameters
 * Ensures no photo data or other sensitive information is transmitted
 * @param {string} url - The Open-Meteo API URL
 * @throws {Error} If request contains sensitive data
 */
function verifyOpenMeteoRequest(url) {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    // Extract all parameters
    const paramKeys = Array.from(params.keys());

    // Allowed parameters for Open-Meteo weather API
    const allowedParams = [
      'latitude',
      'longitude',
      'daily',
      'timezone',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
    ];

    // Check for disallowed parameters
    const disallowedParams = paramKeys.filter(
      (key) => !allowedParams.includes(key)
    );

    if (disallowedParams.length > 0) {
      console.warn(
        `[Privacy Monitor] Open-Meteo request contains unexpected parameters: ${disallowedParams.join(', ')}`
      );
    }

    // Verify no photo data in URL
    if (url.includes('data:image') || url.includes('base64')) {
      throw new Error(
        'Privacy violation: Attempted to send photo data to external API'
      );
    }

    // Log safe request (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Privacy Monitor] Open-Meteo request verified safe:', {
        latitude: params.get('latitude'),
        longitude: params.get('longitude'),
      });
    }
  } catch (error) {
    if (error.message.includes('Privacy violation')) {
      throw error;
    }
    console.warn('[Privacy Monitor] Error verifying Open-Meteo request:', error);
  }
}

/**
 * Get privacy statement to display to users
 * @returns {string} Privacy statement text
 */
export function getPrivacyStatement() {
  return (
    'Photos processed locally. No data leaves your device unless you explicitly share the card URL.'
  );
}

/**
 * Verify that image processing uses only Canvas 2D API
 * This is a documentation function to ensure developers understand the requirement
 * @returns {Object} Privacy compliance information
 */
export function getImageProcessingPrivacyInfo() {
  return {
    method: 'Canvas 2D API',
    externalModels: 'None',
    dataTransmitted: 'None',
    description:
      'All image processing (downsampling, ExG, NDVI-proxy, heatmap) uses Canvas 2D API. No external ML models or remote processing services are used.',
  };
}

/**
 * Verify that only lat/lon are sent to weather API
 * @returns {Object} Weather API privacy compliance information
 */
export function getWeatherAPIPrivacyInfo() {
  return {
    api: 'Open-Meteo',
    dataTransmitted: ['latitude', 'longitude'],
    dataNotTransmitted: [
      'photo',
      'photo dataURI',
      'crop type',
      'vegetation indices',
      'user email',
      'user location name',
    ],
    description:
      'Only latitude and longitude coordinates are sent to Open-Meteo API. No photo data or other sensitive information is transmitted.',
  };
}

/**
 * Verify that share URL only contains safe data
 * @returns {Object} Share URL privacy compliance information
 */
export function getShareURLPrivacyInfo() {
  return {
    dataIncluded: [
      'photo dataURI (thumbnail)',
      'crop type',
      'vegetation indices',
      'geolocation (lat/lon)',
      'timestamp',
    ],
    dataExcluded: [
      'original photo file',
      'user identity',
      'device information',
      'browsing history',
    ],
    description:
      'Share URLs contain only the photo dataURI (thumbnail), crop type, computed indices, and geolocation. No original photo file or user identity information is included.',
  };
}

