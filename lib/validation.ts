import type { ParsedPayslip } from './types';

const FIELDS: (keyof ParsedPayslip)[] = [
  'gross_pay',
  'net_pay',
  'sss_deduction',
  'philhealth_deduction',
  'pagibig_deduction',
  'withholding_tax',
];

export function validatePayslipFields(payslip: ParsedPayslip): string | null {
  for (const field of FIELDS) {
    const value = payslip[field];
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      return `${field} must be a non-negative number.`;
    }
  }
  if (payslip.net_pay > payslip.gross_pay) {
    return 'Net pay cannot exceed gross pay.';
  }
  if (payslip.gross_pay > 0 && payslip.gross_pay < 1000) {
    return 'Gross pay looks too low to be a real cutoff amount.';
  }
  return null;
}
