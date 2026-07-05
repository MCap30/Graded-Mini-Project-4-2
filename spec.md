\# Technical Specification (spec.md) - PaycheckPal



\## 1. System Architecture \& Tech Stack

\* \*Frontend Framework:\* Next.js 14 (App Router) using TypeScript and Tailwind CSS for UI components.

\* \*Backend Database \& Auth:\* Supabase Database with Postgres Row Level Security (RLS) enabled for strict session isolation.

\* \*AI Integration:\* Vercel AI SDK wrapper connecting to Anthropic Claude or OpenAI models.

\* \*Deployment Pipeline:\* Vercel Hosting integrated with a public GitHub repository running GitHub Actions for continuous deployment.



\## 2. Database Schema (Supabase)

The database layout strictly implements a privacy-first protocol, holding zero personal identifiers like names or employee numbers. Row Level Security (RLS) policies force data isolation: users can only interact with entries matching their authenticated ID.



\### Table: profiles

\* id (uuid, Primary Key): References the authenticated user's ID from Supabase Auth.

\* created\_at (timestamp): Automatically populated timestamp on account generation.

\* monthly\_remittance (numeric, default 0.00): Stored user family allocation configuration.



\### Table: payslips

\* id (uuid, Primary Key): Automatically generated unique tracking row identifier.

\* user\_id (uuid, Foreign Key -> profiles.id): Explicitly ties histories to an isolated user session.

\* uploaded\_at (timestamp): Automated processing execution date log.

\* gross\_pay (numeric, Not Null): Total cutoff income parsed.

\* net\_pay (numeric, Not Null): Total take-home income parsed.

\* sss\_deduction (numeric, default 0.00): Social Security System deduction amount.

\* philhealth\_deduction (numeric, default 0.00): PhilHealth insurance contribution amount.

\* pagibig\_deduction (numeric, default 0.00): Pag-IBIG fund contribution amount.

\* withholding\_tax (numeric, default 0.00): Statutory income tax deduction.



\## 3. Core API Endpoints \& Testable Acceptance Criteria



\### API Endpoint 1: POST /api/parse-payslip

\* \*Description:\* Extracts structured financial data from file uploads or raw text using an LLM.

\* \*Testable Acceptance Criteria:\*

&#x20; \* AC-API 1.1: Requests with files exceeding 5MB or invalid mime-types (not .png, .jpg, .jpeg) must be rejected with an HTTP 400 Bad Request.

&#x20; \* AC-API 1.2: Successful executions must parse and return a valid JSON payload mapping exactly to gross\_pay, net\_pay, sss\_deduction, philhealth\_deduction, pagibig\_deduction, and withholding\_tax.

&#x20; \* AC-API 1.3: If the LLM confidence score for extraction drops below 80%, the response must return a failure flag so the UI can prompt for manual text input fallback.



\### API Endpoint 2: POST /api/budget-recommendation

\* \*Description:\* Evaluates income balances to formulate an actionable localized budgeting split.

\* \*Testable Acceptance Criteria:\*

&#x20; \* AC-API 2.1: The logic must strictly execute the localized allocation computation: $Target\\\_Pool = Net\\ Pay - Monthly\\ Remittance$.

&#x20; \* AC-API 2.2: The response payload must include distinct calculated breakdown objects matching a strict 50% Needs, 30% Wants, and 20% Savings split.

&#x20; \* AC-API 2.3: The system must output a string array containing a maximum of 2 actionable localized cost-saving hints using the Vercel AI SDK pipeline.



\## 4. Security, Environment Variables \& Constraints

\* \*Token Secrets Management:\* All access credentials (Supabase API keys, LLM provider tokens) must live in .env.local during local development. Absolutely zero keys can be written into the raw code repository files.

\* \*Payload Verification:\* API inputs must enforce absolute field range checking (e.g., matching common Philippine statutory minimums/maximums) before writing to the database layer to safeguard stability.



\## 5. Architectural Implementation Strategy

\* Next.js Server Components are heavily leveraged to run fast data operations.

\* Client-side interactions utilize React state objects to drive real-time view charts smoothly.

