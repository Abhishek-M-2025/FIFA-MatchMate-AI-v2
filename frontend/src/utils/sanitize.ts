/**
 * Strips HTML tags and script elements from input strings to prevent XSS.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script[^>]*>([\S\s]*?)<\/script>/gi, '') // Strip script tags entirely
    .replace(/<[^>]*>/g, '')                           // Strip remaining HTML tags
    .trim();
}
