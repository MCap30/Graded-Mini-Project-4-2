'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { BudgetBreakdown } from '@/lib/types';

export default function BudgetPlanner({ userId, netPay }: { userId: string; netPay: number }) {
  const [remittance, setRemittance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [breakdown, setBreakdown] = useState<BudgetBreakdown | null>(null);

  useEffect(() => {
    let cancelled = false;

    supabase
      .from('profiles')
      .select('monthly_remittance')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.monthly_remittance != null) {
          setRemittance(Number(data.monthly_remittance));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleCalculate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/budget-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ netPay, remittance }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Failed to generate budget recommendation.');
        setBreakdown(null);
        return;
      }
      setBreakdown(result);
      await supabase.from('profiles').update({ monthly_remittance: remittance }).eq('id', userId);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while generating your budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-gray-800 p-6 border border-gray-700">
      <h3 className="mb-4 text-lg font-semibold text-emerald-400">Budget Recommendation</h3>

      <label className="block mb-4">
        <span className="block text-sm font-medium text-gray-400 mb-1">
          Monthly remittance (provincial/family, defaults to 0)
        </span>
        <input
          type="number"
          value={remittance}
          onChange={(e) => setRemittance(Number(e.target.value) || 0)}
          min={0}
          className="w-full rounded-lg bg-gray-700 border border-gray-600 p-3 text-white focus:border-emerald-500 focus:outline-none"
        />
      </label>

      <button
        onClick={handleCalculate}
        disabled={loading}
        className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-gray-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? 'Calculating...' : 'Get Budget Recommendation'}
      </button>

      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/40 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {breakdown && (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-gray-700 border border-gray-600 p-3">
              <div className="text-xs text-gray-400">Needs (50%)</div>
              <div className="mt-1 font-mono text-emerald-300">₱{breakdown.needs.toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-gray-700 border border-gray-600 p-3">
              <div className="text-xs text-gray-400">Wants (30%)</div>
              <div className="mt-1 font-mono text-emerald-300">₱{breakdown.wants.toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-gray-700 border border-gray-600 p-3">
              <div className="text-xs text-gray-400">Savings (20%)</div>
              <div className="mt-1 font-mono text-emerald-300">₱{breakdown.savings.toFixed(2)}</div>
            </div>
          </div>

          {breakdown.tips.length > 0 && (
            <div className="mt-4 space-y-2">
              {breakdown.tips.map((tip, i) => (
                <p key={i} className="text-sm text-gray-300 leading-relaxed">
                  💡 {tip}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
