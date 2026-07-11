'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pp_privacy_ack';

export default function PrivacyDisclaimerModal({ onAcknowledge }: { onAcknowledge: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const acknowledged = window.localStorage.getItem(STORAGE_KEY) === 'true';
    if (acknowledged) {
      onAcknowledge();
    } else {
      setVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcknowledge = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
    onAcknowledge();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-gray-800 p-8 shadow-xl border border-gray-700">
        <h2 className="mb-4 text-2xl font-bold text-emerald-400">Before you upload</h2>
        <p className="mb-4 text-sm text-gray-300 leading-relaxed">
          PaycheckPal never collects your legal name, employer name, or employee ID. We only store
          the numeric totals from your payslip (gross pay, net pay, and statutory deductions) tied
          to your anonymous account.
        </p>
        <p className="mb-6 text-sm text-gray-300 leading-relaxed">
          Do not upload payslips that show identifying information you&rsquo;re not comfortable storing —
          you can also crop images or paste raw numbers instead of uploading a full payslip photo.
        </p>
        <button
          onClick={handleAcknowledge}
          className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-gray-950 transition hover:bg-emerald-400"
        >
          I understand, continue
        </button>
      </div>
    </div>
  );
}
