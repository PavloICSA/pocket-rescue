/**
 * Image Processing Module for PocketRescue
 * Handles image downsampling, vegetation index computation, and heatmap generation
 *
 * PRIVACY GUARANTEE:
 * - All image processing uses Canvas 2D API (no external ML models or remote services)
 * - No photo data is sent to any external server
 * - All computation occurs locally on the user's device
 * - No external dependencies for image analysis
 * - This module is completely offline-capable
 */

/**
 * Downsample an image to a target size using Canvas 2D API
 * PRIVACY: Uses only Canvas 2D API - no external services or ML models
 * @param {string} photoDataURI - Base64-encoded image data URI
 * @param {number} targetSize - Target width and height in pixels (default: 200)
 * @returns {Promise<{dataURI: string, width: number, height: number, pixelData: Uint8ClampedArray}>}
 */
export async function downsampleImage(photoDataURI, targetSize = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      
      const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
      const dataURI = canvas.toDataURL('image/jpeg');
      
      resolve({
        dataURI,
        width: targetSize,
        height: targetSize,
        pixelData: imageData.data,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = photoDataURI;
  });
}

/**
 * Compute ExG (Excess Green) index for pixel data
 * Formula: ExG = (2*G - R - B) / (2*G + R + B + ε)
 * PRIVACY: Pure local computation using Canvas pixel data - no external calls
 * @param {Uint8ClampedArray} pixelData - RGBA pixel data from canvas
 * @returns {Float32Array} ExG values for each pixel (range: -1 to 1)
 */
export function computeExG(pixelData) {
  const epsilon = 0.0001;
  const exgValues = new Float32Array(pixelData.length / 4);
  
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    const b = pixelData[i + 2];
    
    const numerator = 2 * g - r - b;
    const denominator = 2 * g + r + b + epsilon;
    exgValues[i / 4] = numerator / denominator;
  }
  
  return exgValues;
}

/**
 * Compute NDVI-proxy (Normalized Difference Vegetation Index approximation) for pixel data
 * Formula: NDVI-proxy = (G - R) / (G + R + ε)
 * PRIVACY: Pure local computation using Canvas pixel data - no external calls
 * @param {Uint8ClampedArray} pixelData - RGBA pixel data from canvas
 * @returns {Float32Array} NDVI-proxy values for each pixel (range: -1 to 1)
 */
export function computeNDVIProxy(pixelData) {
  const epsilon = 0.0001;
  const ndviValues = new Float32Array(pixelData.length / 4);
  
  for (let i = 0; i < pixelData.length; i += 4) {
    const r = pixelData[i];
    const g = pixelData[i + 1];
    
    const numerator = g - r;
    const denominator = g + r + epsilon;
    ndviValues[i / 4] = numerator / denominator;
  }
  
  return ndviValues;
}

/**
 * Generate a heatmap canvas from vegetation indices
 * Color mapping: red (< 0.05), yellow (0.05-0.35), green (>= 0.35)
 * PRIVACY: Pure local computation using Canvas 2D API - no external calls
 * @param {Float32Array} indices - Vegetation index values (range: -1 to 1)
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {HTMLCanvasElement} Canvas with heatmap overlay
 */
export function generateHeatmap(indices, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];
    const pixelIndex = i * 4;
    
    let r, g, b;
    
    if (index < 0.05) {
      // Red (poor vegetation)
      r = 239;
      g = 68;
      b = 68;
    } else if (index < 0.35) {
      // Yellow (fair vegetation)
      r = 234;
      g = 179;
      b = 8;
    } else {
      // Green (good vegetation)
      r = 34;
      g = 197;
      b = 94;
    }
    
    data[pixelIndex] = r;
    data[pixelIndex + 1] = g;
    data[pixelIndex + 2] = b;
    data[pixelIndex + 3] = 255; // Alpha
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Compute global vegetation score from indices
 * Scales mean index from [-1, 1] range to [0, 100] range
 * PRIVACY: Pure local computation - no external calls
 * @param {Float32Array} indices - Vegetation index values (range: -1 to 1)
 * @returns {number} Global score (0-100)
 */
export function computeGlobalScore(indices) {
  if (indices.length === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < indices.length; i++) {
    sum += indices[i];
  }
  
  const mean = sum / indices.length;
  // Scale from [-1, 1] to [0, 100]
  const score = ((mean + 1) / 2) * 100;
  
  return Math.round(score);
}
