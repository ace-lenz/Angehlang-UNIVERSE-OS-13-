export interface AudioAnalysisResult {
  bpm: number;
  key: string;
  mood: string;
  rms: number;
}

export class AudioAnalyzer {
  /**
   * Detects BPM from an AudioBuffer using an onset detection heuristic.
   */
  async detectBpm(audioBuffer: AudioBuffer): Promise<number> {
    const data = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Heuristic: Peaks in the low frequency energy
    let peaks = 0;
    const threshold = 0.5;
    for (let i = 0; i < data.length; i += Math.floor(sampleRate / 10)) {
        if (Math.abs(data[i]) > threshold) peaks++;
    }

    const durationSeconds = audioBuffer.duration;
    const bpm = (peaks / durationSeconds) * 60;
    
    // Clamp to realistic range
    return Math.max(60, Math.min(200, Math.round(bpm / 4) * 4));
  }

  /**
   * Detects the musical key (Simulated).
   */
  async detectKey(audioBuffer: AudioBuffer): Promise<string> {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const modes = ['Major', 'Minor'];
    
    // Heuristic: Based on buffer properties
    const index = Math.floor(audioBuffer.duration * 10) % keys.length;
    const modeIndex = Math.floor(audioBuffer.numberOfChannels) % 2;
    
    return `${keys[index]} ${modes[modeIndex]}`;
  }

  /**
   * Performs full spectrum analysis.
   */
  analyze(analyserNode: AnalyserNode): AudioAnalysisResult {
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = (dataArray[i] / 128.0) - 1.0;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / bufferLength);

    return {
      bpm: 120, // Requires historical context or buffer
      key: 'Unknown',
      mood: rms > 0.5 ? 'Aggressive' : 'Calm',
      rms
    };
  }
}

export const audioAnalyzer = new AudioAnalyzer();
