// Plan Item ID: TI-1
/**
 * SpecializedAgents.ts — Domain-specific A2A Peers (Photonic-Enhanced)
 */

import { A2AServer, A2AResponse } from './A2ACore';
import { BaseAgent } from '../base/BaseAgent';

// ──────────────────────────────────────────────────────────────
// WikiKeeper: Sovereign knowledge retrieval + Swarm synthesis
// ──────────────────────────────────────────────────────────────
export class WikiKeeperAgent extends A2AServer {
  constructor(port: number) {
    super({
      name: 'WikiKeeper_Agent',
      description: 'Librarian for the Sovereign Obsidian-LLM Wiki. Manages Explicit RAG Markdown retrieval.',
      port,
      handlers: {
        send_message: async (msg) => this.process(msg)
      }
    });
  }

  public async process(input: any): Promise<any> {
    const text = typeof input === 'string' ? input : (input.text || '');
    try {
      const { sovereignWiki } = await import('@/storage/SovereignWikiEngine');

      if (text.startsWith('fetch:')) {
        const topic = text.replace('fetch:', '').trim();
        const node = await sovereignWiki.getNode(topic);
        if (node) {
          // ◈ Swarm synthesis: Summarize the wiki node content
          const summary = await this.think(`Summarize and explain this wiki entry:\n\n${node.content}`);
          return { text: summary, agent: 'WikiKeeper_Agent', metadata: { found: true, id: node.id } };
        }
        return { text: '[WIKI_EMPTY] Node not found.', agent: 'WikiKeeper_Agent', metadata: { found: false } };
      }

      if (text.startsWith('upsert:')) {
        const lines = text.split('\n');
        const titleLine = lines[0].replace('upsert:', '').trim();
        const content = lines.slice(1).join('\n').trim();
        const node = await sovereignWiki.upsertNode(titleLine, content);
        return { text: `[WIKI_SAVED] Manifested node: [[${node.title}]].`, agent: 'WikiKeeper_Agent', metadata: { id: node.id, saved: true } };
      }

      const results = await sovereignWiki.searchVault(text);
      if (results.length > 0) {
        const context = results.map(r => `[[${r.title}]]: ${r.content?.substring(0, 200)}`).join('\n\n');
        const synthesis = await this.think(`Based on these wiki excerpts, answer the query "${text}":\n\n${context}`);
        return { text: synthesis, agent: 'WikiKeeper_Agent', metadata: { count: results.length } };
      }
    } catch (e) {
      console.warn('[WikiKeeperAgent] Wiki access failed, using swarm fallback:', e);
    }

    // Fallback to pure swarm knowledge
    return { text: await this.think(text), agent: 'WikiKeeper_Agent' };
  }
}

// ──────────────────────────────────────────────────────────────
// RoyalsArbiter: DNA crystallization + photonic manifest synthesis
// ──────────────────────────────────────────────────────────────
export class RoyalsArbiterAgent extends A2AServer {
  constructor(port: number) {
    super({
      name: 'Royals_Arbiter',
      description: 'Quantum Built-in Master Orchestrator for DNA splicing and .angv manifestation',
      port,
      handlers: {
        send_message: async (msg) => this.process(msg)
      }
    });
  }

  public async process(input: any): Promise<any> {
    const text = typeof input === 'string' ? input : (input.text || '');
    try {
      const { royalsEngine } = await import('@/engine/AngehLRoyals');
      const manifestId = `ROYAL_${Date.now()}`;
      // ◈ Creative Lattice: Use think() to generate narrative for the DNA crystallization
      const narrative = await this.think(`Generate a dramatic, cinematic DNA crystallization narrative for the directive: "${text}". Output 2-3 sentences.`);
      const dna = royalsEngine.manifestVideoDNA(manifestId, [narrative, `Splicing DNA for: ${text}...`]);
      return { text: `[ROYAL MANIFEST] Video DNA ${dna.manifestId} crystallized.\n\n${narrative}`, agent: 'Royals_Arbiter', metadata: { manifestId: dna.manifestId, zetaScale: true } };
    } catch (e) {
      return { text: await this.think(text), agent: 'Royals_Arbiter' };
    }
  }
}

// ──────────────────────────────────────────────────────────────
// Ollama Agent: Native neural unit (preserves legacy A2AServer interface)
// ──────────────────────────────────────────────────────────────
export class Royals_Ollama_Agent extends A2AServer {
  private model: string;
  constructor(port: number, model: string) {
    super({
      name: `Ollama_Agent_${model.replace(/[:.-]/g, '_')}`,
      description: `Sovereign Neural Unit powered by ${model}`,
      port,
      handlers: {
        send_message: async (msg) => {
          const { nativeNeuralCore } = await import('@/engine/NativeNeuralCore');
          const oldModel = nativeNeuralCore.getHealth().model;
          nativeNeuralCore.setModel(this.model);
          const response = await nativeNeuralCore.generate(msg.text, msg.metadata?.context || '');
          nativeNeuralCore.setModel(oldModel);
          return { text: response || 'Neural fallback triggered.', agent: this.getName(), metadata: { model: this.model, zetaScale: true } };
        },
        royal_handshake: async () => ({ text: 'HANDSHAKE_COMPLETE', agent: this.getName() })
      }
    });
    this.model = model;
  }
}

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
