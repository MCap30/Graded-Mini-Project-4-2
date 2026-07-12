'use client';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import type { Payslip } from '@/lib/types';

export default function PayslipHistoryChart({
  userId,
  refreshTrigger,
}: {
  userId: string;
  refreshTrigger: number;
}) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('payslips')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(6);

      if (!cancelled) {
        if (!error && data) {
          setPayslips([...data].reverse() as Payslip[]);
        }
        setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshTrigger, localRefresh]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('payslips').delete().eq('id', id);
    setDeletingId(null);
    if (!error) {
      setLocalRefresh((t) => t + 1);
    }
  };

  const chartData = payslips.map((p) => ({
    date: new Date(p.uploaded_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }),
    gross_pay: p.gross_pay,
    net_pay: p.net_pay,
  }));

  return (
    <div className="rounded-2xl bg-gray-800 p-6 border border-gray-700">
      <h3 className="mb-4 text-lg font-semibold text-emerald-400">Payslip History</h3>

      {loading ? (
        <p className="text-sm text-gray-400">Loading history...</p>
      ) : chartData.length === 0 ? (
        <p className="text-sm text-gray-400">No payslips saved yet. Upload one to see trends here.</p>
      ) : (
        <>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#e5e7eb' }}
                />
                <Line type="monotone" dataKey="gross_pay" name="Gross Pay" stroke="#34d399" strokeWidth={2} />
                <Line type="monotone" dataKey="net_pay" name="Net Pay" stroke="#60a5fa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {[...payslips].reverse().map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg bg-gray-700 border border-gray-600 p-3"
              >
                <span className="text-sm text-gray-300">
                  {new Date(p.uploaded_at).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  <span className="ml-2 font-mono text-emerald-300">
                    ₱{p.gross_pay.toFixed(2)} → ₱{p.net_pay.toFixed(2)}
                  </span>
                </span>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="rounded-lg bg-red-500/10 border border-red-500/40 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deletingId === p.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
