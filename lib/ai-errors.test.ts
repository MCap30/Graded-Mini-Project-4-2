import { describe, expect, it } from 'vitest';
import { isTransientAiError } from './ai-errors';

describe('isTransientAiError', () => {
  it('detects a Gemini 503 "high demand" retry failure', () => {
    const error = new Error(
      'AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: This model is currently experiencing high demand.'
    );
    expect(isTransientAiError(error)).toBe(true);
  });

  it('does not flag an unrelated error', () => {
    expect(isTransientAiError(new Error('Missing rawText.'))).toBe(false);
  });
});
