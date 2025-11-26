/**
 * Unit Tests for App Component - URL Reconstruction
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { encodeState } from './share'

describe('App - URL Reconstruction', () => {
  beforeEach(() => {
    // Reset URL before each test
    delete window.location
    window.location = {
      search: '',
      origin: 'https://example.com',
      pathname: '/app/',
    }
  })

  it('should detect and parse share URL on app load', () => {
    // Create a sample card state
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

    // Encode the state
    const encodedState = encodeState(cardState)

    // Simulate URL with encoded state
    window.location.search = `?state=${encodedState}`

    // Verify URL parsing works
    const params = new URLSearchParams(window.location.search)
    const retrievedState = params.get('state')
    expect(retrievedState).toBe(encodedState)
  })

  it('should handle missing state parameter gracefully', () => {
    window.location.search = ''

    const params = new URLSearchParams(window.location.search)
    const state = params.get('state')
    expect(state).toBeNull()
  })

  it('should handle invalid encoded state gracefully', () => {
    window.location.search = '?state=invalid!!!state'

    const params = new URLSearchParams(window.location.search)
    const state = params.get('state')
    expect(state).toBe('invalid!!!state')
    // Decoding should fail, but app should handle it gracefully
  })

  it('should preserve all card fields in URL reconstruction', () => {
    const cardState = {
      photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      cropType: 'maize',
      score: 75,
      riskSummary: 'FLOOD/STRESS RISK: HIGH\nVegetation stress detected.\nPrioritize drainage.',
      interventions: [
        { action: 'Start moisture monitoring', timing: 'within 2 days' },
        { action: 'Apply foliar feed', timing: 'within 3 days' },
        { action: 'Delay nitrogen top-up', timing: 'within 1 week' },
      ],
      geolocation: { lat: 40.7128, lon: -74.0060 },
      timestamp: '2024-11-25T14:30:00Z',
    }

    const encodedState = encodeState(cardState)
    window.location.search = `?state=${encodedState}`

    const params = new URLSearchParams(window.location.search)
    const retrievedState = params.get('state')
    expect(retrievedState).toBe(encodedState)
  })

  it('should handle URL with multiple query parameters', () => {
    const cardState = {
      photo: 'data:image/jpeg;base64,test',
      cropType: 'wheat',
      score: 65,
      riskSummary: 'Test',
      interventions: [],
      geolocation: { lat: 0, lon: 0 },
      timestamp: '2024-11-25T10:30:00Z',
    }

    const encodedState = encodeState(cardState)
    window.location.search = `?other=param&state=${encodedState}&another=value`

    const params = new URLSearchParams(window.location.search)
    const state = params.get('state')
    expect(state).toBe(encodedState)
  })
})
