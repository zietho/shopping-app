import { describe, it, expect } from 'vitest';
import { translations } from '../lib/i18n';

const languages = ['de', 'en', 'fr', 'es'] as const;
const deKeys = Object.keys(translations.de) as (keyof typeof translations.de)[];

describe('i18n completeness', () => {
  for (const lang of languages) {
    it(`${lang} has all top-level sections`, () => {
      for (const section of deKeys) {
        expect(translations[lang]).toHaveProperty(section);
      }
    });

    it(`${lang} has all keys within each section`, () => {
      for (const section of deKeys) {
        const deSection = translations.de[section] as Record<string, string>;
        const langSection = translations[lang][section] as Record<string, string>;
        for (const key of Object.keys(deSection)) {
          expect(langSection, `${lang}.${section}.${key} is missing`).toHaveProperty(key);
          expect(typeof langSection[key]).toBe('string');
          // Empty strings are allowed — some languages intentionally omit suffix words
          expect(typeof langSection[key], `${lang}.${section}.${key} should be a string`).toBe('string');
        }
      }
    });
  }
});
