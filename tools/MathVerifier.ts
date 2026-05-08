/**
 * MathVerifier.ts — v6.0
 * Mathematical expression validation and computation verification.
 * Independently evaluates numeric expressions to catch LLM arithmetic errors.
 */

export interface VerificationResult {
  original: string;
  computed: number | null;
  isCorrect: boolean | null;   // null if unable to verify
  suggestion?: string;
  error?: string;
}

class MathVerifier {
  /** Safely evaluate a mathematical expression string */
  evaluate(expression: string): number | null {
    try {
      // Sanitize: allow only math-safe characters
      const sanitized = expression
        .replace(/[^0-9+\-*/().%^ \t]/g, '')
        .replace(/\^/g, '**')  // convert ^ to ** for JS exponentiation
        .trim();

      if (!sanitized) return null;

      // Use Function constructor in a controlled way (no window access)
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (typeof result !== 'number' || !isFinite(result)) return null;
      return result;
    } catch {
      return null;
    }
  }

  /** Verify a claimed equation: e.g. "2+2=4" or "sqrt(16)=4" */
  verify(claim: string): VerificationResult {
    const eqMatch = claim.match(/^(.+?)\s*=\s*([0-9.+\-*/() ]+)$/);
    if (!eqMatch) {
      return { original: claim, computed: null, isCorrect: null, error: 'Cannot parse as equation.' };
    }

    const [, lhsRaw, rhsRaw] = eqMatch;

    // Handle simple sqrt/abs/floor/ceil
    const lhsNorm = this.normalizeFunctions(lhsRaw.trim());
    const rhsNorm = this.normalizeFunctions(rhsRaw.trim());

    const lhs = this.evaluate(lhsNorm);
    const rhs = this.evaluate(rhsNorm);

    if (lhs === null) {
      return { original: claim, computed: null, isCorrect: null, error: 'Could not evaluate left-hand side.' };
    }

    const isCorrect = rhs !== null ? Math.abs(lhs - rhs) < 1e-9 : null;

    return {
      original: claim,
      computed: lhs,
      isCorrect,
      suggestion: isCorrect === false ? `Correct result is ${lhs}, not ${rhs}.` : undefined,
    };
  }

  /** Scan text for equations and verify each one */
  scanAndVerify(text: string): VerificationResult[] {
    // Match patterns like "2 + 3 = 5" or "x = 42"
    const patterns = text.match(/[0-9(][0-9 +\-*/().^]*=\s*[0-9.]+/g) ?? [];
    return patterns.map(p => this.verify(p.trim()));
  }

  /** Format a number for display */
  format(n: number, precision = 4): string {
    if (Number.isInteger(n)) return n.toString();
    return parseFloat(n.toFixed(precision)).toString();
  }

  private normalizeFunctions(expr: string): string {
    // Replace common math function names with JS equivalents
    return expr
      .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
      .replace(/abs\(([^)]+)\)/g, 'Math.abs($1)')
      .replace(/floor\(([^)]+)\)/g, 'Math.floor($1)')
      .replace(/ceil\(([^)]+)\)/g, 'Math.ceil($1)')
      .replace(/round\(([^)]+)\)/g, 'Math.round($1)')
      .replace(/log\(([^)]+)\)/g, 'Math.log($1)')
      .replace(/pi/gi, 'Math.PI')
      .replace(/e(?!\w)/g, 'Math.E');
  }
}

export const mathVerifier = new MathVerifier();
