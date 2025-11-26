/**
 * Action Planner Module for PocketRescue
 * Handles risk assessment and intervention selection based on vegetation index and weather
 */

import heuristics from './heuristics.json';

/**
 * Compute risk score based on vegetation index and precipitation
 * Rules:
 * - If precip < 5 mm AND index < 0.18: HIGH (drought)
 * - If precip > 40 mm AND index < 0.18: HIGH (flood)
 * - If index < 0.05: HIGH (critical stress)
 * - Otherwise: MEDIUM or LOW based on index and precipitation combination
 *
 * @param {number} vegetationIndex - Vegetation index value (typically 0-1 for ExG/NDVI-proxy normalized)
 * @param {number} precipitationMm - Total precipitation in mm over 3-day period
 * @returns {string} Risk level: "HIGH", "MEDIUM", or "LOW"
 */
export function computeRiskScore(vegetationIndex, precipitationMm) {
  // Critical vegetation stress takes highest priority
  if (vegetationIndex < 0.05) {
    return 'HIGH';
  }

  // Drought risk: low precip + low vegetation
  if (precipitationMm < 5 && vegetationIndex < 0.18) {
    return 'HIGH';
  }

  // Flood/stress risk: high precip + low vegetation
  if (precipitationMm > 40 && vegetationIndex < 0.18) {
    return 'HIGH';
  }

  // Medium risk: moderate vegetation with some stress indicators
  if (vegetationIndex < 0.25 || (precipitationMm > 30 && vegetationIndex < 0.35)) {
    return 'MEDIUM';
  }

  // Low risk: good vegetation and reasonable precipitation
  return 'LOW';
}

/**
 * Generate a 3-line risk summary based on risk level and conditions
 *
 * @param {string} riskLevel - Risk level: "HIGH", "MEDIUM", or "LOW"
 * @param {number} vegetationIndex - Vegetation index value
 * @param {number} precipitationMm - Total precipitation in mm
 * @returns {string} 3-line risk summary text
 */
export function generateRiskSummary(riskLevel, vegetationIndex, precipitationMm) {
  let line1 = '';
  let line2 = '';
  let line3 = '';

  if (riskLevel === 'HIGH') {
    if (vegetationIndex < 0.05) {
      line1 = 'CRITICAL VEGETATION STRESS: HIGH';
      line2 = 'Immediate intervention required.';
      line3 = 'Prioritize irrigation and nutrient support.';
    } else if (precipitationMm < 5 && vegetationIndex < 0.18) {
      line1 = 'SHORT-TERM DROUGHT RISK: HIGH';
      line2 = 'Vegetation stress detected.';
      line3 = 'Prioritize irrigation.';
    } else if (precipitationMm > 40 && vegetationIndex < 0.18) {
      line1 = 'FLOOD/STRESS RISK: HIGH';
      line2 = 'Excessive moisture with weak vegetation.';
      line3 = 'Monitor for disease and drainage issues.';
    }
  } else if (riskLevel === 'MEDIUM') {
    line1 = 'MODERATE RISK: MEDIUM';
    line2 = 'Vegetation shows some stress indicators.';
    line3 = 'Monitor closely and plan interventions.';
  } else {
    line1 = 'FIELD CONDITIONS: GOOD';
    line2 = 'Vegetation health is satisfactory.';
    line3 = 'Continue routine field management.';
  }

  return `${line1}\n${line2}\n${line3}`;
}

/**
 * Select 3 prioritized interventions based on crop type and risk level
 * Interventions are deterministically selected from heuristics.json
 *
 * @param {string} cropType - Crop type (wheat, barley, maize, sunflower, potato, vegetables, orchard)
 * @param {string} riskLevel - Risk level: "HIGH", "MEDIUM", or "LOW"
 * @returns {Array<{action: string, timing: string}>} Array of 3 interventions
 */
export function selectInterventions(cropType, riskLevel) {
  // Validate crop type exists in heuristics
  if (!heuristics[cropType]) {
    console.warn(`Crop type "${cropType}" not found in heuristics, using default interventions`);
    return getDefaultInterventions(riskLevel);
  }

  // Validate risk level exists for crop
  if (!heuristics[cropType][riskLevel]) {
    console.warn(`Risk level "${riskLevel}" not found for crop "${cropType}", using LOW risk interventions`);
    return heuristics[cropType]['LOW'] || getDefaultInterventions('LOW');
  }

  // Return the 3 interventions for this crop and risk level
  return heuristics[cropType][riskLevel];
}

/**
 * Get default interventions if crop type or risk level not found
 * @param {string} riskLevel - Risk level
 * @returns {Array<{action: string, timing: string}>} Default interventions
 */
function getDefaultInterventions(riskLevel) {
  const defaults = {
    HIGH: [
      { action: 'Increase monitoring frequency', timing: 'immediately' },
      { action: 'Scout for pest and disease damage', timing: 'within 1 day' },
      { action: 'Plan intervention strategy', timing: 'within 2 days' },
    ],
    MEDIUM: [
      { action: 'Monitor field conditions regularly', timing: 'every 2 days' },
      { action: 'Scout for pest and disease activity', timing: 'within 3 days' },
      { action: 'Plan management actions', timing: 'within 1 week' },
    ],
    LOW: [
      { action: 'Continue routine field monitoring', timing: 'weekly' },
      { action: 'Document field conditions', timing: 'within 1 week' },
      { action: 'Plan next management step', timing: 'within 2 weeks' },
    ],
  };

  return defaults[riskLevel] || defaults['LOW'];
}

/**
 * Compute complete risk assessment including risk level, summary, and interventions
 *
 * @param {number} vegetationIndex - Vegetation index value
 * @param {number} precipitationMm - Total precipitation in mm
 * @param {string} cropType - Crop type
 * @returns {{riskLevel: string, summary: string, interventions: Array}}
 */
export function computeRiskAssessment(vegetationIndex, precipitationMm, cropType) {
  const riskLevel = computeRiskScore(vegetationIndex, precipitationMm);
  const summary = generateRiskSummary(riskLevel, vegetationIndex, precipitationMm);
  const interventions = selectInterventions(cropType, riskLevel);

  return {
    riskLevel,
    summary,
    interventions,
  };
}
