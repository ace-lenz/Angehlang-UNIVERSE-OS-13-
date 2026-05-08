export class AudioValidation {
  /**
   * Validates if an AudioBuffer is healthy.
   */
  validateBuffer(buffer: AudioBuffer): { valid: boolean; error?: string } {
    if (buffer.length === 0) return { valid: false, error: 'Empty buffer' };
    if (buffer.sampleRate < 8000) return { valid: false, error: 'Sample rate too low' };
    
    // Check for NaN or infinity in channel data
    const data = buffer.getChannelData(0);
    for (let i = 0; i < Math.min(data.length, 1000); i++) {
        if (isNaN(data[i]) || !isFinite(data[i])) {
            return { valid: false, error: 'Buffer contains invalid numerical data' };
        }
    }

    return { valid: true };
  }

  /**
   * Validates if the current browser environment supports necessary audio features.
   */
  validateEnvironment(): { supported: boolean; missing: string[] } {
    const missing = [];
    if (!window.AudioContext && !(window as any).webkitAudioContext) missing.push('Web Audio API');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) missing.push('MediaDevices API');
    if (!window.MediaRecorder) missing.push('MediaRecorder API');
    if (!window.speechSynthesis) missing.push('SpeechSynthesis API');

    return {
      supported: missing.length === 0,
      missing
    };
  }
}

export const audioValidation = new AudioValidation();
