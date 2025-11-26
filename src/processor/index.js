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
 * Strategy: Compute mean of vegetation pixels only (index > 0.05)
 * This avoids soil/background pixels dragging down the score
 * PRIVACY: Pure local computation - no external calls
 * @param {Float32Array} indices - Vegetation index values (range: -1 to 1)
 * @returns {number} Global score (0-100)
 */
export function computeGlobalScore(indices) {
  if (indices.length === 0) return 0;
  
  // Separate vegetation and non-vegetation pixels
  let vegetationSum = 0;
  let vegetationCount = 0;
  let nonVegetationSum = 0;
  let nonVegetationCount = 0;
  
  for (let i = 0; i < indices.length; i++) {
    if (indices[i] > 0.05) {
      vegetationSum += indices[i];
      vegetationCount++;
    } else {
      nonVegetationSum += indices[i];
      nonVegetationCount++;
    }
  }
  
  // If no vegetation pixels detected, return low score
  if (vegetationCount === 0) {
    const nonVegMean = nonVegetationSum / nonVegetationCount;
    if (nonVegMean < -0.1) return 0;
    if (nonVegMean < 0) return 10;
    return 20;
  }
  
  // If mostly non-vegetation, weight it down
  const vegetationRatio = vegetationCount / indices.length;
  const vegetationMean = vegetationSum / vegetationCount;
  
  // Compute score based on vegetation pixels only
  let score;
  if (vegetationMean < 0.1) {
    score = 30 + (vegetationMean - 0.05) * 100; // 30-35: Very low vegetation
  } else if (vegetationMean < 0.2) {
    score = 35 + (vegetationMean - 0.1) * 150; // 35-50: Low vegetation
  } else if (vegetationMean < 0.3) {
    score = 50 + (vegetationMean - 0.2) * 200; // 50-70: Moderate vegetation
  } else if (vegetationMean < 0.4) {
    score = 70 + (vegetationMean - 0.3) * 200; // 70-90: Good vegetation
  } else {
    score = 90 + Math.min((vegetationMean - 0.4) * 100, 10); // 90-100: Excellent vegetation
  }
  
  // Penalize if vegetation is sparse (less than 30% of image)
  if (vegetationRatio < 0.3) {
    score *= 0.8; // Reduce score by 20% if sparse
  }
  
  return Math.round(score);
}
