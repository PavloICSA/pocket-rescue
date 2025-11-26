import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  computeExG,
  computeNDVIProxy,
  computeGlobalScore,
} from './index.js';

describe('Image Processing Module - Property-Based Tests', () => {
  describe('Property 1: ExG Index Computation Correctness', () => {
    // **Feature: pocket-rescue, Property 1: ExG Index Computation Correctness**
    // **Validates: Requirements 3.2**
    it('should compute ExG correctly for all valid RGB pixels', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ),
          ([r, g, b]) => {
            const pixelData = new Uint8ClampedArray([r, g, b, 255]);
            const exgValues = computeExG(pixelData);

            // Verify formula: ExG = (2*G - R - B) / (2*G + R + B + ε)
            const epsilon = 0.0001;
            const expected = (2 * g - r - b) / (2 * g + r + b + epsilon);

            expect(exgValues[0]).toBeCloseTo(expected, 5);
            // Verify result is in valid range
            expect(exgValues[0]).toBeGreaterThanOrEqual(-1);
            expect(exgValues[0]).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: NDVI-proxy Index Computation Correctness', () => {
    // **Feature: pocket-rescue, Property 2: NDVI-proxy Index Computation Correctness**
    // **Validates: Requirements 3.3**
    it('should compute NDVI-proxy correctly for all valid RGB pixels', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 }),
            fc.integer({ min: 0, max: 255 })
          ),
          ([r, g, b]) => {
            const pixelData = new Uint8ClampedArray([r, g, b, 255]);
            const ndviValues = computeNDVIProxy(pixelData);

            // Verify formula: NDVI-proxy = (G - R) / (G + R + ε)
            const epsilon = 0.0001;
            const expected = (g - r) / (g + r + epsilon);

            expect(ndviValues[0]).toBeCloseTo(expected, 5);
            // Verify result is in valid range
            expect(ndviValues[0]).toBeGreaterThanOrEqual(-1);
            expect(ndviValues[0]).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Global Score Aggregation', () => {
    // **Feature: pocket-rescue, Property 3: Global Score Aggregation**
    // **Validates: Requirements 3.5**
    it('should compute global score correctly from any set of indices', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: -1, max: 1, noNaN: true }), {
            minLength: 1,
            maxLength: 1000,
          }),
          (indicesArray) => {
            const indices = new Float32Array(indicesArray);
            const score = computeGlobalScore(indices);

            // Verify formula: score = (mean(indices) + 1) / 2 * 100
            const mean = indicesArray.reduce((a, b) => a + b, 0) / indicesArray.length;
            const expected = Math.round(((mean + 1) / 2) * 100);

            expect(score).toBe(expected);
            // Verify result is in valid range [0, 100]
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Note: Property 4 (Heatmap Color Mapping) is tested via integration tests
  // as it requires Canvas 2D API which is browser-specific and not available in Node.js test environment
});
