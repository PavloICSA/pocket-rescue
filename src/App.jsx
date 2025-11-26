import { useState, useEffect } from 'react'
import Landing from './components/Landing'
import Camera from './components/Camera'
import Geolocation from './components/Geolocation'
import Processing from './components/Processing'
import Card from './components/Card'
import OfflineBanner from './components/OfflineBanner'
import { computeRiskAssessment } from './actionPlanner'
import { fetchForecast } from './weather/openMeteo'
import { decodeState } from './share'
import { initializePrivacyMonitoring } from './privacyMonitor'

export default function App() {
  const [currentStep, setCurrentStep] = useState('landing')
  const [selectedCrop, setSelectedCrop] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [geolocation, setGeolocation] = useState(null)
  const [cardData, setCardData] = useState(null)
  const [processingResults, setProcessingResults] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // Initialize privacy monitoring on app load
  useEffect(() => {
    initializePrivacyMonitoring()
  }, [])

  // Check for share URL on app load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encodedState = params.get('state')

    if (encodedState) {
      try {
        // Decode the state from URL
        const decodedState = decodeState(encodedState)

        // Reconstruct card data from decoded state
        setSelectedCrop(decodedState.cropType)
        setGeolocation(decodedState.geolocation)

        // Check if this is a full state (from URL share) or minimal state (from QR code)
        if (decodedState.photo) {
          // Full state with photo - can display card directly
          setSelectedPhoto(decodedState.photo)
          setCardData(decodedState)
          setCurrentStep('card')
        } else {
          // Minimal state from QR code - need to restart workflow
          // User will need to recapture/reselect photo
          setCurrentStep('landing')
        }
      } catch (error) {
        console.error('Failed to decode share URL:', error)
        // If decoding fails, stay on landing screen
        setCurrentStep('landing')
      }
    }
  }, [])

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleCropSelected = (cropType) => {
    setSelectedCrop(cropType)
  }

  const handleCameraClick = () => {
    setCurrentStep('camera')
  }

  const handlePhotoSelected = (photoDataURI) => {
    setSelectedPhoto(photoDataURI)
    setProcessingResults(null) // Clear previous processing results
    setCardData(null) // Clear previous card data
    setCurrentStep('geolocation')
  }

  const handleCameraCancel = () => {
    setProcessingResults(null) // Clear processing results when canceling
    setCardData(null) // Clear card data when canceling
    setCurrentStep('landing')
  }

  const handleSampleImageSelected = (photoDataURI, suggestedCrop) => {
    setSelectedPhoto(photoDataURI)
    setSelectedCrop(suggestedCrop)
    setProcessingResults(null) // Clear previous processing results
    setCardData(null) // Clear previous card data
    setCurrentStep('geolocation')
  }

  const handleGeolocationConfirmed = (location) => {
    setGeolocation(location)
    setProcessingResults(null) // Clear processing results when confirming new location
    setCurrentStep('processing')
  }

  const handleGeolocationCancel = () => {
    setProcessingResults(null) // Clear processing results when canceling
    setCurrentStep('camera')
  }

  const handleProcessingComplete = async (results) => {
    // Fetch forecast and compute risk assessment
    try {
      const forecast = await fetchForecast(geolocation.lat, geolocation.lon)

      // Set demo mode if using cached forecast
      if (forecast.source === 'cached') {
        setIsDemoMode(true)
      }

      // Use NDVI-proxy index for risk assessment (raw index value, not score)
      // Compute mean of NDVI-proxy indices
      let vegetationIndexSum = 0
      for (let i = 0; i < results.ndviIndices.length; i++) {
        vegetationIndexSum += results.ndviIndices[i]
      }
      const vegetationIndex = vegetationIndexSum / results.ndviIndices.length

      // Compute risk assessment
      const riskAssessment = computeRiskAssessment(
        vegetationIndex,
        forecast.precipitationMm,
        selectedCrop
      )

      // Create card data
      const newCardData = {
        photo: selectedPhoto,
        cropType: selectedCrop,
        score: results.globalScore,
        riskSummary: riskAssessment.summary,
        interventions: riskAssessment.interventions,
        geolocation,
        timestamp: new Date().toISOString(),
      }

      setProcessingResults(results)
      setCardData(newCardData)
      setCurrentStep('card')
    } catch (error) {
      console.error('Failed to compute risk assessment:', error)
      // Still show card with basic data if risk assessment fails
      const newCardData = {
        photo: selectedPhoto,
        cropType: selectedCrop,
        score: results.globalScore,
        riskSummary: 'Unable to compute risk assessment.\nPlease check your connection.\nTry again later.',
        interventions: [
          { action: 'Monitor field conditions', timing: 'daily' },
          { action: 'Scout for pest and disease', timing: 'within 3 days' },
          { action: 'Plan management actions', timing: 'within 1 week' },
        ],
        geolocation,
        timestamp: new Date().toISOString(),
      }
      setProcessingResults(results)
      setCardData(newCardData)
      setCurrentStep('card')
    }
  }

  const handleProcessingCancel = () => {
    setCurrentStep('geolocation')
  }

  const handleCardBack = () => {
    setCurrentStep('processing')
    // Keep cardData so user can go back to card without reprocessing
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineBanner isOnline={isOnline} isDemoMode={isDemoMode} />
      
      {/* Single-column layout for landing, camera, geolocation, processing */}
      {['landing', 'camera', 'geolocation', 'processing'].includes(currentStep) && (
        <>
          {currentStep === 'landing' && (
            <Landing
              onCropSelected={handleCropSelected}
              onCameraClick={handleCameraClick}
              onSampleImageSelected={handleSampleImageSelected}
            />
          )}
          {currentStep === 'camera' && (
            <Camera
              onPhotoSelected={handlePhotoSelected}
              onCancel={handleCameraCancel}
            />
          )}
          {currentStep === 'geolocation' && (
            <Geolocation
              onGeolocationConfirmed={handleGeolocationConfirmed}
              onCancel={handleGeolocationCancel}
            />
          )}
          {currentStep === 'processing' && (
            <Processing
              photo={selectedPhoto}
              cropType={selectedCrop}
              geolocation={geolocation}
              onProcessingComplete={handleProcessingComplete}
              onCancel={handleProcessingCancel}
              precomputedResults={processingResults}
            />
          )}
        </>
      )}

      {/* Card display - full width on mobile, centered on desktop */}
      {currentStep === 'card' && cardData && (
        <Card
          photo={cardData.photo}
          cropType={cardData.cropType}
          score={cardData.score}
          riskSummary={cardData.riskSummary}
          interventions={cardData.interventions}
          geolocation={cardData.geolocation}
          timestamp={cardData.timestamp}
          onBack={handleCardBack}
        />
      )}
    </div>
  )
}
