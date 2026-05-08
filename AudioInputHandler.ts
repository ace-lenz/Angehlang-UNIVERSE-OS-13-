import { upeEngine } from './UnifiedProcessingEngine';

export interface AudioInputSource {
  type: 'file' | 'record' | 'tts' | 'url';
  data: string | File | Blob;
  name: string;
}

export class AudioInputHandler {
  private audioCtx: AudioContext;

  constructor(context?: AudioContext) {
    this.audioCtx = context || new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  /**
   * Processes a file upload and returns an AudioBuffer.
   */
  async handleFileUpload(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    return await this.audioCtx.decodeAudioData(arrayBuffer);
  }

  /**
   * Starts a recording session and returns a Blob.
   */
  async startRecording(): Promise<MediaRecorder> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    return mediaRecorder;
  }

  /**
   * Stops a recording and returns the Blob.
   */
  async stopRecording(recorder: MediaRecorder): Promise<Blob> {
    return new Promise((resolve) => {
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        resolve(blob);
      };
      recorder.stop();
      recorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  /**
   * Generates speech from text using the Web Speech API.
   * Returns a promise that resolves when speech is finished.
   */
  async generateTTS(text: string, voice?: SpeechSynthesisVoice): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Imports audio from a URL.
   */
  async importFromUrl(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioCtx.decodeAudioData(arrayBuffer);
  }

  /**
   * Uses AI to enhance an input prompt for better audio generation.
   */
  async enhancePrompt(prompt: string): Promise<string> {
    const result = await upeEngine.dispatch('logic', 
      `(ENHANCE_AUDIO_PROMPT "${prompt}")`, 
      'quantum'
    );
    return result.enhancedPrompt || prompt;
  }
}

export const audioInputHandler = new AudioInputHandler();
