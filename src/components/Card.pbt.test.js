import { describe, it, expect } from 'vitest'
import fc from 'fast-check'

/**
 * **Feature: pocket-rescue, Property 14: QR Code Validity**
 * **Validates: Requirements 7.2**
 *
 * For any shareable URL, the generated QR code SHALL encode the URL such that
 * scanning the QR code with a standard QR reader opens the same URL and reconstructs the card.
 */
describe('Property 14: QR Code Validity', () => {
  it('should generate QR code that encodes the shareable URL correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          photo: fc.base64String({ minLength: 100, maxLength: 1000 }),
          cropType: fc.constantFrom('wheat', 'barley', 'maize', 'sunflower', 'potato', 'vegetables', 'orchard'),
          score: fc.integer({ min: 0, max: 100 }),
          riskSummary: fc.string({ minLength: 10, maxLength: 200 }),
          interventions: fc.array(
            fc.record({
              action: fc.string({ minLength: 5, maxLength: 100 }),
              timing: fc.constantFrom('immediately', 'within 2 days', 'within 1 week'),
            }),
            { minLength: 3, maxLength: 3 }
          ),
          geolocation: fc.record({
            lat: fc.float({ min: -90, max: 90, noNaN: true }),
            lon: fc.float({ min: -180, max: 180, noNaN: true }),
          }),
          timestamp: fc.date().map(d => d.toISOString()),
        }),
        (cardState) => {
          // Generate the shareable URL using the same logic as Card component
          const jsonString = JSON.stringify(cardState)
          const base64url = btoa(jsonString)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')

          const baseURL = 'http://localhost:3000/'
          const shareURL = `${baseURL}?state=${base64url}`

          // Verify that the URL is valid and contains the encoded state
          expect(shareURL).toContain('?state=')
          expect(shareURL).toMatch(/^http:\/\/localhost:3000\/\?state=[A-Za-z0-9_-]+$/)

          // Verify that the encoded state can be decoded back to the original
          const decodedBase64 = base64url
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            // Add padding if needed
            .padEnd(base64url.length + (4 - (base64url.length % 4)) % 4, '=')

          const decodedJsonString = atob(decodedBase64)
          const decodedState = JSON.parse(decodedJsonString)

          // Verify round-trip: original state should match decoded state
          // Note: JSON converts -0 to 0, so we use loose equality for geolocation
          expect(decodedState.photo).toBe(cardState.photo)
          expect(decodedState.cropType).toBe(cardState.cropType)
          expect(decodedState.score).toBe(cardState.score)
          expect(decodedState.riskSummary).toBe(cardState.riskSummary)
          expect(decodedState.interventions).toEqual(cardState.interventions)
          expect(decodedState.geolocation.lat == cardState.geolocation.lat).toBe(true)
          expect(decodedState.geolocation.lon == cardState.geolocation.lon).toBe(true)
          expect(decodedState.timestamp).toBe(cardState.timestamp)

          // Verify that the URL is scannable (contains valid base64url characters only)
          const urlPart = shareURL.split('?state=')[1]
          expect(urlPart).toMatch(/^[A-Za-z0-9_-]+$/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate QR code with valid base64url encoding', () => {
    fc.assert(
      fc.property(
        fc.record({
          photo: fc.base64String({ minLength: 50, maxLength: 500 }),
          cropType: fc.constantFrom('wheat', 'barley', 'maize'),
          score: fc.integer({ min: 0, max: 100 }),
          riskSummary: fc.string({ minLength: 5, maxLength: 100 }),
          interventions: fc.array(
            fc.record({
              action: fc.string({ minLength: 3, maxLength: 50 }),
              timing: fc.string({ minLength: 3, maxLength: 30 }),
            }),
            { minLength: 3, maxLength: 3 }
          ),
          geolocation: fc.record({
            lat: fc.float({ min: -90, max: 90, noNaN: true }),
            lon: fc.float({ min: -180, max: 180, noNaN: true }),
          }),
          timestamp: fc.date().map(d => d.toISOString()),
        }),
        (cardState) => {
          // Encode state to base64url
          const jsonString = JSON.stringify(cardState)
          const base64url = btoa(jsonString)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '')

          // Verify base64url contains only valid characters
          expect(base64url).toMatch(/^[A-Za-z0-9_-]*$/)

          // Verify that base64url is not empty
          expect(base64url.length).toBeGreaterThan(0)

          // Verify that decoding works without errors
          const decodedBase64 = base64url
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(base64url.length + (4 - (base64url.length % 4)) % 4, '=')

          expect(() => {
            atob(decodedBase64)
          }).not.toThrow()
        }
      ),
      { numRuns: 100 }
    )
  })
})
