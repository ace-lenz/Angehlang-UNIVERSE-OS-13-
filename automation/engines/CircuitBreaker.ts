/**
 * Circuit Breaker - Production resilience for automation
 * 
 * Prevents cascading failures by opening circuit when failures exceed threshold
 * States: CLOSED (normal) -> OPEN (blocked) -> HALF_OPEN (testing)
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
  monitoredOperations: string[];
}

export interface CircuitMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  averageResponseTime: number;
}

export interface CircuitRecord {
  operation: string;
  startTime: number;
  endTime?: number;
  success?: boolean;
  error?: string;
}

// ===================== CIRCUIT BREAKER =====================

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private config: CircuitConfig;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number = 0;
  private lastSuccessTime: number = 0;
  private nextAttempt: number = 0;
  private records: CircuitRecord[] = [];
  private responseTimes: number[] = [];
  private metrics: CircuitMetrics = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    rejectedCalls: 0,
    lastFailureTime: 0,
    lastSuccessTime: 0,
    averageResponseTime: 0
  };

  constructor(config: Partial<CircuitConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 3,
      timeout: config.timeout || 30000,
      resetTimeout: config.resetTimeout || 60000,
      monitoredOperations: config.monitoredOperations || ['default']
    };
  }

  // ===================== EXECUTE =====================

  async execute<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      this.metrics.rejectedCalls++;
      throw new Error(`Circuit breaker is OPEN for operation: ${operation}`);
    }

    const record: CircuitRecord = {
      operation,
      startTime: Date.now()
    };

    this.metrics.totalCalls++;

    try {
      const result = await Promise.race([
        fn(),
        this.createTimeoutPromise(this.config.timeout)
      ]);

      record.endTime = Date.now();
      record.success = true;
      this.onSuccess(record);

      return result as T;

    } catch (error) {
      record.endTime = Date.now();
      record.success = false;
      record.error = error instanceof Error ? error.message : 'Unknown error';
      this.onFailure(record);

      throw error;
    }
  }

  private createTimeoutPromise<T>(timeout: number): Promise<T> {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeout)
    );
  }

  // ===================== STATE MANAGEMENT =====================

  private canExecute(): boolean {
    switch (this.state) {
      case 'closed':
        return true;
      
      case 'open':
        if (Date.now() >= this.nextAttempt) {
          this.state = 'half-open';
          this.successes = 0;
          console.log('[CircuitBreaker] State: CLOSED -> HALF_OPEN');
          return true;
        }
        return false;
      
      case 'half-open':
        return true;
      
      default:
        return false;
    }
  }

  private onSuccess(record: CircuitRecord): void {
    this.failures = 0;
    this.successes++;
    this.lastSuccessTime = Date.now();

    // Track response time
    if (record.endTime && record.startTime) {
      const duration = record.endTime - record.startTime;
      this.responseTimes.push(duration);
      if (this.responseTimes.length > 100) this.responseTimes.shift();
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }

    this.metrics.successfulCalls++;

    // Check if we can close the circuit
    if (this.state === 'half-open' && this.successes >= this.config.successThreshold) {
      this.state = 'closed';
      console.log('[CircuitBreaker] State: HALF_OPEN -> CLOSED');
    }

    this.addRecord(record);
  }

  private onFailure(record: CircuitRecord): void {
    this.failures++;
    this.successes = 0;
    this.lastFailureTime = Date.now();
    this.metrics.failedCalls++;
    this.metrics.lastFailureTime = this.lastFailureTime;

    // Check if we should open the circuit
    if (this.state === 'closed' && this.failures >= this.config.failureThreshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.config.resetTimeout;
      console.log(`[CircuitBreaker] State: CLOSED -> OPEN (failures: ${this.failures})`);
    }

    // Reset half-open on failure
    if (this.state === 'half-open') {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.config.resetTimeout;
      console.log('[CircuitBreaker] State: HALF_OPEN -> OPEN (failure)');
    }

    this.addRecord(record);
  }

  private addRecord(record: CircuitRecord): void {
    this.records.push(record);
    if (this.records.length > 1000) {
      this.records = this.records.slice(-500);
    }
  }

  // ===================== MANUAL CONTROL =====================

  forceOpen(): void {
    this.state = 'open';
    this.nextAttempt = Date.now() + this.config.resetTimeout;
    console.log('[CircuitBreaker] Force OPEN');
  }

  forceClosed(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    console.log('[CircuitBreaker] Force CLOSED');
  }

  forceHalfOpen(): void {
    this.state = 'half-open';
    this.successes = 0;
    console.log('[CircuitBreaker] Force HALF_OPEN');
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.records = [];
    this.responseTimes = [];
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      lastFailureTime: 0,
      lastSuccessTime: 0,
      averageResponseTime: 0
    };
    console.log('[CircuitBreaker] Reset');
  }

  // ===================== STATUS =====================

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): CircuitMetrics {
    return { ...this.metrics };
  }

  getHealth(): { healthy: boolean; state: CircuitState; reason: string } {
    if (this.state === 'open') {
      const timeUntilRetry = Math.max(0, this.nextAttempt - Date.now());
      return {
        healthy: false,
        state: this.state,
        reason: `Open, retry in ${Math.ceil(timeUntilRetry / 1000)}s`
      };
    }

    const failureRate = this.metrics.totalCalls > 0 
      ? (this.metrics.failedCalls / this.metrics.totalCalls) * 100 
      : 0;

    if (failureRate > 80) {
      return {
        healthy: false,
        state: this.state,
        reason: `High failure rate: ${failureRate.toFixed(1)}%`
      };
    }

    return {
      healthy: true,
      state: this.state,
      reason: 'Operating normally'
    };
  }

  getRecentRecords(limit: number = 20): CircuitRecord[] {
    return this.records.slice(-limit);
  }

  getOperationStats(operation: string): { calls: number; failures: number; avgTime: number } {
    const opRecords = this.records.filter(r => r.operation === operation);
    const times = opRecords.filter(r => r.endTime).map(r => r.endTime! - r.startTime);
    
    return {
      calls: opRecords.length,
      failures: opRecords.filter(r => !r.success).length,
      avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
    };
  }
}

// ===================== CIRCUIT BREAKER REGISTRY =====================

class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  get(operation: string, config?: Partial<CircuitConfig>): CircuitBreaker {
    if (!this.breakers.has(operation)) {
      this.breakers.set(operation, new CircuitBreaker(config));
    }
    return this.breakers.get(operation)!;
  }

  getAll(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  getAllHealth(): Array<{ operation: string; health: { healthy: boolean; state: CircuitState; reason: string } }> {
    return Array.from(this.breakers.entries()).map(([op, cb]) => ({
      operation: op,
      health: cb.getHealth()
    }));
  }

  resetAll(): void {
    this.breakers.forEach(cb => cb.reset());
  }

  getAllMetrics(): Record<string, CircuitMetrics> {
    const metrics: Record<string, CircuitMetrics> = {};
    this.breakers.forEach((cb, op) => {
      metrics[op] = cb.getMetrics();
    });
    return metrics;
  }
}

// ===================== SINGLETON =====================

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

export const defaultCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  resetTimeout: 60000
});

export default circuitBreakerRegistry;