import { describe, it, expect } from 'vitest'
import { validateGeolocation, parseAndValidateGeolocation } from './geolocationValidator'

describe('validateGeolocation', () => {
  it('should accept valid coordinates', () => {
    const result = validateGeolocation(51.5074, -0.1278)
    expect(result.valid).toBe(true)
  })

  it('should accept boundary latitude values', () => {
    expect(validateGeolocation(-90, 0).valid).toBe(true)
    expect(validateGeolocation(90, 0).valid).toBe(true)
  })

  it('should accept boundary longitude values', () => {
    expect(validateGeolocation(0, -180).valid).toBe(true)
    expect(validateGeolocation(0, 180).valid).toBe(true)
  })

  it('should accept zero coordinates', () => {
    const result = validateGeolocation(0, 0)
    expect(result.valid).toBe(true)
  })

  it('should reject latitude below -90', () => {
    const result = validateGeolocation(-90.1, 0)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('Latitude')
  })

  it('should reject latitude above 90', () => {
    const result = validateGeolocation(90.1, 0)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('Latitude')
  })

  it('should reject longitude below -180', () => {
    const result = validateGeolocation(0, -180.1)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('Longitude')
  })

  it('should reject longitude above 180', () => {
    const result = validateGeolocation(0, 180.1)
    expect(result.valid).toBe(false)
    expect(result.message).toContain('Longitude')
  })

  it('should reject non-number latitude', () => {
    const result = validateGeolocation('51.5074', 0)
    expect(result.valid).toBe(false)
  })

  it('should reject non-number longitude', () => {
    const result = validateGeolocation(0, '0.1278')
    expect(result.valid).toBe(false)
  })

  it('should reject NaN values', () => {
    const result = validateGeolocation(NaN, 0)
    expect(result.valid).toBe(false)
  })

  it('should reject Infinity values', () => {
    const result = validateGeolocation(Infinity, 0)
    expect(result.valid).toBe(false)
  })

  it('should reject negative Infinity values', () => {
    const result = validateGeolocation(-Infinity, 0)
    expect(result.valid).toBe(false)
  })
})

describe('parseAndValidateGeolocation', () => {
  it('should parse and validate valid string coordinates', () => {
    const result = parseAndValidateGeolocation('51.5074', '-0.1278')
    expect(result.valid).toBe(true)
    expect(result.lat).toBe(51.5074)
    expect(result.lon).toBe(-0.1278)
  })

  it('should parse integer strings', () => {
    const result = parseAndValidateGeolocation('45', '90')
    expect(result.valid).toBe(true)
    expect(result.lat).toBe(45)
    expect(result.lon).toBe(90)
  })

  it('should reject non-numeric strings', () => {
    const result = parseAndValidateGeolocation('abc', '0')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('valid numbers')
  })

  it('should reject empty strings', () => {
    const result = parseAndValidateGeolocation('', '0')
    expect(result.valid).toBe(false)
  })

  it('should reject out-of-range parsed values', () => {
    const result = parseAndValidateGeolocation('91', '0')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('Latitude')
  })

  it('should handle whitespace in strings', () => {
    const result = parseAndValidateGeolocation('  51.5074  ', '  -0.1278  ')
    expect(result.valid).toBe(true)
    expect(result.lat).toBe(51.5074)
    expect(result.lon).toBe(-0.1278)
  })

  it('should reject both invalid coordinates', () => {
    const result = parseAndValidateGeolocation('abc', 'xyz')
    expect(result.valid).toBe(false)
  })
})
