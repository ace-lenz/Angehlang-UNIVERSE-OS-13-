export class AudioExporter {
  /**
   * Encodes an AudioBuffer into a WAV Blob.
   */
  async bufferToWav(buffer: AudioBuffer): Promise<Blob> {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let i, sample, offset = 0, pos = 0;

    // write WAVE header
    this.setUint32(0x46464952, view, pos); pos += 4;                         // "RIFF"
    this.setUint32(length - 8, view, pos); pos += 4;                         // file length
    this.setUint32(0x45564157, view, pos); pos += 4;                         // "WAVE"

    this.setUint32(0x20746d66, view, pos); pos += 4;                         // "fmt " chunk
    this.setUint32(16, view, pos); pos += 4;                                 // length = 16
    view.setUint16(pos, 1, true); pos += 2;                                  // PCM (uncompressed)
    view.setUint16(pos, numOfChan, true); pos += 2;
    this.setUint32(buffer.sampleRate, view, pos); pos += 4;
    this.setUint32(buffer.sampleRate * 2 * numOfChan, view, pos); pos += 4;  // avg. bytes/sec
    view.setUint16(pos, numOfChan * 2, true); pos += 2;                      // block-align
    view.setUint16(pos, 16, true); pos += 2;                                 // 16-bit (hardcoded)

    this.setUint32(0x61746164, view, pos); pos += 4;                         // "data" - chunk
    this.setUint32(length - pos - 4, view, pos); pos += 4;                   // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // write 16-bit sample
            pos += 2;
        }
        offset++;                                     // next sample index
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  private setUint32(data: number, view: DataView, pos: number) {
    view.setUint32(pos, data, false);
  }

  /**
   * Helper to trigger download of a Blob.
   */
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export const audioExporter = new AudioExporter();
