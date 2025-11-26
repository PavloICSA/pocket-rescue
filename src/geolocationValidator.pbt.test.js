import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { validateGeolocation } from './geolocationValidator'

describe('Geolocation Validation - Property-Based Tests', () => {
  // **Feature: pocket-rescue, Property 5: Geolocation Validation**
  // **Validates: Requirements 2.4**
  it('should accept all valid latitude and longitude pairs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -900, max: 900 }).map(n => n / 10),
        fc.integer({ min: -1800, max: 1800 }).map(n => n / 10),
        (lat, lon) => {
          const result = validateGeolocation(lat, lon)
          expect(result.valid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 5: Geolocation Validation**
  // **Validates: Requirements 2.4**
  it('should reject latitude outside [-90, 90] range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: -500, max: -91 }),
          fc.integer({ min: 91, max: 500 })
        ),
        fc.integer({ min: -180, max: 180 }),
        (lat, lon) => {
          const result = validateGeolocation(lat, lon)
          expect(result.valid).toBe(false)
          expect(result.message).toContain('Latitude')
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 5: Geolocation Validation**
  // **Validates: Requirements 2.4**
  it('should reject longitude outside [-180, 180] range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -90, max: 90 }),
        fc.oneof(
          fc.integer({ min: -500, max: -181 }),
          fc.integer({ min: 181, max: 500 })
        ),
        (lat, lon) => {
          const result = validateGeolocation(lat, lon)
          expect(result.valid).toBe(false)
          expect(result.message).toContain('Longitude')
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 5: Geolocation Validation**
  // **Validates: Requirements 2.4**
  it('should accept boundary values exactly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(-90, 90),
        fc.constantFrom(-180, 180),
        (lat, lon) => {
          const result = validateGeolocation(lat, lon)
          expect(result.valid).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
