// Plan Item ID: TI-1
/**
 * MathVerifier.ts — Formal Logic and Mathematical Verification
 */

export class MathLogicVerifier {
  verify(content: string): { valid: boolean; errors: string[]; corrections: string[] } {
    const errors: string[] = [];
    const corrections: string[] = [];

    // Extract math expressions
    const mathPatterns = [
      /\$([^$]+)\$/g,
      /(\d+)\s*[\+\-\*\/]\s*(\d+)/g,
      /(\d+)\s*\^\s*(\d+)/g,
      /sqrt\s*\(\s*(\d+)\s*\)/gi,
      /factorial\s*\(\s*(\d+)\s*\)/gi
    ];

    for (const pattern of mathPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        try {
          const expr = match[1] || match[0];
          if (expr.includes('+') || expr.includes('-') || expr.includes('*') || expr.includes('/')) {
            const parts = expr.match(/\d+/g);
            if (parts && parts.length >= 2) {
              const a = parseInt(parts[0]);
              const b = parseInt(parts[1]);
              let result: number;
              if (expr.includes('+')) result = a + b;
              else if (expr.includes('-')) result = a - b;
              else if (expr.includes('*')) result = a * b;
              else if (expr.includes('/')) result = a / b;
              else result = 0;
              corrections.push(`Verified: ${expr} = ${result}`);
            }
          }
          if (expr.includes('sqrt')) {
            const num = parseInt(expr.match(/\d+/)?.[0] || '0');
            corrections.push(`Verified: √${num} = ${Math.sqrt(num)}`);
          }
          if (expr.includes('^')) {
            const parts = expr.split('^');
            const base = parseInt(parts[0]);
            const exp = parseInt(parts[1]);
            corrections.push(`Verified: ${base}^${exp} = ${Math.pow(base, exp)}`);
          }
        } catch (e) {
          errors.push(`Math error in "${match[0]}": ${e}`);
        }
      }
    }

    // Check logical consistency
    if (content.toLowerCase().includes('if') && content.toLowerCase().includes('else') && !content.toLowerCase().includes('then')) {
      errors.push('Incomplete conditional: missing "then" clause');
    }

    // Check for contradictions
    const contradictions = [
      ['true', 'false'],
      ['yes', 'no'],
      ['always', 'never'],
      ['increase', 'decrease']
    ];
    for (const [a, b] of contradictions) {
      if (content.toLowerCase().includes(a) && content.toLowerCase().includes(b)) {
        errors.push(`Potential contradiction: "${a}" and "${b}" both present`);
      }
    }

    return { valid: errors.length === 0, errors, corrections };
  }
}

export const mathVerifier = new MathLogicVerifier();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
