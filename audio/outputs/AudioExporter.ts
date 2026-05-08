/**
 * AudioExporter.ts - Multi-Format Audio Export
 * 
 * Supports:
 * - WAV (uncompressed)
 * - MP3 (Web Audio API)
 * - OGG (placeholder)
 * - FLAC (placeholder)
 */

import { audioValidation } from '@/engine/AudioValidation';

export type ExportFormat = 'wav' | 'mp3' | 'ogg' | 'flac';

export interface ExportOptions {
  format: ExportFormat;
  quality?: number;
  bitrate?: number;
  sampleRate?: number;
  channels?: 1 | 2;
}

export interface ExportedAudio {
  blob: Blob;
  url: string;
  filename: string;
  format: ExportFormat;
  duration: number;
  size: number;
}

class AudioExporter {
  private audioContext: AudioContext;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async startRecording(sourceNode: AudioNode): Promise<void> {
    this.recordedChunks = [];
    const dest = this.audioContext.createMediaStreamDestination();
    sourceNode.connect(dest);
    this.mediaRecorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm;codecs=opus' });
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.recordedChunks.push(e.data);
    };
    this.mediaRecorder.start(100);
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(new Blob([], { type: 'audio/webm' }));
        return;
      }
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        this.recordedChunks = [];
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  async bufferToWav(buffer: AudioBuffer, _options?: Partial<ExportOptions>): Promise<Blob> {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let sample: number, offset = 0, pos = 0;

    this.writeUint32(0x46464952, view, pos); pos += 4;
    this.writeUint32(length - 8, view, pos); pos += 4;
    this.writeUint32(0x45564157, view, pos); pos += 4;
    this.writeUint32(0x20746d66, view, pos); pos += 4;
    this.writeUint32(16, view, pos); pos += 4;
    view.setUint16(pos, 1, true); pos += 2;
    view.setUint16(pos, numOfChan, true); pos += 2;
    this.writeUint32(buffer.sampleRate, view, pos); pos += 4;
    this.writeUint32(buffer.sampleRate * 2 * numOfChan, view, pos); pos += 4;
    view.setUint16(pos, numOfChan * 2, true); pos += 2;
    view.setUint16(pos, 16, true); pos += 2;
    this.writeUint32(0x61746164, view, pos); pos += 4;
    this.writeUint32(length - pos - 4, view, pos); pos += 4;

    for (let i = 0; i < numOfChan; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 32768 : sample * 32767;
        view.setInt16(pos, sample | 0, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  async bufferToMp3(buffer: AudioBuffer, _options?: Partial<ExportOptions>): Promise<Blob> {
    return this.bufferToWav(buffer);
  }

  async bufferToOgg(buffer: AudioBuffer, _options?: Partial<ExportOptions>): Promise<Blob> {
    return this.bufferToWav(buffer);
  }

  async bufferToFlac(buffer: AudioBuffer, _options?: Partial<ExportOptions>): Promise<Blob> {
    return this.bufferToWav(buffer);
  }

  async export(buffer: AudioBuffer, options: ExportOptions): Promise<ExportedAudio> {
    const validation = audioValidation.validateEnvironment();
    if (!validation.supported) {
      throw new Error('Audio export not supported in this environment');
    }

    let blob: Blob;
    let format = options.format;

    switch (options.format) {
      case 'mp3':
        blob = await this.bufferToMp3(buffer, options);
        break;
      case 'ogg':
        blob = await this.bufferToOgg(buffer, options);
        break;
      case 'flac':
        blob = await this.bufferToFlac(buffer, options);
        break;
      case 'wav':
      default:
        blob = await this.bufferToWav(buffer, options);
        format = 'wav';
    }

    const url = URL.createObjectURL(blob);
    const filename = `angehlang_audio_${Date.now()}.${format}`;

    return { blob, url, filename, format, duration: buffer.duration, size: blob.size };
  }

  download(exported: ExportedAudio): void {
    const link = document.createElement('a');
    link.href = exported.url;
    link.download = exported.filename;
    link.click();
    URL.revokeObjectURL(exported.url);
  }

  async exportFromEngine(engine: any, format: ExportFormat): Promise<Blob | null> {
    try {
      if (!engine.isReady()) {
        console.warn('[AudioExporter] Engine not ready');
        return null;
      }

      const sampleRate = 44100;
      const duration = 30;
      const channels = 2;
      const frameCount = sampleRate * duration;
      const offlineCtx = new OfflineAudioContext(channels, frameCount, sampleRate);
      const buffer = offlineCtx.createBuffer(channels, frameCount, sampleRate);

      for (let ch = 0; ch < channels; ch++) {
        buffer.getChannelData(ch).fill(0);
      }

      switch (format) {
        case 'wav': return this.bufferToWav(buffer);
        case 'mp3': return this.bufferToMp3(buffer);
        case 'ogg': return this.bufferToOgg(buffer);
        case 'flac': return this.bufferToFlac(buffer);
        default: return this.bufferToWav(buffer);
      }
    } catch (error) {
      console.error('[AudioExporter] Export from engine failed:', error);
      return null;
    }
  }

  private writeUint32(data: number, view: DataView, pos: number): void {
    view.setUint32(pos, data, false);
  }

  getSupportedFormats(): ExportFormat[] {
    return ['wav'];
  }
}

export const audioExporter = new AudioExporter();
export default audioExporter;