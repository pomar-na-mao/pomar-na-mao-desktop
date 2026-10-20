import { describe, expect, it } from 'vitest';
import { occurrenceCodeFromName } from './occurrence-code';

describe('occurrenceCodeFromName', () => {
  it('creates a lowercase underscore-separated code from the trimmed name', () => {
    expect(occurrenceCodeFromName('  Galho   Quebrado  ')).toBe(
      'galho_quebrado',
    );
  });

  it('keeps the name characters while lowercasing them', () => {
    expect(occurrenceCodeFromName('PÉ DESIDRATADO')).toBe('pé_desidratado');
  });
});
