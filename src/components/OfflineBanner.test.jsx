import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { act } from 'react'
import OfflineBanner from './OfflineBanner'

describe('OfflineBanner Component', () => {
  it('should display offline mode banner when isOnline is false', () => {
    render(<OfflineBanner isOnline={false} isDemoMode={false} />)

    expect(screen.getByText(/Offline mode/)).toBeInTheDocument()
    expect(screen.getByText(/No internet connection/)).toBeInTheDocument()
  })

  it('should display demo mode banner when isDemoMode is true', () => {
    render(<OfflineBanner isOnline={true} isDemoMode={true} />)

    expect(screen.getByText(/Demo mode \(cached forecast\)/)).toBeInTheDocument()
    expect(screen.getByText(/Using cached forecast data/)).toBeInTheDocument()
  })

  it('should not display banner when online and not in demo mode', () => {
    const { container } = render(<OfflineBanner isOnline={true} isDemoMode={false} />)

    expect(container.firstChild).toBeNull()
  })

  it('should display dismiss button', () => {
    render(<OfflineBanner isOnline={false} isDemoMode={false} />)

    const dismissButton = screen.getByRole('button', { name: /Dismiss offline banner/ })
    expect(dismissButton).toBeInTheDocument()
  })

  it('should hide banner when dismiss button is clicked', () => {
    const { container } = render(<OfflineBanner isOnline={false} isDemoMode={false} />)

    expect(screen.getByText(/Offline mode/)).toBeInTheDocument()

    const dismissButton = screen.getByRole('button', { name: /Dismiss offline banner/ })
    act(() => {
      dismissButton.click()
    })

    expect(container.firstChild).toBeNull()
  })

  it('should display banner with correct styling classes', () => {
    const { container } = render(<OfflineBanner isOnline={false} isDemoMode={false} />)

    const banner = container.querySelector('div')
    expect(banner).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'bg-yellow-50')
  })

  it('should display demo mode banner when both isOnline and isDemoMode are true', () => {
    render(<OfflineBanner isOnline={true} isDemoMode={true} />)

    expect(screen.getByText(/Demo mode \(cached forecast\)/)).toBeInTheDocument()
  })

  it('should display offline mode banner when both isOnline and isDemoMode are false', () => {
    render(<OfflineBanner isOnline={false} isDemoMode={false} />)

    expect(screen.getByText(/Offline mode/)).toBeInTheDocument()
  })
})
