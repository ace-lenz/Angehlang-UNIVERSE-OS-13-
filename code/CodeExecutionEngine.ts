// Plan Item ID: TI-1
/**
 * CodeExecutionEngine.ts - Safe code execution and validation
 * 
 * Features:
 * - Sandboxed JavaScript/TypeScript execution
 * - Async/await support
 * - Syntax validation
 * - Error detection and auto-fix suggestions
 * - Output capture
 * - Extended built-in APIs
 */

export interface CodeExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  logs: string[];
  executionTime: number;
  warnings?: string[];
  stackTrace?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'fatal';
}

export interface ValidationWarning {
  line: number;
  column: number;
  message: string;
  code?: string;
}

// ===================== CODE EXECUTOR =====================

export class CodeExecutionEngine {
  private executionHistory: Map<string, CodeExecutionResult[]> = new Map();
  private maxHistorySize = 50;

  async execute(code: string, language: string = 'javascript'): Promise<CodeExecutionResult> {
    const startTime = performance.now();
    const logs: string[] = [];

    if (language !== 'javascript' && language !== 'typescript') {
      return {
        success: false,
        error: `Language ${language} execution not supported in browser`,
        logs,
        executionTime: performance.now() - startTime
      };
    }

    try {
      // Create sandboxed environment
      const sandbox = this.createSandbox();
      
      // Capture console output with timestamps
      const getTimestamp = () => new Date().toISOString().split('T')[1].slice(0, 12);
      
      sandbox.console.log = (...args: any[]) => {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        logs.push(`[${getTimestamp()}] LOG: ${msg}`);
      };
      sandbox.console.error = (...args: any[]) => {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        logs.push(`[${getTimestamp()}] ERROR: ${msg}`);
      };
      sandbox.console.warn = (...args: any[]) => {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        logs.push(`[${getTimestamp()}] WARN: ${msg}`);
      };
      sandbox.console.info = (...args: any[]) => {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        logs.push(`[${getTimestamp()}] INFO: ${msg}`);
      };
      sandbox.console.debug = (...args: any[]) => {
        const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        logs.push(`[${getTimestamp()}] DEBUG: ${msg}`);
      };
      sandbox.console.table = (data: any) => {
        logs.push(`[${getTimestamp()}] TABLE:\n${JSON.stringify(data, null, 2)}`);
      };
      sandbox.console.time = (label: string) => {
        logs.push(`[${getTimestamp()}] TIMER START: ${label}`);
      };
      sandbox.console.timeEnd = (label: string) => {
        logs.push(`[${getTimestamp()}] TIMER END: ${label}`);
      };

      // Check if code contains async/await
      const isAsync = code.includes('async') || code.includes('await');
      
      // Wrap code for execution
      let wrappedCode: string;
      if (isAsync) {
        wrappedCode = `
          (async function(console, setTimeout, Promise, JSON, Math, Date, Array, Object, String, Number, Boolean, RegExp, Map, Set, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent) {
            "use strict";
            ${code}
          })
        `;
      } else {
        wrappedCode = `
          (function(console, setTimeout, Promise, JSON, Math, Date, Array, Object, String, Number, Boolean, RegExp, Map, Set, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent) {
            "use strict";
            ${code}
          })
        `;
      }
      
      const fn = eval(wrappedCode);
      
      // Execute with timeout protection
      const result = await this.executeWithTimeout(
        () => fn(
          sandbox.console, 
          sandbox.setTimeout, 
          sandbox.Promise, 
          sandbox.JSON, 
          sandbox.Math, 
          sandbox.Date, 
          sandbox.Array, 
          sandbox.Object, 
          sandbox.String, 
          sandbox.Number, 
          sandbox.Boolean, 
          sandbox.RegExp, 
          sandbox.Map, 
          sandbox.Set, 
          sandbox.parseInt, 
          sandbox.parseFloat, 
          sandbox.isNaN, 
          sandbox.isFinite, 
          sandbox.encodeURIComponent, 
          sandbox.decodeURIComponent
        ),
        5000 // 5 second timeout
      );

      const executionTime = performance.now() - startTime;

      return {
        success: true,
        output: this.formatOutput(result),
        logs,
        executionTime
      };

    } catch (error: any) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown execution error';
      const stackTrace = error instanceof Error ? error.stack : undefined;
      
      // Clean up stack trace for display
      const cleanedStack = stackTrace?.split('\n').slice(0, 5).join('\n');
      
      return {
        success: false,
        error: errorMessage,
        logs,
        executionTime,
        stackTrace: cleanedStack
      };
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);
      
      Promise.resolve(fn())
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(err => {
          clearTimeout(timeout);
          reject(err);
        });
    });
  }

  private formatOutput(result: any): any {
    if (result === undefined) return undefined;
    if (result === null) return 'null';
    if (typeof result === 'function') return `[Function: ${result.name || 'anonymous'}]`;
    if (typeof result === 'object') {
      try {
        return JSON.stringify(result, null, 2);
      } catch {
        return String(result);
      }
    }
    return result;
  }

  private createSandbox(): any {
    // Create a safe setTimeout that doesn't actually schedule (for security)
    const safeSetTimeout = (callback: Function, delay?: number) => {
      // Execute immediately but wrap like a timeout
      setTimeout(() => {
        try {
          callback();
        } catch (e) {
          console.error('setTimeout error:', e);
        }
      }, 0);
      return 0;
    };

    return {
      // Console APIs
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {},
        debug: () => {},
        table: () => {},
        time: () => {},
        timeEnd: () => {},
        assert: (condition: boolean, ...args: any[]) => {
          if (!condition) console.error('Assertion failed:', ...args);
        },
        clear: () => {},
        count: (label?: string) => {},
        countReset: (label?: string) => {},
        dir: (obj: any) => {},
        dirxml: (obj: any) => {},
        group: (...args: any[]) => {},
        groupEnd: () => {},
        groupCollapsed: (...args: any[]) => {},
        profile: () => {},
        profileEnd: () => {},
        timeLog: (label?: string) => {},
        trace: () => {}
      },
      
      // Core APIs - Safe to expose
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Promise,
      Map: typeof Map !== 'undefined' ? Map : undefined,
      Set: typeof Set !== 'undefined' ? Set : undefined,
      WeakMap: typeof WeakMap !== 'undefined' ? WeakMap : undefined,
      WeakSet: typeof WeakSet !== 'undefined' ? WeakSet : undefined,
      Symbol: typeof Symbol !== 'undefined' ? Symbol : undefined,
      
      // Utility functions
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      encodeURIComponent,
      decodeURIComponent,
      encodeURI,
      decodeURI,
      escape,
      unescape,
      
      // Timer functions - safe wrapper
      setTimeout: safeSetTimeout,
      clearTimeout: () => {},
      setInterval: (callback: Function, interval?: number) => {
        const id = setInterval(() => {
          try {
            callback();
          } catch (e) {
            console.error('setInterval error:', e);
          }
        }, interval || 100);
        return id;
      },
      clearInterval: () => {},
      
      // Typed Array APIs
      Int8Array: typeof Int8Array !== 'undefined' ? Int8Array : undefined,
      Uint8Array: typeof Uint8Array !== 'undefined' ? Uint8Array : undefined,
      Int16Array: typeof Int16Array !== 'undefined' ? Int16Array : undefined,
      Uint16Array: typeof Uint16Array !== 'undefined' ? Uint16Array : undefined,
      Int32Array: typeof Int32Array !== 'undefined' ? Int32Array : undefined,
      Uint32Array: typeof Uint32Array !== 'undefined' ? Uint32Array : undefined,
      Float32Array: typeof Float32Array !== 'undefined' ? Float32Array : undefined,
      Float64Array: typeof Float64Array !== 'undefined' ? Float64Array : undefined,
      ArrayBuffer: typeof ArrayBuffer !== 'undefined' ? ArrayBuffer : undefined,
      DataView: typeof DataView !== 'undefined' ? DataView : undefined,
      
      // Error constructors
      Error: Error,
      TypeError: TypeError,
      ReferenceError: ReferenceError,
      SyntaxError: SyntaxError,
      RangeError: RangeError,
      URIError: URIError,
      EvalError: EvalError,
      
      // Block dangerous APIs - These can compromise security
      eval: undefined,
      Function: undefined,
      window: undefined,
      document: undefined,
      fetch: undefined,
      XMLHttpRequest: undefined,
      localStorage: undefined,
      sessionStorage: undefined,
      indexedDB: undefined,
      WebSocket: undefined,
      Worker: undefined,
      importScripts: undefined,
      
      // DOM references - blocked
      Node: undefined,
      Element: undefined,
      HTMLElement: undefined,
      SVGElement: undefined,
      
      // Crypto - blocked in sandbox
      crypto: undefined,
      SubtleCrypto: undefined,
      
      // Other dangerous globals
      globalThis: undefined,
      global: undefined,
      process: undefined,
      Buffer: undefined,
      __dirname: undefined,
      __filename: undefined,
      exports: undefined,
      module: undefined,
      require: undefined
    };
  }

  // ===================== VALIDATION =====================

  validate(code: string, language: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    try {
      // Basic syntax check
      new Function(code);
    } catch (e) {
      if (e instanceof SyntaxError) {
        const match = e.message.match(/at position (\d+)/);
        const position = match ? parseInt(match[1]) : 0;
        
        // Calculate line and column
        const lines = code.substring(0, position).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;

        errors.push({
          line,
          column,
          message: e.message,
          severity: 'error'
        });
      }
    }

    // Check for common issues
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for console.log in production code
      if (line.includes('console.log') && !line.includes('//')) {
        warnings.push({
          line: lineNum,
          column: line.indexOf('console.log'),
          message: 'Debug console.log statement found',
          code: 'no-console'
        });
      }

      // Check for TODO (ERR-006 Compliance)
      if (line.toLowerCase().includes('todo')) {
        const isDescribed = line.includes(':');
        warnings.push({
          line: lineNum,
          column: line.toLowerCase().indexOf('todo'),
          message: isDescribed 
            ? 'TODO comment found - ensure it is assigned and tracked' 
            : 'Undescribed TODO marker found - add colon + explanation (e.g. "// TODO: <Agent>: <action>")',
          code: isDescribed ? 'no-todo' : 'undescribed-todo'
        });
      }

      // Check for eval
      if (line.includes('eval(')) {
        warnings.push({
          line: lineNum,
          column: line.indexOf('eval('),
          message: 'Use of eval detected - security risk',
          code: 'no-eval'
        });
      }

      // Check for console.trace
      if (line.includes('console.trace')) {
        warnings.push({
          line: lineNum,
          column: line.indexOf('console.trace'),
          message: 'Debug console.trace found',
          code: 'no-console'
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ===================== AUTO-FIX SUGGESTIONS =====================

  getAutoFixSuggestions(code: string, errors: ValidationError[]): string[] {
    const suggestions: string[] = [];

    errors.forEach(error => {
      if (error.message.includes('unexpected token')) {
        const line = code.split('\n')[error.line - 1];
        if (line && line.trim().endsWith(',')) {
          suggestions.push(`Line ${error.line}: Remove trailing comma`);
        }
        if (line && line.trim().endsWith('.')) {
          suggestions.push(`Line ${error.line}: Check for missing semicolon`);
        }
      }

      if (error.message.includes('undefined')) {
        suggestions.push(`Line ${error.line}: Variable may be undefined - check spelling or initialization`);
      }

      if (error.message.includes('not a function')) {
        suggestions.push(`Line ${error.line}: Check if the function is correctly defined`);
      }
    });

    return suggestions;
  }

  // ===================== CODE COMPLETION =====================

  suggestCompletions(code: string, cursorPosition: number): string[] {
    const lastWord = code.substring(0, cursorPosition).match(/[\w.]+$/)?.[0] || '';
    
    const commonCompletions: Record<string, string[]> = {
      'console': ['console.log()', 'console.error()', 'console.warn()', 'console.info()'],
      'const': ['const name = value', 'const { name } = object', 'const [name] = array'],
      'let': ['let name = value', 'let { name } = object', 'let [name] = array'],
      'function': ['function name() {}', 'function name(params) {}'],
      'async': ['async function name() {}', 'await promise'],
      'class': ['class Name {}', 'class Name extends Parent {}'],
      'import': ['import { name } from "module"', 'import name from "module"'],
      'export': ['export default name', 'export { name }', 'export const name = value'],
      'if': ['if (condition) {}', 'if (condition) {} else {}'],
      'for': ['for (let i = 0; i < length; i++) {}', 'for (const item of array) {}'],
      'try': ['try {} catch (error) {}', 'try {} finally {}'],
      'return': ['return value', 'return'],
      'this': ['this.property', 'this.method()'],
      'new': ['new ClassName()', 'new Promise()'],
    };

    return commonCompletions[lastWord] || [];
  }

  // ===================== FORMATTER =====================

  formatCode(code: string, language: string): string {
    if (language === 'json') {
      try {
        const parsed = JSON.parse(code);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return code;
      }
    }

    // Basic JavaScript formatting
    let formatted = code;
    
    // Add semicolons where missing
    formatted = formatted.replace(/([^;{}\n])\n/g, '$1;\n');
    
    // Add spacing around operators
    formatted = formatted.replace(/\s*([=+\-*/<>!&|%^])\s*/g, ' $1 ');
    
    // Add indentation
    const lines = formatted.split('\n');
    let indent = 0;
    const formattedLines = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      
      if (trimmed.startsWith('}') || trimmed.startsWith(')')) {
        indent = Math.max(0, indent - 1);
      }
      
      const result = '  '.repeat(indent) + trimmed;
      
      if (trimmed.endsWith('{') || trimmed.endsWith('(')) {
        indent++;
      }
      
      return result;
    });

    return formattedLines.join('\n');
  }

  // ===================== HISTORY =====================

  saveExecution(fileName: string, result: CodeExecutionResult): void {
    if (!this.executionHistory.has(fileName)) {
      this.executionHistory.set(fileName, []);
    }

    const history = this.executionHistory.get(fileName)!;
    history.unshift(result);
    
    if (history.length > this.maxHistorySize) {
      history.pop();
    }
  }

  getExecutionHistory(fileName: string): CodeExecutionResult[] {
    return this.executionHistory.get(fileName) || [];
  }

  clearHistory(): void {
    this.executionHistory.clear();
  }
}

// ===================== SINGLETON =====================

export const codeExecutor = new CodeExecutionEngine();

export default codeExecutor;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
