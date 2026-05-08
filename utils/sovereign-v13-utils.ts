// Plan Item ID: TI-1
/**
 * sovereign-utils.ts - Comprehensive Utility Functions v13
 * 
 * Features:
 * - Type utilities
 * - String manipulation
 * - Date/time helpers
 * - Validation utilities
 * - Math helpers
 * - Color utilities
 * - Crypto utilities
 * - DOM utilities
 * - etc.
 */

// ============= Type Utilities =============
export type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] };
export type DeepRequired<T> = { [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P] };
export type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

export type ValueOf<T> = T[keyof T];
export type KeysOf<T> = keyof T;

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isType<T>(value: unknown, type: string): value is T {
  return typeof value === type;
}

export function assert(condition: boolean, message = 'Assertion failed'): asserts condition {
  if (!condition) throw new Error(message);
}

// ============= String Utilities =============
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function camelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
}

export function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
}

export function snakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toLowerCase();
}

export function truncate(str: string, length: number, suffix = '...'): string {
  return str.length > length ? str.slice(0, length - suffix.length) + suffix : str;
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function randomString(length: number, charset?: string): string {
  const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const chars = charset || defaultCharset;
  return Array(length).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function template(str: string, data: Record<string, any>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => data[k] ?? `{{${k}}}`);
}

// ============= Date/Time Utilities =============
export function formatDate(date: Date | number, format = 'YYYY-MM-DD'): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const map: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    MM: (d.getMonth() + 1).toString().padStart(2, '0'),
    DD: d.getDate().toString().padStart(2, '0'),
    HH: d.getHours().toString().padStart(2, '0'),
    mm: d.getMinutes().toString().padStart(2, '0'),
    ss: d.getSeconds().toString().padStart(2, '0')
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, m => map[m]);
}

export function timeAgo(date: Date | number): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

export function parseDate(str: string): Date | null {
  const date = new Date(str);
  return isNaN(date.getTime()) ? null : date;
}

// ============= Number Utilities =============
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function round(value: number, decimals = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function formatNumber(num: number, decimals = 0, separator = ','): string {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

// ============= Array Utilities =============
export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));
}

export function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function groupBy<T, K extends string | number>(arr: T[], key: (item: T) => K): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(arr: T[], key: (item: T) => number, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const aVal = key(a), bVal = key(b);
    return order === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });
}

// ============= Object Utilities =============
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T {
  for (const source of sources) {
    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceVal = source[key];
      const targetVal = target[key];
      if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal) && typeof targetVal === 'object') {
        target[key] = deepMerge((targetVal as any) || {}, sourceVal as any) as any;
      } else {
        target[key] = sourceVal as any;
      }
    }
  }
  return target;
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, k) => (k in obj && (acc[k] = obj[k]), acc), {} as Pick<T, K>);
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(k => delete result[k]);
  return result;
}

export function mapValues<T extends object, R>(obj: T, fn: (value: any, key: string) => R): Record<string, R> {
  const result: Record<string, R> = {};
  Object.keys(obj).forEach(key => {
    result[key] = fn((obj as any)[key], key);
  });
  return result;
}

// ============= Validation Utilities =============
export function isEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export function isUrl(str: string): boolean {
  try { new URL(str); return true; } catch { return false; }
}

export function isPhone(str: string): boolean {
  return /^[\d\s\-\+\(\)]{10,}$/.test(str);
}

export function isIP(str: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(str) || /^([a-f0-9]{1,4}:){7}[a-f0-9]{1,4}$/i.test(str);
}

export function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export function isJSON(str: string): boolean {
  try { JSON.parse(str); return true; } catch { return false; }
}

export function validatePassword(password: string): { valid: boolean; errors: string[]; strength: number } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('At least one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('At least one special character');
  
  const strength = 100 - (errors.length * 20);
  return { valid: errors.length === 0, errors, strength: Math.max(0, strength) };
}

// ============= Color Utilities =============
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * percent)),
    Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * percent)),
    Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * percent))
  );
}

export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    Math.max(0, Math.floor(rgb.r * (1 - percent))),
    Math.max(0, Math.floor(rgb.g * (1 - percent))),
    Math.max(0, Math.floor(rgb.b * (1 - percent)))
  );
}

export function getContrastColor(hex: string): 'black' | 'white' {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'black';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? 'black' : 'white';
}

// ============= Async Utilities =============
export async function retry<T>(fn: () => Promise<T>, attempts = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1) throw error;
    await new Promise(r => setTimeout(r, delay));
    return retry(fn, attempts - 1, delay * 2);
  }
}

export async function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let lastTime = 0;
  return ((...args: any[]) => {
    const now = Date.now();
    if (now - lastTime >= ms) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
}

// ============= CSS Utilities =============
export function classNames(...classes: (string | boolean | undefined | null | Record<string, boolean>)[]): string {
  return classes.filter(Boolean).map(c => {
    if (typeof c === 'string') return c;
    if (typeof c === 'object') return Object.entries(c).filter(([, v]) => v).map(([k]) => k).join(' ');
    return '';
  }).join(' ');
}

// ============= Export all =============
export const cn = classNames;
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
