export type BudgetSplit = {
  targetPool: number;
  needs: number;
  wants: number;
  savings: number;
};

export function computeBudgetBreakdown(netPay: number, remittance: number): BudgetSplit {
  const targetPool = Math.max(netPay - remittance, 0);
  return {
    targetPool,
    needs: targetPool * 0.5,
    wants: targetPool * 0.3,
    savings: targetPool * 0.2,
  };
}
