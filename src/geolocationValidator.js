/**
 * Validates geolocation coordinates
 * @param {number} latitude - Latitude value
 * @param {number} longitude - Longitude value
 * @returns {object} { valid: boolean, message?: string }
 */
export function validateGeolocation(latitude, longitude) {
  // Check if values are numbers
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return { valid: false, message: 'Latitude and longitude must be numbers.' }
  }

  // Check if values are finite
  if (!isFinite(latitude) || !isFinite(longitude)) {
    return { valid: false, message: 'Latitude and longitude must be finite numbers.' }
  }

  // Validate latitude range: [-90, 90]
  if (latitude < -90 || latitude > 90) {
    return { valid: false, message: 'Latitude must be between -90 and 90.' }
  }

  // Validate longitude range: [-180, 180]
  if (longitude < -180 || longitude > 180) {
    return { valid: false, message: 'Longitude must be between -180 and 180.' }
  }

  return { valid: true }
}

/**
 * Parses string inputs to numbers and validates
 * @param {string} latStr - Latitude as string
 * @param {string} lonStr - Longitude as string
 * @returns {object} { valid: boolean, lat?: number, lon?: number, message?: string }
 */
export function parseAndValidateGeolocation(latStr, lonStr) {
  const lat = parseFloat(latStr)
  const lon = parseFloat(lonStr)

  if (isNaN(lat) || isNaN(lon)) {
    return { valid: false, message: 'Please enter valid numbers.' }
  }

  const validation = validateGeolocation(lat, lon)
  if (!validation.valid) {
    return validation
  }

  return { valid: true, lat, lon }
}
