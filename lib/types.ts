export type ParsedPayslip = {
  gross_pay: number;
  net_pay: number;
  sss_deduction: number;
  philhealth_deduction: number;
  pagibig_deduction: number;
  withholding_tax: number;
};

export type Payslip = ParsedPayslip & {
  id: string;
  user_id: string;
  uploaded_at: string;
};

export type BudgetBreakdown = {
  targetPool: number;
  needs: number;
  wants: number;
  savings: number;
  tips: string[];
};
