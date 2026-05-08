/**
 * Storage Types
 */
export interface StorageConfig {
  driver?: string;
  maxSize?: number;
}

export interface StorageEntry {
  key: string;
  value: any;
  timestamp: number;
  expiresAt?: number;
}