/**
 * MCPClient.ts - Model Context Protocol Implementation
 * 
 * Features:
 * - MCP protocol client
 * - STDIO and HTTP transport
 * - Tool registry
 * - External tool integration
 */

export interface MCPMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: Record<string, any>;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export type MCPTransport = 'stdio' | 'http';

interface MCPClientConfig {
  transport: MCPTransport;
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
}

class MCPClient {
  private static instance: MCPClient;
  private config: MCPClientConfig | null = null;
  private connected: boolean = false;
  private tools: Map<string, MCPTool> = new Map();
  private resources: Map<string, MCPResource> = new Map();
  private pendingRequests: Map<number, any> = new Map();
  private requestId: number = 0;

  private constructor() {}

  public static getInstance(): MCPClient {
    if (!MCPClient.instance) {
      MCPClient.instance = new MCPClient();
    }
    return MCPClient.instance;
  }

  // ========== Connection ==========

  async connect(config: MCPClientConfig): Promise<boolean> {
    this.config = config;

    if (config.transport === 'stdio') {
      return this.connectStdio(config.command!, config.args || []);
    } else if (config.transport === 'http') {
      return this.connectHttp(config.url!, config.headers);
    }

    return false;
  }

  private async connectStdio(command: string, args: string[]): Promise<boolean> {
    console.log('[MCP] STDIO connection not fully implemented in browser');
    return false;
  }

  private async connectHttp(url: string, headers?: Record<string, string>): Promise<boolean> {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'initialize',
          params: {},
          id: this.requestId++
        })
      });

      if (res.ok) {
        this.connected = true;
        await this.loadTools();
        return true;
      }
    } catch (e) {
      console.error('[MCP] Connection failed:', e);
    }

    return false;
  }

  disconnect(): void {
    this.connected = false;
    this.tools.clear();
    this.resources.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  // ========== Tools ==========

  private async loadTools(): Promise<void> {
    if (!this.connected || !this.config) return;

    const response = await this.sendRequest('tools/list', {});
    
    if (response.result?.tools) {
      for (const tool of response.result.tools) {
        this.tools.set(tool.name, tool);
      }
    }
  }

  async callTool(name: string, arguments_: Record<string, any>): Promise<any> {
    if (!this.connected) {
      throw new Error('MCP client not connected');
    }

    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found`);
    }

    const response = await this.sendRequest('tools/call', {
      name,
      arguments: arguments_
    });

    return response.result;
  }

  getTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  // ========== Resources ==========

  async loadResources(): Promise<void> {
    if (!this.connected) return;

    const response = await this.sendRequest('resources/list', {});
    
    if (response.result?.resources) {
      for (const resource of response.result.resources) {
        this.resources.set(resource.uri, resource);
      }
    }
  }

  async readResource(uri: string): Promise<string> {
    if (!this.connected) {
      throw new Error('MCP client not connected');
    }

    const response = await this.sendRequest('resources/read', { uri });
    return response.result?.contents?.[0]?.text || '';
  }

  getResources(): MCPResource[] {
    return Array.from(this.resources.values());
  }

  // ========== Prompts ==========

  async listPrompts(): Promise<any[]> {
    if (!this.connected) return [];

    const response = await this.sendRequest('prompts/list', {});
    return response.result?.prompts || [];
  }

  async getPrompt(name: string, arguments_: Record<string, any>): Promise<string> {
    if (!this.connected) {
      throw new Error('MCP client not connected');
    }

    const response = await this.sendRequest('prompts/get', {
      name,
      arguments: arguments_
    });

    return response.result?.messages?.[0]?.content?.text || '';
  }

  // ========== Request/Response ==========

  private async sendRequest(method: string, params: Record<string, any>): Promise<MCPMessage> {
    if (!this.config) {
      throw new Error('MCP client not configured');
    }

    const id = this.requestId++;
    const message: MCPMessage = {
      jsonrpc: '2.0',
      method,
      params,
      id
    };

    if (this.config.transport === 'http') {
      const res = await fetch(this.config.url!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers
        },
        body: JSON.stringify(message)
      });

      if (!res.ok) {
        throw new Error(`MCP request failed: ${res.status}`);
      }

      return res.json();
    }

    // Fallback
    return { jsonrpc: '2.0', id, result: null };
  }

  // ========== Built-in Tools ==========

  registerBuiltInTools(): void {
    this.tools.set('filesystem.read', {
      name: 'filesystem.read',
      description: 'Read a file from the filesystem',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to read' }
        },
        required: ['path']
      }
    });

    this.tools.set('filesystem.write', {
      name: 'filesystem.write',
      description: 'Write content to a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'File path to write' },
          content: { type: 'string', description: 'Content to write' }
        },
        required: ['path', 'content']
      }
    });

    this.tools.set('terminal.run', {
      name: 'terminal.run',
      description: 'Run a terminal command',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to run' },
          cwd: { type: 'string', description: 'Working directory' }
        },
        required: ['command']
      }
    });

    this.tools.set('git.status', {
      name: 'git.status',
      description: 'Get git status',
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Repository path' }
        }
      }
    });

    this.tools.set('grep.search', {
      name: 'grep.search',
      description: 'Search for text in files',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: { type: 'string', description: 'Search pattern' },
          path: { type: 'string', description: 'Directory to search' }
        },
        required: ['pattern']
      }
    });
  }
}

export const mcpClient = MCPClient.getInstance();
export default mcpClient;