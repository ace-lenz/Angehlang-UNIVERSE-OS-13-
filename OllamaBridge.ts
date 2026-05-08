/**
 * OllamaBridge.ts - NATIVE OLLAMA INTEGRATION
 * Bridges the Angehlang Universe OS with local LLM inference.
 */

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  eval_count: number;
  eval_duration: number;
}

export class OllamaBridge {
  private static instance: OllamaBridge;
  private baseUrl: string;

  private constructor() {
    // If in browser, use the server proxy to avoid CORS/Networking issues
    if (typeof window !== 'undefined') {
      this.baseUrl = '/api/ollama';
    } else {
      this.baseUrl = 'http://172.30.112.1:11434/api';
    }
  }

  public static getInstance(): OllamaBridge {
    if (!OllamaBridge.instance) {
      OllamaBridge.instance = new OllamaBridge();
    }
    return OllamaBridge.instance;
  }

  public async generate(model: string, prompt: string, system?: string): Promise<string> {
    try {
      const endpoint = this.baseUrl.endsWith('/api') ? `${this.baseUrl}/chat` : `${this.baseUrl}/chat`;
      console.log(`[OllamaBridge] Calling ${model} via ${endpoint}...`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt }
          ],
          stream: false,
          options: {
            temperature: 0.7,
            num_ctx: 4096
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = (await response.json()) as OllamaResponse;
      return data.message.content;
    } catch (error) {
      console.error('[OllamaBridge] Error:', error);
      throw error;
    }
  }

  public async *generateStream(model: string, prompt: string, system?: string): AsyncGenerator<string> {
    try {
      const endpoint = this.baseUrl.endsWith('/api') ? `${this.baseUrl}/chat` : `${this.baseUrl}/chat`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt }
          ],
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`Ollama API error: ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream not supported');

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              yield data.message.content;
            }
          } catch (e) {
            // Partial JSON chunk
          }
        }
      }
    } catch (error) {
      console.error('[OllamaBridge] Stream Error:', error);
      throw error;
    }
  }
}

export const ollamaBridge = OllamaBridge.getInstance();
