import { useState, useEffect } from 'react'
import Toast from './Toast'
import { parseAndValidateGeolocation } from '../geolocationValidator'

export default function Geolocation({ onGeolocationConfirmed, onCancel }) {
  const [step, setStep] = useState('requesting') // 'requesting', 'manual', 'confirmed'
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [error, setError] = useState('')
  const [isRequesting, setIsRequesting] = useState(true)
  const [confirmedLocation, setConfirmedLocation] = useState(null)
  const [toast, setToast] = useState(null)

  // Request browser geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setStep('manual')
      setIsRequesting(false)
      return
    }

    const timeoutId = setTimeout(() => {
      setError('Geolocation request timed out. Please enter coordinates manually.')
      setStep('manual')
      setIsRequesting(false)
    }, 10000) // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId)
        const { latitude: lat, longitude: lon } = position.coords
        setLatitude(lat.toString())
        setLongitude(lon.toString())
        setConfirmedLocation({ lat, lon, source: 'browser' })
        setStep('confirmed')
        setIsRequesting(false)
        setToast({ message: 'Location detected successfully!', type: 'success' })
      },
      () => {
        clearTimeout(timeoutId)
        setError('Geolocation permission denied or unavailable.')
        setStep('manual')
        setIsRequesting(false)
        setToast({ message: 'Please enter your location manually.', type: 'info' })
      }
    )
  }, [])

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const validation = parseAndValidateGeolocation(latitude, longitude)

    if (!validation.valid) {
      setError(validation.message)
      setToast({ message: validation.message, type: 'error' })
      return
    }

    setError('')
    setConfirmedLocation({
      lat: validation.lat,
      lon: validation.lon,
      source: 'manual',
    })
    setStep('confirmed')
    setToast({ message: 'Location confirmed!', type: 'success' })
  }

  const handleConfirm = () => {
    if (confirmedLocation) {
      onGeolocationConfirmed(confirmedLocation)
    }
  }

  const handleEdit = () => {
    setStep('manual')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">PocketRescue</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Confirm Field Location</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto">
          {step === 'requesting' && isRequesting && (
            // Requesting geolocation
            <div className="text-center" role="status" aria-live="polite">
              <div className="mb-6 sm:mb-8">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" aria-hidden="true"></div>
                </div>
              </div>
              <p className="text-gray-600 text-base sm:text-lg mb-3 sm:mb-4">
                Requesting your location...
              </p>
              <p className="text-gray-500 text-xs sm:text-sm">
                Please allow location access when prompted by your browser.
              </p>
            </div>
          )}

          {step === 'manual' && (
            // Manual entry form
            <div>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Enter Field Location</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Enter the latitude and longitude of your field.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4 sm:space-y-6">
                {/* Latitude input */}
                <div>
                  <label htmlFor="latitude" className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                    Latitude (−90 to 90)
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    min="-90"
                    max="90"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g., 51.5074"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-base sm:text-lg"
                    aria-label="Latitude coordinate"
                    aria-describedby="latitude-help"
                  />
                  <p id="latitude-help" className="text-xs text-gray-600 mt-1">
                    Enter a value between -90 and 90
                  </p>
                </div>

                {/* Longitude input */}
                <div>
                  <label htmlFor="longitude" className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                    Longitude (−180 to 180)
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    min="-180"
                    max="180"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g., -0.1278"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-base sm:text-lg"
                    aria-label="Longitude coordinate"
                    aria-describedby="longitude-help"
                  />
                  <p id="longitude-help" className="text-xs text-gray-600 mt-1">
                    Enter a value between -180 and 180
                  </p>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-xs sm:text-sm">{error}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button
                    type="submit"
                    className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                    aria-label="Confirm location coordinates"
                  >
                    ✓ Confirm Location
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                    aria-label="Cancel location entry"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </form>

              {/* Help text */}
              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 text-xs sm:text-sm">
                  <strong>Need help?</strong> You can find your coordinates using Google Maps or any GPS app.
                </p>
              </div>
            </div>
          )}

          {step === 'confirmed' && confirmedLocation && (
            // Confirmation screen
            <div>
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Location Confirmed</h2>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Your field location has been confirmed. Proceed to image processing.
                </p>
              </div>

              {/* Location display */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Latitude</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {confirmedLocation.lat.toFixed(4)}°
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Longitude</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {confirmedLocation.lon.toFixed(4)}°
                    </p>
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-600">
                    <strong>Source:</strong>{' '}
                    {confirmedLocation.source === 'browser'
                      ? 'Browser Geolocation'
                      : 'Manual Entry'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                >
                  ✓ Proceed to Processing
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                >
                  ✎ Edit Location
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
