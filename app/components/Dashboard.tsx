'use client';
import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Payslip } from '@/lib/types';
import PrivacyDisclaimerModal from './PrivacyDisclaimerModal';
import PayslipUploadForm from './PayslipUploadForm';
import DeductionExplainer from './DeductionExplainer';
import BudgetPlanner from './BudgetPlanner';
import PayslipHistoryChart from './PayslipHistoryChart';

export default function Dashboard({ session }: { session: Session }) {
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [latestPayslip, setLatestPayslip] = useState<Payslip | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaved = (payslip: Payslip) => {
    setLatestPayslip(payslip);
    setRefreshTrigger((t) => t + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <PrivacyDisclaimerModal onAcknowledge={() => setPrivacyAcknowledged(true)} />

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">PaycheckPal</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition"
          >
            Sign Out
          </button>
        </div>

        <div className="space-y-6">
          <PayslipUploadForm
            userId={session.user.id}
            enabled={privacyAcknowledged}
            onSaved={handleSaved}
          />

          {latestPayslip && <DeductionExplainer payslip={latestPayslip} />}
          {latestPayslip && <BudgetPlanner netPay={latestPayslip.net_pay} />}

          <PayslipHistoryChart userId={session.user.id} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}
