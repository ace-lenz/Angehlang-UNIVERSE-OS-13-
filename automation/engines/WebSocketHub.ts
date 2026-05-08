/**
 * WebSocket Hub - Real-time communication for automation
 * 
 * Features:
 * - Real-time workflow execution updates
 * - Live node status streaming
 * - Event broadcasting for neural triggers
 * - Connection health monitoring
 * - Auto-reconnection with exponential backoff
 */

import { ExecutionContext } from '../types';

export type WSMessageType = 
  | 'execution_start'
  | 'execution_progress'
  | 'execution_complete'
  | 'execution_error'
  | 'node_status'
  | 'node_complete'
  | 'node_error'
  | 'trigger_fired'
  | 'heartbeat'
  | 'connection_status'
  | 'workflow_update'
  | 'metric_update';

export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: number;
  executionId?: string;
  nodeId?: string;
  workflowId?: string;
}

export interface WSConnectionConfig {
  url: string;
  autoReconnect: boolean;
  reconnectInterval: number;
  reconnectMaxAttempts: number;
  heartbeatInterval: number;
  bufferSize: number;
}

export interface ConnectionState {
  connected: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
  lastMessage: number;
  buffer: WSMessage[];
}

// ===================== WEBOCKET HUB =====================

export class WebSocketHub {
  private ws: WebSocket | null = null;
  private config: WSConnectionConfig;
  private state: ConnectionState = {
    connected: false,
    reconnectAttempts: 0,
    lastHeartbeat: 0,
    lastMessage: 0,
    buffer: []
  };
  private handlers: Map<WSMessageType, Set<(msg: WSMessage) => void>> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private eventSource: EventSource | null = null;

  constructor(config: Partial<WSConnectionConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8080/ws',
      autoReconnect: config.autoReconnect ?? true,
      reconnectInterval: config.reconnectInterval || 1000,
      reconnectMaxAttempts: config.reconnectMaxAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      bufferSize: config.bufferSize || 100
    };

    this.initEventSource();
  }

  // ===================== EVENT SOURCE (Server-Sent Events) =====================

  private initEventSource(): void {
    if (typeof window === 'undefined') return;

    try {
      this.eventSource = new EventSource('/api/automation/events');
      
      this.eventSource.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('[WSHub] Failed to parse event:', e);
        }
      };

      this.eventSource.onerror = () => {
        console.warn('[WSHub] EventSource connection lost');
        this.state.connected = false;
        if (this.config.autoReconnect) {
          this.scheduleReconnect();
        }
      };

      this.eventSource.onopen = () => {
        console.log('[WSHub] EventSource connected');
        this.state.connected = true;
        this.state.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      // Setup event type listeners
      const eventTypes: WSMessageType[] = [
        'execution_start', 'execution_progress', 'execution_complete', 'execution_error',
        'node_status', 'node_complete', 'node_error', 'trigger_fired', 'heartbeat',
        'connection_status', 'workflow_update', 'metric_update'
      ];

      eventTypes.forEach(type => {
        const listener = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === type) {
              this.handleMessage(data);
            }
          } catch (e) {}
        };
        // @ts-ignore
        this.eventSource?.addEventListener(type, listener);
      });

    } catch (e) {
      console.warn('[WSHub] EventSource not available, falling back to polling');
    }
  }

  // ===================== WEBSOCKET =====================

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('[WSHub] WebSocket connected');
          this.state.connected = true;
          this.state.reconnectAttempts = 0;
          this.flushBuffer();
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            console.error('[WSHub] Failed to parse message:', e);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WSHub] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WSHub] WebSocket disconnected');
          this.state.connected = false;
          this.stopHeartbeat();
          
          if (this.config.autoReconnect && this.state.reconnectAttempts < this.config.reconnectMaxAttempts) {
            this.scheduleReconnect();
          }
        };

      } catch (e) {
        reject(e);
      }
    });
  }

  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.state.connected = false;
    console.log('[WSHub] Disconnected');
  }

  // ===================== MESSAGE HANDLING =====================

  private handleMessage(message: WSMessage): void {
    this.state.lastMessage = Date.now();
    this.state.buffer.push(message);

    if (this.state.buffer.length > this.config.bufferSize) {
      this.state.buffer.shift();
    }

    if (message.type === 'heartbeat') {
      this.state.lastHeartbeat = Date.now();
    }

    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (e) {
          console.error('[WSHub] Handler error:', e);
        }
      });
    }

    // Also call wildcard handlers
    const wildcardHandlers = this.handlers.get('*' as any);
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(message));
    }
  }

  send(message: WSMessage): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }

    // Buffer if not connected
    this.state.buffer.push(message);
    return false;
  }

  private flushBuffer(): void {
    while (this.state.buffer.length > 0) {
      const message = this.state.buffer.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  // ===================== SUBSCRIPTION =====================

  subscribe(type: WSMessageType, handler: (msg: WSMessage) => void): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  subscribeToExecution(executionId: string, handler: (msg: WSMessage) => void): () => void {
    return this.subscribe('execution_progress', (msg) => {
      if (msg.executionId === executionId) {
        handler(msg);
      }
    });
  }

  subscribeToWorkflow(workflowId: string, handler: (msg: WSMessage) => void): () => void {
    return this.subscribe('workflow_update', (msg) => {
      if (msg.workflowId === workflowId) {
        handler(msg);
      }
    });
  }

  // ===================== RECONNECTION =====================

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.state.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.state.reconnectAttempts - 1);
    
    console.log(`[WSHub] Reconnecting in ${delay}ms (attempt ${this.state.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(() => {
        if (this.state.reconnectAttempts < this.config.reconnectMaxAttempts) {
          this.scheduleReconnect();
        }
      });
    }, delay);
  }

  // ===================== HEARTBEAT =====================

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      const now = Date.now();
      
      // Check if we've received a heartbeat recently
      if (now - this.state.lastHeartbeat > this.config.heartbeatInterval * 2) {
        console.warn('[WSHub] No heartbeat received, reconnecting...');
        this.disconnect();
        this.scheduleReconnect();
        return;
      }

      // Send heartbeat
      this.send({
        type: 'heartbeat',
        payload: { timestamp: now },
        timestamp: now
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ===================== STATUS =====================

  isConnected(): boolean {
    return this.state.connected || (this.eventSource?.readyState === EventSource.OPEN);
  }

  getState(): ConnectionState {
    return { ...this.state };
  }

  getBuffer(): WSMessage[] {
    return [...this.state.buffer];
  }

  // ===================== BROADCAST HELPERS =====================

  broadcastExecutionStart(executionId: string, workflowId: string): void {
    this.send({
      type: 'execution_start',
      payload: { executionId, workflowId },
      timestamp: Date.now(),
      executionId,
      workflowId
    });
  }

  broadcastExecutionProgress(executionId: string, nodeId: string, progress: number): void {
    this.send({
      type: 'execution_progress',
      payload: { nodeId, progress },
      timestamp: Date.now(),
      executionId,
      nodeId
    });
  }

  broadcastExecutionComplete(executionId: string, result: any): void {
    this.send({
      type: 'execution_complete',
      payload: { result },
      timestamp: Date.now(),
      executionId
    });
  }

  broadcastExecutionError(executionId: string, error: string): void {
    this.send({
      type: 'execution_error',
      payload: { error },
      timestamp: Date.now(),
      executionId
    });
  }

  broadcastTriggerFired(triggerId: string, eventType: string, data: any): void {
    this.send({
      type: 'trigger_fired',
      payload: { triggerId, eventType, data },
      timestamp: Date.now()
    });
  }

  broadcastNodeStatus(nodeId: string, status: string, output?: any): void {
    this.send({
      type: 'node_status',
      payload: { nodeId, status, output },
      timestamp: Date.now(),
      nodeId
    });
  }

  broadcastMetricUpdate(metric: string, value: number): void {
    this.send({
      type: 'metric_update',
      payload: { metric, value },
      timestamp: Date.now()
    });
  }
}

// ===================== SINGLETON =====================

export const wsHub = new WebSocketHub();

export default wsHub;