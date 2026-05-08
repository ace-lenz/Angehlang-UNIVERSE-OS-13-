// Plan Item ID: TI-1
/**
 * ResearchAgents.ts — Orchestration and Synthesis of Deep Research
 */

import { A2AServer, A2AClient, A2AResponse } from './A2ACore';
import { BaseAgent } from '../base/BaseAgent';

export class ResearcherAgent extends A2AServer {
  private promptClient: A2AClient;
  private searchClient: A2AClient;

  constructor(port: number, promptPort: number, searchPort: number) {
    super({
      name: 'Researcher_Agent',
      description: 'Deep research by optimizing queries and executing searches',
      port,
      handlers: {
        send_message: async (msg) => this.process(msg)
      }
    });
    this.promptClient = new A2AClient({ baseUrl: `http://localhost:${promptPort}` });
    this.searchClient = new A2AClient({ baseUrl: `http://localhost:${searchPort}` });
  }

  public async process(input: any): Promise<any> {
    return await this.research(input.text || String(input), input.metadata?.isDeep);
  }

  private async research(topic: string, isDeep: boolean = false): Promise<A2AResponse> {
    const optResponse = await this.promptClient.sendMessage({ text: topic, sender: 'Researcher_Agent', metadata: { isDeep } }, { isDeep });
    const searchResponse = await this.searchClient.sendMessage({ text: optResponse.text, sender: 'Researcher_Agent', metadata: { isDeep } }, { isDeep });
    
    let results = [];
    try {
      const parsed = JSON.parse(searchResponse.text || '[]');
      results = Array.isArray(parsed) ? parsed : [];
    } catch { results = []; }
    
    // ◈ SWARM SYNTHESIS: Use the think() method to summarize results recursively
    const context = results.map((r: any) => `${r.title}: ${r.snippet}`).join('\n');
    const summary = await this.think(`Summarize these research results for the topic "${topic}":\n${context}`);
    
    return { text: summary, agent: 'Researcher_Agent', metadata: { sources: results.length } };
  }
}

export class OrchestratorAgent extends A2AServer {
  private researcherClients: A2AClient[] = [];

  constructor(port: number, researcherPorts: number[]) {
    super({
      name: 'Orchestrator_Agent',
      description: 'Coordinates multiple researcher agents for comprehensive answers',
      port,
      handlers: {
        send_message: async (msg) => {
          return await this.orchestrate(msg.text, msg.metadata?.isDeep);
        }
      }
    });
    this.researcherClients = researcherPorts.map(port => new A2AClient({ baseUrl: `http://localhost:${port}` }));
  }

  private async orchestrate(query: string, isDeep: boolean = false): Promise<A2AResponse> {
    const promises = this.researcherClients.map(client => client.sendMessage({ text: query, sender: 'Orchestrator_Agent', metadata: { isDeep } }, { isDeep }));
    const results = await Promise.all(promises);
    const combined = results.filter(r => r.text).map(r => r.text).join('\n\n---\n\n');
    return { text: combined || `Orchestrated research for: ${query}`, agent: 'Orchestrator_Agent', metadata: { researchers: this.researcherClients.length } };
  }
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
