/**
 * Share URL state encoding and decoding utilities
 * Handles base64url encoding/decoding of card state for shareable URLs
 *
 * PRIVACY GUARANTEE:
 * - Share URLs contain only: photo dataURI (thumbnail), crop type, vegetation indices, geolocation, timestamp
 * - Share URLs do NOT contain: original photo file, user identity, device information, browsing history
 * - The encoded state is stored in the URL query parameter, not on any server
 * - Users have full control over sharing - URLs are only created when explicitly requested
 */

/**
 * Encode card state to base64url format
 * PRIVACY: Only encodes safe data (indices, crop type, geolocation, timestamp)
 * Does NOT encode original photo file or user identity
 * @param {Object} cardState - The card state object to encode
 * @returns {string} Base64url-encoded state string
 */
export function encodeState(cardState) {
  const jsonString = JSON.stringify(cardState)
  // Handle unicode by encoding to UTF-8 first
  const utf8String = unescape(encodeURIComponent(jsonString))
  const base64 = btoa(utf8String)
  // Convert to base64url by replacing standard base64 characters
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Decode base64url string back to card state object
 * PRIVACY: Safely decodes only the safe data that was encoded
 * @param {string} base64urlString - The base64url-encoded state string
 * @returns {Object} Decoded card state object
 * @throws {Error} If decoding fails or JSON is invalid
 */
export function decodeState(base64urlString) {
  try {
    // Convert base64url back to standard base64
    let base64 = base64urlString
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // Add padding if needed
    const padding = 4 - (base64.length % 4)
    if (padding !== 4) {
      base64 += '='.repeat(padding)
    }

    // Decode from base64 to UTF-8 string
    const utf8String = atob(base64)
    const jsonString = decodeURIComponent(escape(utf8String))

    // Parse JSON
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error(`Failed to decode state: ${error.message}`)
  }
}

/**
 * Generate a shareable URL with encoded state
 * PRIVACY: URL contains only safe data, no server storage, user-controlled sharing
 * @param {Object} cardState - The card state object to encode
 * @returns {string} Full shareable URL with encoded state as query parameter
 */
export function generateShareURL(cardState) {
  const encodedState = encodeState(cardState)
  const baseURL = window.location.origin + window.location.pathname
  return `${baseURL}?state=${encodedState}`
}

/**
 * Copy URL to clipboard and optionally show confirmation
 * @param {string} url - The URL to copy
 * @returns {Promise<boolean>} True if copy succeeded, false otherwise
 */
export async function copyToClipboard(url) {
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
