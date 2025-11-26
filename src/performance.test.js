import { describe, it, expect } from 'vitest'
import { computeExG, computeNDVIProxy, computeGlobalScore } from './processor/index'

/**
 * Performance Testing for PocketRescue
 * Measures:
 * - Image processing time (target: < 3 seconds)
 * - Bundle size (target: < 400 KB gzipped)
 * - PDF export time (target: < 5 seconds)
 */

describe('Performance Tests', () => {



  it('should compute ExG indices correctly', () => {
    const startTime = performance.now()

    // Create test pixel data (RGBA format)
    const pixelData = new Uint8ClampedArray([
      255, 0, 0, 255, // Red pixel
      0, 255, 0, 255, // Green pixel
      0, 0, 255, 255, // Blue pixel
    ])

    const exgIndices = computeExG(pixelData)

    const endTime = performance.now()
    const computeTime = endTime - startTime

    console.log(`ExG computation time: ${computeTime.toFixed(2)}ms`)
    expect(exgIndices.length).toBe(3)
    expect(exgIndices[0]).toBeLessThan(0) // Red should have negative ExG
    expect(exgIndices[1]).toBeGreaterThan(0) // Green should have positive ExG
    expect(exgIndices[2]).toBeLessThan(0) // Blue should have negative ExG
  })

  it('should compute NDVI-proxy indices correctly', () => {
    const startTime = performance.now()

    // Create test pixel data (RGBA format)
    const pixelData = new Uint8ClampedArray([
      255, 0, 0, 255, // Red pixel (R=255, G=0)
      0, 255, 0, 255, // Green pixel (R=0, G=255)
      0, 0, 255, 255, // Blue pixel (R=0, G=0)
    ])

    const ndviIndices = computeNDVIProxy(pixelData)

    const endTime = performance.now()
    const computeTime = endTime - startTime

    console.log(`NDVI-proxy computation time: ${computeTime.toFixed(2)}ms`)
    expect(ndviIndices.length).toBe(3)
    expect(ndviIndices[0]).toBeLessThan(0) // Red should have negative NDVI (0-255)/(0+255) < 0
    expect(ndviIndices[1]).toBeGreaterThan(0) // Green should have positive NDVI (255-0)/(255+0) > 0
    // Blue pixel: (0-0)/(0+0+epsilon) = 0, so it's neither positive nor negative
    expect(ndviIndices[2]).toBe(0)
  })

  it('should compute global score correctly', () => {
    const startTime = performance.now()

    // Create test indices with known mean
    const indices = new Float32Array([0.5, 0.3, 0.7, 0.4, 0.6])
    const globalScore = computeGlobalScore(indices)

    const endTime = performance.now()
    const computeTime = endTime - startTime

    console.log(`Global score computation time: ${computeTime.toFixed(2)}ms`)
    expect(globalScore).toBeGreaterThanOrEqual(0)
    expect(globalScore).toBeLessThanOrEqual(100)
    // Mean of [0.5, 0.3, 0.7, 0.4, 0.6] = 0.5
    // Scaled: (0.5 + 1) / 2 * 100 = 75
    expect(globalScore).toBe(75)
  })
})
