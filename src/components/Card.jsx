import { useState, useRef } from 'react'
import QRCode from 'qrcode.react'
import ExplainModal from './ExplainModal'
import Toast from './Toast'
import ErrorBoundary from './ErrorBoundary'

export default function Card({
  photo,
  cropType,
  score,
  riskSummary,
  interventions,
  geolocation,
  timestamp,
  onBack,
}) {
  const [isExplainOpen, setIsExplainOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const cardRef = useRef(null)
  const qrRef = useRef(null)

  // Generate shareable URL with encoded state (full state with photo)
  const generateShareURL = () => {
    const state = {
      photo,
      cropType,
      score,
      riskSummary,
      interventions,
      geolocation,
      timestamp,
    }

    const jsonString = JSON.stringify(state)
    const base64url = btoa(jsonString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    const baseURL = window.location.origin + window.location.pathname
    return `${baseURL}?state=${base64url}`
  }

  // Generate QR code data (minimal state without photo to fit in QR code)
  const generateQRData = () => {
    const minimalState = {
      cropType,
      score,
      geolocation,
      timestamp,
    }

    const jsonString = JSON.stringify(minimalState)
    const base64url = btoa(jsonString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')

    const baseURL = window.location.origin + window.location.pathname
    return `${baseURL}?state=${base64url}`
  }

  const shareURL = generateShareURL()
  const qrData = generateQRData()

  // Copy share URL to clipboard
  const handleShareURL = async () => {
    try {
      await navigator.clipboard.writeText(shareURL)
      setToast({ message: 'URL copied to clipboard!', type: 'success' })
    } catch (err) {
      console.error('Failed to copy URL:', err)
      setToast({ message: 'Failed to copy URL. Please try again.', type: 'error' })
    }
  }

  // Export card as PDF
  const handleDownloadPDF = async () => {
    setIsExporting(true)
    try {
      const { exportCardToPDF } = await import('../export')
      await exportCardToPDF(cardRef.current, `field-action-card-${timestamp}`)
      setToast({ message: 'PDF downloaded successfully!', type: 'success' })
    } catch (err) {
      console.error('PDF export failed:', err)
      setToast({ message: 'PDF export failed. Please try again.', type: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  // Export card as PNG
  const handleDownloadPNG = async () => {
    setIsExporting(true)
    try {
      const { exportCardToPNG } = await import('../export')
      await exportCardToPNG(cardRef.current, `field-action-card-${timestamp}`)
      setToast({ message: 'PNG downloaded successfully!', type: 'success' })
    } catch (err) {
      console.error('PNG export failed:', err)
      setToast({ message: 'PNG export failed. Please try again.', type: 'error' })
    } finally {
      setIsExporting(false)
    }
  }

  // Get score badge color
  const getScoreBadgeColor = (scoreValue) => {
    if (scoreValue < 33) return 'bg-red-500'
    if (scoreValue < 66) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getScoreBadgeLabel = (scoreValue) => {
    if (scoreValue < 33) return 'Poor'
    if (scoreValue < 66) return 'Fair'
    return 'Good'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">PocketRescue</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Field Action Card</p>
            </div>
            <button
              onClick={() => window.location.href = window.location.pathname}
              className="flex-shrink-0 text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base whitespace-nowrap"
              aria-label="Go to home page"
            >
              🏠 Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Card Container - Printable */}
        <div
          ref={cardRef}
          className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 lg:p-12 mb-6 sm:mb-8"
          style={{
            aspectRatio: '8.5 / 11',
            maxWidth: '600px',
            margin: '0 auto',
            pageBreakInside: 'avoid',
          }}
        >
          {/* Card Header */}
          <div className="flex justify-between items-start mb-4 sm:mb-6 gap-3 sm:gap-4">
            {/* Photo Thumbnail (Top-Left) */}
            <div className="flex-shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-lg overflow-hidden shadow-md border-2 border-gray-200">
              <img
                src={photo}
                alt="Field photo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Score Badge (Top-Right) */}
            <div className="flex flex-col items-center">
              <div
                className={`${getScoreBadgeColor(score)} text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center shadow-lg`}
              >
                <p className="text-2xl sm:text-3xl font-bold">{score}</p>
                <p className="text-xs font-semibold mt-0.5">{getScoreBadgeLabel(score)}</p>
              </div>
              <p className="text-xs text-gray-600 mt-1 sm:mt-2 text-center">Health Score</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-3 sm:my-4"></div>

          {/* Risk Summary (Center) */}
          <div className="mb-4 sm:mb-6 text-center">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-pre-line leading-relaxed">
              {riskSummary}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-3 sm:my-4"></div>

          {/* Interventions (3 Rows) */}
          <div className="mb-4 sm:mb-6">
            <p className="text-xs font-bold text-gray-900 mb-2 sm:mb-3 uppercase tracking-wide">
              Recommended Actions
            </p>
            <div className="space-y-2 sm:space-y-3">
              {interventions.map((intervention, index) => (
                <div key={index} className="flex gap-2 sm:gap-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 break-words">
                      {intervention.action}
                    </p>
                    <p className="text-xs text-gray-600">
                      When to act: <span className="font-semibold">{intervention.timing}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-200 my-3 sm:my-4"></div>

          {/* Footer with QR Code and Metadata */}
          <div className="flex justify-between items-end gap-2 sm:gap-3">
            {/* Metadata (Left) */}
            <div className="text-xs text-gray-600 flex-1 min-w-0">
              <p className="truncate">
                <strong>Crop:</strong> {cropType.charAt(0).toUpperCase() + cropType.slice(1)}
              </p>
              <p className="truncate">
                <strong>Location:</strong> {geolocation.lat.toFixed(2)}°, {geolocation.lon.toFixed(2)}°
              </p>
              <p className="truncate">
                <strong>Date:</strong> {new Date(timestamp).toLocaleDateString()}
              </p>
            </div>

            {/* QR Code (Right) */}
            <div
              ref={qrRef}
              className="flex-shrink-0 bg-white p-1 sm:p-2 rounded border-2 border-gray-200"
            >
              <QRCode
                value={qrData}
                size={60}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-2xl mx-auto">
          {/* Button Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="py-3 sm:py-4 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 min-h-12 sm:min-h-14"
              aria-label="Download card as PDF"
              aria-busy={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Exporting...
                </>
              ) : (
                <>
                  📄 Download PDF
                </>
              )}
            </button>
            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="py-3 sm:py-4 px-4 sm:px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 min-h-12 sm:min-h-14"
              aria-label="Download card as PNG"
              aria-busy={isExporting}
            >
              {isExporting ? (
                <>
                  <span className="inline-block animate-spin">⟳</span>
                  Exporting...
                </>
              ) : (
                <>
                  🖼️ Download PNG
                </>
              )}
            </button>
            <button
              onClick={handleShareURL}
              className="py-3 sm:py-4 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 min-h-12 sm:min-h-14"
              aria-label="Copy shareable URL to clipboard"
            >
              🔗 Share URL
            </button>
            <button
              onClick={() => setIsExplainOpen(true)}
              className="py-3 sm:py-4 px-4 sm:px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2 min-h-12 sm:min-h-14"
              aria-label="Show heuristic explanation"
            >
              ❓ Explain
            </button>
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="py-3 sm:py-4 px-6 sm:px-8 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
              aria-label="Go back to processing"
            >
              ← Back
            </button>
          </div>
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

      {/* Explain Modal */}
      <ErrorBoundary>
        <ExplainModal
          isOpen={isExplainOpen}
          onClose={() => setIsExplainOpen(false)}
          cropType={cropType}
        />
      </ErrorBoundary>
    </div>
  )
}
