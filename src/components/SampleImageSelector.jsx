import { useState } from 'react'

const SAMPLE_IMAGES = [
  {
    id: 'wheat',
    name: 'Wheat',
    path: '/assets/samples/wheat.JPG',
    suggestedCrop: 'wheat',
  },
  {
    id: 'maize',
    name: 'Maize',
    path: '/assets/samples/maize.jpg',
    suggestedCrop: 'maize',
  },
  {
    id: 'potato',
    name: 'Potato',
    path: '/assets/samples/potato.JPG',
    suggestedCrop: 'potato',
  },
]

export default function SampleImageSelector({ onImageSelected, onCancel }) {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleSelect = async (image) => {
    try {
      const response = await fetch(image.path)
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onload = (e) => {
        onImageSelected(e.target.result, image.suggestedCrop)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Failed to load sample image:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Select a Sample Image</h2>
          <p className="text-gray-600 mt-2">
            Choose a sample image to test the app without camera permissions
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SAMPLE_IMAGES.map((image) => (
              <div
                key={image.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => setSelectedImage(image.id)}
              >
                <img
                  src={image.path}
                  alt={image.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{image.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Suggested crop: <span className="font-medium">{image.suggestedCrop}</span>
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelect(image)
                    }}
                    className={`mt-3 w-full py-2 px-3 rounded font-medium transition-colors ${
                      selectedImage === image.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    {selectedImage === image.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
