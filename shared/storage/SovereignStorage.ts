/**
 * Sovereign Storage - Placeholder
 */
export const sovereignStorage = {
  get: async (key: string) => null,
  set: async (key: string, value: any) => {},
  delete: async (key: string) => {},
};

export interface StorageConfig {
  driver?: string;
}

export interface StorageEntry {
  key: string;
  value: any;
  timestamp: number;
}