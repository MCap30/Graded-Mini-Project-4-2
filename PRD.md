\# PRD: PaycheckPal



\## Problem Statement

Filipino NCR professionals aged 25-35 receive a payslip every cutoff but cannot decode why their net pay dropped – and have no system to allocate what's left. Despite stable employment, most live paycheck to paycheck: not from low income, but from zero payslip-to-budget translation. No existing tool combines Philippine-specific deduction parsing (SSS, PhilHealth, Pag-IBIG) with AI budget guidance contextualized to NCR cost of living and provincial remittance.



\## Target Users

1\. \*Primary\* – The stable-but-stressed professional. Age 25-35, BPO / engineering / office, P25K–P55K gross, NCR-based, sends remittance home, uses GCash daily, budgets via mental math or abandoned Excel.

2\. \*Secondary\* – The freelancer / VA. Variable income, computes own SSS/PhilHealth contributions, no HR to generate payslip for them.



\## Core Features



\### 1. Payslip Input

\* \*\*Description:\*\* User can upload an image or paste raw text of a payslip. The system uses AI to automatically extract financial totals.

\* \*\*Acceptance Criteria:\*\*

&#x20; \* AC 1.1: The UI must include a file upload dropzone that restricts files to .png, .jpg, and .jpeg formats under 5MB, alongside a plain-text input area.

&#x20; \* AC 1.2: The backend parsing route must extract and structure the following data fields: gross\_pay, net\_pay, sss\_deduction, philhealth\_deduction, pagibig\_deduction, and withholding\_tax.

&#x20; \* AC 1.3: If parsing fields are completely missing or unreadable, the UI must display a clear validation message: "Unable to fully read payslip layout. Please verify fields manually or try pasting raw text."



\### 2. Deduction Explainer

\* \*Description:\* Plain-language breakdown of government-mandated cuts (SSS, PhilHealth, Pag-IBIG) and withholding tax with tax bracket context.

\* \*Acceptance Criteria:\*

&#x20; \* AC 2.1: Clicking on a specific deduction amount must open a modal or expanded view showing the statutory basis or current tax bracket logic used for that calculation.

&#x20; \* AC 2.2: The component must automatically flag if a deduction appears mathematically anomalous based on the user's base salary range (e.g., standard Pag-IBIG caps).



\### 3. AI Budget Recommendation

\* \*Description:\* Contextualized 50/30/20 budget breakdown using the parsed net pay, factoring in typical NCR rent benchmarks and user-declared monthly remittance.

\* \*Acceptance Criteria:\*

&#x20; \* AC 3.1: The app must feature a form input field where the user inputs their monthly allocation for provincial/family remittance (defaulting to 0 if left blank).

&#x20; \* AC 3.2: The component must take the remaining balance (Net Pay - Remittance) and calculate a target 50% Needs, 30% Wants, and 20% Savings split.

&#x20; \* AC 3.3: The system must query an LLM via the Vercel AI SDK to provide a 2-sentence actionable localized tip based on current NCR average living expenses



\### 4. Payslip History

\* \*Description:\* Secure, timeline-based list of past parsed cutoffs to track trends or sudden deduction shifts.

\* \*Acceptance Criteria:\*

&#x20; \* AC 4.1: User data must be stored in a Supabase database linked strictly to the user’s authenticated session profile

&#x20; \* AC 4.2: The UI dashboard must display a historical trend line chart showing gross vs. net pay fluctuations over the last 6 entries.



\### 5. Privacy-First Onboarding

\* \*Description:\* High-assurance introductory flow clarifying that personal identification information or employer names are not collected.

\* \*Acceptance Criteria:\*

&#x20; \* AC 5.1: The database schema must strictly omit text fields for personal identification data like legal\_name, company\_name, or employee\_id.

&#x20; \* AC 5.2: First-time visitors must be presented with an explicit, unskippable data policy disclaimer message before the file upload feature becomes active.



\## Out of Scope

1\. Real bank or GCash account sync / open banking integration

2\. Loan tracking, credit score, or debt repayment planner

3\. Investment recommendations (mutual funds, stocks, crypto)

4\. Mobile native app (iOS / Android) – web only for v1

5\. Multi-user / shared household budgeting

6\. Real payment processing or premium billing in-app



\## Success Metrics

1\. ≥80% payslip parse accuracy.

2\. AI response rendering and parsing completes under 4 seconds.



\## Open Questions

1\. Will users actually upload a payslip image to a web app they just discovered – or does trust need to be built first through a text-only flow?

2\. How consistent are Philippine payslip layouts across BPO, government, and private sector employers – and how many formats does Claude need to handle reliably before launch?

3\. Is P99/month the right price point, or should v1 be entirely free to maximize adoption and validate retention before introducing a paywall?

4\. Should the budget recommendation use fixed NCR benchmarks (average rent, commute cost) or let users declare their own fixed expenses for a more personalized output?

5\. What is the minimum viable privacy assurance that converts a skeptical first-time user – a badge, a link to a policy, or a full explainer screen?

