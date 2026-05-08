import { upeEngine } from './UnifiedProcessingEngine';
import { GENRE_PRESETS, GenreConfig } from '@/features/audio/audio-types';

export class GenreDetector {
  /**
   * Detects and enhances genre from natural language input.
   */
  async detectAndEnhance(input: string): Promise<{ detected: string; enhanced: string; config: GenreConfig }> {
    console.log(`[GenreDetector] Analyzing input: "${input}"`);

    // Simulated AI-driven genre detection through UPE
    const analysis = await upeEngine.dispatch('logic', 
      `(DETECT_GENRE_PROFILE "${input}")`, 
      'high'
    );

    const detected = analysis.genre || 'ambient';
    const enhanced = analysis.enhancedPrompt || `A high-fidelity ${detected} soundscape with modern textures.`;
    
    // Fallback to presets if specific config not generated
    const config = GENRE_PRESETS[detected as keyof typeof GENRE_PRESETS] || GENRE_PRESETS['quantum'];

    return { detected, enhanced, config };
  }

  /**
   * Blends multiple genres into a single configuration.
   */
  async blendGenres(genres: string[]): Promise<GenreConfig> {
    const result = await upeEngine.dispatch('logic', 
      `(BLEND_AUDIO_PROFILES "${genres.join(', ')}")`, 
      'quantum'
    );

    return result.config || GENRE_PRESETS['quantum'];
  }

  /**
   * Suggests improvements to a user's genre prompt.
   */
  async suggestEnhancements(input: string): Promise<string[]> {
    const analysis = await upeEngine.dispatch('logic', 
      `(SUGGEST_AUDIO_ENHANCEMENTS "${input}")`, 
      'high'
    );
    return analysis.suggestions || [
      'Add more sub-bass energy',
      'Incorporate granular textures',
      'Switch to a 128 BPM driving rhythm'
    ];
  }
}

export const genreDetector = new GenreDetector();
