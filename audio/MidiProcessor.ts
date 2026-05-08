/**
 * MidiProcessor.ts
 * 
 * Handles Web MIDI API integration for the Angehlang Audio Studio.
 * Allows connecting external MIDI controllers to trigger the synthesis engine.
 */

import { toneAudioEngine } from './engines/ToneAudioEngine';

export class MidiProcessor {
  private static instance: MidiProcessor;
  private access: MIDIAccess | null = null;
  private inputs: MIDIInput[] = [];

  private constructor() {}

  public static getInstance(): MidiProcessor {
    if (!MidiProcessor.instance) {
      MidiProcessor.instance = new MidiProcessor();
    }
    return MidiProcessor.instance;
  }

  public async initialize(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) {
      console.warn('[MidiProcessor] Web MIDI API not supported in this browser.');
      return false;
    }

    try {
      this.access = await navigator.requestMIDIAccess();
      this.updateInputs();
      this.access.onstatechange = () => this.updateInputs();
      console.log('[MidiProcessor] MIDI Access granted.');
      return true;
    } catch (err) {
      console.error('[MidiProcessor] Failed to get MIDI access:', err);
      return false;
    }
  }

  private updateInputs() {
    if (!this.access) return;
    this.inputs = Array.from(this.access.inputs.values());
    this.inputs.forEach(input => {
      input.onmidimessage = (msg) => this.handleMidiMessage(msg);
    });
    console.log(`[MidiProcessor] Detected ${this.inputs.length} MIDI input(s).`);
  }

  private handleMidiMessage(message: MIDIMessageEvent) {
    const [status, note, velocity] = message.data;
    const command = status & 0xf0;
    // const channel = status & 0x0f;

    switch (command) {
      case 0x90: // Note On
        if (velocity > 0) {
          this.playMidiNote(note, velocity);
        } else {
          // Some controllers send velocity 0 for Note Off
          this.stopMidiNote(note);
        }
        break;
      case 0x80: // Note Off
        this.stopMidiNote(note);
        break;
      case 0xb0: // Control Change
        this.handleCC(note, velocity);
        break;
    }
  }

  private playMidiNote(midiNote: number, velocity: number) {
    const freq = Math.pow(2, (midiNote - 69) / 12) * 440;
    const noteName = this.midiToNoteName(midiNote);
    toneAudioEngine.playNote(noteName, '4n', velocity / 127);
    console.log(`[MIDI] Note On: ${noteName} (${midiNote}) | Vel: ${velocity}`);
  }

  private stopMidiNote(midiNote: number) {
    // Tone.js PolySynth handles release automatically if triggered with duration,
    // but for real-time MIDI we might want explicit triggerRelease.
    // However, our current playNote uses triggerAttackRelease.
    // For full MIDI support, we should enhance ToneAudioEngine.
  }

  private handleCC(cc: number, value: number) {
    console.log(`[MIDI] CC: ${cc} | Value: ${value}`);
    // Map CC to engine parameters (e.g. Master Gain, Filter Cutoff)
    if (cc === 7) { // Volume
      toneAudioEngine.setMasterGain(value / 127);
    }
  }

  private midiToNoteName(midi: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const name = notes[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  }

  public getConnectedInputs(): string[] {
    return this.inputs.map(i => i.name || 'Unknown Device');
  }
}

export const midiProcessor = MidiProcessor.getInstance();
