import { describe, expect, it } from 'vitest';
import { validatePayslipFields } from './validation';
import type { ParsedPayslip } from './types';

const basePayslip: ParsedPayslip = {
  gross_pay: 28500,
  net_pay: 24712.5,
  sss_deduction: 1125,
  philhealth_deduction: 712.5,
  pagibig_deduction: 100,
  withholding_tax: 1850,
};

describe('validatePayslipFields', () => {
  it('accepts a valid payslip', () => {
    expect(validatePayslipFields(basePayslip)).toBeNull();
  });

  it('rejects a negative field', () => {
    const result = validatePayslipFields({ ...basePayslip, sss_deduction: -1 });
    expect(result).not.toBeNull();
  });

  it('rejects net_pay greater than gross_pay', () => {
    const result = validatePayslipFields({ ...basePayslip, net_pay: 30000 });
    expect(result).not.toBeNull();
  });

  it('rejects gross_pay under ₱1000', () => {
    const result = validatePayslipFields({ ...basePayslip, gross_pay: 500, net_pay: 400 });
    expect(result).not.toBeNull();
  });
});
