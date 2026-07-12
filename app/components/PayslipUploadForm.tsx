'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { validatePayslipFields } from '@/lib/validation';
import type { ParsedPayslip, Payslip } from '@/lib/types';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const EMPTY_FIELDS: ParsedPayslip = {
  gross_pay: 0,
  net_pay: 0,
  sss_deduction: 0,
  philhealth_deduction: 0,
  pagibig_deduction: 0,
  withholding_tax: 0,
};

export default function PayslipUploadForm({
  userId,
  enabled,
  onSaved,
}: {
  userId: string;
  enabled: boolean;
  onSaved: (payslip: Payslip) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [fields, setFields] = useState<ParsedPayslip>(EMPTY_FIELDS);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setMessage('Only .png, .jpg, and .jpeg files are supported.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setMessage('File exceeds the 5MB limit.');
      setFile(null);
      return;
    }
    setMessage('');
    setFile(selected);
  };

  const handleParse = async () => {
    setLoading(true);
    setMessage('');
    try {
      let response: Response;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch('/api/parse-payslip', { method: 'POST', body: formData });
      } else if (rawText.trim()) {
        response = await fetch('/api/parse-payslip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawText }),
        });
      } else {
        setMessage('Upload a payslip image or paste the raw text first.');
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || 'Failed to parse payslip.');
        setLoading(false);
        return;
      }

      if (result.success) {
        setFields(result.data);
        setMessage('');
      } else {
        setFields({ ...EMPTY_FIELDS, ...result.partialData });
        setMessage(
          result.message ||
            'Unable to fully read payslip layout. Please verify fields manually or try pasting raw text.'
        );
      }
      setReviewing(true);
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong while parsing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (key: keyof ParsedPayslip, value: string) => {
    setFields((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const handleConfirm = async () => {
    const validationError = validatePayslipFields(fields);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('payslips')
      .insert({ user_id: userId, ...fields })
      .select()
      .single();
    setLoading(false);

    if (error) {
      setMessage('Failed to save payslip: ' + error.message);
      return;
    }

    onSaved(data as Payslip);
    setReviewing(false);
    setFile(null);
    setRawText('');
    setFields(EMPTY_FIELDS);
    setMessage('Payslip saved.');
  };

  if (reviewing) {
    return (
      <div className="rounded-2xl bg-gray-800 p-6 border border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-emerald-400">Review Parsed Payslip</h3>
        {message && (
          <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/40 p-3 text-sm text-amber-300">
            {message}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(fields) as (keyof ParsedPayslip)[]).map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {key.replace(/_/g, ' ')}
              </label>
              <input
                type="number"
                value={fields[key]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 p-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-emerald-500 p-3 font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Confirm & Save'}
          </button>
          <button
            onClick={() => setReviewing(false)}
            className="rounded-lg bg-gray-700 p-3 font-medium text-gray-200 hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-800 p-6 border border-gray-700">
      <h3 className="mb-4 text-lg font-semibold text-emerald-400">Upload Payslip</h3>

      <label className="block mb-4">
        <span className="block text-sm font-medium text-gray-400 mb-1">
          Payslip image (.png, .jpg, .jpeg, max 5MB)
        </span>
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={!enabled}
          className="w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-gray-950 file:font-semibold disabled:opacity-50"
        />
      </label>

      <div className="mb-4 text-center text-xs text-gray-500">or</div>

      <label className="block mb-4">
        <span className="block text-sm font-medium text-gray-400 mb-1">Paste raw payslip text</span>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          disabled={!enabled}
          rows={4}
          className="w-full rounded-lg bg-gray-700 border border-gray-600 p-3 text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          placeholder="Gross Pay: 30,000.00&#10;Net Pay: 24,500.00&#10;SSS: 900.00..."
        />
      </label>

      {message && (
        <div className="mb-4 rounded-lg bg-gray-700 p-3 text-sm text-center text-amber-300 border border-amber-500/30">
          {message}
        </div>
      )}

      <button
        onClick={handleParse}
        disabled={!enabled || loading}
        className="w-full rounded-lg bg-emerald-500 p-3 font-semibold text-gray-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {loading ? 'Reading...' : 'Read Payslip'}
      </button>
    </div>
  );
}
