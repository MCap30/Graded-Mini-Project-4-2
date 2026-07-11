import { describe, expect, it } from 'vitest';
import { computeBudgetBreakdown } from './budget';

describe('computeBudgetBreakdown', () => {
  it('splits net pay 50/30/20 with no remittance', () => {
    const result = computeBudgetBreakdown(20000, 0);
    expect(result.targetPool).toBe(20000);
    expect(result.needs).toBe(10000);
    expect(result.wants).toBe(6000);
    expect(result.savings).toBe(4000);
  });

  it('subtracts remittance before splitting', () => {
    const result = computeBudgetBreakdown(24712.5, 5000);
    expect(result.targetPool).toBeCloseTo(19712.5);
    expect(result.needs).toBeCloseTo(9856.25);
    expect(result.wants).toBeCloseTo(5913.75);
    expect(result.savings).toBeCloseTo(3942.5);
  });

  it('clamps targetPool to 0 when remittance exceeds net pay', () => {
    const result = computeBudgetBreakdown(5000, 8000);
    expect(result.targetPool).toBe(0);
    expect(result.needs).toBe(0);
    expect(result.wants).toBe(0);
    expect(result.savings).toBe(0);
  });
});
