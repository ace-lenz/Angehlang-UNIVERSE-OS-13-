import { StudioDiffusionAdapter, AdapterManifest, validateAllAdapters } from './StudioDiffusionAdapter';
import { DiffusionResult, DiffusionRequest } from '../DiffusionTypes';
import { sovereignDiffusionHub } from '../SovereignDiffusionHub';

export class ImageDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'image-gallery';
  readonly defaultMode = 'aesthetic';
  protected readonly studioName = 'ImageGallery';
  protected readonly primaryCore = 'aesthetic';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['aesthetic'],
      inputModalities: { text: true, image: true, video: false, audio: false, code: false, sensorData: false },
      maxInputSize: { image: { width: 2048, height: 2048 } },
      outputFormat: 'ImageBitmap', progressiveOutput: true, maxLatencyMs: 2000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 50, needsGPU: true, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'direct-memory', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'aesthetic', dimensions: { width: 1024, height: 1024 }, steps: input.steps || 30, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[ImageGallery] Generated: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class AudioDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'audio-studio';
  readonly defaultMode = 'temporal';
  protected readonly studioName = 'AudioStudio';
  protected readonly primaryCore = 'temporal';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['temporal'],
      inputModalities: { text: true, image: false, video: false, audio: true, code: false, sensorData: true },
      maxInputSize: { audio: { durationSeconds: 300 } },
      outputFormat: 'WAV', progressiveOutput: true, maxLatencyMs: 5000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 100, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'shared-arraybuffer', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'temporal', dimensions: { width: 1, height: 1, duration: input.duration || 30 }, steps: input.steps || 20, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[AudioStudio] Generated: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class MusicDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'music-production';
  readonly defaultMode = 'temporal';
  protected readonly studioName = 'MusicProduction';
  protected readonly primaryCore = 'temporal';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['temporal'],
      inputModalities: { text: true, image: false, video: false, audio: true, code: false, sensorData: false },
      maxInputSize: { audio: { durationSeconds: 600 } },
      outputFormat: 'WAV', progressiveOutput: true, maxLatencyMs: 8000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 150, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'shared-arraybuffer', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const bpm = input.bpm || 120;
    const instruments = input.instruments || ['piano', 'drums'];
    const request: DiffusionRequest = { prompt, mode: 'temporal', dimensions: { width: 1, height: 1, duration: input.duration || 60 }, steps: input.steps || 25, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[MusicProduction] Created: ${prompt}\nBPM: ${bpm}\nInstruments: ${instruments.join(', ')}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class VideoDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'video-player';
  readonly defaultMode = 'temporal';
  protected readonly studioName = 'VideoPlayer';
  protected readonly primaryCore = 'temporal';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['temporal', 'spatial'],
      inputModalities: { text: true, image: true, video: true, audio: true, code: false, sensorData: false },
      maxInputSize: { video: { width: 1920, height: 1080, durationSeconds: 300 } },
      outputFormat: 'MP4', progressiveOutput: true, maxLatencyMs: 15000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 500, needsGPU: true, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'direct-memory', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const frames = input.frames || 60;
    const fps = input.fps || 30;
    const request: DiffusionRequest = { prompt, mode: 'temporal', dimensions: { width: 1280, height: 720, duration: frames / fps }, steps: input.steps || 40, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[VideoPlayer] Generated: ${prompt}\nFrames: ${frames}\nFPS: ${fps}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class ThreeDDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'three-d-viewer';
  readonly defaultMode = 'spatial';
  protected readonly studioName = 'ThreeDViewer';
  protected readonly primaryCore = 'spatial';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['spatial', 'aesthetic'],
      inputModalities: { text: true, image: true, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { image: { width: 4096, height: 4096 } },
      outputFormat: 'GLTF', progressiveOutput: true, maxLatencyMs: 10000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 300, needsGPU: true, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'direct-memory', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const complexity = input.complexity || 5;
    const request: DiffusionRequest = { prompt, mode: 'spatial', dimensions: { width: 1, height: 1, depth: complexity }, steps: input.steps || 35, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[ThreeDViewer] Synthesized: ${prompt}\nComplexity: ${complexity}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class CodeDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'code-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'CodeStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'aesthetic'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'SourceCode', progressiveOutput: true, maxLatencyMs: 5000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 100, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 20, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[CodeStudio] Generated code: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class GameDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'game-studio';
  readonly defaultMode = 'spatial';
  protected readonly studioName = 'GameStudio';
  protected readonly primaryCore = 'spatial';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['spatial', 'aesthetic', 'temporal'],
      inputModalities: { text: true, image: true, video: false, audio: true, code: true, sensorData: false },
      maxInputSize: { image: { width: 2048, height: 2048 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 8000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 200, needsGPU: true, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'direct-memory', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'spatial', dimensions: { width: 1, height: 1, depth: 10 }, steps: input.steps || 30, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[GameStudio] Generated game content: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class DataVizDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'data-viz';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'DataViz';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'aesthetic'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 100000 } },
      outputFormat: 'SVG', progressiveOutput: true, maxLatencyMs: 3000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 50, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const chartType = input.chartType || 'bar';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[DataViz] Created ${chartType} chart: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class BookDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'book-studio';
  readonly defaultMode = 'aesthetic';
  protected readonly studioName = 'BookStudio';
  protected readonly primaryCore = 'aesthetic';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['aesthetic', 'abstract'],
      inputModalities: { text: true, image: true, video: false, audio: true, code: false, sensorData: false },
      maxInputSize: { text: { maxChars: 200000 } },
      outputFormat: 'PDF', progressiveOutput: true, maxLatencyMs: 10000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 80, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const chapters = input.chapters || 5;
    const request: DiffusionRequest = { prompt, mode: 'aesthetic', steps: input.steps || 25, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[BookStudio] Generated book content: ${prompt}\nChapters: ${chapters}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class SimulationDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'simulation-studio';
  readonly defaultMode = 'spatial';
  protected readonly studioName = 'SimulationStudio';
  protected readonly primaryCore = 'spatial';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['spatial', 'abstract'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 12000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 250, needsGPU: true, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'shared-arraybuffer', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'spatial', dimensions: { width: 1, height: 1, depth: 5 }, steps: input.steps || 30, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[SimulationStudio] Generated simulation: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class BioDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'synthetic-bio';
  readonly defaultMode = 'spatial';
  protected readonly studioName = 'SyntheticBio';
  protected readonly primaryCore = 'spatial';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['spatial', 'abstract'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 100000 } },
      outputFormat: 'PDB', progressiveOutput: true, maxLatencyMs: 15000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 300, needsGPU: true, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'direct-memory', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'spatial', dimensions: { width: 1, height: 1, depth: 8 }, steps: input.steps || 40, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[SyntheticBio] Synthesized molecular structure: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class IoTDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'iot-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'IoTStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'spatial'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 30000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 3000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 30, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[IoTStudio] Generated IoT config: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class NetworkDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'network-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'NetworkStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'spatial'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 5000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 50, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[NetworkStudio] Generated network topology: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class SecurityDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'security-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'SecurityStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'spatial'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 4000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 60, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 20, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[SecurityStudio] Generated security pattern: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class DatabaseDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'database-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'DatabaseStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { text: { maxChars: 30000 } },
      outputFormat: 'SQL', progressiveOutput: true, maxLatencyMs: 3000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 40, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[DatabaseStudio] Generated schema: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class CloudDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'cloud-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'CloudStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'spatial'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 5000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 60, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[CloudStudio] Generated cloud config: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class WebDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'browser-studio';
  readonly defaultMode = 'aesthetic';
  protected readonly studioName = 'BrowserStudio';
  protected readonly primaryCore = 'aesthetic';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['aesthetic', 'abstract'],
      inputModalities: { text: true, image: true, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { text: { maxChars: 100000 } },
      outputFormat: 'HTML', progressiveOutput: true, maxLatencyMs: 6000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 80, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'aesthetic', dimensions: { width: 1920, height: 1080 }, steps: input.steps || 25, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[BrowserStudio] Generated web layout: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class OSDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'os-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'OSStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'spatial'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: false },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 5000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 50, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[OSStudio] Generated OS config: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class IntelligenceDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'intelligence-hub';
  readonly defaultMode = 'aesthetic';
  protected readonly studioName = 'IntelligenceHub';
  protected readonly primaryCore = 'aesthetic';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['aesthetic', 'abstract', 'temporal', 'spatial'],
      inputModalities: { text: true, image: true, video: true, audio: true, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 200000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 10000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 200, needsGPU: true, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'direct-memory', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'aesthetic', steps: input.steps || 30, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[IntelligenceHub] Analyzed and synthesized: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class BenchmarkDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'benchmark-studio';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'BenchmarkStudio';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'spatial', 'temporal'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 5000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 100, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[BenchmarkStudio] Generated benchmark: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class TestDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'progressive-test';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'ProgressiveTest';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'aesthetic', 'temporal', 'spatial'],
      inputModalities: { text: true, image: true, video: true, audio: true, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 100000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 5000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 80, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[ProgressiveTest] Generated test scenario: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class WorkflowDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'automation-dashboard';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'AutomationDashboard';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'temporal'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 4000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 40, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 20, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[AutomationDashboard] Generated workflow: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

export class ProtocolDiffusionAdapter extends StudioDiffusionAdapter {
  readonly studioId = 'a2a-communication-hub';
  readonly defaultMode = 'abstract';
  protected readonly studioName = 'A2ACommunicationHub';
  protected readonly primaryCore = 'abstract';

  public verify(): AdapterManifest {
    return {
      studioId: this.studioId, studioName: this.studioName, supportedCores: ['abstract', 'temporal', 'spatial'],
      inputModalities: { text: true, image: false, video: false, audio: false, code: true, sensorData: true },
      maxInputSize: { text: { maxChars: 50000 } },
      outputFormat: 'JSON', progressiveOutput: true, maxLatencyMs: 2000, subMillisecondRequired: false,
      asyncStreaming: true, peakMemoryMB: 30, needsGPU: false, webWorkerCompatible: true,
      offlineFallback: true, fullySelfHosted: true, binaryDNAStorage: true,
      a2aBridge: 'message-channel', multiNodeSupport: true, broadcastStatus: true,
      errorHandling: 'retry', telemetryEvents: ['start', 'progress', 'finish', 'error'], signOutput: true
    };
  }

  public async process(input: any): Promise<DiffusionResult> {
    if (!this.validate(input)) return this.handleError(new Error('Invalid input'));
    const prompt = typeof input === 'string' ? input : input.prompt || '';
    const request: DiffusionRequest = { prompt, mode: 'abstract', steps: input.steps || 15, seed: input.seed };
    try {
      const result = await sovereignDiffusionHub.diffuse(request);
      return { ...result, description: `[A2ACommunicationHub] Generated protocol: ${prompt}\n\n${result.description}` };
    } catch (error) { return this.handleError(error as Error, input); }
  }
  protected mapToStudioData(result: DiffusionResult): any { return this.formatOutput(result); }
}

// Export singleton instances for direct imports
export const imageDiffusionAdapter = new ImageDiffusionAdapter();
export const audioDiffusionAdapter = new AudioDiffusionAdapter();
export const musicDiffusionAdapter = new MusicDiffusionAdapter();
export const videoDiffusionAdapter = new VideoDiffusionAdapter();
export const threeDDiffusionAdapter = new ThreeDDiffusionAdapter();
export const codeDiffusionAdapter = new CodeDiffusionAdapter();
export const gameDiffusionAdapter = new GameDiffusionAdapter();
export const dataVizDiffusionAdapter = new DataVizDiffusionAdapter();
export const bookDiffusionAdapter = new BookDiffusionAdapter();
export const simulationDiffusionAdapter = new SimulationDiffusionAdapter();
export const bioDiffusionAdapter = new BioDiffusionAdapter();
export const iotDiffusionAdapter = new IoTDiffusionAdapter();
export const networkDiffusionAdapter = new NetworkDiffusionAdapter();
export const securityDiffusionAdapter = new SecurityDiffusionAdapter();
export const databaseDiffusionAdapter = new DatabaseDiffusionAdapter();
export const cloudDiffusionAdapter = new CloudDiffusionAdapter();
export const webDiffusionAdapter = new WebDiffusionAdapter();
export const osDiffusionAdapter = new OSDiffusionAdapter();
export const intelligenceDiffusionAdapter = new IntelligenceDiffusionAdapter();
export const benchmarkDiffusionAdapter = new BenchmarkDiffusionAdapter();
export const testDiffusionAdapter = new TestDiffusionAdapter();
export const workflowDiffusionAdapter = new WorkflowDiffusionAdapter();
export const protocolDiffusionAdapter = new ProtocolDiffusionAdapter();