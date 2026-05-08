// Plan Item ID: TI-1
/**
 * SyntaxHighlighter.ts — Sovereign Photonic Highlighting Engine
 * 
 * A lightweight, regex-based syntax highlighter for the Angehlang Universe OS.
 * Designed for speed and zero-latency UI rendering.
 */

export interface Token {
  type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'text' | 'operator' | 'class';
  value: string;
}

const LANGUAGES: Record<string, {
  keywords: RegExp;
  functions: RegExp;
  classes: RegExp;
  strings: RegExp;
  numbers: RegExp;
  comments: RegExp;
  operators: RegExp;
}> = {
  typescript: {
    keywords: /\b(const|let|var|function|async|await|return|if|else|for|while|import|export|from|class|extends|implements|interface|type|enum|new|this|try|catch|finally|throw|default|case|switch|break|continue|yield|public|private|protected|static|readonly|async|await|true|false|null|undefined|any|string|number|boolean|void)\b/g,
    functions: /\b([a-zA-Z_]\w*)(?=\s*\()/g,
    classes: /\b([A-Z]\w*)\b/g,
    strings: /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g,
    numbers: /\b\d+(\.\d+)?\b/g,
    comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
    operators: /[+\-*\/=<>!&|?:]+/g
  },
  javascript: {
    keywords: /\b(const|let|var|function|async|await|return|if|else|for|while|import|export|from|class|extends|new|this|try|catch|finally|throw|default|case|switch|break|continue|yield|true|false|null|undefined)\b/g,
    functions: /\b([a-zA-Z_]\w*)(?=\s*\()/g,
    classes: /\b([A-Z]\w*)\b/g,
    strings: /(['"`])(?:(?!\1)[^\\]|\\.)*\1/g,
    numbers: /\b\d+(\.\d+)?\b/g,
    comments: /(\/\/.*|\/\*[\s\S]*?\*\/)/g,
    operators: /[+\-*\/=<>!&|?:]+/g
  },
  css: {
    keywords: /(@[a-zA-Z\-]+|!important)/g,
    functions: /\b([a-zA-Z\-]+)(?=\()/g,
    classes: /(\.[a-zA-Z\-]+|#[a-zA-Z\-]+)/g,
    strings: /(['"])(?:(?!\1)[^\\]|\\.)*\1/g,
    numbers: /\b\d+(\.\d+)?(px|rem|em|%|vh|vw|s|ms)?\b/g,
    comments: /(\/\*[\s\S]*?\*\/)/g,
    operators: /[:;{},]+/g
  }
};

export function highlightCode(code: string, lang: string = 'typescript'): Token[] {
  const rules = LANGUAGES[lang] || LANGUAGES.typescript;
  const tokens: Token[] = [];
  
  // Combine all patterns into one for single-pass matching
  const patterns = [
    { type: 'comment', regex: rules.comments },
    { type: 'string', regex: rules.strings },
    { type: 'keyword', regex: rules.keywords },
    { type: 'function', regex: rules.functions },
    { type: 'class', regex: rules.classes },
    { type: 'number', regex: rules.numbers },
    { type: 'operator', regex: rules.operators }
  ];

  let lastIndex = 0;
  const allMatches: { type: string; start: number; end: number; value: string }[] = [];

  patterns.forEach(({ type, regex }) => {
    let match;
    regex.lastIndex = 0;
    while ((match = regex.exec(code)) !== null) {
      allMatches.push({ type, start: match.index, end: match.index + match[0].length, value: match[0] });
    }
  });

  // Sort matches by start index
  allMatches.sort((a, b) => a.start - b.start);

  // Filter overlapping matches (e.g. keyword inside string)
  const filteredMatches: typeof allMatches = [];
  let currentEnd = 0;
  for (const match of allMatches) {
    if (match.start >= currentEnd) {
      filteredMatches.push(match);
      currentEnd = match.end;
    }
  }

  // Fill in the 'text' tokens
  filteredMatches.forEach(match => {
    if (match.start > lastIndex) {
      tokens.push({ type: 'text', value: code.substring(lastIndex, match.start) });
    }
    tokens.push({ type: match.type as any, value: match.value });
    lastIndex = match.end;
  });

  if (lastIndex < code.length) {
    tokens.push({ type: 'text', value: code.substring(lastIndex) });
  }

  return tokens;
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
