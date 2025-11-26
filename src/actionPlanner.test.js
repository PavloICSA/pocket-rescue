/**
 * Unit Tests for Action Planner Module
 */

import { describe, it, expect } from 'vitest';
import {
  computeRiskScore,
  generateRiskSummary,
  selectInterventions,
  computeRiskAssessment,
} from './actionPlanner';

describe('actionPlanner - computeRiskScore', () => {
  it('should return HIGH for critical vegetation stress (index < 0.05)', () => {
    const result = computeRiskScore(0.03, 20);
    expect(result).toBe('HIGH');
  });

  it('should return HIGH for drought risk (precip < 5 mm AND index < 0.18)', () => {
    const result = computeRiskScore(0.15, 3);
    expect(result).toBe('HIGH');
  });

  it('should return HIGH for flood risk (precip > 40 mm AND index < 0.18)', () => {
    const result = computeRiskScore(0.12, 50);
    expect(result).toBe('HIGH');
  });

  it('should return MEDIUM for moderate stress (index < 0.25)', () => {
    const result = computeRiskScore(0.20, 20);
    expect(result).toBe('MEDIUM');
  });

  it('should return MEDIUM for high precip with moderate vegetation', () => {
    const result = computeRiskScore(0.30, 35);
    expect(result).toBe('MEDIUM');
  });

  it('should return LOW for good conditions (high index, normal precip)', () => {
    const result = computeRiskScore(0.40, 20);
    expect(result).toBe('LOW');
  });

  it('should return LOW for excellent conditions', () => {
    const result = computeRiskScore(0.50, 15);
    expect(result).toBe('LOW');
  });

  it('should handle boundary case: index exactly 0.05', () => {
    const result = computeRiskScore(0.05, 20);
    expect(result).toBe('MEDIUM');
  });

  it('should handle boundary case: precip exactly 5 mm', () => {
    const result = computeRiskScore(0.15, 5);
    expect(result).toBe('MEDIUM');
  });

  it('should handle boundary case: precip exactly 40 mm', () => {
    const result = computeRiskScore(0.12, 40);
    expect(result).toBe('MEDIUM');
  });
});

describe('actionPlanner - generateRiskSummary', () => {
  it('should generate critical stress summary for HIGH risk with low index', () => {
    const summary = generateRiskSummary('HIGH', 0.03, 20);
    expect(summary).toContain('CRITICAL VEGETATION STRESS: HIGH');
    expect(summary).toContain('Immediate intervention required');
    expect(summary).toContain('irrigation');
  });

  it('should generate drought summary for HIGH risk with low precip', () => {
    const summary = generateRiskSummary('HIGH', 0.15, 3);
    expect(summary).toContain('SHORT-TERM DROUGHT RISK: HIGH');
    expect(summary).toContain('Vegetation stress detected');
    expect(summary).toContain('irrigation');
  });

  it('should generate flood summary for HIGH risk with high precip', () => {
    const summary = generateRiskSummary('HIGH', 0.12, 50);
    expect(summary).toContain('FLOOD/STRESS RISK: HIGH');
    expect(summary).toContain('Excessive moisture');
    expect(summary).toContain('disease');
  });

  it('should generate MEDIUM risk summary', () => {
    const summary = generateRiskSummary('MEDIUM', 0.20, 20);
    expect(summary).toContain('MODERATE RISK: MEDIUM');
    expect(summary).toContain('stress indicators');
  });

  it('should generate LOW risk summary', () => {
    const summary = generateRiskSummary('LOW', 0.40, 20);
    expect(summary).toContain('FIELD CONDITIONS: GOOD');
    expect(summary).toContain('satisfactory');
  });

  it('should return 3-line summary (contains 2 newlines)', () => {
    const summary = generateRiskSummary('HIGH', 0.03, 20);
    const lines = summary.split('\n');
    expect(lines).toHaveLength(3);
  });
});

describe('actionPlanner - selectInterventions', () => {
  it('should return 3 interventions for wheat HIGH risk', () => {
    const interventions = selectInterventions('wheat', 'HIGH');
    expect(interventions).toHaveLength(3);
    expect(interventions[0]).toHaveProperty('action');
    expect(interventions[0]).toHaveProperty('timing');
  });

  it('should return 3 interventions for maize MEDIUM risk', () => {
    const interventions = selectInterventions('maize', 'MEDIUM');
    expect(interventions).toHaveLength(3);
  });

  it('should return 3 interventions for potato LOW risk', () => {
    const interventions = selectInterventions('potato', 'LOW');
    expect(interventions).toHaveLength(3);
  });

  it('should return deterministic interventions (same crop/risk = same result)', () => {
    const result1 = selectInterventions('barley', 'HIGH');
    const result2 = selectInterventions('barley', 'HIGH');
    expect(result1).toEqual(result2);
  });

  it('should handle all crop types', () => {
    const crops = ['wheat', 'barley', 'maize', 'sunflower', 'potato', 'vegetables', 'orchard'];
    crops.forEach((crop) => {
      const interventions = selectInterventions(crop, 'HIGH');
      expect(interventions).toHaveLength(3);
    });
  });

  it('should handle all risk levels', () => {
    const risks = ['HIGH', 'MEDIUM', 'LOW'];
    risks.forEach((risk) => {
      const interventions = selectInterventions('wheat', risk);
      expect(interventions).toHaveLength(3);
    });
  });

  it('should return default interventions for unknown crop type', () => {
    const interventions = selectInterventions('unknown_crop', 'HIGH');
    expect(interventions).toHaveLength(3);
    expect(interventions[0]).toHaveProperty('action');
  });

  it('should return default interventions for unknown risk level', () => {
    const interventions = selectInterventions('wheat', 'UNKNOWN');
    expect(interventions).toHaveLength(3);
  });

  it('should have action and timing properties for all interventions', () => {
    const interventions = selectInterventions('sunflower', 'MEDIUM');
    interventions.forEach((intervention) => {
      expect(typeof intervention.action).toBe('string');
      expect(typeof intervention.timing).toBe('string');
      expect(intervention.action.length).toBeGreaterThan(0);
      expect(intervention.timing.length).toBeGreaterThan(0);
    });
  });
});

describe('actionPlanner - computeRiskAssessment', () => {
  it('should return complete risk assessment object', () => {
    const assessment = computeRiskAssessment(0.15, 3, 'wheat');
    expect(assessment).toHaveProperty('riskLevel');
    expect(assessment).toHaveProperty('summary');
    expect(assessment).toHaveProperty('interventions');
  });

  it('should have HIGH risk level for drought conditions', () => {
    const assessment = computeRiskAssessment(0.15, 3, 'wheat');
    expect(assessment.riskLevel).toBe('HIGH');
  });

  it('should have 3-line summary', () => {
    const assessment = computeRiskAssessment(0.15, 3, 'wheat');
    const lines = assessment.summary.split('\n');
    expect(lines).toHaveLength(3);
  });

  it('should have 3 interventions', () => {
    const assessment = computeRiskAssessment(0.15, 3, 'wheat');
    expect(assessment.interventions).toHaveLength(3);
  });

  it('should match risk level from computeRiskScore', () => {
    const index = 0.20;
    const precip = 20;
    const crop = 'maize';

    const assessment = computeRiskAssessment(index, precip, crop);
    const directRisk = computeRiskScore(index, precip);

    expect(assessment.riskLevel).toBe(directRisk);
  });

  it('should match interventions from selectInterventions', () => {
    const index = 0.30;
    const precip = 15;
    const crop = 'barley';

    const assessment = computeRiskAssessment(index, precip, crop);
    const directInterventions = selectInterventions(crop, computeRiskScore(index, precip));

    expect(assessment.interventions).toEqual(directInterventions);
  });
});
