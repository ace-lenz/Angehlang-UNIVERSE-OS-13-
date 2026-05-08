/**
 * sovereign-utils.ts
 *
 * Centralized utility functions for the Angehlang Universe OS ecosystem.
 */

/**
 * Standardizes language detection based on file extension
 */
export const detectLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescript',
    js: 'javascript',
    jsx: 'javascript',
    py: 'python',
    css: 'css',
    html: 'html',
    json: 'json',
    rs: 'rust',
    go: 'go',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'sh',
    md: 'markdown',
    angeh: 'angehlang',
  };
  return map[ext] || 'text';
};

/**
 * Formats byte size into human-readable strings
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Nano-debounce for performance-critical UI updates
 */
export const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): ((...args: Parameters<T>) => void) => {
  let timeout: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) window.clearTimeout(timeout);
    timeout = window.setTimeout(() => fn(...args), delay);
  };
};

/**
 * Standardizes timestamp formatting for the OS log
 */
export const formatTimestamp = (ts?: number | string): string => {
  const date = ts ? new Date(ts) : new Date();
  return date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

/**
 * Lightweight class name joiner
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
