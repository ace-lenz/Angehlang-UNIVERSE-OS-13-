/**
 * RealMusicGenerator.ts - Music Theory-Based Audio Generation
 * 
 * Generates melodies, bass, and drums using actual music theory:
 * - Scale-based note selection
 * - Chord voicings
 * - Rhythm patterns
 * - Genre-specific arrangements
 * - User-defined custom scales/chords
 */

import { GENRE_DATABASE, GenreConfig, getGenreById, searchGenres } from '../data/GenreDatabase';
import { SCALES, CHORD_PROGRESSIONS, ChordProgression } from '../data/GenreDatabase';

export interface MusicGeneratorConfig {
  genre: string;
  bpm: number;
  key: string;
  scale: string;
  chordProgression: string;
  duration: number; // in seconds
  complexity: number; // 0-1
  seed?: number;
}

export interface MelodyNote {
  time: string;
  note: string;
  duration: string;
  velocity: number;
}

export interface BassNote {
  time: string;
  note: string;
  duration: string;
  velocity: number;
}

export interface DrumNote {
  time: string;
  drum: string;
  velocity: number;
}

export interface GeneratedTrack {
  melody: MelodyNote[];
  bass: BassNote[];
  drums: DrumNote[];
  metadata: {
    genre: string;
    bpm: number;
    key: string;
    scale: string;
    chordProgression: string;
    duration: number;
  };
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteToMidi(note: string): number {
  const octave = parseInt(note.slice(-1));
  const noteName = note.slice(0, -1);
  return (octave + 1) * 12 + NOTE_NAMES.indexOf(noteName);
}

function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteName = NOTE_NAMES[midi % 12];
  return noteName + octave;
}

function transposeNote(note: string, semitones: number): string {
  const midi = noteToMidi(note) + semitones;
  return midiToNote(midi);
}

function getScaleNotes(root: string, scaleType: string): string[] {
  const scale = SCALES[scaleType] || SCALES['major'];
  const rootIdx = NOTE_NAMES.indexOf(root.replace(/\d/g, ''));
  const rootOctave = parseInt(root[root.length - 1]) || 4;
  
  return scale.intervals.map(interval => {
    const noteIdx = (rootIdx + interval) % 12;
    const octaveOffset = Math.floor((rootIdx + interval) / 12);
    return NOTE_NAMES[noteIdx] + (rootOctave + octaveOffset);
  });
}

function getChordNotes(root: string, chordType: string, octave = 4): string[] {
  const chordIntervals: Record<string, number[]> = {
    '': [0, 4, 7],
    'maj': [0, 4, 7],
    'major': [0, 4, 7],
    'min': [0, 3, 7],
    'minor': [0, 3, 7],
    '7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'min7': [0, 3, 7, 10],
    'sus4': [0, 5, 7],
    'sus2': [0, 2, 7],
    'dim': [0, 3, 6],
    'aug': [0, 4, 8],
  };
  
  const intervals = chordIntervals[chordType] || [0, 4, 7];
  const rootNote = noteToMidi(root + octave);
  
  return intervals.map(interval => midiToNote(rootNote + interval));
}

function parseRomanChord(chord: string, key: string): string[] {
  const romanNumerals: Record<string, number> = {
    'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6,
    'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6,
  };
  
  // Handle flat symbols
  const baseKey = key.replace('b', '#').replace('#', '');
  const keyIdx = NOTE_NAMES.indexOf(baseKey);
  
  let degree = romanNumerals[chord.toLowerCase().replace('b', '').replace('#', '')];
  if (degree === undefined) degree = 0;
  
  // Get major/minor from case and additions
  const isMinor = chord.toLowerCase() === chord;
  const isDiminished = chord.toLowerCase().includes('dim') || chord.toLowerCase().includes('ø');
  const isAugmented = chord.toLowerCase().includes('aug') || chord.toLowerCase().includes('+');
  const is7th = chord.includes('7');
  const isMajor7 = chord.includes('maj7') || (chord.toUpperCase() === chord && chord.includes('7'));
  
  let chordType = '';
  if (isDiminished) chordType = 'dim';
  else if (isAugmented) chordType = 'aug';
  else if (isMajor7) chordType = isMinor ? 'min7' : 'maj7';
  else if (is7th) chordType = isMinor ? 'min7' : '7';
  else chordType = isMinor ? 'min' : 'maj';
  
  const chordRoot = NOTE_NAMES[(keyIdx + degree) % 12];
  return getChordNotes(chordRoot, chordType);
}

class RealMusicGenerator {
  private static instance: RealMusicGenerator;
  private seed: number;

  private constructor() {
    this.seed = Date.now();
  }

  public static getInstance(): RealMusicGenerator {
    if (!RealMusicGenerator.instance) {
      RealMusicGenerator.instance = new RealMusicGenerator();
    }
    return RealMusicGenerator.instance;
  }

  setSeed(seed: number): void {
    this.seed = seed;
  }

  private random(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  private pickRandom<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  private pickWeighted<T>(array: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = this.random() * total;
    
    for (let i = 0; i < array.length; i++) {
      r -= weights[i];
      if (r <= 0) return array[i];
    }
    return array[array.length - 1];
  }

  /**
   * Generate a complete music track
   */
  async generate(config: MusicGeneratorConfig): Promise<GeneratedTrack> {
    const genre = getGenreById(config.genre) || GENRE_DATABASE[0];
    const bpm = config.bpm || genre.bpm.min;
    const key = config.key || genre.rootNote;
    const scaleType = config.scale || genre.scale;
    
    // Get scale notes
    const scaleNotes = getScaleNotes(key, scaleType);
    const scaleNotesHigh = getScaleNotes(key + '4', scaleType).map(n => n.replace(/\d/, (parseInt(n[n.length - 1]) + 2).toString()));
    const scaleNotesMid = getScaleNotes(key + '3', scaleType);
    const scaleNotesBass = getScaleNotes(key + '2', scaleType);
    
    // Get chord progression
    const progression = CHORD_PROGRESSIONS[config.chordProgression] || CHORD_PROGRESSIONS['I-IV-V-I'];
    
    // Calculate duration in beats
    const totalBeats = Math.ceil((config.duration / 60) * bpm);
    const beatDuration = 60 / bpm;
    const measureLength = 4; // 4/4 time
    
    // Generate melody
    const melody = this.generateMelody(
      scaleNotesHigh,
      totalBeats,
      measureLength,
      config.complexity
    );
    
    // Generate bass
    const bass = this.generateBass(
      scaleNotesBass,
      progression,
      totalBeats,
      measureLength
    );
    
    // Generate drums
    const drums = this.generateDrums(
      genre.drumPattern,
      totalBeats,
      measureLength
    );
    
    return {
      melody,
      bass,
      drums,
      metadata: {
        genre: genre.id,
        bpm,
        key,
        scale: scaleType,
        chordProgression: config.chordProgression,
        duration: config.duration
      }
    };
  }

  /**
   * Generate rhythmic pattern
   */
  private generateRhythm(beats: number[], density: number): number[] {
    const pattern: number[] = [];
    let lastHit = -2;
    
    for (let i = 0; i < beats.length; i++) {
      const beat = beats[i];
      const gap = i - lastHit;
      
      // Probability based on position and rhythm
      let probability = 0;
      
      // Strong beats have higher probability
      if (beat % 4 === 0) probability = 0.95;
      else if (beat % 4 === 2) probability = 0.7;
      else if (beat % 4 === 1 || beat % 4 === 3) probability = density;
      
      // Avoid running eighth notes
      if (gap < 2 && this.random() > 0.3) {
        probability *= 0.2;
      }
      
      if (this.random() < probability) {
        pattern.push(beat);
        lastHit = i;
      }
    }
    
    return pattern;
  }

  /**
   * Generate melody track
   */
  private generateMelody(
    scaleNotes: string[],
    totalBeats: number,
    measureLength: number,
    complexity: number
  ): MelodyNote[] {
    const melody: MelodyNote[] = [];
    const beatDuration = 1; // normalized
    
    // Generate melodic rhythmic pattern
    const rhythmPattern = [];
    for (let i = 0; i < totalBeats; i++) {
      const subdivision = this.random() < complexity ? 4 : 2;
      for (let j = 0; j < subdivision; j++) {
        rhythmPattern.push(i * subdivision + j);
      }
    }
    
    // Filter rhythm with probability
    const filteredRhythm = this.generateRhythm(rhythmPattern, complexity * 0.8);
    
    // Generate notes
    for (let i = 0; i < filteredRhythm.length; i++) {
      const beatPosition = filteredRhythm[i];
      
      // Select note from scale with probability weighting
      let note: string;
      const noteWeight = this.random();
      
      if (noteWeight < 0.5) {
        // Root notes more common
        note = this.pickWeighted(scaleNotes, [0.4, 0.15, 0.15, 0.1, 0.1, 0.05, 0.05]);
      } else if (noteWeight < 0.75) {
        // Fifth and third
        note = this.pickWeighted(scaleNotes.slice(0, 5), [0.1, 0.3, 0.3, 0.15, 0.15]);
      } else {
        // Random from scale
        note = this.pickRandom(scaleNotes);
      }
      
      // Determine note duration
      const isLongNote = this.random() < 0.15 && i < filteredRhythm.length - 2;
      const isShortNote = this.random() < 0.3;
      
      let duration: string;
      if (isLongNote) {
        duration = '2n';
      } else if (isShortNote) {
        duration = '16n';
      } else {
        duration = '8n';
      }
      
      // Skip if too close to previous
      const lastNote = melody[melody.length - 1];
      if (lastNote && parseFloat(lastNote.time) > beatPosition - 0.25) {
        continue;
      }
      
      // Add syncopation occasionally
      const syncopate = this.random() < 0.2 && beatPosition > 2;
      
      melody.push({
        time: (syncopate ? beatPosition - 0.25 : beatPosition) + 'n',
        note,
        duration,
        velocity: 0.5 + this.random() * 0.4
      });
    }
    
    return melody;
  }

  /**
   * Generate bass track
   */
  private generateBass(
    scaleNotes: string[],
    progression: ChordProgression,
    totalBeats: number,
    measureLength: number
  ): BassNote[] {
    const bass: BassNote[] = [];
    
    // Calculate beats per chord change
    const beatsPerChord = Math.floor(totalBeats / progression.chords.length);
    
    for (let i = 0; i < progression.chords.length; i++) {
      const chord = progression.chords[i];
      const chordNotes = parseRomanChord(chord, scaleNotes[0].replace(/\d/, ''));
      const bassNote = chordNotes[0].replace(/\d/, '2'); // Move to bass octave
      
      const chordStartBeat = i * beatsPerChord;
      
      // Root on beat 1
      bass.push({
        time: chordStartBeat + 'n',
        note: bassNote,
        duration: '4n',
        velocity: 0.85
      });
      
      // Fifth on beat 3 occasionally
      if (this.random() < 0.5 && chordNotes[1]) {
        bass.push({
          time: (chordStartBeat + 2) + 'n',
          note: chordNotes[1].replace(/\d/, '2'),
          duration: '8n',
          velocity: 0.6
        });
      }
      
      // Walking bass line for longer progressions
      if (beatsPerChord >= 8 && this.random() < 0.6) {
        const walkBeats = [0.5, 1, 1.5, 2];
        for (const wb of walkBeats) {
          const targetNote = scaleNotes[(i + Math.floor(wb)) % scaleNotes.length];
          bass.push({
            time: (chordStartBeat + wb) + 'n',
            note: targetNote.replace(/\d/, '2'),
            duration: '16n',
            velocity: 0.4
          });
        }
      }
    }
    
    return bass;
  }

  /**
   * Generate drum track
   */
  private generateDrums(
    patternType: string,
    totalBeats: number,
    measureLength: number
  ): DrumNote[] {
    const drums: DrumNote[] = [];
    
    // Get pattern based on type
    const patternMap: Record<string, { kick: number[]; snares: number[]; hihat: number[] }> = {
      'house': {
        kick: [0, 4, 8, 12],
        snares: [4, 12],
        hihat: [0, 2, 4, 6, 8, 10, 12, 14]
      },
      'techno': {
        kick: [0, 4, 8, 12],
        snares: [],
        hihat: [0, 2, 4, 6, 8, 10, 12, 14]
      },
      'hiphop': {
        kick: [0, 6, 10, 14],
        snares: [4, 12],
        hihat: [0, 1, 2, 3, 4, 5, 6, 7]
      },
      'trap': {
        kick: [0, 4, 8, 12, 14],
        snares: [6, 14],
        hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      },
      'rock': {
        kick: [0, 8, 12],
        snares: [4, 12],
        hihat: [0, 4, 8, 12]
      },
      'pop': {
        kick: [0, 8, 12],
        snares: [4, 12],
        hihat: [0, 2, 4, 6, 8, 10, 12, 14]
      },
      'jazz': {
        kick: [0, 7, 10, 14],
        snares: [3, 11],
        hihat: [0, 2, 4, 6, 8, 10, 12, 14]
      },
      'edm': {
        kick: [0, 4, 8, 12],
        snares: [4, 12],
        hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      },
      'dubstep': {
        kick: [0, 8],
        snares: [4, 12],
        hihat: [0, 4, 8, 12]
      },
      'dnb': {
        kick: [0, 2, 4, 6, 8, 10, 12, 14],
        snares: [3, 7, 11, 15],
        hihat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
      }
    };
    
    const pattern = patternMap[patternType] || patternMap['pop'];
    
    // Generate kick
    const kickPattern = pattern.kick || [];
    for (const beat of kickPattern) {
      if (beat < totalBeats) {
        drums.push({
          time: beat + 'n',
          drum: 'kick',
          velocity: 1
        });
      }
    }
    
    // Generate snare
    const snarePattern = pattern.snares || [];
    for (const beat of snarePattern) {
      if (beat < totalBeats) {
        drums.push({
          time: beat + 'n',
          drum: 'snare',
          velocity: 0.8
        });
      }
    }
    
    // Generate hi-hats
    const hihatPattern = pattern.hihat || [];
    for (const beat of hihatPattern) {
      if (beat < totalBeats) {
        drums.push({
          time: beat + 'n',
          drum: 'hihat',
          velocity: 0.4
        });
      }
    }
    
    // Add fills occasionally
    const fillFrequency = Math.floor(totalBeats / 16);
    if (fillFrequency > 0) {
      const fillPositions = [4, 12, 20, 28].filter(p => p < totalBeats);
      for (const pos of fillPositions) {
        // Add fill variation
        drums.push({
          time: pos + 'n',
          drum: 'fill',
          velocity: 0.7
        });
      }
    }
    
    return drums;
  }

  /**
   * Analyze and suggest improvements
   */
  analyzeTrack(track: GeneratedTrack): { score: number; suggestions: string[] } {
    const suggestions: string[] = [];
    let score = 50;
    
    // Check melody density
    if (track.melody.length > 50) {
      score += 10;
    } else if (track.melody.length < 10) {
      suggestions.push('Add more melodic variation');
    }
    
    // Check bass presence
    if (track.bass.length === 0) {
      suggestions.push('Add bass line for foundation');
      score -= 10;
    } else {
      score += 15;
    }
    
    // Check drum variety
    const uniqueDrums = new Set(track.drums.map(d => d.drum));
    if (uniqueDrums.size < 2) {
      suggestions.push('Add more drum variety');
    } else {
      score += 10;
    }
    
    // Check rhythm complexity
    const avgMelodyVelocity = track.melody.reduce((s, n) => s + n.velocity, 0) / track.melody.length;
    if (avgMelodyVelocity > 0.8) {
      suggestions.push('Consider softer dynamics for verses');
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      suggestions
    };
  }
}

export const realMusicGenerator = RealMusicGenerator.getInstance();
export default realMusicGenerator;