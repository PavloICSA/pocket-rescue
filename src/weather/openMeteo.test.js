import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchForecast } from './openMeteo.js';

describe('fetchForecast', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should fetch forecast from Open-Meteo API successfully', async () => {
    const mockResponse = {
      daily: {
        precipitation_sum: [5.2, 3.1, 4.2],
        temperature_2m_max: [18, 19, 17],
        temperature_2m_min: [8, 9, 7],
      },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const forecast = await fetchForecast(51.5074, -0.1278);

    expect(forecast.precipitationMm).toBe(12.5); // 5.2 + 3.1 + 4.2
    expect(forecast.tempMin).toBe(7);
    expect(forecast.tempMax).toBe(19);
    expect(forecast.source).toBe('openMeteo');
    expect(forecast.timestamp).toBeDefined();
  });

  it('should cache forecast in localStorage after successful fetch', async () => {
    const mockResponse = {
      daily: {
        precipitation_sum: [5.0, 5.0, 5.0],
        temperature_2m_max: [20, 20, 20],
        temperature_2m_min: [10, 10, 10],
      },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    await fetchForecast(51.5074, -0.1278);

    const cached = localStorage.getItem('pocketRescue_forecast_cache');
    expect(cached).toBeDefined();
    const cachedData = JSON.parse(cached);
    expect(cachedData.precipitationMm).toBe(15);
  });

  it('should use cached forecast when API fails', async () => {
    // Pre-populate cache
    const cachedForecast = {
      precipitationMm: 20.0,
      tempMin: 5,
      tempMax: 25,
      source: 'openMeteo',
      timestamp: '2024-11-25T10:00:00Z',
      cachedAt: Date.now(),
    };
    localStorage.setItem('pocketRescue_forecast_cache', JSON.stringify(cachedForecast));

    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const forecast = await fetchForecast(51.5074, -0.1278);

    expect(forecast.precipitationMm).toBe(20.0);
    expect(forecast.tempMin).toBe(5);
    expect(forecast.tempMax).toBe(25);
    expect(forecast.source).toBe('cached');
  });

  it('should use sample forecast when API fails and no cache exists', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    const forecast = await fetchForecast(51.5074, -0.1278);

    expect(forecast.precipitationMm).toBe(12.5);
    expect(forecast.tempMin).toBe(8);
    expect(forecast.tempMax).toBe(18);
    expect(forecast.source).toBe('cached');
  });

  it('should handle API timeout gracefully', async () => {
    // Pre-populate cache
    const cachedForecast = {
      precipitationMm: 15.0,
      tempMin: 6,
      tempMax: 22,
      source: 'openMeteo',
      timestamp: '2024-11-25T10:00:00Z',
      cachedAt: Date.now(),
    };
    localStorage.setItem('pocketRescue_forecast_cache', JSON.stringify(cachedForecast));

    global.fetch = vi.fn(() =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100);
      })
    );

    const forecast = await fetchForecast(51.5074, -0.1278);

    expect(forecast.source).toBe('cached');
    expect(forecast.precipitationMm).toBe(15.0);
  });

  it('should handle invalid API response format', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      })
    );

    const forecast = await fetchForecast(51.5074, -0.1278);

    // Should fall back to sample forecast
    expect(forecast.precipitationMm).toBe(12.5);
    expect(forecast.source).toBe('cached');
  });

  it('should round precipitation to 1 decimal place', async () => {
    const mockResponse = {
      daily: {
        precipitation_sum: [5.234, 3.567, 4.891],
        temperature_2m_max: [18, 19, 17],
        temperature_2m_min: [8, 9, 7],
      },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const forecast = await fetchForecast(51.5074, -0.1278);

    // 5.234 + 3.567 + 4.891 = 13.692, rounded to 13.7
    expect(forecast.precipitationMm).toBe(13.7);
  });

  it('should return integer temperature values', async () => {
    const mockResponse = {
      daily: {
        precipitation_sum: [5.0, 5.0, 5.0],
        temperature_2m_max: [18.7, 19.3, 17.2],
        temperature_2m_min: [8.4, 9.6, 7.1],
      },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    const forecast = await fetchForecast(51.5074, -0.1278);

    expect(Number.isInteger(forecast.tempMin)).toBe(true);
    expect(Number.isInteger(forecast.tempMax)).toBe(true);
  });
});
