import { upeEngine } from './UnifiedProcessingEngine';

export interface GeneratedLyrics {
  text: string;
  metadata: {
    mood: string;
    key: string;
    bpm: number;
    structure: string[]; // ['verse', 'chorus', etc.]
  };
}

export class LyricGenerator {
  /**
   * Generates lyrics based on a theme and mood.
   */
  async generateLyrics(prompt: string, mood?: string): Promise<GeneratedLyrics> {
    const result = await upeEngine.dispatch('logic', 
      `(GENERATE_LYRICS "${prompt}" :mood "${mood || 'balanced'}")`, 
      'quantum'
    );

    return {
      text: result.lyrics || 'Searching for the echoes in the machine...',
      metadata: {
        mood: result.mood || 'melancholic',
        key: result.key || 'Am',
        bpm: result.bpm || 120,
        structure: result.structure || ['verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus']
      }
    };
  }

  /**
   * Suggests chord progressions for generated lyrics.
   */
  async suggestChords(lyrics: string, genre: string): Promise<string[]> {
    const result = await upeEngine.dispatch('logic', 
      `(SUGGEST_CHORDS "${lyrics.substring(0, 100)}" :genre "${genre}")`, 
      'high'
    );
    return result.chords || ['Am', 'F', 'C', 'G'];
  }

  /**
   * Enhances a basic lyric prompt.
   */
  async enhanceLyricPrompt(input: string): Promise<string> {
    const result = await upeEngine.dispatch('logic', 
      `(ENHANCE_LYRIC_PROMPT "${input}")`, 
      'high'
    );
    return result.enhancedPrompt || input;
  }
}

export const lyricGenerator = new LyricGenerator();
