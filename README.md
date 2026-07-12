# PaycheckPal

An AI-assisted payslip reader and budget planner for Filipino professionals in NCR. Upload or paste a payslip, get a plain-language breakdown of your SSS/PhilHealth/Pag-IBIG/withholding deductions, and receive a localized 50/30/20 budget recommendation based on your net pay and monthly remittance.

Privacy-first: the app never collects legal names, employer names, or employee IDs — only the numeric totals from your payslip.

## Live app

https://graded-mini-project-4-2-mscaparas30-9029s-projects.vercel.app
# Use Sample Payslip.png located in same folder to test the app.

## Demo

https://www.loom.com/share/70b3d33c119b4823b9960d78eb76b46f

## Features

1. **Payslip Input** — upload a payslip image (.png/.jpg/.jpeg, max 5MB) or paste raw payslip text; an LLM extracts gross pay, net pay, and all four statutory deductions.
2. **Deduction Explainer** — click any deduction to see its statutory basis, with automatic flags for values that look mathematically anomalous (e.g. Pag-IBIG above the standard cap).
3. **AI Budget Recommendation** — enter a monthly remittance amount and get a 50/30/20 (Needs/Wants/Savings) breakdown of what's left, plus AI-generated tips grounded in NCR cost of living.
4. **Payslip History** — a trend chart of gross vs. net pay across your last 6 saved payslips.
5. **Privacy-First Onboarding** — an unskippable disclaimer explains what is (and isn't) stored before the upload feature unlocks.

See [Phase1_IdeaValidation_PayslipAnalyzer.docx](Phase1_IdeaValidation_PayslipAnalyzer.docx) for the 7-step idea validation, [PRD.md](PRD.md) for the full product spec, and [spec.md](spec.md) for the technical spec and API contracts.

## Tech stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend/Auth/DB**: Supabase (Postgres with Row Level Security)
- **AI**: Vercel AI SDK (`ai` + `@ai-sdk/google`), Gemini models
- **Charts**: Recharts
- **Tests**: Vitest

## Getting started

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy the env template and fill in your own values:
   ```bash
   cp .env.local.example .env.local
   ```
   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
   | `GOOGLE_GENERATIVE_AI_API_KEY` | A Gemini API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (free tier available) |
3. Run the database migration in [supabase/migrations/001_init_profiles_payslips.sql](supabase/migrations/001_init_profiles_payslips.sql) against your Supabase project (via the SQL Editor or `supabase db push`).
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint the codebase |
| `npm run typecheck` | TypeScript type-check with no emit |
| `npm test` | Run the Vitest unit test suite |

## CI/CD

GitHub Actions ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs lint, typecheck, unit tests, and a production build on every push/PR to `main`. Deployment is handled separately via Vercel's GitHub integration, which auto-deploys on push once the repo is imported.

## Security

No secrets are committed to this repo — `.env.local` is gitignored. See `.env.local.example` for the variables you need to supply locally, and configure the same variables in your Vercel project settings for production.
