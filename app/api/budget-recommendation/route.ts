import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { computeBudgetBreakdown } from '@/lib/budget';
import { isTransientAiError } from '@/lib/ai-errors';

export const runtime = 'nodejs';

const tipsSchema = z.object({
  tips: z
    .array(z.string())
    .max(2)
    .describe('Up to 2 short, actionable, localized cost-saving tips for someone in Metro Manila.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const netPay = Number(body?.netPay);
    const remittance = Number(body?.remittance) || 0;

    if (!Number.isFinite(netPay) || netPay < 0) {
      return NextResponse.json({ error: 'netPay must be a non-negative number.' }, { status: 400 });
    }
    if (remittance < 0) {
      return NextResponse.json({ error: 'remittance must be a non-negative number.' }, { status: 400 });
    }

    const { targetPool, needs, wants, savings } = computeBudgetBreakdown(netPay, remittance);

    const { object } = await generateObject({
      model: google('gemini-flash-latest'),
      schema: tipsSchema,
      prompt: `A Metro Manila (NCR) professional has ₱${targetPool.toFixed(2)} left after remittance,
split into Needs ₱${needs.toFixed(2)} (50%), Wants ₱${wants.toFixed(2)} (30%), and Savings ₱${savings.toFixed(2)} (20%).
Give at most 2 short, actionable, localized tips (2 sentences total) referencing typical NCR living costs
(e.g. rent, commute, groceries) to help them stick to this budget. Be specific and practical, not generic.`,
    });

    return NextResponse.json({
      targetPool,
      needs,
      wants,
      savings,
      tips: object.tips.slice(0, 2),
    });
  } catch (error) {
    console.error('budget-recommendation error', error);
    if (isTransientAiError(error)) {
      return NextResponse.json(
        { error: 'The AI service is temporarily busy. Please try again in a moment.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to generate budget recommendation.' }, { status: 500 });
  }
}
