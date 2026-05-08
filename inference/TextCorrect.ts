// Plan Item ID: TI-1
/**
 * TextCorrect.ts — Linguistic Refinement and Auto-Correction
 */

export function autoCorrectText(text: string): { corrected: string; changes: string[] } {
  const changes: string[] = [];
  let corrected = text;

  // Common corrections
  const corrections = [
    { pattern: /\bteh\b/gi, replacement: 'the', desc: 'teh → the' },
    { pattern: /\brecieve\b/gi, replacement: 'receive', desc: 'recieve → receive' },
    { pattern: /\boccured\b/gi, replacement: 'occurred', desc: 'occured → occurred' },
    { pattern: /\bseperate\b/gi, replacement: 'separate', desc: 'seperate → separate' },
    { pattern: /\bdefinately\b/gi, replacement: 'definitely', desc: 'definately → definitely' },
    { pattern: /\balot\b/gi, replacement: 'a lot', desc: 'alot → a lot' },
    { pattern: /\bcant\b/gi, replacement: "can't", desc: 'cant → can\'t' },
    { pattern: /\bwont\b/gi, replacement: "won't", desc: 'wont → won\'t' },
    { pattern: /\bdont\b/gi, replacement: "don't", desc: 'dont → don\'t' },
    { pattern: /\b(its|it is)\s+(\w+)\b/gi, replacement: "it's $2", desc: 'its → it\'s (possessive)', check: true }
  ];

  for (const corr of corrections) {
    if (corr.check && corr.pattern.test(corrected)) {
      corrected = corrected.replace(corr.pattern, corr.replacement);
      changes.push(corr.desc);
    } else if (!corr.check) {
      const matches = corrected.match(corr.pattern);
      if (matches) {
        corrected = corrected.replace(corr.pattern, corr.replacement);
        changes.push(...matches.map(() => corr.desc));
      }
    }
  }

  return { corrected, changes };
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
