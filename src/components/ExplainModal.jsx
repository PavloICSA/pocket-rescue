import heuristics from '../heuristics.json'

export default function ExplainModal({ isOpen, onClose, cropType }) {
  if (!isOpen) return null

  const cropHeuristics = heuristics[cropType] || {}

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Heuristic Thresholds & Decision Logic
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Vegetation Index Thresholds */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Vegetation Index Thresholds</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <p>
                <strong>Critical Stress:</strong> Index &lt; 0.05 → Risk = HIGH
              </p>
              <p>
                <strong>Low Vegetation:</strong> Index &lt; 0.18 → Combined with weather for risk
              </p>
              <p>
                <strong>Moderate Vegetation:</strong> Index &lt; 0.25 → Risk = MEDIUM
              </p>
              <p>
                <strong>Good Vegetation:</strong> Index ≥ 0.35 → Risk = LOW
              </p>
            </div>
          </div>

          {/* Weather-Based Risk Rules */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Weather-Based Risk Rules</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <p>
                <strong>Drought Risk:</strong> Precipitation &lt; 5mm AND Index &lt; 0.18 → HIGH
              </p>
              <p>
                <strong>Flood Risk:</strong> Precipitation &gt; 40mm AND Index &lt; 0.18 → HIGH
              </p>
              <p>
                <strong>Moderate Risk:</strong> Index &lt; 0.25 OR (Precip &gt; 30mm AND Index &lt; 0.35) → MEDIUM
              </p>
              <p>
                <strong>Low Risk:</strong> Good vegetation AND reasonable precipitation → LOW
              </p>
            </div>
          </div>

          {/* Crop-Specific Interventions */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              {cropType.charAt(0).toUpperCase() + cropType.slice(1)} Interventions by Risk Level
            </h3>
            <div className="space-y-4">
              {Object.entries(cropHeuristics)
                .filter(([key]) => ['HIGH', 'MEDIUM', 'LOW'].includes(key))
                .map(([riskLevel, interventions]) => (
                  <div key={riskLevel} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-bold text-gray-900 mb-2">{riskLevel} Risk:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {Array.isArray(interventions) ? (
                        interventions.map((intervention, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>
                              <strong>{intervention.action}</strong> ({intervention.timing})
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500">No interventions available</li>
                      )}
                    </ul>
                  </div>
                ))}
            </div>
          </div>

          {/* Index Computation */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Index Computation Formulae</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm font-mono">
              <p>
                <strong>ExG (Excess Green):</strong>
                <br />
                ExG = (2·G - R - B) / (2·G + R + B + ε)
              </p>
              <p>
                <strong>NDVI-proxy:</strong>
                <br />
                NDVI = (G - R) / (G + R + ε)
              </p>
              <p>
                <strong>Global Score (0-100):</strong>
                <br />
                Score = (mean(indices) + 1) / 2 × 100
              </p>
              <p className="text-xs text-gray-600">
                where ε = 0.0001 (to avoid division by zero)
              </p>
            </div>
          </div>

          {/* Heatmap Color Legend */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Heatmap Color Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded"></div>
                <span>
                  <strong>Red (Poor):</strong> Index &lt; 0.05
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                <span>
                  <strong>Yellow (Fair):</strong> 0.05 ≤ Index &lt; 0.35
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded"></div>
                <span>
                  <strong>Green (Good):</strong> Index ≥ 0.35
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
