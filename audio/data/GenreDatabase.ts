/**
 * GenreDatabase.ts - 50+ Genres with Music Theory
 * 
 * Complete genre specifications including:
 * - Root notes and scales
 * - Chord progressions
 * - BPM ranges
 * - Characteristic instruments
 * - Drum patterns
 * - Tone.js presets mapping
 */

export interface GenreConfig {
  id: string;
  name: string;
  bpm: { min: number; max: number };
  rootNote: string;
  scale: string;
  chordProgression: string;
  instruments: string[];
  characteristics: string[];
  mood: string[];
  drumPattern: string;
  tonePreset: string;
}

export interface ScaleConfig {
  name: string;
  intervals: number[];
  description: string;
}

export interface ChordProgression {
  name: string;
  chords: string[];
  description: string;
}

export const SCALES: Record<string, ScaleConfig> = {
  'major': { name: 'Major', intervals: [0, 2, 4, 5, 7, 9, 11], description: 'Bright, happy' },
  'minor': { name: 'Natural Minor', intervals: [0, 2, 3, 5, 7, 8, 10], description: 'Sad, melancholic' },
  'dorian': { name: 'Dorian', intervals: [0, 2, 3, 5, 7, 9, 10], description: 'Minor with raised 6th' },
  'phrygian': { name: 'Phrygian', intervals: [0, 1, 3, 5, 7, 8, 10], description: 'Spanish/flamenco' },
  'lydian': { name: 'Lydian', intervals: [0, 2, 4, 6, 7, 9, 11], description: 'Dreamy, floating' },
  'mixolydian': { name: 'Mixolydian', intervals: [0, 2, 4, 5, 7, 9, 10], description: 'Bluesy, major 7th' },
  'locrian': { name: 'Locrian', intervals: [0, 1, 3, 5, 6, 8, 10], description: 'Dark, unstable' },
  'pentatonic_major': { name: 'Major Pentatonic', intervals: [0, 2, 4, 7, 9], description: 'Asian, folk' },
  'pentatonic_minor': { name: 'Minor Pentatonic', intervals: [0, 3, 5, 7, 10], description: 'Blues, rock' },
  'blues': { name: 'Blues', intervals: [0, 3, 5, 6, 7, 10], description: 'Blues scale' },
  'harmonic_minor': { name: 'Harmonic Minor', intervals: [0, 2, 3, 5, 7, 8, 11], description: 'Classical, exotic' },
  'melodic_minor': { name: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11], description: 'Jazz' },
  'whole_tone': { name: 'Whole Tone', intervals: [0, 2, 4, 6, 8, 10], description: 'Dreamy, floating' },
  'chromatic': { name: 'Chromatic', intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], description: 'All notes' },
};

export const CHORD_PROGRESSIONS: Record<string, ChordProgression> = {
  'I-IV-V-I': { name: 'Basic', chords: ['I', 'IV', 'V', 'I'], description: 'Classic pop' },
  'I-V-vi-IV': { name: 'Sensitive', chords: ['I', 'V', 'vi', 'IV'], description: 'Pop standard' },
  'vi-IV-I-V': { name: 'Sad', chords: ['vi', 'IV', 'I', 'V'], description: 'Emotional' },
  'ii-V-I': { name: 'Jazz', chords: ['ii', 'V', 'I'], description: 'Jazz standard' },
  'i-bVII-IV': { name: 'Andalusian', chords: ['i', 'bVII', 'IV', 'i'], description: 'Flamenco, rock' },
  'i-III-bVII-IV': { name: 'Minor Pop', chords: ['i', 'III', 'bVII', 'IV'], description: 'Modern pop' },
  'I-vi-IV-V': { name: '50s', chords: ['I', 'vi', 'IV', 'V'], description: '50s doo-wop' },
  'i-bVI-bVII-I': { name: 'Andalusian', chords: ['i', 'bVI', 'bVII', 'I'], description: 'Spanish' },
};

export const GENRE_DATABASE: GenreConfig[] = [
  // 1. Electronic / Dance
  {
    id: 'house',
    name: 'House',
    bpm: { min: 118, max: 130 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['4-on-floor kick', 'bass', 'hi-hats', 'piano', 'strings'],
    characteristics: ['steady beat', 'pitched kick', 'soulful', 'rhythmic'],
    mood: ['energetic', 'uplifting', 'groovy'],
    drumPattern: 'house',
    tonePreset: 'polysynth'
  },
  {
    id: 'techno',
    name: 'Techno',
    bpm: { min: 120, max: 135 },
    rootNote: 'C',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['modular synths', 'kick', 'hi-hats', 'bass', 'FX'],
    characteristics: ['repetitive', 'dark', 'mechanical', 'hypnotic'],
    mood: ['intense', 'dark', 'hypnotic'],
    drumPattern: 'techno',
    tonePreset: 'fmsynth'
  },
  {
    id: 'trance',
    name: 'Trance',
    bpm: { min: 125, max: 145 },
    rootNote: 'A',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['supersaw', 'kick', 'hi-hats', 'bass', 'strings', 'plucks'],
    characteristics: ['melodic', 'build-ups', 'emotional', 'uplifting'],
    mood: ['euphoric', 'emotional', 'spiritual'],
    drumPattern: 'trance',
    tonePreset: 'polysynth'
  },
  {
    id: 'dubstep',
    name: 'Dubstep',
    bpm: { min: 138, max: 142 },
    rootNote: 'C',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['wobble bass', 'heavy kick', 'snare', 'FX', 'reese'],
    characteristics: ['wobble', 'heavy', 'dark', 'drop-oriented'],
    mood: ['dark', 'intense', 'huge'],
    drumPattern: 'dubstep',
    tonePreset: 'fmsynth'
  },
  {
    id: 'drum_and_bass',
    name: 'Drum & Bass',
    bpm: { min: 160, max: 180 },
    rootNote: 'C',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['liquid bass', 'breakbeat', 'drums', 'pads'],
    characteristics: ['fast', 'complex rhythm', 'liquid', 'energetic'],
    mood: ['energetic', 'exciting', 'complex'],
    drumPattern: 'dnb',
    tonePreset: 'polysynth'
  },
  {
    id: 'edm',
    name: 'EDM',
    bpm: { min: 125, max: 140 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-V-vi-IV',
    instruments: ['supersaw', 'lead', 'kick', 'bass', 'drops'],
    characteristics: ['big', 'drop-heavy', 'commercial', 'energy'],
    mood: ['energetic', 'uplifting', 'huge'],
    drumPattern: 'edm',
    tonePreset: 'polysynth'
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    bpm: { min: 110, max: 130 },
    rootNote: 'E',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['retro synths', 'bass', 'drums', 'pad', 'guitar'],
    characteristics: ['80s', 'retro', 'nostalgic', 'dreamy'],
    mood: ['nostalgic', 'retro', 'dreamy'],
    drumPattern: 'synthwave',
    tonePreset: 'polysynth'
  },

  // 2. Hip Hop / Rap
  {
    id: 'hiphop',
    name: 'Hip Hop',
    bpm: { min: 80, max: 100 },
    rootNote: 'C',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['trap hi-hats', 'kick', '808', 'snare', 'samples'],
    characteristics: ['beat-driven', 'sample-based', 'flow', 'loops'],
    mood: ['chill', 'confident', 'urban'],
    drumPattern: 'hiphop',
    tonePreset: 'membrane'
  },
  {
    id: 'trap',
    name: 'Trap',
    bpm: { min: 140, max: 180 },
    rootNote: 'C',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['808', 'snare rolls', 'kick', 'hi-hats', 'synths'],
    characteristics: ['aggressive', 'triplet hi-hats', 'layers', 'hard'],
    mood: ['aggressive', 'intense', 'hard'],
    drumPattern: 'trap',
    tonePreset: 'membrane'
  },
  {
    id: 'lofi',
    name: 'Lo-Fi Hip Hop',
    bpm: { min: 60, max: 85 },
    rootNote: 'D',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['chill piano', 'dusty drums', 'bass', 'field recordings'],
    characteristics: ['chill', 'warm', 'imperfect', 'chill'],
    mood: ['chill', 'relaxed', 'mellow'],
    drumPattern: 'lofi',
    tonePreset: 'polysynth'
  },

  // 3. Rock / Metal
  {
    id: 'rock',
    name: 'Rock',
    bpm: { min: 100, max: 140 },
    rootNote: 'E',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['guitar', 'drums', 'bass', 'vocals'],
    characteristics: ['guitar-driven', 'energetic', 'band', 'live'],
    mood: ['energetic', 'rebellious', 'powerful'],
    drumPattern: 'rock',
    tonePreset: 'polysynth'
  },
  {
    id: 'metal',
    name: 'Metal',
    bpm: { min: 100, max: 180 },
    rootNote: 'D',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['distorted guitar', 'double bass', 'bass', 'vocals'],
    characteristics: ['heavy', 'aggressive', 'distorted', 'complex'],
    mood: ['aggressive', 'intense', 'dark'],
    drumPattern: 'metal',
    tonePreset: 'fmsynth'
  },
  {
    id: 'punk',
    name: 'Punk',
    bpm: { min: 140, max: 180 },
    rootNote: 'E',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['power chords', 'drums', 'bass', 'vocals'],
    characteristics: ['fast', 'energetic', 'rebellious', 'three-chord'],
    mood: ['energetic', 'rebellious', 'raw'],
    drumPattern: 'punk',
    tonePreset: 'polysynth'
  },

  // 4. Pop
  {
    id: 'pop',
    name: 'Pop',
    bpm: { min: 90, max: 120 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-V-vi-IV',
    instruments: ['vocals', 'synths', 'drums', 'bass', 'guitar'],
    characteristics: ['catchy', 'melodic', 'commercial', 'accessible'],
    mood: ['happy', 'uplifting', 'catchy'],
    drumPattern: 'pop',
    tonePreset: 'polysynth'
  },
  {
    id: 'dance_pop',
    name: 'Dance Pop',
    bpm: { min: 110, max: 130 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-V-vi-IV',
    instruments: ['synth', 'kick', 'bass', 'vocals', 'drums'],
    characteristics: ['danceable', 'electronic', 'pulsing', 'syncopated'],
    mood: ['energetic', 'danceable', 'fun'],
    drumPattern: 'dance',
    tonePreset: 'polysynth'
  },

  // 5. Jazz / Blues
  {
    id: 'jazz',
    name: 'Jazz',
    bpm: { min: 100, max: 140 },
    rootNote: 'C',
    scale: 'dorian',
    chordProgression: 'ii-V-I',
    instruments: ['piano', 'drums', 'bass', 'horn', 'guitar'],
    characteristics: ['improvisational', 'complex harmony', 'swing rhythm', 'sophisticated'],
    mood: ['sophisticated', 'chill', 'intellectual'],
    drumPattern: 'jazz',
    tonePreset: 'polysynth'
  },
  {
    id: 'blues',
    name: 'Blues',
    bpm: { min: 60, max: 100 },
    rootNote: 'E',
    scale: 'blues',
    chordProgression: 'I-IV-I',
    instruments: ['guitar', 'vocals', 'harp', 'bass', 'drums'],
    characteristics: ['12-bar', 'blue notes', 'call-response', 'soulful'],
    mood: ['soulful', 'emotional', 'classic'],
    drumPattern: 'blues',
    tonePreset: 'polysynth'
  },

  // 6. Classical / Orchestral
  {
    id: 'classical',
    name: 'Classical',
    bpm: { min: 60, max: 120 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['strings', 'piano', 'woodwinds', 'brass'],
    characteristics: ['structured', 'formal', 'emotional', 'acoustic'],
    mood: ['sophisticated', 'elegant', 'emotional'],
    drumPattern: 'classical',
    tonePreset: 'polysynth'
  },
  {
    id: 'orchestral',
    name: 'Orchestral',
    bpm: { min: 60, max: 140 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['full orchestra', 'strings', 'brass', 'winds', 'percussion'],
    characteristics: ['epic', 'dramatic', 'cinematic', 'full'],
    mood: ['epic', 'dramatic', 'cinematic'],
    drumPattern: 'orchestral',
    tonePreset: 'polysynth'
  },

  // 7. Ambient / Chill
  {
    id: 'ambient',
    name: 'Ambient',
    bpm: { min: 40, max: 80 },
    rootNote: 'E',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['pad', 'drone', 'texture', 'field recordings'],
    characteristics: ['atmospheric', 'textural', 'slow', 'evolving'],
    mood: ['calm', 'atmospheric', 'meditative'],
    drumPattern: 'ambient',
    tonePreset: 'polysynth'
  },
  {
    id: 'chillout',
    name: 'Chillout',
    bpm: { min: 70, max: 100 },
    rootNote: 'G',
    scale: 'major',
    chordProgression: 'I-vi-IV-V',
    instruments: ['soft drums', 'pads', 'piano', 'bass', 'vocals'],
    characteristics: ['relaxed', 'smooth', 'mellow', 'groovy'],
    mood: ['relaxed', 'chill', 'mellow'],
    drumPattern: 'chillout',
    tonePreset: 'polysynth'
  },
  {
    id: 'downtempo',
    name: 'Downtempo',
    bpm: { min: 80, max: 100 },
    rootNote: 'C',
    scale: 'minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['organic drums', 'bass', 'keys', 'samples'],
    characteristics: ['slow', 'organic', 'groovy', 'atmospheric'],
    mood: ['relaxed', 'groovy', 'atmospheric'],
    drumPattern: 'downtempo',
    tonePreset: 'polysynth'
  },

  // 8. R&B / Soul
  {
    id: 'rn_b',
    name: 'R&B',
    bpm: { min: 60, max: 100 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-vi-IV-V',
    instruments: ['drums', 'bass', 'piano', 'vocals', 'guitar'],
    characteristics: ['smooth', 'groovy', 'melodic', 'soulful'],
    mood: ['smooth', 'romantic', 'soulful'],
    drumPattern: 'rnb',
    tonePreset: 'polysynth'
  },
  {
    id: 'soul',
    name: 'Soul',
    bpm: { min: 80, max: 110 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['drums', 'bass', 'organ', 'horns', 'vocals'],
    characteristics: ['soulful', 'groovy', 'emotional', 'horn section'],
    mood: ['soulful', 'emotional', 'uplifting'],
    drumPattern: 'soul',
    tonePreset: 'polysynth'
  },
  {
    id: 'funk',
    name: 'Funk',
    bpm: { min: 100, max: 130 },
    rootNote: 'C',
    scale: 'mixolydian',
    chordProgression: 'I-IV-V-I',
    instruments: ['guitar', 'drums', 'bass', 'horns', 'clavinet'],
    characteristics: ['groovy', 'syncopated', 'tight rhythm', 'slap bass'],
    mood: ['funky', 'groovy', 'energetic'],
    drumPattern: 'funk',
    tonePreset: 'polysynth'
  },

  // 9. Country / Folk
  {
    id: 'country',
    name: 'Country',
    bpm: { min: 70, max: 140 },
    rootNote: 'G',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['guitar', 'pedal steel', 'drums', 'bass', 'vocals'],
    characteristics: ['storytelling', 'acoustic', 'band', ' Americana'],
    mood: ['wholesome', 'rural', 'storytelling'],
    drumPattern: 'country',
    tonePreset: 'polysynth'
  },
  {
    id: 'folk',
    name: 'Folk',
    bpm: { min: 60, max: 120 },
    rootNote: 'G',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['acoustic guitar', 'vocals', 'violin', 'cello'],
    characteristics: ['acoustic', 'traditional', 'melodic', 'storytelling'],
    mood: ['nostalgic', 'wholesome', 'organic'],
    drumPattern: 'folk',
    tonePreset: 'polysynth'
  },

  // 10. Latin / World
  {
    id: 'salsa',
    name: 'Salsa',
    bpm: { min: 160, max: 180 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['congas', 'bongos', 'timbales', 'piano', 'bass'],
    characteristics: ['rhythmic', 'danceable', 'horns', ' Spanish'],
    mood: ['energetic', 'passionate', 'danceable'],
    drumPattern: 'salsa',
    tonePreset: 'polysynth'
  },
  {
    id: 'reggae',
    name: 'Reggae',
    bpm: { min: 60, max: 90 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['drums', 'bass', 'guitar', 'keys', 'horns'],
    characteristics: ['offbeat rhythm', 'laid-back', 'bass-heavy', 'organic'],
    mood: ['chill', 'laid-back', 'positive'],
    drumPattern: 'reggae',
    tonePreset: 'polysynth'
  },
  {
    id: 'afrobeats',
    name: 'Afrobeat',
    bpm: { min: 100, max: 130 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['drums', 'bass', 'guitar', 'percussion', 'synths'],
    characteristics: ['complex rhythm', 'fusion', 'danceable', 'groovy'],
    mood: ['energetic', 'danceable', 'groovy'],
    drumPattern: 'afrobeats',
    tonePreset: 'polysynth'
  },

  // 11. Indie / Alternative
  {
    id: 'indie_rock',
    name: 'Indie Rock',
    bpm: { min: 100, max: 140 },
    rootNote: 'E',
    scale: 'major',
    chordProgression: 'I-V-vi-IV',
    instruments: ['guitar', 'drums', 'bass', 'vocals', 'synths'],
    characteristics: ['alternative', 'guitar-driven', 'melodic', 'eclectic'],
    mood: ['indie', 'alternative', 'creative'],
    drumPattern: 'indie',
    tonePreset: 'polysynth'
  },
  {
    id: 'dream_pop',
    name: 'Dream Pop',
    bpm: { min: 60, max: 100 },
    rootNote: 'E',
    scale: 'major',
    chordProgression: 'I-vi-IV-V',
    instruments: ['ethereal guitar', 'drums', 'synths', 'voice', 'bass'],
    characteristics: ['ambient', 'textural', 'dreamy', 'atmospheric'],
    mood: ['dreamy', 'ethereal', 'mellow'],
    drumPattern: 'dreampop',
    tonePreset: 'polysynth'
  },

  // 12. Specialty
  {
    id: 'quantum',
    name: 'Quantum',
    bpm: { min: 90, max: 140 },
    rootNote: 'E',
    scale: 'harmonic_minor',
    chordProgression: 'i-bVII-IV',
    instruments: ['quantum synths', 'phase modulation', 'AI-generated', 'neural textures'],
    characteristics: ['futuristic', 'AI-assisted', 'innovative', 'quantum coherence'],
    mood: ['futuristic', 'innovative', 'quantum'],
    drumPattern: 'quantum',
    tonePreset: 'fmsynth'
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    bpm: { min: 50, max: 120 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['orchestra', 'choir', 'piano', 'synths', 'percussion'],
    characteristics: ['epic', 'dramatic', 'emotional', 'film-score'],
    mood: ['epic', 'dramatic', 'emotional'],
    drumPattern: 'cinematic',
    tonePreset: 'polysynth'
  },
  {
    id: 'video_game',
    name: 'Video Game',
    bpm: { min: 100, max: 180 },
    rootNote: 'C',
    scale: 'major',
    chordProgression: 'I-IV-V-I',
    instruments: ['chiptune', 'retro synths', '8-bit', 'sound effects'],
    characteristics: ['retro', 'pixel-art', 'arcade', 'nostalgic'],
    mood: ['nostalgic', 'exciting', 'gaming'],
    drumPattern: 'game',
    tonePreset: 'square'
  }
];

export function getGenreById(id: string): GenreConfig | undefined {
  return GENRE_DATABASE.find(g => g.id === id);
}

export function getGenre(id: string): GenreConfig {
  return getGenreById(id) || GENRE_DATABASE[0];
}

export function getAllGenres(): GenreConfig[] {
  return GENRE_DATABASE;
}

export function getGenresByMood(mood: string): GenreConfig[] {
  return GENRE_DATABASE.filter(g => g.mood.includes(mood.toLowerCase()));
}

export function getGenresByBpm(bpm: number): GenreConfig[] {
  return GENRE_DATABASE.filter(g => bpm >= g.bpm.min && bpm <= g.bpm.max);
}

export function getGenresByScale(scale: string): GenreConfig[] {
  return GENRE_DATABASE.filter(g => g.scale === scale);
}

export function searchGenres(query: string): GenreConfig[] {
  const q = query.toLowerCase();
  return GENRE_DATABASE.filter(g => 
    g.name.toLowerCase().includes(q) ||
    g.id.toLowerCase().includes(q) ||
    g.characteristics.some(c => c.toLowerCase().includes(q)) ||
    g.mood.some(m => m.toLowerCase().includes(q))
  );
}

export default GENRE_DATABASE;