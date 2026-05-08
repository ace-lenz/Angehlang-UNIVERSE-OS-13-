/**
 * UniversalInputHandler.ts - Handle ANY input type
 * 
 * Features:
 * - Accept files from prompt, dropzone, clipboard, webhook
 * - Auto-detect file type and content
 * - Process images, audio, video, PDF, docs, code
 * - Pass to appropriate studios
 */

import { autoFlowEngine, AutomationNode } from './AutoFlowEngine';

export type FileType = 'image' | 'audio' | 'video' | 'document' | 'code' | 'text' | 'data' | 'unknown';

export interface ProcessedInput {
  type: FileType;
  name: string;
  size: number;
  content: string | ArrayBuffer;
  preview?: string;
  metadata: Record<string, any>;
}

export interface UniversalInputConfig {
  accept: string[];
  maxSize: number;
  multiple: boolean;
}

class UniversalInputHandler {
  private static instance: UniversalInputHandler;

  private constructor() {}

  public static getInstance(): UniversalInputHandler {
    if (!UniversalInputHandler.instance) {
      UniversalInputHandler.instance = new UniversalInputHandler();
    }
    return UniversalInputHandler.instance;
  }

  // ========== FILE TYPE DETECTION ==========

  detectFileType(file: File): FileType {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    const ext = name.split('.').pop() || '';

    // Image types
    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'image';
    }

    // Audio types
    if (type.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext)) {
      return 'audio';
    }

    // Video types
    if (type.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) {
      return 'video';
    }

    // Document types
    if (type.includes('pdf') || ['pdf'].includes(ext) ||
        type.includes('document') || ['doc', 'docx', 'odt'].includes(ext)) {
      return 'document';
    }

    // Code types
    if (type.includes('javascript') || type.includes('typescript') ||
        ['js', 'ts', 'tsx', 'jsx', 'py', 'rs', 'go', 'java', 'c', 'cpp', 'h'].includes(ext)) {
      return 'code';
    }

    // Text types
    if (type.startsWith('text/') || ['txt', 'md', 'json', 'xml', 'html', 'css'].includes(ext)) {
      return 'text';
    }

    // Data types
    if (type.includes('json') || type.includes('csv') ||
        ['json', 'csv', 'xml', 'yaml', 'yml'].includes(ext)) {
      return 'data';
    }

    return 'unknown';
  }

  // ========== FILE PROCESSING ==========

  async processFile(file: File): Promise<ProcessedInput> {
    const type = this.detectFileType(file);
    
    const processed: ProcessedInput = {
      type,
      name: file.name,
      size: file.size,
      content: '',
      metadata: {
        lastModified: file.lastModified,
        type: file.type
      }
    };

    // Process based on file type
    switch (type) {
      case 'image':
        processed.content = await this.readAsDataURL(file);
        processed.metadata.dimensions = await this.getImageDimensions(file);
        break;

      case 'audio':
      case 'video':
        processed.content = await this.readAsArrayBuffer(file);
        processed.metadata.duration = await this.getMediaDuration(file);
        break;

      case 'document':
        processed.content = await this.extractTextFromFile(file);
        if (file.name.endsWith('.json')) {
          try {
            processed.metadata = { ...processed.metadata, ...JSON.parse(processed.content as string) };
          } catch (e) {}
        }
        break;

      case 'code':
      case 'text':
        processed.content = await this.readAsText(file);
        processed.preview = (processed.content as string).slice(0, 500);
        break;

      case 'data':
        processed.content = await this.readAsText(file);
        try {
          processed.metadata = { ...processed.metadata, ...JSON.parse(processed.content as string) };
        } catch (e) {}
        break;

      default:
        processed.content = await this.readAsArrayBuffer(file);
    }

    return processed;
  }

  async processFiles(files: File[]): Promise<ProcessedInput[]> {
    return Promise.all(files.map(f => this.processFile(f)));
  }

  // ========== FILE READING ==========

  private readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private readAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // ========== METADATA EXTRACTION ==========

  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private getMediaDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const el = file.type.startsWith('audio') ? new Audio() : document.createElement('video');
      el.onloadedmetadata = () => resolve(el.duration);
      el.onerror = reject;
      el.src = URL.createObjectURL(file);
    });
  }

  private extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      
      if (file.name.endsWith('.pdf')) {
        // For PDF, we'd need pdf.js - simplified for now
        resolve(`[PDF Document: ${file.name}]`);
      } else {
        reader.readAsText(file);
      }
    });
  }

  // ========== CLIPBOARD HANDLING ==========

  async handlePaste(items: DataTransferItem[]): Promise<ProcessedInput[]> {
    const results: ProcessedInput[] = [];

    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          results.push(await this.processFile(file));
        }
      } else if (item.kind === 'string') {
        item.getAsString((str: string | null) => {
          if (str) {
            results.push({
              type: 'text',
              name: 'pasted-text',
              size: str.length,
              content: str,
              metadata: { source: 'clipboard' }
            });
          }
        });
      }
    }

    return results;
  }

  // ========== DRAG & DROP ==========

  handleDragOver(e: React.DragEvent): void {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  async handleDrop(e: React.DragEvent): Promise<ProcessedInput[]> {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    return this.processFiles(files);
  }

  // ========== URL/WEB INPUT ==========

  async processUrl(url: string): Promise<ProcessedInput> {
    // Try to detect what type of URL this is
    const isImage = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url);
    const isAudio = /\.(mp3|wav|ogg|flac|m4a)/i.test(url);
    const isVideo = /\.(mp4|webm|mov|avi)/i.test(url);
    const isPdf = /\.pdf/i.test(url);

    let type: FileType = 'unknown';
    let content = '';
    let metadata: Record<string, any> = { url };

    if (isImage) {
      type = 'image';
      content = url;
      metadata.contentType = 'image/*';
    } else if (isAudio) {
      type = 'audio';
      content = url;
      metadata.contentType = 'audio/*';
    } else if (isVideo) {
      type = 'video';
      content = url;
      metadata.contentType = 'video/*';
    } else if (isPdf) {
      type = 'document';
      content = url;
      metadata.contentType = 'application/pdf';
    } else {
      // Try to fetch as text
      try {
        const res = await fetch(url);
        const text = await res.text();
        type = 'text';
        content = text;
        metadata.contentType = res.headers.get('content-type') || 'text/plain';
      } catch (e) {
        type = 'unknown';
        content = url;
      }
    }

    return {
      type,
      name: url.split('/').pop() || 'web-resource',
      size: 0,
      content,
      metadata
    };
  }
}

export const inputHandler = UniversalInputHandler.getInstance();
export default inputHandler;