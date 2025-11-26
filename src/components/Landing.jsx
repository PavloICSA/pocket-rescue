import { useState } from 'react'
import SampleImageSelector from './SampleImageSelector'

const CROP_TYPES = ['wheat', 'barley', 'maize', 'sunflower', 'potato', 'vegetables', 'orchard']

export default function Landing({
  onCropSelected,
  onCameraClick,
  onSampleImageSelected,
}) {
  const [selectedCrop, setSelectedCrop] = useState('')
  const [showSampleSelector, setShowSampleSelector] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  const handleCropChange = (e) => {
    setSelectedCrop(e.target.value)
  }

  const handleCaptureClick = () => {
    if (selectedCrop) {
      onCropSelected(selectedCrop)
      onCameraClick()
    }
  }

  const handleSampleImageSelected = (photoDataURI, suggestedCrop) => {
    setSelectedCrop(suggestedCrop)
    onSampleImageSelected(photoDataURI, suggestedCrop)
    setShowSampleSelector(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <img
              src="/icon.png"
              alt="PocketRescue logo"
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                PocketRescue
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">
                Field Action Card Generator
              </p>
            </div>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="flex-shrink-0 text-blue-600 hover:text-blue-700 font-medium underline text-sm sm:text-base whitespace-nowrap"
            >
              How it works?
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-12">
          {/* Pitch */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Turn one photo into an actionable field plan in seconds.
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
              Analyze vegetation health, get weather-based risk assessment, and receive crop-specific
              interventions - all processed locally on your device.
            </p>
          </div>

          {/* Privacy Statement */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-5 mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-blue-900 font-medium">
              🔒 Privacy First: Photos processed locally. No data leaves your device unless you
              explicitly share the card URL.
            </p>
          </div>

          {/* Crop Selector */}
          <div className="mb-6 sm:mb-8">
            <label htmlFor="crop-select" className="block text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
              Select your crop type:
            </label>
            <select
              id="crop-select"
              value={selectedCrop}
              onChange={handleCropChange}
              className="w-full px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium text-base sm:text-lg"
              aria-label="Select crop type for analysis"
              aria-describedby="crop-help"
            >
              <option value="">-- Choose a crop --</option>
              {CROP_TYPES.map((crop) => (
                <option key={crop} value={crop}>
                  {crop.charAt(0).toUpperCase() + crop.slice(1)}
                </option>
              ))}
            </select>
            <p id="crop-help" className="text-xs text-gray-600 mt-2">
              Choose the crop type to receive tailored recommendations
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleCaptureClick}
              disabled={!selectedCrop}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14 ${
                selectedCrop
                  ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              aria-label="Capture field photo with device camera"
              aria-disabled={!selectedCrop}
            >
              📷 Capture field photo
            </button>
            <button
              onClick={() => setShowSampleSelector(true)}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-base sm:text-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors min-h-12 sm:min-h-14"
              aria-label="Load sample image for demo"
            >
              📸 Load sample image
            </button>
          </div>

          {/* Info Text */}
          <p className="text-center text-gray-600 text-xs sm:text-sm mt-4 sm:mt-6">
            No camera? Use a sample image to explore the app. Your device camera will be requested
            only when you choose to capture a photo.
          </p>
        </div>
      </main>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">How PocketRescue Works</h2>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">📊 Vegetation Health Analysis</h3>
                <p className="text-gray-700">
                  PocketRescue computes two vegetation indices from your photo:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                  <li>
                    <strong>ExG (Excess Green)</strong>: Highlights green vegetation by comparing
                    color channels
                  </li>
                  <li>
                    <strong>NDVI-proxy</strong>: Approximates normalized difference vegetation index
                    for health assessment
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">🌤️ Weather Integration</h3>
                <p className="text-gray-700">
                  The app fetches a 3-day weather forecast for your location to assess drought,
                  flood, or stress risk.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">🔒 Privacy & Security</h3>
                <p className="text-gray-700">
                  All image processing happens on your device. Your photos never leave your phone
                  or computer. Only your location (latitude/longitude) is sent to the weather
                  service.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">💡 Actionable Recommendations</h3>
                <p className="text-gray-700">
                  Based on vegetation health and weather, you receive 3 prioritized interventions
                  tailored to your crop type.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Image Selector Modal */}
      {showSampleSelector && (
        <SampleImageSelector
          onImageSelected={handleSampleImageSelected}
          onCancel={() => setShowSampleSelector(false)}
        />
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Privacy Guarantee</h3>
              <p className="text-gray-700 mb-4">
                <strong>Photos processed locally. No data leaves your device unless you explicitly share the card URL.</strong>
              </p>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">Core Privacy Principles</h3>
              
              <h4 className="font-bold text-gray-900 mb-2">1. Image Processing</h4>
              <p className="text-gray-700 mb-4">
                All image processing uses Canvas 2D API (no external ML models or remote processing). Zero bytes sent to any external service.
              </p>
              
              <h4 className="font-bold text-gray-900 mb-2">2. Weather API</h4>
              <p className="text-gray-700 mb-4">
                Only latitude and longitude are sent to Open-Meteo API (no photo data). Open-Meteo is privacy-respecting and does not track users.
              </p>
              
              <h4 className="font-bold text-gray-900 mb-2">3. Share URL Encoding</h4>
              <p className="text-gray-700 mb-4">
                Share URLs encode only photo dataURI, indices, and metadata. No server-side storage. User has full control over sharing.
              </p>
              
              <h4 className="font-bold text-gray-900 mb-2">4. Privacy Monitoring</h4>
              <p className="text-gray-700 mb-4">
                Network monitoring detects and prevents unauthorized data transmission. Only whitelisted APIs are called.
              </p>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">User Privacy Controls</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Camera Permission: Users can deny camera access and use sample images</li>
                <li>Geolocation Permission: Users can deny geolocation and enter coordinates manually</li>
                <li>Sharing: Users explicitly choose to share URLs (no automatic sharing)</li>
                <li>Export: Users explicitly choose to download PDFs/PNGs (no automatic uploads)</li>
                <li>Offline Mode: Users can use app offline with cached data</li>
              </ul>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Terms of Use</h2>
              <button
                onClick={() => setShowTerms(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              <h3 className="text-lg font-bold text-gray-900 mb-3">1. Acceptance of Terms</h3>
              <p className="text-gray-700 mb-4">
                By accessing and using PocketRescue, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">2. Use License</h3>
              <p className="text-gray-700 mb-4">
                Permission is granted to temporarily download and use PocketRescue for personal, non-commercial purposes only.
              </p>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">3. Disclaimer</h3>
              <p className="text-gray-700 mb-4">
                The materials on PocketRescue are provided on an 'as is' basis. PocketRescue makes no warranties, expressed or implied.
              </p>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">4. Agricultural Disclaimer</h3>
              <p className="text-gray-700 mb-4">
                PocketRescue provides recommendations based on vegetation analysis and weather data. These recommendations are for informational purposes only and should not be considered as professional agricultural advice. Always consult with qualified agricultural professionals before making significant management decisions.
              </p>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">5. User Responsibilities</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Providing accurate geolocation information</li>
                <li>Verifying recommendations with local agricultural experts</li>
                <li>Using the App in compliance with local laws and regulations</li>
                <li>Not using the App for any illegal or unauthorized purpose</li>
              </ul>
              
              <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">6. Contact</h3>
              <p className="text-gray-700">
                <strong>Pavlo Lykhovyd</strong><br />
                Dr of Agricultural Sciences<br />
                Senior Researcher<br />
                Institute of Climate-Smart Agriculture<br />
                NAAS, UKRAINE<br />
                Email: pavel.likhovid@gmail.com
              </p>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Section */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">About PocketRescue</h3>
              <p className="text-sm leading-relaxed">
                A privacy-first Progressive Web App for rapid field assessment and crop-specific interventions using vegetation health analysis and weather integration.
              </p>
            </div>

            {/* Developer Section */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Developer</h3>
              <p className="text-sm mb-2">
                <strong>Pavlo Lykhovyd</strong>
              </p>
              <p className="text-sm mb-3">
                Dr of Agricultural Sciences<br />
                Senior Researcher<br />
                Institute of Climate-Smart Agriculture<br />
                NAAS, UKRAINE
              </p>
              <a
                href="mailto:pavel.likhovid@gmail.com"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                pavel.likhovid@gmail.com
              </a>
            </div>

            {/* Links Section */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setShowHowItWorks(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    How it works
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowPrivacy(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setShowTerms(true)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Terms of Use
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2025 PocketRescue. All rights reserved.
              </p>
              <p className="text-sm text-gray-400">
                Built with ❤️ for sustainable agriculture
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
