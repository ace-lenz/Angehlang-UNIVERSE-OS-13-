// Plan Item ID: TI-1
import { useState, useRef } from 'react';
import { useSovereign } from '@/context/SovereignContext';
import { Message } from '@/types';
import { sovereignLLM, ZetaInferenceResult } from '@/engine/SovereignLLM';

export const useSovereignInference = () => {
  const { currentSessionId, setSessions, setUi } = useSovereign();
  const [streamedText, setStreamedText] = useState('');
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const streamRafRef = useRef<number>(0);

  const startInference = async (userInput: string, selectedFiles: any[]) => {
    if (!userInput.trim() && selectedFiles.length === 0) return;
    
    const { angehlangLLM } = await import('@/engine/AngehlangLLM');
    const query = userInput;
    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(),
      files: selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size }))
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return {
          ...s,
          title: s.messages.length === 0 ? query.substring(0, 40) : s.title,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    }));

    setUi(prev => ({ ...prev, isThinking: true }));

    try {
      // ◈ Native Synaptic Orchestration (Consensus + Self-Training)
      const { nativeNeuralCore } = await import('@/engine/NativeNeuralCore');
      const result = await nativeNeuralCore.generateComplex(query);
      
      const assistantMsg: Message = {
        role: 'assistant',
        content: result.text,
        timestamp: new Date().toLocaleTimeString(),
        thinking: [`Sovereign Synthesis | Lattice Resonance: OPTIMAL | Dim: 50D`],
        thinkingTrace: result.thinkingTrace,
        isSearching: false
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, assistantMsg] };
        }
        return s;
      }));

      // Stream text for UI
      const fullText = result.text || '';
      setStreamingMsgId(Date.now().toString());
      setStreamedText(fullText);
      setTimeout(() => {
        setStreamingMsgId(null);
        setStreamedText('');
      }, 100);
      
    } catch (error) {
      console.error('[SovereignInference] Error:', error);
      
      const errorMsg: Message = {
        role: 'assistant',
        content: `## Error\n\nI encountered an issue while processing your request.\n\n**Details:** ${error instanceof Error ? error.message : String(error)}\n\nPlease try again.`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return { ...s, messages: [...s.messages, errorMsg] };
        }
        return s;
      }));
    } finally {
      setUi(prev => ({ ...prev, isThinking: false }));
    }
  };

  return { startInference, streamedText, streamingMsgId };
};
// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
