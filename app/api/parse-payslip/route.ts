import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validatePayslipFields } from '@/lib/validation';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const parsedPayslipSchema = z.object({
  gross_pay: z.number(),
  net_pay: z.number(),
  sss_deduction: z.number(),
  philhealth_deduction: z.number(),
  pagibig_deduction: z.number(),
  withholding_tax: z.number(),
  confidence: z
    .number()
    .describe('Confidence from 0 to 1 that all fields were read correctly from the source.'),
});

const SYSTEM_PROMPT = `You extract structured financial data from Philippine payslips.
Read the provided payslip (image or raw text) and return: gross_pay, net_pay, sss_deduction,
philhealth_deduction, pagibig_deduction, withholding_tax, all as plain numbers in PHP (no currency
symbols or commas). If a field is genuinely absent from the payslip, use 0. Also return a
"confidence" score from 0 to 1 reflecting how confident you are that every field was read
correctly — lower it if the layout was unclear, the image was low quality, or fields were guessed.`;

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'Missing file upload.' }, { status: 400 });
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: 'Only .png, .jpg, and .jpeg files are supported.' },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: 'File exceeds the 5MB limit.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');

      const { object } = await generateObject({
        model: google('gemini-flash-latest'),
        schema: parsedPayslipSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: SYSTEM_PROMPT },
              { type: 'file', data: base64, mediaType: file.type },
            ],
          },
        ],
      });

      return respondWithParsedResult(object);
    }

    const body = await request.json();
    const rawText = typeof body?.rawText === 'string' ? body.rawText.trim() : '';
    if (!rawText) {
      return NextResponse.json({ error: 'Missing rawText.' }, { status: 400 });
    }

    const { object } = await generateObject({
      model: google('gemini-flash-latest'),
      schema: parsedPayslipSchema,
      prompt: `${SYSTEM_PROMPT}\n\nPayslip text:\n${rawText}`,
    });

    return respondWithParsedResult(object);
  } catch (error) {
    console.error('parse-payslip error', error);
    return NextResponse.json({ error: 'Failed to parse payslip.' }, { status: 500 });
  }
}

function respondWithParsedResult(object: z.infer<typeof parsedPayslipSchema>) {
  const { confidence, ...fields } = object;

  if (confidence < 0.8) {
    return NextResponse.json({
      success: false,
      reason: 'low_confidence',
      message:
        'Unable to fully read payslip layout. Please verify fields manually or try pasting raw text.',
      partialData: fields,
    });
  }

  const validationError = validatePayslipFields(fields);
  if (validationError) {
    return NextResponse.json({
      success: false,
      reason: 'invalid_fields',
      message: validationError,
      partialData: fields,
    });
  }

  return NextResponse.json({ success: true, data: fields });
}
