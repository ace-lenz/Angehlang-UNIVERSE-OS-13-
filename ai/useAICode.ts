/**
 * useAICode.ts - AI Code Generation Hook
 * 
 * Features:
 * - Context-aware code generation
 * - Streaming responses
 * - Model switching
 * - Conversation history
 * - QPPU integration
 */

import { useState, useCallback } from 'react';
import { aiOrchestrator, AIRequest, AIResponse, ChatMessage, AIModelConfig } from './AIOrchestrator';
import { contextMemory, SearchResult } from './ContextMemory';

interface UseAICode {
  isGenerating: boolean;
  content: string;
  error: string | null;
  models: AIModelConfig[];
  activeModel: string;
  conversation: ChatMessage[];
  // Methods
  generate: (prompt: string, options?: AICodeOptions) => Promise<string>;
  generateStream: (prompt: string, options?: AICodeOptions) => AsyncGenerator<string>;
  setModel: (modelId: string) => void;
  clearConversation: () => void;
  searchContext: (query: string) => Promise<SearchResult[]>;
}

interface AICodeOptions {
  system?: string;
  context?: string;
  files?: { path: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export function useAICode(initialContext?: string): UseAICode {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [models] = useState<AIModelConfig[]>(() => aiOrchestrator.getAvailableModels());
  const [activeModel, setActiveModelState] = useState(() => aiOrchestrator.getActiveModel()?.id || 'qwen2.5-coder:7b');
  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  const generate = useCallback(async (prompt: string, options?: AICodeOptions): Promise<string> => {
    setIsGenerating(true);
    setError(null);
    setContent('');

    try {
      // Get context from memory if available
      let contextStr = options?.context || initialContext || '';
      if (!contextStr && prompt.length > 50) {
        contextStr = await contextMemory.getContextForQuery(prompt);
      }

      const request: AIRequest = {
        prompt,
        system: options?.system || 'You are an expert code generator. Produce complete, production-ready code.',
        context: contextStr,
        files: options?.files,
        temperature: options?.temperature ?? 0.2,
        maxTokens: options?.maxTokens ?? 4096
      };

      // Add user message
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
        model: activeModel
      };
      setConversation(prev => [...prev, userMsg]);

      // Generate
      const response = await aiOrchestrator.generate(request);
      
      // Add assistant message
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        model: response.model
      };
      setConversation(prev => [...prev, assistantMsg]);
      
      // Save to memory
      await contextMemory.addEntry({
        type: 'conversation',
        content: prompt + '\n\n' + response.content,
        metadata: {
          tags: ['code-generation'],
          timestamp: Date.now()
        }
      });

      setContent(response.content);
      return response.content;

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Generation failed';
      setError(errMsg);
      return `// Error: ${errMsg}`;
    } finally {
      setIsGenerating(false);
    }
  }, [activeModel, initialContext]);

  const generateStream = useCallback(async function* (prompt: string, options?: AICodeOptions): AsyncGenerator<string> {
    setIsGenerating(true);
    setError(null);
    setContent('');

    try {
      let contextStr = options?.context || initialContext || '';
      if (!contextStr && prompt.length > 50) {
        contextStr = await contextMemory.getContextForQuery(prompt);
      }

      const request: AIRequest = {
        prompt,
        system: options?.system || 'You are an expert code generator.',
        context: contextStr,
        files: options?.files,
        temperature: options?.temperature ?? 0.2,
        maxTokens: options?.maxTokens ?? 4096
      };

      let fullContent = '';
      
      for await (const chunk of aiOrchestrator.generateStream(request)) {
        fullContent += chunk;
        setContent(fullContent);
        yield chunk;
      }

      // Add to conversation
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: prompt,
        timestamp: Date.now(),
        model: activeModel
      };
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: fullContent,
        timestamp: Date.now(),
        model: activeModel
      };
      setConversation(prev => [...prev, userMsg, assistantMsg]);

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Generation failed';
      setError(errMsg);
      yield `\n// Error: ${errMsg}`;
    } finally {
      setIsGenerating(false);
    }
  } as any, [activeModel, initialContext]);

  const setModel = useCallback((modelId: string) => {
    aiOrchestrator.setActiveModel(modelId);
    setActiveModelState(modelId);
  }, []);

  const clearConversation = useCallback(() => {
    setConversation([]);
    setContent('');
    setError(null);
  }, []);

  const searchContext = useCallback(async (query: string): Promise<SearchResult[]> => {
    return contextMemory.search(query, undefined, 5);
  }, []);

  return {
    isGenerating,
    content,
    error,
    models,
    activeModel,
    conversation,
    generate,
    generateStream,
    setModel,
    clearConversation,
    searchContext
  };
}

export default useAICode;