import { useState, useEffect } from 'react'
import Toast from './Toast'
import {
  downsampleImage,
  computeExG,
  computeNDVIProxy,
  generateHeatmap,
  computeGlobalScore,
} from '../processor/index.js'

export default function Processing({
  photo,
  cropType,
  geolocation,
  onProcessingComplete,
  onCancel,
  precomputedResults,
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [processingTime, setProcessingTime] = useState(0)
  const [heatmapDataURI, setHeatmapDataURI] = useState(null)
  const [score, setScore] = useState(null)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(!precomputedResults)
  const [toast, setToast] = useState(null)

  const steps = [
    { label: 'Downsample image', description: 'Resizing to 200×200 pixels' },
    { label: 'Compute indices', description: 'Calculating ExG and NDVI-proxy' },
    { label: 'Generate heatmap', description: 'Creating vegetation overlay' },
  ]

  useEffect(() => {
    const processImage = async () => {
      // If precomputed results are available, use them instead of reprocessing
      if (precomputedResults) {
        setHeatmapDataURI(precomputedResults.heatmapDataURI)
        setScore(precomputedResults.globalScore)
        setProcessingTime(precomputedResults.processingTime)
        setCurrentStep(2)
        setIsProcessing(false)
        return
      }

      const startTime = performance.now()

      try {
        // Step 1: Downsample
        setCurrentStep(0)
        const downsampled = await downsampleImage(photo, 200)

        // Step 2: Compute indices
        setCurrentStep(1)
        const exgIndices = computeExG(downsampled.pixelData)
        const ndviIndices = computeNDVIProxy(downsampled.pixelData)

        // Use NDVI-proxy for heatmap and score (more commonly used)
        const indices = ndviIndices

        // Step 3: Generate heatmap
        setCurrentStep(2)
        const heatmapCanvas = generateHeatmap(indices, downsampled.width, downsampled.height)
        const heatmapURI = heatmapCanvas.toDataURL('image/png')
        setHeatmapDataURI(heatmapURI)

        // Compute global score
        const globalScore = computeGlobalScore(indices)
        setScore(globalScore)

        const endTime = performance.now()
        const processingDuration = endTime - startTime

        setProcessingTime(processingDuration)
        setIsProcessing(false)

        // Call completion callback with results
        onProcessingComplete({
          exgIndices,
          ndviIndices,
          globalScore,
          heatmapDataURI: heatmapURI,
          processingTime: processingDuration,
          downsampled,
        })
      } catch (err) {
        const errorMsg = err.message || 'Image processing failed. Please try another photo.'
        setError(errorMsg)
        setIsProcessing(false)
        setToast({ message: errorMsg, type: 'error' })
      }
    }

    processImage()
  }, [photo, onProcessingComplete, precomputedResults])

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
              <p className="text-sm sm:text-base text-gray-600 mt-1">Processing Field Photo</p>
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12 max-w-2xl mx-auto">
          {error ? (
            // Error state
            <div className="text-center" role="alert">
              <div className="mb-4 sm:mb-6 text-red-700">
                <p className="text-base sm:text-lg font-semibold">⚠️ Processing Failed</p>
                <p className="text-gray-700 mt-2 text-sm sm:text-base">{error}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                  aria-label="Go back to previous step"
                >
                  ← Back
                </button>
              </div>
            </div>
          ) : isProcessing ? (
            // Processing state
            <div role="status" aria-live="polite" aria-atomic="true">
              <div className="mb-8 sm:mb-12">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                  Analyzing your field...
                </h2>

                {/* Progress Steps */}
                <div className="space-y-3 sm:space-y-4">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                          index < currentStep
                            ? 'bg-green-500'
                            : index === currentStep
                              ? 'bg-blue-500 animate-pulse'
                              : 'bg-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        {index < currentStep ? '✓' : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-semibold text-sm sm:text-base ${
                            index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {step.label}
                        </p>
                        <p
                          className={`text-xs sm:text-sm ${
                            index === currentStep ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Processing Time */}
                <div className="mt-6 sm:mt-8 text-center">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Processing time: {processingTime.toFixed(2)}ms
                  </p>
                </div>
              </div>

              {/* Cancel Button */}
              <div className="flex justify-center">
                <button
                  onClick={onCancel}
                  className="py-3 sm:py-4 px-6 sm:px-8 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                  aria-label="Cancel processing"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            // Completion state
            <div role="status" aria-live="polite">
              <div className="mb-6 sm:mb-8 text-center">
                <p className="text-base sm:text-lg font-semibold text-green-700 mb-2 sm:mb-4">✓ Processing Complete</p>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Processing time: {processingTime.toFixed(2)}ms (target: &lt; 3000ms)
                </p>
              </div>

              {/* Score Display */}
              {score !== null && (
                <div className="mb-6 sm:mb-8 text-center">
                  <div className="inline-block">
                    <div
                      className={`${getScoreBadgeColor(score)} text-white rounded-full w-24 h-24 sm:w-32 sm:h-32 flex flex-col items-center justify-center shadow-lg`}
                    >
                      <p className="text-3xl sm:text-5xl font-bold">{score}</p>
                      <p className="text-xs sm:text-sm font-semibold mt-1">{getScoreBadgeLabel(score)}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-base mt-3 sm:mt-4">Vegetation Health Score (0-100)</p>
                </div>
              )}

              {/* Heatmap Display */}
              {heatmapDataURI && (
                <div className="mb-6 sm:mb-8">
                  <p className="text-gray-900 font-semibold text-sm sm:text-base mb-2 sm:mb-3">Vegetation Heatmap</p>
                  <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center max-h-80 sm:max-h-96">
                    <img
                      src={heatmapDataURI}
                      alt="Vegetation heatmap overlay"
                      className="max-w-full max-h-80 sm:max-h-96 object-contain"
                    />
                  </div>
                  <div className="mt-2 sm:mt-3 flex justify-between text-xs text-gray-600 gap-2">
                    <span>🔴 Poor (&lt; 0.05)</span>
                    <span>🟡 Fair (0.05 - 0.35)</span>
                    <span>🟢 Good (≥ 0.35)</span>
                  </div>
                </div>
              )}

              {/* Processing Details */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Processing Details</p>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Crop Type:</strong> {cropType.charAt(0).toUpperCase() + cropType.slice(1)}
                  </p>
                  <p>
                    <strong>Location:</strong> {geolocation.lat.toFixed(4)}°,{' '}
                    {geolocation.lon.toFixed(4)}°
                  </p>
                  <p>
                    <strong>Processing Time:</strong> {processingTime.toFixed(2)}ms
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {processingTime < 3000 ? (
                      <span className="text-green-600 font-semibold">✓ Within target (&lt; 3s)</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">⚠ Exceeded target (&gt; 3s)</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                  aria-label="Go back to previous step"
                >
                  ← Back
                </button>
                <button
                  onClick={() => {
                    // This will be handled by parent component to proceed to card
                    onProcessingComplete({
                      exgIndices: null,
                      ndviIndices: null,
                      globalScore: score,
                      heatmapDataURI,
                      processingTime,
                      downsampled: null,
                    })
                  }}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                  aria-label="Proceed to view field action card"
                >
                  Proceed to Card →
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
