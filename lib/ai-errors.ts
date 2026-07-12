export function isTransientAiError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /RetryError|UNAVAILABLE|high demand|overloaded|503/i.test(message);
}
