import { describe, it, expect } from 'vitest';
import {
  downsampleImage,
  computeExG,
  computeNDVIProxy,
  computeGlobalScore,
} from './index.js';

describe('Image Processing Module', () => {
  describe('computeExG', () => {
    it('should compute ExG correctly for known pixel values', () => {
      // Create pixel data: RGBA format
      // Pixel 1: R=100, G=150, B=50
      const pixelData = new Uint8ClampedArray([100, 150, 50, 255]);
      
      const exgValues = computeExG(pixelData);
      
      // ExG = (2*G - R - B) / (2*G + R + B + ε)
      // = (2*150 - 100 - 50) / (2*150 + 100 + 50 + 0.0001)
      // = (300 - 150) / (450 + 0.0001)
      // = 150 / 450.0001 ≈ 0.3333
      expect(exgValues[0]).toBeCloseTo(0.3333, 3);
    });

    it('should return values in range [-1, 1]', () => {
      // Test with various pixel combinations
      const testCases = [
        [0, 255, 0, 255],     // Pure green
        [255, 0, 0, 255],     // Pure red
        [0, 0, 255, 255],     // Pure blue
        [128, 128, 128, 255], // Gray
      ];

      testCases.forEach((pixelData) => {
        const exgValues = computeExG(new Uint8ClampedArray(pixelData));
        expect(exgValues[0]).toBeGreaterThanOrEqual(-1);
        expect(exgValues[0]).toBeLessThanOrEqual(1);
      });
    });

    it('should handle multiple pixels', () => {
      // Two pixels: RGBA format
      const pixelData = new Uint8ClampedArray([100, 150, 50, 255, 50, 200, 100, 255]);
      
      const exgValues = computeExG(pixelData);
      
      expect(exgValues.length).toBe(2);
      expect(exgValues[0]).toBeCloseTo(0.3333, 3);
    });

    it('should avoid division by zero with epsilon', () => {
      // All channels zero
      const pixelData = new Uint8ClampedArray([0, 0, 0, 255]);
      
      const exgValues = computeExG(pixelData);
      
      // Should not be NaN or Infinity
      expect(Number.isFinite(exgValues[0])).toBe(true);
    });
  });

  describe('computeNDVIProxy', () => {
    it('should compute NDVI-proxy correctly for known pixel values', () => {
      // Pixel: R=100, G=150, B=50
      const pixelData = new Uint8ClampedArray([100, 150, 50, 255]);
      
      const ndviValues = computeNDVIProxy(pixelData);
      
      // NDVI-proxy = (G - R) / (G + R + ε)
      // = (150 - 100) / (150 + 100 + 0.0001)
      // = 50 / 250.0001 ≈ 0.2
      expect(ndviValues[0]).toBeCloseTo(0.2, 3);
    });

    it('should return values in range [-1, 1]', () => {
      const testCases = [
        [0, 255, 0, 255],
        [255, 0, 0, 255],
        [0, 0, 255, 255],
        [128, 128, 128, 255],
      ];

      testCases.forEach((pixelData) => {
        const ndviValues = computeNDVIProxy(new Uint8ClampedArray(pixelData));
        expect(ndviValues[0]).toBeGreaterThanOrEqual(-1);
        expect(ndviValues[0]).toBeLessThanOrEqual(1);
      });
    });

    it('should handle multiple pixels', () => {
      const pixelData = new Uint8ClampedArray([100, 150, 50, 255, 50, 200, 100, 255]);
      
      const ndviValues = computeNDVIProxy(pixelData);
      
      expect(ndviValues.length).toBe(2);
      expect(ndviValues[0]).toBeCloseTo(0.2, 3);
    });

    it('should avoid division by zero with epsilon', () => {
      const pixelData = new Uint8ClampedArray([0, 0, 0, 255]);
      
      const ndviValues = computeNDVIProxy(pixelData);
      
      expect(Number.isFinite(ndviValues[0])).toBe(true);
    });
  });

  // Note: generateHeatmap tests are skipped in Node.js environment
  // as they require Canvas 2D API which is browser-specific.
  // These functions will be tested via property-based tests and integration tests.;

  describe('computeGlobalScore', () => {
    it('should compute score correctly from indices', () => {
      // Mean of [0.5, 0.5] = 0.5
      // Scaled: (0.5 + 1) / 2 * 100 = 75
      const indices = new Float32Array([0.5, 0.5]);
      
      const score = computeGlobalScore(indices);
      
      expect(score).toBe(75);
    });

    it('should scale from [-1, 1] to [0, 100]', () => {
      const testCases = [
        { indices: new Float32Array([-1]), expected: 0 },
        { indices: new Float32Array([0]), expected: 50 },
        { indices: new Float32Array([1]), expected: 100 },
      ];

      testCases.forEach(({ indices, expected }) => {
        const score = computeGlobalScore(indices);
        expect(score).toBe(expected);
      });
    });

    it('should return 0 for empty indices', () => {
      const indices = new Float32Array([]);
      
      const score = computeGlobalScore(indices);
      
      expect(score).toBe(0);
    });

    it('should round the result to nearest integer', () => {
      // Mean of [0.33, 0.33] ≈ 0.33
      // Scaled: (0.33 + 1) / 2 * 100 ≈ 66.5 → rounds to 67 or 66
      const indices = new Float32Array([0.33, 0.33]);
      
      const score = computeGlobalScore(indices);
      
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(66);
      expect(score).toBeLessThanOrEqual(67);
    });

    it('should handle multiple pixels with varying indices', () => {
      const indices = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]);
      
      const score = computeGlobalScore(indices);
      
      // Mean = 0.3, Scaled = (0.3 + 1) / 2 * 100 = 65
      expect(score).toBe(65);
    });
  });

  describe('downsampleImage', () => {
    it('should return a promise', () => {
      const result = downsampleImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
