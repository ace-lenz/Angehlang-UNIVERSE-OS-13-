/**
 * MonitorAgents.ts — SWARM TRAINING MONITOR
 * 
 * Specialized agents that monitor the autonomous evolution and training of the swarm.
 * Reports on quality scores, IQ progression, and self-healing cycles.
 */

import { A2AServer, A2AMessage, A2AResponse } from './A2ACore';
import { selfTrainingEngine } from '@/engine/SelfTrainingEngine';
import { evolutionCore } from '@/memory/EvolutionEngine';

export class SwarmMonitorAgent extends A2AServer {
  constructor(port: number) {
    super({
      name: 'Swarm_Monitor_Agent',
      description: 'Monitors autonomous training, agent ranks, and system perfection metrics.',
      port,
      handlers: {
        send_message: async (msg: A2AMessage) => this.handleMessage(msg)
      }
    });
  }

  private async handleMessage(msg: A2AMessage): Promise<A2AResponse> {
    const text = msg.text.toLowerCase();
    
    if (text.includes('status') || text.includes('training')) {
      const trainingStatus = selfTrainingEngine.getStatus();
      const agents = evolutionCore.getAllStates();
      const avgIQ = agents.reduce((sum, a) => sum + a.intelligenceLevel, 0) / (agents.length || 1);
      
      const report = [
        `[Swarm Monitor] Training Cycle: ${trainingStatus.active ? 'ACTIVE' : 'IDLE'}`,
        `[Swarm Monitor] Total Cycles: ${trainingStatus.historyCount}`,
        `[Swarm Monitor] System Aggregate IQ: ${avgIQ.toFixed(2)}`,
        `[Swarm Monitor] Active Agents: ${agents.length}`,
        `[Swarm Monitor] Top Agent: ${agents.sort((a, b) => b.intelligenceLevel - a.intelligenceLevel)[0]?.agentId || 'None'}`,
      ].join('\n');

      return {
        text: report,
        agent: this.config.name,
        metadata: {
          trainingStatus,
          avgIQ,
          timestamp: Date.now()
        }
      };
    }

    if (text.includes('perfection') || text.includes('score')) {
      const history = selfTrainingEngine.getHistory();
      const lastScore = history.length > 0 ? history[history.length - 1].score : 0;
      
      return {
        text: `[Swarm Monitor] Current System Perfection Score: ${lastScore.toFixed(2)}/10.00`,
        agent: this.config.name,
        metadata: { lastScore }
      };
    }

    return {
      text: "[Swarm Monitor] Monitoring active. Send 'status' or 'perfection' for detailed analytics.",
      agent: this.config.name
    };
  }
}
