import type { ParsedPayslip } from './types';

export type DeductionKey =
  | 'sss_deduction'
  | 'philhealth_deduction'
  | 'pagibig_deduction'
  | 'withholding_tax';

export type StatutoryInfo = {
  label: string;
  basis: string;
  anomaly: (payslip: ParsedPayslip) => string | null;
};

// Approximate 2024/2025 contribution rules for anomaly flags — not a full
// bracket table. Good enough to catch obviously-wrong parses, not to audit payroll.
export const STATUTORY_INFO: Record<DeductionKey, StatutoryInfo> = {
  sss_deduction: {
    label: 'SSS',
    basis:
      'Social Security System contribution: employee share is roughly 4.5% of your monthly salary credit, capped at a maximum salary credit of ₱35,000.',
    anomaly: (p) => {
      const maxExpected = p.gross_pay * 0.05;
      if (p.sss_deduction > maxExpected + 50) {
        return `SSS deduction looks high relative to gross pay (expected up to ~₱${maxExpected.toFixed(2)}).`;
      }
      return null;
    },
  },
  philhealth_deduction: {
    label: 'PhilHealth',
    basis:
      'PhilHealth premium: employee share is 2.5% of monthly basic salary (half of the 5% total premium), split between employee and employer.',
    anomaly: (p) => {
      const expected = p.gross_pay * 0.025;
      if (Math.abs(p.philhealth_deduction - expected) > expected * 0.5 + 20) {
        return `PhilHealth deduction deviates from the expected ~2.5% of gross pay (~₱${expected.toFixed(2)}).`;
      }
      return null;
    },
  },
  pagibig_deduction: {
    label: 'Pag-IBIG',
    basis:
      'Pag-IBIG Fund contribution: employee share is 1-2% of monthly compensation, capped at ₱100 for most employees under current guidelines.',
    anomaly: (p) => {
      if (p.pagibig_deduction > 100) {
        return 'Pag-IBIG deduction exceeds the standard ₱100 employee cap.';
      }
      return null;
    },
  },
  withholding_tax: {
    label: 'Withholding Tax',
    basis:
      'Withholding tax is computed from the BIR graduated income tax table based on taxable income after statutory deductions.',
    anomaly: (p) => {
      if (p.withholding_tax > p.gross_pay * 0.35) {
        return 'Withholding tax looks unusually high relative to gross pay — worth double-checking.';
      }
      return null;
    },
  },
};
