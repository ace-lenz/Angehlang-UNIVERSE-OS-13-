// Plan Item ID: TI-1
/**
 * @angehlang/shared - Shared Utilities and QPPU Integration
 * 
 * This package exports:
 * - QPPU integration (qppu/)
 * - Storage utilities (storage/)
 * - Shared types (types/)
 * - Utility functions (utils/)
 */

// ========== QPPU Integration ==========
export { qppuEngine } from './qppu/QPPUCore';
export type { QPPUConfig, ANGHVFrame, QPPURequest, QPPUResponse } from './qppu/types';

// ========== Storage ==========
export { sovereignStorage } from './storage/SovereignStorage';
export type { StorageConfig, StorageEntry } from './storage/types';

// ========== Types ==========
export * from './types';

// ========== Utilities ==========
// export { cn, detectLanguage, formatBytes, debounce, throttle } from './utils';

// import { qppuEngine } from './qppu';
// import { storage } from './storage';

// export const create = {
//   qppu: qppuEngine,
//   storage
// };

// export default {
//   qppu: qppuEngine,
//   storage
// };
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
