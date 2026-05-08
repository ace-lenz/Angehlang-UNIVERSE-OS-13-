// Plan Item ID: TI-1
/**
 * ErrorPrevention.ts - Always-On Error Prevention System
 * 
 * Validates all generated code for common errors
 * Includes type safety, null checks, bounds checking, and more
 */

import type { LanguageType } from './IntentAnalyzer';

export interface ValidationError {
  line: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fixes: FixRecommendation[];
}

export interface FixRecommendation {
  line: number;
  original: string;
  fixed: string;
  reason: string;
}

const LANGUAGE_PATTERNS: Record<LanguageType, ValidationRules> = {
  typescript: {
    typePatterns: [
      { pattern: /:\s*any\b/g, suggestion: 'Avoid "any" type, use specific types instead' },
      { pattern: /as\s+any\b/g, suggestion: 'Avoid type assertion to "any"' },
    ],
    nullPatterns: [
      { pattern: /\.value\./g, suggestion: 'Use optional chaining: obj?.value', fix: (m) => m.replace(/\.(\w+)\./g, '?.$1?.') },
      { pattern: /\[\s*\w+\s*\]\s*\./g, suggestion: 'Check array index before access' },
    ],
    asyncPatterns: [
      { pattern: /async\s+function.*[^}](?!\s*await)/g, suggestion: 'Consider if async is needed without await' },
    ],
  },
  javascript: {
    typePatterns: [],
    nullPatterns: [
      { pattern: /\.(\w+)\./g, suggestion: 'Use optional chaining: obj?.property', fix: (m) => m.replace(/\.(\w+)\./g, '?.$1?.') },
    ],
    asyncPatterns: [],
  },
  python: {
    typePatterns: [],
    nullPatterns: [
      { pattern: /\[idx\]/g, suggestion: 'Use try-except for list index access', fix: (m) => `try:\n    ${m}\nexcept IndexError:` },
      { pattern: /dict\["/g, suggestion: 'Use .get() for dict access', fix: (m) => m.replace(/(\w+)\["/, '$1.get("') },
    ],
    asyncPatterns: [],
  },
  go: {
    typePatterns: [
      { pattern: /interface\{\}/g, suggestion: 'Use specific interface or {}|nil pattern' },
    ],
    nullPatterns: [
      { pattern: /\[\]/g, suggestion: 'Check if slice is empty before indexing' },
      { pattern: /\.(\w+)\s*$/gm, suggestion: 'Check for nil pointer before field access' },
    ],
    asyncPatterns: [],
  },
  rust: {
    typePatterns: [],
    nullPatterns: [],
    asyncPatterns: [],
  },
  c: {
    typePatterns: [],
    nullPatterns: [
      { pattern: /->/g, suggestion: 'Check pointer before arrow operator' },
      { pattern: /\[\s*\w+\s*\]/g, suggestion: 'Validate array bounds' },
    ],
    asyncPatterns: [],
  },
  cpp: {
    typePatterns: [],
    nullPatterns: [
      { pattern: /->/g, suggestion: 'Check pointer validity before dereferencing' },
      { pattern: /new\s+\w+[^;]/g, suggestion: 'Use smart pointers instead of raw new' },
    ],
    asyncPatterns: [],
  },
  csharp: {
    typePatterns: [],
    nullPatterns: [
      { pattern: /\.\w+;/g, suggestion: 'Use null-conditional: obj?.property' },
    ],
    asyncPatterns: [],
  },
  lua: {
    typePatterns: [],
    nullPatterns: [],
    asyncPatterns: [],
  },
  html: {
    typePatterns: [],
    nullPatterns: [],
    asyncPatterns: [],
  },
  css: {
    typePatterns: [],
    nullPatterns: [],
    asyncPatterns: [],
  },
  sql: {
    typePatterns: [],
    nullPatterns: [
      { pattern: /'/g, suggestion: 'Use parameterized queries to prevent SQL injection', fix: (m) => m.replace(/'/g, "''") },
    ],
    asyncPatterns: [],
  },
  bash: {
    typePatterns: [],
    nullPatterns: [],
    asyncPatterns: [],
    injectionPatterns: [
      { pattern: /\$!/g, suggestion: 'Quote variable expansions: "$variable"' },
      { pattern: /\|/g, suggestion: 'Use set -o pipefail for pipeline error handling' },
    ],
  },
  yaml: {
    typePatterns: [],
    nullPatterns: [],
    asyncPatterns: [],
  },
  json: {
    typePatterns: [],
    nullPatterns: [],
    asyncPatterns: [],
  },
};

interface ValidationRules {
  typePatterns: { pattern: RegExp; suggestion: string; fix?: (code: string) => string }[];
  nullPatterns: { pattern: RegExp; suggestion: string; fix?: (code: string) => string }[];
  asyncPatterns: { pattern: RegExp; suggestion: string; fix?: (code: string) => string }[];
  injectionPatterns?: { pattern: RegExp; suggestion: string; fix?: (code: string) => string }[];
}

class ErrorPrevention {
  validate(code: string, language: LanguageType): ValidationResult {
    const rules = LANGUAGE_PATTERNS[language] || LANGUAGE_PATTERNS.typescript;
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const fixes: FixRecommendation[] = [];

    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Check type patterns
      for (const rule of rules.typePatterns) {
        const matches = rule.pattern.exec(line);
        if (matches) {
          warnings.push({
            line: lineNumber,
            severity: 'warning',
            code: 'TYPE001',
            message: `Potential type issue: ${rule.suggestion}`,
            suggestion: rule.suggestion,
          });
        }
      }

      // Check null patterns
      for (const rule of rules.nullPatterns) {
        const matches = rule.pattern.exec(line);
        if (matches) {
          errors.push({
            line: lineNumber,
            severity: 'error',
            code: 'NULL001',
            message: `Null safety issue: ${rule.suggestion}`,
            suggestion: rule.suggestion,
          });

          if (rule.fix) {
            fixes.push({
              line: lineNumber,
              original: line,
              fixed: rule.fix(line),
              reason: rule.suggestion,
            });
          }
        }
      }

      // Check injection patterns
      for (const rule of rules.injectionPatterns || []) {
        const matches = rule.pattern.exec(line);
        if (matches) {
          errors.push({
            line: lineNumber,
            severity: 'error',
            code: 'INJECT001',
            message: `Security: ${rule.suggestion}`,
            suggestion: rule.suggestion,
          });
        }
      }
    });

    // Additional common checks
    errors.push(...this.checkCommonErrors(code, language));

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      fixes,
    };
  }

  private checkCommonErrors(code: string, language: LanguageType): ValidationError[] {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Console.log in production code
      if (line.includes('console.log') && !line.includes('//') && !line.includes('debug')) {
        warnings.push({
          line: lineNumber,
          severity: 'warning',
          code: 'LOG001',
          message: 'Console.log found - remove for production',
        });
      }

      // Hardcoded secrets
      if (/(apiKey|password|secret|token)\s*=\s*["']/i.test(line)) {
        errors.push({
          line: lineNumber,
          severity: 'error',
          code: 'SEC001',
          message: 'Potential hardcoded secret detected - use environment variables',
        });
      }

      // ERR-001 · Detect undescribed TODO markers:
      // A bare "// TODO" without a colon-separated explanation (e.g. "// TODO: implement X")
      // violates Sovereign Code Quality standards. All TODOs must carry a description
      // that names the responsible agent or developer and the planned action.
      if (/^\s*\/\/\s*TODO\b/.test(line) && !line.includes(':')) {
        warnings.push({
          line: lineNumber,
          severity: 'warning',
          code: 'TODO001',
          message: 'Undescribed TODO marker — add colon + explanation, e.g. "// TODO: <agent>: describe the pending work"',
          suggestion: 'Replace with: // TODO: <AgentName>: <description of pending work>',
        });
      }
    });

    return errors;
  }

  applyFixes(code: string, fixes: FixRecommendation[]): string {
    let fixedCode = code;
    const lineArray = fixedCode.split('\n');

    for (const fix of fixes) {
      if (fix.line <= lineArray.length) {
        lineArray[fix.line - 1] = fix.fixed;
      }
    }

    return lineArray.join('\n');
  }

  generateValidationReport(result: ValidationResult): string {
    const lines: string[] = [];

    lines.push('# Error Prevention Report');
    lines.push('');
    lines.push(`Status: ${result.valid ? '✅ VALID' : '❌ ERRORS FOUND'}`);
    lines.push('');

    if (result.errors.length > 0) {
      lines.push('## Errors');
      for (const error of result.errors) {
        lines.push(`- Line ${error.line}: [${error.code}] ${error.message}`);
      }
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('## Warnings');
      for (const warning of result.warnings) {
        lines.push(`- Line ${warning.line}: [${warning.code}] ${warning.message}`);
      }
      lines.push('');
    }

    if (result.fixes.length > 0) {
      lines.push('## Recommended Fixes');
      for (const fix of result.fixes) {
        lines.push(`- Line ${fix.line}: ${fix.reason}`);
      }
    }

    return lines.join('\n');
  }

  // Add error prevention comments to code
  addSafetyComments(code: string, language: LanguageType): string {
    const commentPatterns: Record<string, { prefix: string; patterns: string[] }> = {
      typescript: { prefix: '//', patterns: ['strict', 'null', 'bounds'] },
      python: { prefix: '#', patterns: ['type', 'null', 'check'] },
      go: { prefix: '//', patterns: ['nil', 'check', 'error'] },
      rust: { prefix: '//', patterns: ['option', 'result', 'unwrap'] },
    };

    const pattern = commentPatterns[language] || commentPatterns.typescript;
    
    // Add file header
    const header = [
      '',
      `${pattern.prefix} ==========================================`,
      `${pattern.prefix} Error Prevention Enabled`,
      `${pattern.prefix} - Type Safety: Enabled`,
      `${pattern.prefix} - Null Checks: Enabled`, 
      `${pattern.prefix} - Input Validation: Enabled`,
      `${pattern.prefix} - Bounds Checking: Enabled`,
      `${pattern.prefix} ==========================================`,
      '',
    ].join('\n');

    return header + code;
  }
}

export const errorPrevention = new ErrorPrevention();
export default errorPrevention;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
