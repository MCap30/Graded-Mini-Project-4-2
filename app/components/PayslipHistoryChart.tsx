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
  }, [userId, refreshTrigger]);

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
      )}
    </div>
  );
}
