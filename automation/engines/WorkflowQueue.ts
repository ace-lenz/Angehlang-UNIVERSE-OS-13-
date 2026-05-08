/**
 * Queue System - High-volume execution support
 * Handles large numbers of workflow executions with priority queuing
 */

import { ExecutionContext } from '../types';

// ===================== QUEUE TYPES =====================

export type QueuePriority = 'critical' | 'high' | 'normal' | 'low';

export interface QueuedItem {
  id: string;
  workflowId: string;
  input: Record<string, any>;
  priority: QueuePriority;
  enqueuedAt: number;
  scheduledAt?: number;
  attempts: number;
  maxAttempts: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'dead';
}

export interface QueueStats {
  totalProcessed: number;
  currentlyQueued: number;
  currentlyProcessing: number;
  averageWaitTime: number;
  averageProcessTime: number;
  successRate: number;
  failureRate: number;
}

export interface QueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  defaultPriority: QueuePriority;
  defaultTimeout: number;
  deadLetterMaxAttempts: number;
  retryDelay: number;
  backoffMultiplier: number;
}

// ===================== PRIORITY COMPARATOR =====================

function comparePriority(a: QueuePriority, b: QueuePriority): number {
  const weights: Record<QueuePriority, number> = {
    critical: 4,
    high: 3,
    normal: 2,
    low: 1
  };
  return weights[b] - weights[a];
}

// ===================== WORKFLOW QUEUE =====================

export class WorkflowQueue {
  private queue: QueuedItem[] = [];
  private processing: Map<string, QueuedItem> = new Map();
  private completed: Map<string, any> = new Map();
  private failed: Map<string, any> = new Map();
  private config: QueueConfig;
  private workers: Map<string, (item: QueuedItem) => Promise<any>> = new Map();
  private stats = {
    totalProcessed: 0,
    totalSuccess: 0,
    totalFailed: 0,
    waitTimes: [] as number[],
    processTimes: [] as number[]
  };

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 10,
      maxQueueSize: config.maxQueueSize || 1000,
      defaultPriority: config.defaultPriority || 'normal',
      defaultTimeout: config.defaultTimeout || 300000,
      deadLetterMaxAttempts: config.deadLetterMaxAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      backoffMultiplier: config.backoffMultiplier || 2
    };
  }

  // ===================== ENQUEUE =====================

  enqueue(
    workflowId: string, 
    input: Record<string, any> = {},
    priority: QueuePriority = this.config.defaultPriority
  ): string {
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error('Queue is full');
    }

    const item: QueuedItem = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      workflowId,
      input,
      priority,
      enqueuedAt: Date.now(),
      attempts: 0,
      maxAttempts: this.config.deadLetterMaxAttempts,
      status: 'queued'
    };

    // Insert based on priority
    const insertIndex = this.queue.findIndex(i => 
      comparePriority(i.priority, priority) > 0
    );
    
    if (insertIndex === -1) {
      this.queue.push(item);
    } else {
      this.queue.splice(insertIndex, 0, item);
    }

    this.processNext();
    return item.id;
  }

  // ===================== DEQUEUE =====================

  private dequeue(): QueuedItem | null {
    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      if (item.status === 'dead') {
        this.failed.set(item.id, item);
        continue;
      }

      return item;
    }
    return null;
  }

  // ===================== PROCESS =====================

  private async processNext(): Promise<void> {
    if (this.processing.size >= this.config.maxConcurrent) {
      return;
    }

    const item = this.dequeue();
    if (!item) return;

    const worker = this.workers.get(item.workflowId);
    if (!worker) {
      console.warn(`[Queue] No worker registered for workflow: ${item.workflowId}`);
      return;
    }

    item.status = 'processing';
    item.attempts++;
    this.processing.set(item.id, item);

    const startTime = Date.now();
    const waitTime = startTime - item.enqueuedAt;
    this.stats.waitTimes.push(waitTime);
    if (this.stats.waitTimes.length > 100) this.stats.waitTimes.shift();

    try {
      const result = await Promise.race([
        worker(item),
        this.createTimeoutPromise(this.config.defaultTimeout)
      ]);

      const processTime = Date.now() - startTime;
      this.stats.processTimes.push(processTime);
      if (this.stats.processTimes.length > 100) this.stats.processTimes.shift();

      item.status = 'completed';
      this.completed.set(item.id, result);
      this.stats.totalProcessed++;
      this.stats.totalSuccess++;
      
      console.log(`[Queue] Item ${item.id} completed in ${processTime}ms`);

    } catch (error) {
      item.status = 'failed';
      this.failed.set(item.id, { error: error instanceof Error ? error.message : 'Unknown error' });
      this.stats.totalProcessed++;
      this.stats.totalFailed++;

      console.error(`[Queue] Item ${item.id} failed:`, error);

      // Retry logic
      if (item.attempts < item.maxAttempts) {
        const delay = this.config.retryDelay * Math.pow(this.config.backoffMultiplier, item.attempts - 1);
        setTimeout(() => {
          item.status = 'queued';
          this.queue.push(item);
          this.processNext();
        }, delay);
      } else {
        item.status = 'dead';
        console.error(`[Queue] Item ${item.id} moved to dead letter after ${item.maxAttempts} attempts`);
      }
    }

    this.processing.delete(item.id);
    this.processNext();
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Execution timeout')), timeout)
    );
  }

  // ===================== WORKER REGISTRATION =====================

  registerWorker(workflowId: string, worker: (item: QueuedItem) => Promise<any>): void {
    this.workers.set(workflowId, worker);
  }

  unregisterWorker(workflowId: string): void {
    this.workers.delete(workflowId);
  }

  // ===================== QUEUE OPERATIONS =====================

  getStatus(itemId: string): QueuedItem | null {
    return (
      this.queue.find(i => i.id === itemId) ||
      this.processing.get(itemId) ||
      this.completed.get(itemId) ||
      this.failed.get(itemId) ||
      null
    );
  }

  getQueueItems(): QueuedItem[] {
    return [...this.queue];
  }

  getProcessingItems(): QueuedItem[] {
    return Array.from(this.processing.values());
  }

  getCompletedItems(limit: number = 50): any[] {
    const items = Array.from(this.completed.entries())
      .slice(-limit)
      .map(([id, result]) => ({ id, result }));
    return items.reverse();
  }

  getFailedItems(limit: number = 50): any[] {
    const items = Array.from(this.failed.entries())
      .slice(-limit)
      .map(([id, error]) => ({ id, error }));
    return items.reverse();
  }

  cancel(itemId: string): boolean {
    const index = this.queue.findIndex(i => i.id === itemId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    
    const processing = this.processing.get(itemId);
    if (processing) {
      processing.status = 'dead';
      this.processing.delete(itemId);
      return true;
    }

    return false;
  }

  retry(itemId: string): boolean {
    const failed = this.failed.get(itemId);
    if (failed) {
      const item: QueuedItem = {
        ...failed,
        id: itemId,
        status: 'queued',
        attempts: 0,
        enqueuedAt: Date.now()
      };
      this.queue.push(item);
      this.failed.delete(itemId);
      this.processNext();
      return true;
    }
    return false;
  }

  clear(): void {
    this.queue = [];
    this.processing.clear();
    console.log('[Queue] Cleared all queued items');
  }

  // ===================== STATISTICS =====================

  getStats(): QueueStats {
    const avgWaitTime = this.stats.waitTimes.length > 0
      ? this.stats.waitTimes.reduce((a, b) => a + b, 0) / this.stats.waitTimes.length
      : 0;

    const avgProcessTime = this.stats.processTimes.length > 0
      ? this.stats.processTimes.reduce((a, b) => a + b, 0) / this.stats.processTimes.length
      : 0;

    return {
      totalProcessed: this.stats.totalProcessed,
      currentlyQueued: this.queue.length,
      currentlyProcessing: this.processing.size,
      averageWaitTime: avgWaitTime,
      averageProcessTime: avgProcessTime,
      successRate: this.stats.totalProcessed > 0 
        ? (this.stats.totalSuccess / this.stats.totalProcessed) * 100 
        : 0,
      failureRate: this.stats.totalProcessed > 0 
        ? (this.stats.totalFailed / this.stats.totalProcessed) * 100 
        : 0
    };
  }

  // ===================== PRIORITY UPDATE =====================

  updatePriority(itemId: string, priority: QueuePriority): boolean {
    const item = this.queue.find(i => i.id === itemId);
    if (item) {
      item.priority = priority;
      // Re-sort queue
      this.queue.sort((a, b) => comparePriority(a.priority, b.priority));
      return true;
    }
    return false;
  }

  // ===================== BULK OPERATIONS =====================

  bulkEnqueue(items: Array<{ workflowId: string; input: Record<string, any>; priority?: QueuePriority }>): string[] {
    return items.map(item => this.enqueue(item.workflowId, item.input, item.priority));
  }

  bulkCancel(itemIds: string[]): number {
    let cancelled = 0;
    itemIds.forEach(id => {
      if (this.cancel(id)) cancelled++;
    });
    return cancelled;
  }
}

// ===================== SINGLETON INSTANCE =====================

export const workflowQueue = new WorkflowQueue();

export default workflowQueue;