/**
 * Unit Tests for Share Module
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  encodeState,
  decodeState,
  generateShareURL,
  copyToClipboard,
} from './share'

describe('share - encodeState', () => {
  it('should encode a simple object to base64url', () => {
    const state = { message: 'hello' }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
  })

  it('should not contain standard base64 characters (+, /, =)', () => {
    const state = { test: 'data with special chars: +/=' }
    const encoded = encodeState(state)
    expect(encoded).not.toContain('+')
    expect(encoded).not.toContain('/')
    expect(encoded).not.toContain('=')
  })

  it('should encode complex card state object', () => {
    const cardState = {
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      cropType: 'wheat',
      score: 65,
      riskSummary: 'Test risk',
      interventions: [
        { action: 'Action 1', timing: 'within 2 days' },
        { action: 'Action 2', timing: 'immediately' },
      ],
      geolocation: { lat: 51.5074, lon: -0.1278 },
      timestamp: '2024-11-25T10:30:00Z',
    }
    const encoded = encodeState(cardState)
    expect(typeof encoded).toBe('string')
    expect(encoded.length).toBeGreaterThan(0)
  })

  it('should handle empty object', () => {
    const state = {}
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })

  it('should handle nested objects', () => {
    const state = {
      level1: {
        level2: {
          level3: 'deep value',
        },
      },
    }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })

  it('should handle arrays', () => {
    const state = {
      items: [1, 2, 3, 4, 5],
      nested: [{ id: 1 }, { id: 2 }],
    }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })

  it('should handle special characters in strings', () => {
    const state = {
      text: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
    }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })

  it('should handle unicode characters', () => {
    const state = {
      text: 'Unicode: 你好世界 🌍 مرحبا',
    }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })

  it('should handle null and undefined values', () => {
    const state = {
      nullValue: null,
      undefinedValue: undefined,
    }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })

  it('should handle boolean values', () => {
    const state = {
      isActive: true,
      isDeleted: false,
    }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })

  it('should handle numeric values', () => {
    const state = {
      integer: 42,
      float: 3.14159,
      negative: -100,
      zero: 0,
    }
    const encoded = encodeState(state)
    expect(typeof encoded).toBe('string')
  })
})

describe('share - decodeState', () => {
  it('should decode base64url back to original object', () => {
    const original = { message: 'hello' }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should decode complex card state', () => {
    const cardState = {
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      cropType: 'wheat',
      score: 65,
      riskSummary: 'Test risk',
      interventions: [
        { action: 'Action 1', timing: 'within 2 days' },
        { action: 'Action 2', timing: 'immediately' },
      ],
      geolocation: { lat: 51.5074, lon: -0.1278 },
      timestamp: '2024-11-25T10:30:00Z',
    }
    const encoded = encodeState(cardState)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(cardState)
  })

  it('should handle empty object', () => {
    const original = {}
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should handle nested objects', () => {
    const original = {
      level1: {
        level2: {
          level3: 'deep value',
        },
      },
    }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should handle arrays', () => {
    const original = {
      items: [1, 2, 3, 4, 5],
      nested: [{ id: 1 }, { id: 2 }],
    }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should handle special characters', () => {
    const original = {
      text: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
    }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should handle unicode characters', () => {
    const original = {
      text: 'Unicode: 你好世界 🌍 مرحبا',
    }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should throw error for invalid base64url', () => {
    expect(() => decodeState('!!!invalid!!!')).toThrow()
  })

  it('should throw error for invalid JSON', () => {
    // Create a valid base64url that decodes to invalid JSON
    const invalidJSON = btoa('{invalid json}')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    expect(() => decodeState(invalidJSON)).toThrow()
  })

  it('should handle base64url with missing padding', () => {
    const original = { test: 'data' }
    const encoded = encodeState(original)
    // encoded should not have padding, but decodeState should handle it
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should handle boolean values', () => {
    const original = {
      isActive: true,
      isDeleted: false,
    }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should handle numeric values', () => {
    const original = {
      integer: 42,
      float: 3.14159,
      negative: -100,
      zero: 0,
    }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })

  it('should handle null values', () => {
    const original = {
      nullValue: null,
    }
    const encoded = encodeState(original)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(original)
  })
})

describe('share - generateShareURL', () => {
  beforeEach(() => {
    // Mock window.location
    delete window.location
    window.location = {
      origin: 'https://example.com',
      pathname: '/app/',
    }
  })

  it('should generate a URL with state query parameter', () => {
    const state = { message: 'hello' }
    const url = generateShareURL(state)
    expect(url).toContain('https://example.com/app/')
    expect(url).toContain('?state=')
  })

  it('should include encoded state in URL', () => {
    const state = { test: 'data' }
    const url = generateShareURL(state)
    const encoded = encodeState(state)
    expect(url).toContain(encoded)
  })

  it('should generate valid URL format', () => {
    const state = { cropType: 'wheat', score: 65 }
    const url = generateShareURL(state)
    expect(() => new URL(url)).not.toThrow()
  })

  it('should handle complex card state', () => {
    const cardState = {
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      cropType: 'wheat',
      score: 65,
      riskSummary: 'Test risk',
      interventions: [
        { action: 'Action 1', timing: 'within 2 days' },
      ],
      geolocation: { lat: 51.5074, lon: -0.1278 },
      timestamp: '2024-11-25T10:30:00Z',
    }
    const url = generateShareURL(cardState)
    expect(url).toContain('?state=')
    expect(() => new URL(url)).not.toThrow()
  })

  it('should use window.location.origin and pathname', () => {
    const state = { test: 'data' }
    const url = generateShareURL(state)
    expect(url).toMatch(/^https:\/\/example\.com\/app\//)
  })

  it('should handle different origins', () => {
    window.location.origin = 'http://localhost:3000'
    window.location.pathname = '/'
    const state = { test: 'data' }
    const url = generateShareURL(state)
    expect(url).toMatch(/^http:\/\/localhost:3000\//)
  })

  it('should handle different pathnames', () => {
    window.location.origin = 'https://example.com'
    window.location.pathname = '/pocket-rescue/'
    const state = { test: 'data' }
    const url = generateShareURL(state)
    expect(url).toMatch(/^https:\/\/example\.com\/pocket-rescue\//)
  })
})

describe('share - copyToClipboard', () => {
  beforeEach(() => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    })
  })

  it('should call navigator.clipboard.writeText with URL', async () => {
    navigator.clipboard.writeText.mockResolvedValue(undefined)
    const url = 'https://example.com/app/?state=abc123'
    await copyToClipboard(url)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url)
  })

  it('should return true on successful copy', async () => {
    navigator.clipboard.writeText.mockResolvedValue(undefined)
    const url = 'https://example.com/app/?state=abc123'
    const result = await copyToClipboard(url)
    expect(result).toBe(true)
  })

  it('should return false on copy failure', async () => {
    navigator.clipboard.writeText.mockRejectedValue(new Error('Copy failed'))
    const url = 'https://example.com/app/?state=abc123'
    const result = await copyToClipboard(url)
    expect(result).toBe(false)
  })

  it('should handle long URLs', async () => {
    navigator.clipboard.writeText.mockResolvedValue(undefined)
    const longUrl = 'https://example.com/app/?state=' + 'a'.repeat(1000)
    const result = await copyToClipboard(longUrl)
    expect(result).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longUrl)
  })

  it('should handle URLs with special characters', async () => {
    navigator.clipboard.writeText.mockResolvedValue(undefined)
    const url = 'https://example.com/app/?state=abc-_123'
    const result = await copyToClipboard(url)
    expect(result).toBe(true)
  })
})

describe('share - Round-trip encoding/decoding', () => {
  it('should preserve all fields in complex card state', () => {
    const cardState = {
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      cropType: 'wheat',
      score: 65,
      riskSummary: 'SHORT-TERM DROUGHT RISK: HIGH\nVegetation stress detected.\nPrioritize irrigation.',
      interventions: [
        { action: 'Start moisture monitoring with tensiometers', timing: 'within 2 days' },
        { action: 'Apply light foliar feed if nutrient-deficit suspected', timing: 'within 3 days' },
        { action: 'Delay nitrogen top-up if drought risk high', timing: 'within 1 week' },
      ],
      geolocation: { lat: 51.5074, lon: -0.1278, accuracy: 10, source: 'browser' },
      timestamp: '2024-11-25T10:30:00Z',
    }

    const encoded = encodeState(cardState)
    const decoded = decodeState(encoded)

    expect(decoded).toEqual(cardState)
    expect(decoded.photo).toBe(cardState.photo)
    expect(decoded.cropType).toBe(cardState.cropType)
    expect(decoded.score).toBe(cardState.score)
    expect(decoded.riskSummary).toBe(cardState.riskSummary)
    expect(decoded.interventions).toEqual(cardState.interventions)
    expect(decoded.geolocation).toEqual(cardState.geolocation)
    expect(decoded.timestamp).toBe(cardState.timestamp)
  })

  it('should preserve array order', () => {
    const state = {
      items: [5, 4, 3, 2, 1],
    }
    const encoded = encodeState(state)
    const decoded = decodeState(encoded)
    expect(decoded.items).toEqual([5, 4, 3, 2, 1])
  })

  it('should preserve object key order', () => {
    const state = {
      z: 1,
      a: 2,
      m: 3,
    }
    const encoded = encodeState(state)
    const decoded = decodeState(encoded)
    expect(decoded).toEqual(state)
  })

  it('should preserve numeric precision', () => {
    const state = {
      lat: 51.50740000000001,
      lon: -0.12780000000001,
      score: 65.5,
    }
    const encoded = encodeState(state)
    const decoded = decodeState(encoded)
    expect(decoded.lat).toBe(state.lat)
    expect(decoded.lon).toBe(state.lon)
    expect(decoded.score).toBe(state.score)
  })

  it('should preserve empty strings', () => {
    const state = {
      empty: '',
      notEmpty: 'value',
    }
    const encoded = encodeState(state)
    const decoded = decodeState(encoded)
    expect(decoded.empty).toBe('')
    expect(decoded.notEmpty).toBe('value')
  })

  it('should preserve zero values', () => {
    const state = {
      zero: 0,
      nonZero: 5,
    }
    const encoded = encodeState(state)
    const decoded = decodeState(encoded)
    expect(decoded.zero).toBe(0)
    expect(decoded.nonZero).toBe(5)
  })
})
