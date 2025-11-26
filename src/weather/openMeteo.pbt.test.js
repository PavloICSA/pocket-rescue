import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { fetchForecast } from './openMeteo.js';

describe('Property-Based Tests: Weather Forecast', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Property 11: Offline Forecast Fallback - should always return valid forecast structure even when API fails', async () => {
    // **Feature: pocket-rescue, Property 11: Offline Forecast Fallback**
    // **Validates: Requirements 4.2, 9.4**

    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.float({ min: -90, max: 90 }), // latitude
          fc.float({ min: -180, max: 180 }) // longitude
        ),
        async ([lat, lon]) => {
          // Simulate API failure
          global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

          const forecast = await fetchForecast(lat, lon);

          // Verify forecast has required structure
          expect(forecast).toBeDefined();
          expect(forecast.precipitationMm).toBeDefined();
          expect(forecast.tempMin).toBeDefined();
          expect(forecast.tempMax).toBeDefined();
          expect(forecast.source).toBeDefined();
          expect(forecast.timestamp).toBeDefined();

          // Verify data types
          expect(typeof forecast.precipitationMm).toBe('number');
          expect(typeof forecast.tempMin).toBe('number');
          expect(typeof forecast.tempMax).toBe('number');
          expect(typeof forecast.source).toBe('string');
          expect(typeof forecast.timestamp).toBe('string');

          // Verify reasonable ranges
          expect(forecast.precipitationMm).toBeGreaterThanOrEqual(0);
          expect(forecast.tempMin).toBeGreaterThanOrEqual(-50);
          expect(forecast.tempMax).toBeLessThanOrEqual(60);
          expect(forecast.tempMin).toBeLessThanOrEqual(forecast.tempMax);

          // Verify source is either 'openMeteo' or 'cached'
          expect(['openMeteo', 'cached']).toContain(forecast.source);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11: Offline Forecast Fallback - should use cached forecast when API unavailable', async () => {
    // **Feature: pocket-rescue, Property 11: Offline Forecast Fallback**
    // **Validates: Requirements 4.2, 9.4**

    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.float({ min: -90, max: 90, noNaN: true }), // latitude
          fc.float({ min: -180, max: 180, noNaN: true }), // longitude
          fc.float({ min: 0, max: 100, noNaN: true }), // precipitation
          fc.integer({ min: -50, max: 50 }), // tempMin
          fc.integer({ min: -50, max: 50 }) // tempMax
        ),
        async ([lat, lon, precip, tempMin, tempMax]) => {
          // Ensure tempMin <= tempMax
          const actualTempMin = Math.min(tempMin, tempMax);
          const actualTempMax = Math.max(tempMin, tempMax);

          // Pre-populate cache with known values
          const cachedForecast = {
            precipitationMm: precip,
            tempMin: actualTempMin,
            tempMax: actualTempMax,
            source: 'openMeteo',
            timestamp: '2024-11-25T10:00:00Z',
            cachedAt: Date.now(),
          };
          localStorage.setItem('pocketRescue_forecast_cache', JSON.stringify(cachedForecast));

          // Simulate API failure
          global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

          const forecast = await fetchForecast(lat, lon);

          // Verify cached values are returned
          expect(forecast.precipitationMm).toBe(precip);
          expect(forecast.tempMin).toBe(actualTempMin);
          expect(forecast.tempMax).toBe(actualTempMax);
          expect(forecast.source).toBe('cached');
        }
      ),
      { numRuns: 100 }
    );
  });
});
