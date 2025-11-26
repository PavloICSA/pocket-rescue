import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import Toast from './Toast'

describe('Toast Component', () => {
  it('should render success toast with correct message', () => {
    render(<Toast message="Success!" type="success" />)

    expect(screen.getByText('Success!')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('should render error toast with correct styling', () => {
    const { container } = render(<Toast message="Error occurred" type="error" />)

    const toast = container.querySelector('.error-message')
    expect(toast).toBeInTheDocument()
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })

  it('should render warning toast', () => {
    const { container } = render(<Toast message="Warning!" type="warning" />)

    const toast = container.querySelector('.warning-message')
    expect(toast).toBeInTheDocument()
  })

  it('should render info toast', () => {
    const { container } = render(<Toast message="Info message" type="info" />)

    const toast = container.querySelector('.info-message')
    expect(toast).toBeInTheDocument()
  })

  it('should auto-dismiss after specified duration', async () => {
    const { container } = render(
      <Toast message="Auto dismiss" type="success" duration={100} />
    )

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

    await waitFor(
      () => {
        expect(container.firstChild).toBeNull()
      },
      { timeout: 200 }
    )
  })

  it('should call onDismiss callback when auto-dismissing', async () => {
    const onDismiss = vi.fn()
    render(
      <Toast message="Dismiss callback" type="success" duration={100} onDismiss={onDismiss} />
    )

    await waitFor(
      () => {
        expect(onDismiss).toHaveBeenCalled()
      },
      { timeout: 200 }
    )
  })

  it('should dismiss when close button is clicked', () => {
    const { container } = render(<Toast message="Click to dismiss" type="success" />)

    expect(screen.getByText('Click to dismiss')).toBeInTheDocument()

    const closeButton = screen.getByRole('button', { name: /Dismiss notification/ })
    act(() => {
      closeButton.click()
    })

    expect(container.firstChild).toBeNull()
  })

  it('should have correct ARIA attributes for accessibility', () => {
    render(<Toast message="Accessible toast" type="success" />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-atomic', 'true')
  })

  it('should display correct icon for each type', () => {
    const { container, rerender } = render(<Toast message="Success" type="success" />)
    let icon = container.querySelector('.text-lg.font-bold')
    expect(icon).toHaveTextContent('✓')

    rerender(<Toast message="Error" type="error" />)
    icon = container.querySelector('.text-lg.font-bold')
    expect(icon).toHaveTextContent('✕')

    rerender(<Toast message="Warning" type="warning" />)
    icon = container.querySelector('.text-lg.font-bold')
    expect(icon).toHaveTextContent('⚠')

    rerender(<Toast message="Info" type="info" />)
    icon = container.querySelector('.text-lg.font-bold')
    expect(icon).toHaveTextContent('ℹ')
  })

  it('should have animation class for toast notification', () => {
    const { container } = render(<Toast message="Animated" type="success" />)

    const toast = container.querySelector('.toast-notification')
    expect(toast).toHaveClass('toast-notification')
  })
})
