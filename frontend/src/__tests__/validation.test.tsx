import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '../utils/sanitize';

describe('Frontend Input Sanitization', () => {
  it('strips HTML tags and script elements securely', () => {
    const maliciousInput = '<script>alert("hack")</script><p>Click <b>here</b>!</p>';
    const sanitized = sanitizeInput(maliciousInput);
    
    // Expect script tags and HTML tags to be stripped, leaving raw plain text
    expect(sanitized).toBe('Click here!');
  });

  it('handles empty inputs or whitespace gracefully', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput('   ')).toBe('');
  });

  it('preserves plain textual content', () => {
    const text = 'Gate C is very busy, route via Gate D.';
    expect(sanitizeInput(text)).toBe(text);
  });
});
