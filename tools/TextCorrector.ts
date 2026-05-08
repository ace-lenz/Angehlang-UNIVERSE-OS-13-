/**
 * TextCorrector.ts — v6.0
 * Automatic text correction pipeline for AI-generated output.
 * Detects and fixes common issues: double spaces, unclosed brackets,
 * markdown formatting errors, inconsistent capitalization, etc.
 */

export interface CorrectionDiff {
  original: string;
  corrected: string;
  changes: CorrectionChange[];
}

export interface CorrectionChange {
  type: string;
  description: string;
  from?: string;
  to?: string;
}

class TextCorrector {
  /** Run all corrections and return the diff */
  correct(text: string): CorrectionDiff {
    const changes: CorrectionChange[] = [];
    let result = text;

    // 1. Normalize line endings
    const r1 = result.replace(/\r\n/g, '\n');
    if (r1 !== result) changes.push({ type: 'line_endings', description: 'Normalized CRLF to LF' });
    result = r1;

    // 2. Remove trailing spaces on each line
    const r2 = result.replace(/[ \t]+$/gm, '');
    if (r2 !== result) changes.push({ type: 'trailing_space', description: 'Removed trailing whitespace' });
    result = r2;

    // 3. Collapse multiple blank lines to max 2
    const r3 = result.replace(/\n{3,}/g, '\n\n');
    if (r3 !== result) changes.push({ type: 'blank_lines', description: 'Collapsed excessive blank lines' });
    result = r3;

    // 4. Double spaces in prose (not in code blocks)
    const r4 = this.fixOutsideCodeBlocks(result, (s) => s.replace(/  +/g, ' '));
    if (r4 !== result) changes.push({ type: 'double_space', description: 'Fixed double spaces in prose' });
    result = r4;

    // 5. Fix unclosed markdown bold/italic
    const boldCount = (result.match(/\*\*/g) ?? []).length;
    if (boldCount % 2 !== 0) {
      result += '**';
      changes.push({ type: 'markdown_bold', description: 'Closed unclosed bold marker (**)', from: '', to: '**' });
    }

    // 6. Fix unclosed inline code backticks (outside blocks)
    const backtickCount = (result.match(/(?<!`)`(?!`)/g) ?? []).length;
    if (backtickCount % 2 !== 0) {
      result += '`';
      changes.push({ type: 'markdown_code', description: 'Closed unclosed inline code backtick' });
    }

    // 7. Ensure single space after sentence-ending punctuation (outside code)
    const r7 = this.fixOutsideCodeBlocks(result, (s) =>
      s.replace(/([.!?])([A-Z])/g, '$1 $2')
    );
    if (r7 !== result) changes.push({ type: 'sentence_spacing', description: 'Added space after sentence-ending punctuation' });
    result = r7;

    // 8. Fix common word typos
    const TYPOS: [RegExp, string][] = [
      [/\bteh\b/gi, 'the'],
      [/\badn\b/gi, 'and'],
      [/\bfro\b(?!\w)/gi, 'for'],
      [/\brecieve\b/gi, 'receive'],
      [/\boccured\b/gi, 'occurred'],
      [/\bseperate\b/gi, 'separate'],
    ];
    TYPOS.forEach(([pattern, replacement]) => {
      const r = result.replace(pattern, replacement);
      if (r !== result) {
        changes.push({ type: 'typo', description: `Auto-corrected typo`, from: String(pattern), to: replacement });
        result = r;
      }
    });

    return { original: text, corrected: result, changes };
  }

  /** Apply a transform only outside code blocks */
  private fixOutsideCodeBlocks(text: string, fn: (s: string) => string): string {
    const parts = text.split(/(```[\s\S]*?```|`[^`]+`)/g);
    return parts.map((part, i) => {
      // Even indices are outside code blocks, odd are code blocks
      return i % 2 === 0 ? fn(part) : part;
    }).join('');
  }

  /** Quick single-pass apply (no diff) */
  apply(text: string): string {
    return this.correct(text).corrected;
  }

  /** Summary of what was changed */
  summarize(diff: CorrectionDiff): string {
    if (diff.changes.length === 0) return '✓ No corrections needed.';
    return `Applied ${diff.changes.length} correction(s): ${diff.changes.map(c => c.description).join('; ')}.`;
  }
}

export const textCorrector = new TextCorrector();
