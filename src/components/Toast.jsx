import { useEffect, useState } from 'react'

/**
 * Toast Notification Component
 * Displays temporary success, error, warning, or info messages
 * Automatically dismisses after 3 seconds
 * WCAG AA compliant with high contrast colors
 */
export default function Toast({ message, type = 'success', duration = 3000, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onDismiss) {
        onDismiss()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  if (!isVisible) {
    return null
  }

  const typeStyles = {
    success: 'success-message',
    error: 'error-message',
    warning: 'warning-message',
    info: 'info-message',
  }

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      className={`toast-notification fixed top-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm p-4 rounded-lg border-2 font-semibold text-sm sm:text-base z-50 ${typeStyles[type]}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold">{typeIcons[type]}</span>
        <span>{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-auto flex-shrink-0 font-bold hover:opacity-70 transition-opacity"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
