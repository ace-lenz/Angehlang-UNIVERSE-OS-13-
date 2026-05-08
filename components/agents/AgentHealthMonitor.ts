// Plan Item ID: TI-1
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'offline';

export interface AgentHealth {
  agentId: string;
  status: HealthStatus;
  lastSeen: number;
  uptime: number;
  restartCount: number;
  lastError?: string;
  metrics: {
    tasksProcessed: number;
    tasksFailed: number;
    avgLatency: number;
  };
}

type HealthCallback = (health: AgentHealth) => void;

class AgentHealthMonitor {
  private static instance: AgentHealthMonitor;
  
  private agentHealth: Map<string, AgentHealth> = new Map();
  private healthChecks: Map<string, number> = new Map();
  private heartbeatInterval: number | null = null;
  private listeners: HealthCallback[] = [];
  
  private heartbeatIntervalMs = 30000;
  private maxOfflineTimeMs = 120000;
  
  private constructor() {
    this.startHeartbeat();
  }
  
  public static getInstance(): AgentHealthMonitor {
    if (!AgentHealthMonitor.instance) {
      AgentHealthMonitor.instance = new AgentHealthMonitor();
    }
    return AgentHealthMonitor.instance;
  }
  
  public registerAgent(agentId: string): void {
    this.agentHealth.set(agentId, {
      agentId,
      status: 'healthy',
      lastSeen: Date.now(),
      uptime: Date.now(),
      restartCount: 0,
      metrics: { tasksProcessed: 0, tasksFailed: 0, avgLatency: 0 }
    });
    console.log(`[HealthMonitor] Registered agent: ${agentId}`);
  }
  
  public heartbeat(agentId: string, status?: HealthStatus): void {
    const health = this.agentHealth.get(agentId);
    if (health) {
      health.lastSeen = Date.now();
      if (status) health.status = status;
      this.healthChecks.set(agentId, Date.now());
      this.notifyListeners(health);
    }
  }
  
  public markTaskComplete(agentId: string, latency: number): void {
    const health = this.agentHealth.get(agentId);
    if (health) {
      health.metrics.tasksProcessed++;
      const total = health.metrics.avgLatency * (health.metrics.tasksProcessed - 1);
      health.metrics.avgLatency = (total + latency) / health.metrics.tasksProcessed;
    }
  }
  
  public markTaskFailed(agentId: string, error: string): void {
    const health = this.agentHealth.get(agentId);
    if (health) {
      health.metrics.tasksFailed++;
      health.lastError = error;
    }
  }
  
  public getHealth(agentId: string): AgentHealth | undefined {
    return this.agentHealth.get(agentId);
  }
  
  public getAllHealth(): AgentHealth[] {
    return Array.from(this.agentHealth.values());
  }
  
  public onHealthUpdate(callback: HealthCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }
  
  private notifyListeners(health: AgentHealth): void {
    this.listeners.forEach(cb => cb(health));
  }
  
  private startHeartbeat(): void {
    if (this.heartbeatInterval) return;
    
    this.heartbeatInterval = window.setInterval(() => {
      this.checkAgentHealth();
    }, this.heartbeatIntervalMs);
  }
  
  private checkAgentHealth(): void {
    const now = Date.now();
    
    this.agentHealth.forEach((health, agentId) => {
      const timeSinceLastSeen = now - health.lastSeen;
      
      if (timeSinceLastSeen > this.maxOfflineTimeMs) {
        health.status = 'offline';
        console.warn(`[HealthMonitor] Agent ${agentId} is OFFLINE`);
      } else if (timeSinceLastSeen > 60000) {
        health.status = 'unhealthy';
      } else if (health.metrics.tasksFailed > health.metrics.tasksProcessed * 0.1) {
        health.status = 'degraded';
      }
      
      this.notifyListeners(health);
    });
  }
  
  public attemptRecovery(agentId: string): boolean {
    const health = this.agentHealth.get(agentId);
    if (health && health.status === 'offline') {
      health.status = 'healthy';
      health.lastSeen = Date.now();
      health.restartCount++;
      health.uptime = Date.now();
      health.lastError = undefined;
      console.log(`[HealthMonitor] Recovered agent: ${agentId}`);
      return true;
    }
    return false;
  }
  
  public updateConfig(interval: number, maxOffline: number): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatIntervalMs = interval;
    this.maxOfflineTimeMs = maxOffline;
    this.startHeartbeat();
  }
}

export const agentHealthMonitor = AgentHealthMonitor.getInstance();
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
