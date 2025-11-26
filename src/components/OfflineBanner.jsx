import { useState } from 'react'

export default function OfflineBanner({ isOnline, isDemoMode }) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show banner if dismissed, or if online and not in demo mode
  if (isDismissed || (isOnline && !isDemoMode)) {
    return null
  }

  const bannerText = isDemoMode ? '📡 Demo mode (cached forecast)' : '📡 Offline mode'
  const bannerDescription = isDemoMode
    ? 'Using cached forecast data. Weather API unavailable.'
    : 'No internet connection. Using cached data.'

  return (
    <div 
      className="fixed top-0 left-0 right-0 bg-yellow-50 border-b-2 border-yellow-400 shadow-md z-40"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-yellow-900">{bannerText}</p>
          <p className="text-sm text-yellow-800">{bannerDescription}</p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-4 flex-shrink-0 text-yellow-600 hover:text-yellow-800 font-bold text-lg transition-colors"
          aria-label="Dismiss offline banner"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
