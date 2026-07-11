'use client';
import { useState } from 'react';
import type { ParsedPayslip } from '@/lib/types';
import { STATUTORY_INFO, type DeductionKey } from '@/lib/statutory';

const DEDUCTION_KEYS: DeductionKey[] = [
  'sss_deduction',
  'philhealth_deduction',
  'pagibig_deduction',
  'withholding_tax',
];

export default function DeductionExplainer({ payslip }: { payslip: ParsedPayslip }) {
  const [openKey, setOpenKey] = useState<DeductionKey | null>(null);

  return (
    <div className="rounded-2xl bg-gray-800 p-6 border border-gray-700">
      <h3 className="mb-4 text-lg font-semibold text-emerald-400">Deduction Breakdown</h3>
      <div className="space-y-2">
        {DEDUCTION_KEYS.map((key) => {
          const info = STATUTORY_INFO[key];
          const anomaly = info.anomaly(payslip);
          return (
            <button
              key={key}
              onClick={() => setOpenKey(key)}
              className="w-full flex items-center justify-between rounded-lg bg-gray-750 border border-gray-600 p-3 text-left hover:border-emerald-500 transition"
            >
              <span className="text-gray-200">{info.label}</span>
              <span className="flex items-center gap-2">
                {anomaly && (
                  <span className="text-xs rounded-full bg-amber-500/20 text-amber-400 px-2 py-0.5 border border-amber-500/40">
                    Check this
                  </span>
                )}
                <span className="font-mono text-emerald-300">
                  ₱{payslip[key].toFixed(2)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {openKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpenKey(null)}>
          <div
            className="w-full max-w-md rounded-2xl bg-gray-800 p-6 shadow-xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-2 text-xl font-bold text-emerald-400">{STATUTORY_INFO[openKey].label}</h4>
            <p className="mb-4 text-sm text-gray-300 leading-relaxed">{STATUTORY_INFO[openKey].basis}</p>
            {STATUTORY_INFO[openKey].anomaly(payslip) && (
              <p className="mb-4 text-sm text-amber-400 leading-relaxed">
                {STATUTORY_INFO[openKey].anomaly(payslip)}
              </p>
            )}
            <button
              onClick={() => setOpenKey(null)}
              className="w-full rounded-lg bg-gray-700 p-2 font-medium text-gray-200 hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
