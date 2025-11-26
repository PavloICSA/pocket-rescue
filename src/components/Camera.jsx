import { useState, useRef } from 'react'
import Toast from './Toast'

export default function Camera({ onPhotoSelected, onCancel }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoMetadata, setPhotoMetadata] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select a valid image file (JPEG, PNG, etc.)', type: 'error' })
      setIsLoading(false)
      return
    }

    // Validate file size (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: 'Photo is too large. Please select a photo under 10 MB.', type: 'error' })
      setIsLoading(false)
      return
    }

    // Read file as dataURI
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataURI = event.target?.result
      if (typeof dataURI !== 'string') {
        setToast({ message: 'Failed to read file. Please try again.', type: 'error' })
        setIsLoading(false)
        return
      }

      // Create image to get dimensions
      const img = new Image()
      img.onload = () => {
        setSelectedPhoto(dataURI)
        setPhotoMetadata({
          width: img.width,
          height: img.height,
          mimeType: file.type,
        })
        setToast({ message: 'Photo loaded successfully!', type: 'success' })
        setIsLoading(false)
      }
      img.onerror = () => {
        setToast({ message: 'Failed to load image. Please try another photo.', type: 'error' })
        setIsLoading(false)
      }
      img.src = dataURI
    }
    reader.onerror = () => {
      setToast({ message: 'Failed to read file. Please try again.', type: 'error' })
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirm = () => {
    if (selectedPhoto && photoMetadata) {
      onPhotoSelected(selectedPhoto, photoMetadata)
    }
  }

  const handleReselect = () => {
    setSelectedPhoto(null)
    setPhotoMetadata(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">PocketRescue</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Capture Field Photo</p>
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
          {!selectedPhoto ? (
            // File input screen
            <div className="text-center">
              <div className="mb-6 sm:mb-8">
                <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6">
                  Take a photo of your field or select an image from your device.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*;capture=camera"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Camera button */}
              <button
                onClick={handleCameraClick}
                disabled={isLoading}
                className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-bold text-base sm:text-lg transition-colors mb-3 sm:mb-4 min-h-12 sm:min-h-14"
                aria-label="Capture or select photo from device"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Loading...
                  </>
                ) : (
                  '📷 Capture or Select Photo'
                )}
              </button>

              <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4">
                Click the button above to open your camera or file picker.
              </p>
            </div>
          ) : (
            // Photo preview screen
            <div>
              <div className="mb-6 sm:mb-8">
                <p className="text-gray-600 text-base sm:text-lg mb-3 sm:mb-4 font-semibold">Photo Preview</p>
                <div className="bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center max-h-96 sm:max-h-[500px]">
                  <img
                    src={selectedPhoto}
                    alt="Selected field photo"
                    className="max-w-full max-h-96 sm:max-h-[500px] object-contain"
                  />
                </div>
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Dimensions:</strong> {photoMetadata.width} × {photoMetadata.height} px
                  </p>
                  <p>
                    <strong>Format:</strong> {photoMetadata.mimeType}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                  aria-label="Confirm selected photo"
                >
                  ✓ Confirm Photo
                </button>
                <button
                  onClick={handleReselect}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                  aria-label="Select a different photo"
                >
                  ↻ Re-select Photo
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 py-3 sm:py-4 px-4 sm:px-6 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-bold text-base sm:text-lg transition-colors min-h-12 sm:min-h-14"
                  aria-label="Cancel photo selection"
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
