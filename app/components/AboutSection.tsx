export default function AboutSection() {
  return (
    <div className="rounded-2xl bg-gray-800 p-6 border border-gray-700">
      <h2 className="mb-2 text-lg font-semibold text-emerald-400">About PaycheckPal</h2>
      <p className="mb-4 text-sm text-gray-300 leading-relaxed">
        PaycheckPal helps Filipino professionals understand where their salary goes and how to
        budget what&rsquo;s left. Upload or paste a payslip and let AI break down your gross pay, net
        pay, and statutory deductions in plain language — then get a localized budget plan for
        Metro Manila living costs.
      </p>
      <ol className="space-y-1.5 text-sm text-gray-300 list-decimal list-inside">
        <li>
          <span className="text-gray-200 font-medium">Read Payslip</span> — upload a payslip photo
          or paste the raw text; AI extracts your gross pay, net pay, SSS, PhilHealth, Pag-IBIG,
          and withholding tax.
        </li>
        <li>
          <span className="text-gray-200 font-medium">Deduction Breakdown</span> — click any
          deduction to see its statutory basis and what percentage of your gross pay it takes.
        </li>
        <li>
          <span className="text-gray-200 font-medium">Budget Recommendation</span> — enter your
          monthly remittance and get a 50/30/20 (Needs/Wants/Savings) split with localized tips.
        </li>
        <li>
          <span className="text-gray-200 font-medium">Payslip History</span> — track gross vs. net
          pay trends across your last 6 saved payslips, and delete any entry you no longer need.
        </li>
      </ol>
    </div>
  );
}
