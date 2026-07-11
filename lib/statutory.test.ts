import { describe, expect, it } from 'vitest';
import { STATUTORY_INFO } from './statutory';
import type { ParsedPayslip } from './types';

const normalPayslip: ParsedPayslip = {
  gross_pay: 28500,
  net_pay: 24712.5,
  sss_deduction: 1125,
  philhealth_deduction: 712.5,
  pagibig_deduction: 100,
  withholding_tax: 1850,
};

describe('STATUTORY_INFO anomaly checks', () => {
  it('flags nothing for a normal payslip', () => {
    expect(STATUTORY_INFO.sss_deduction.anomaly(normalPayslip)).toBeNull();
    expect(STATUTORY_INFO.philhealth_deduction.anomaly(normalPayslip)).toBeNull();
    expect(STATUTORY_INFO.pagibig_deduction.anomaly(normalPayslip)).toBeNull();
    expect(STATUTORY_INFO.withholding_tax.anomaly(normalPayslip)).toBeNull();
  });

  it('flags Pag-IBIG deduction over the ₱100 cap', () => {
    const payslip = { ...normalPayslip, pagibig_deduction: 250 };
    expect(STATUTORY_INFO.pagibig_deduction.anomaly(payslip)).not.toBeNull();
  });

  it('flags an SSS deduction far above the expected share of gross pay', () => {
    const payslip = { ...normalPayslip, sss_deduction: 10000 };
    expect(STATUTORY_INFO.sss_deduction.anomaly(payslip)).not.toBeNull();
  });

  it('flags a withholding tax far above the expected share of gross pay', () => {
    const payslip = { ...normalPayslip, withholding_tax: 20000 };
    expect(STATUTORY_INFO.withholding_tax.anomaly(payslip)).not.toBeNull();
  });
});
