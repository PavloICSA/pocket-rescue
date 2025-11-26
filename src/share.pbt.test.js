/**
 * Property-Based Tests for Share Module
 * Using fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  encodeState,
  decodeState,
} from './share'

describe('share - Property-Based Tests', () => {
  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - encoding then decoding preserves state', () => {
    fc.assert(
      fc.property(
        fc.object({
          recordConstraints: {
            maxDepth: 2,
            maxKeys: 5,
            withNullPrototype: false,
          },
          values: [
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.integer(), { maxLength: 3 }),
          ],
        }),
        (state) => {
          // Encode the state
          const encoded = encodeState(state)

          // Verify encoded is a string
          expect(typeof encoded).toBe('string')

          // Decode the state
          const decoded = decodeState(encoded)

          // Verify decoded matches original
          expect(decoded).toEqual(state)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - preserves all field types', () => {
    fc.assert(
      fc.property(
        fc.record({
          stringField: fc.string(),
          integerField: fc.integer(),
          booleanField: fc.boolean(),
          nullField: fc.constant(null),
          arrayField: fc.array(fc.integer(), { maxLength: 3 }),
        }),
        (state) => {
          const encoded = encodeState(state)
          const decoded = decodeState(encoded)

          // Verify all fields are preserved
          expect(decoded.stringField).toBe(state.stringField)
          expect(decoded.integerField).toBe(state.integerField)
          expect(decoded.booleanField).toBe(state.booleanField)
          expect(decoded.nullField).toBe(state.nullField)
          expect(decoded.arrayField).toEqual(state.arrayField)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - encoded string never contains standard base64 chars', () => {
    fc.assert(
      fc.property(
        fc.object({
          recordConstraints: {
            maxDepth: 2,
            maxKeys: 5,
          },
        }),
        (state) => {
          const encoded = encodeState(state)

          // Verify no standard base64 characters are present
          expect(encoded).not.toContain('+')
          expect(encoded).not.toContain('/')
          expect(encoded).not.toContain('=')

          // Verify only base64url characters are present
          const base64urlRegex = /^[A-Za-z0-9_-]*$/
          expect(encoded).toMatch(base64urlRegex)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - complex card state round trip', () => {
    fc.assert(
      fc.property(
        fc.record({
          photo: fc.string(),
          cropType: fc.constantFrom('wheat', 'barley', 'maize', 'sunflower', 'potato', 'vegetables', 'orchard'),
          score: fc.integer({ min: 0, max: 100 }),
          riskSummary: fc.string(),
          interventions: fc.array(
            fc.record({
              action: fc.string(),
              timing: fc.string(),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          geolocation: fc.record({
            lat: fc.float({ min: -90, max: 90, noNaN: true, noInfinity: true }),
            lon: fc.float({ min: -180, max: 180, noNaN: true, noInfinity: true }),
          }),
          timestamp: fc.string(),
        }),
        (cardState) => {
          const encoded = encodeState(cardState)
          const decoded = decodeState(encoded)

          // Verify all card fields are preserved
          expect(decoded.photo).toBe(cardState.photo)
          expect(decoded.cropType).toBe(cardState.cropType)
          expect(decoded.score).toBe(cardState.score)
          expect(decoded.riskSummary).toBe(cardState.riskSummary)
          expect(decoded.interventions).toEqual(cardState.interventions)
          // For geolocation, use loose equality to handle -0 vs +0 (JSON limitation)
          expect(decoded.geolocation.lat == cardState.geolocation.lat).toBe(true)
          expect(decoded.geolocation.lon == cardState.geolocation.lon).toBe(true)
          expect(decoded.timestamp).toBe(cardState.timestamp)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - preserves numeric precision', () => {
    fc.assert(
      fc.property(
        fc.record({
          lat: fc.float({ min: -90, max: 90, noNaN: true, noInfinity: true }),
          lon: fc.float({ min: -180, max: 180, noNaN: true, noInfinity: true }),
          score: fc.integer({ min: 0, max: 100 }),
        }),
        (state) => {
          const encoded = encodeState(state)
          const decoded = decodeState(encoded)

          // Verify numeric values are preserved (JSON converts -0 to +0, which is acceptable)
          // Use loose equality to handle this JSON limitation
          expect(decoded.lat == state.lat).toBe(true)
          expect(decoded.lon == state.lon).toBe(true)
          expect(decoded.score == state.score).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - handles special characters', () => {
    fc.assert(
      fc.property(
        fc.record({
          text: fc.string(),
          unicode: fc.string(),
        }),
        (state) => {
          const encoded = encodeState(state)
          const decoded = decodeState(encoded)

          // Verify special and unicode characters are preserved
          expect(decoded.text).toBe(state.text)
          expect(decoded.unicode).toBe(state.unicode)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - handles empty and zero values', () => {
    fc.assert(
      fc.property(
        fc.record({
          emptyString: fc.constant(''),
          zero: fc.constant(0),
          false: fc.constant(false),
          null: fc.constant(null),
          emptyArray: fc.constant([]),
          emptyObject: fc.constant({}),
        }),
        (state) => {
          const encoded = encodeState(state)
          const decoded = decodeState(encoded)

          // Verify empty and zero values are preserved
          expect(decoded.emptyString).toBe('')
          expect(decoded.zero).toBe(0)
          expect(decoded.false).toBe(false)
          expect(decoded.null).toBe(null)
          expect(decoded.emptyArray).toEqual([])
          expect(decoded.emptyObject).toEqual({})
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - encoded string is deterministic', () => {
    fc.assert(
      fc.property(
        fc.object({
          recordConstraints: {
            maxDepth: 2,
            maxKeys: 5,
          },
        }),
        (state) => {
          const encoded1 = encodeState(state)
          const encoded2 = encodeState(state)
          const encoded3 = encodeState(state)

          // Verify encoding is deterministic
          expect(encoded1).toBe(encoded2)
          expect(encoded2).toBe(encoded3)
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: pocket-rescue, Property 8: Share URL State Encoding Round Trip**
  // **Validates: Requirements 8.1, 8.2, 8.4**
  it('Property 8: Share URL State Encoding Round Trip - different states produce different encodings', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.object({ maxDepth: 1, maxKeys: 3 }),
          fc.object({ maxDepth: 1, maxKeys: 3 })
        ),
        ([state1, state2]) => {
          // Skip if states are equal (rare but possible with random generation)
          if (JSON.stringify(state1) === JSON.stringify(state2)) {
            return true
          }

          const encoded1 = encodeState(state1)
          const encoded2 = encodeState(state2)

          // Different states should produce different encodings
          expect(encoded1).not.toBe(encoded2)
        }
      ),
      { numRuns: 100 }
    )
  })
})
