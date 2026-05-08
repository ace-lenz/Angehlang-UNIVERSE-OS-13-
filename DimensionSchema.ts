/**
 * DimensionSchema.ts
 * 
 * Formal N-Dimensional ANGHV v3.0 Schema.
 * Maps logical data categories to specific photonic/quantum degrees of freedom.
 * Supports dynamic scaling from 50D to 500D.
 * 
 * NEW in v3.0:
 * - Dynamic dimension scaling
 * - Neural dimension category
 * - Semantic dimension category  
 * - CrossModal dimension category
 * - Auto-scaling based on content complexity
 */

export interface DimensionMetadata {
  id: number;
  label: string;
  category: 'Spatial' | 'Spectral' | 'Polarization' | 'OAM' | 'Mode' | 'Temporal' | 'Quantum' | 'Nonlinear' | 'Topological' | 'Environmental' | 'Control' | 'User-Preference' | 'Derived' | 'Neural' | 'Semantic' | 'CrossModal';
  description: string;
  unit?: string;
  range?: [number, number];
  dynamic?: boolean;
}

export interface DimensionConfig {
  baseDimensions: number;
  maxDimensions: number;
  autoScale: boolean;
  compression: 'lossless' | 'lossy' | 'adaptive';
  activeCategories: string[];
}

export const DEFAULT_DIMENSION_CONFIG: DimensionConfig = {
  baseDimensions: 50,
  maxDimensions: 500,
  autoScale: true,
  compression: 'adaptive',
  activeCategories: ['Spatial', 'Spectral', 'Polarization', 'OAM', 'Mode', 'Temporal', 'Quantum', 'Nonlinear', 'Topological', 'Environmental', 'Control', 'User-Preference', 'Derived', 'Neural', 'Semantic', 'CrossModal']
};

export const DIMENSION_SCHEMA: Record<number, DimensionMetadata> = {
  // ── Spatial Dimensions (3D) ───────────────────────────────────────────────
  1: { id: 1, label: 'Lattice_X', category: 'Spatial', description: 'Photonic lattice position X', unit: 'node' },
  2: { id: 2, label: 'Lattice_Y', category: 'Spatial', description: 'Photonic lattice position Y', unit: 'node' },
  3: { id: 3, label: 'Lattice_Z', category: 'Spatial', description: 'Photonic lattice position Z', unit: 'node' },
  
  // ── Spectral Dimensions (5D) ──────────────────────────────────────────────
  4: { id: 4, label: 'Wavelength', category: 'Spectral', description: 'Visible spectrum frequency', unit: 'nm', range: [400, 750] },
  5: { id: 5, label: 'Freq_Shift', category: 'Spectral', description: 'Doppler/Frequency shift', unit: 'THz' },
  6: { id: 6, label: 'Wave_Phase', category: 'Spectral', description: 'Coherent Phase offset', unit: 'rad', range: [0, 2 * Math.PI] },
  7: { id: 7, label: 'Coherence_T', category: 'Spectral', description: 'Coherence Time', unit: 'fs' },
  8: { id: 8, label: 'Spectral_BW', category: 'Spectral', description: 'Bandwidth width', unit: 'nm' },
  
  // ── Polarization Dimensions (4D) ──────────────────────────────────────────
  9:  { id: 9,  label: 'Stokes_S0', category: 'Polarization', description: 'Total Intensity' },
  10: { id: 10, label: 'Stokes_S1', category: 'Polarization', description: 'Horizontal/Vertical imbalance' },
  11: { id: 11, label: 'Stokes_S2', category: 'Polarization', description: 'Diagonal imbalance' },
  12: { id: 12, label: 'Stokes_S3', category: 'Polarization', description: 'Circular imbalance' },
  
  // ── OAM Dimensions (3D) ───────────────────────────────────────────────────
  13: { id: 13, label: 'OAM_Mode_L', category: 'OAM', description: 'Orbital Angular Momentum mode l' },
  14: { id: 14, label: 'OAM_Index_P', category: 'OAM', description: 'Radial index p' },
  15: { id: 15, label: 'OAM_Charge', category: 'OAM', description: 'Topological charge' },
  
  // ── Mode Dimensions (4D) ──────────────────────────────────────────────────
  16: { id: 16, label: 'Transverse_Mode', category: 'Mode', description: 'TE/TM selection' },
  17: { id: 17, label: 'Mode_Order', category: 'Mode', description: 'Higher-order index' },
  18: { id: 18, label: 'Coupling_Coeff', category: 'Mode', description: 'Mode coupling efficiency' },
  19: { id: 19, label: 'Orthogonality', category: 'Mode', description: 'Mode separation measure' },
  
  // ── Temporal Dimensions (3D) ──────────────────────────────────────────────
  20: { id: 20, label: 'Pulse_Timing', category: 'Temporal', description: 'Absolute pulse arrival', unit: 'fs' },
  21: { id: 21, label: 'Pulse_Delay', category: 'Temporal', description: 'Relative delay', unit: 'fs' },
  22: { id: 22, label: 'Rep_Rate', category: 'Temporal', description: 'Pulse repetition frequency', unit: 'Hz' },
  
  // ── Quantum Dimensions (4D) ───────────────────────────────────────────────
  23: { id: 23, label: 'Entanglement', category: 'Quantum', description: 'Bipartite entanglement score' },
  24: { id: 24, label: 'Superposition', category: 'Quantum', description: 'State probability weight' },
  25: { id: 25, label: 'Quantum_Coherence', category: 'Quantum', description: 'Basis-state coherence' },
  26: { id: 26, label: 'Squeezing', category: 'Quantum', description: 'Uncertainty reduction parameter' },
  
  // ── Nonlinear Dimensions (4D) ─────────────────────────────────────────────
  27: { id: 27, label: 'Harmonic_Index', category: 'Nonlinear', description: 'n-th harmonic order' },
  28: { id: 28, label: 'Mixing_Product', category: 'Nonlinear', description: 'FWM mixing order' },
  29: { id: 29, label: 'Parametric_Gain', category: 'Nonlinear', description: 'Optical gain scalar' },
  30: { id: 30, label: 'Kerr_Coeff', category: 'Nonlinear', description: 'Refractive index shift' },
  
  // ── Topological Dimensions (4D) ───────────────────────────────────────────
  31: { id: 31, label: 'Vortex_Charge', category: 'Topological', description: 'Phase singularity index' },
  32: { id: 32, label: 'Skyrmion_Num', category: 'Topological', description: 'Topological charge density' },
  33: { id: 33, label: 'Hopfion_State', category: 'Topological', description: 'Knotted field invariant' },
  34: { id: 34, label: 'Monopole_Charge', category: 'Topological', description: 'Synthetic magnetic charge' },
  
  // ── Environmental Dimensions (Simulated) (5D) ─────────────────────────────
  35: { id: 35, label: 'Env_Temp', category: 'Environmental', description: 'Simulated node temperature', unit: 'K' },
  36: { id: 36, label: 'Env_Press', category: 'Environmental', description: 'Simulated optical pressure', unit: 'Pa' },
  37: { id: 37, label: 'Env_Humidity', category: 'Environmental', description: 'Humidity index', unit: '%' },
  38: { id: 38, label: 'Env_Gas_Comp', category: 'Environmental', description: 'Gas composition signature' },
  39: { id: 39, label: 'Env_Optical_D', category: 'Environmental', description: 'Medium optical density' },
  
  // ── Control Dimensions (4D) ───────────────────────────────────────────────
  40: { id: 40, label: 'Control_Feedback', category: 'Control', description: 'Feedback gain' },
  41: { id: 41, label: 'Control_Feedforward', category: 'Control', description: 'Feedforward delay' },
  42: { id: 42, label: 'Control_Adaptation', category: 'Control', description: 'Real-time adaptation rate' },
  43: { id: 43, label: 'Control_Learning', category: 'Control', description: 'Neural convergence rate' },
  
  // ── User-Preference Dimensions (4D) ────────────────────────────────────────
  44: { id: 44, label: 'Pref_Quality', category: 'User-Preference', description: 'Fidelity target' },
  45: { id: 45, label: 'Pref_Perf', category: 'User-Preference', description: 'Latency vs Throughput' },
  46: { id: 46, label: 'Pref_Power', category: 'User-Preference', description: 'Thermal throttling limit' },
  47: { id: 47, label: 'Pref_Latency', category: 'User-Preference', description: 'Real-time tolerance' },
  
  // ── Derived Dimensions (3D+) ──────────────────────────────────────────────
  48: { id: 48, label: 'Derived_Entropy', category: 'Derived', description: 'Information entropy' },
  49: { id: 49, label: 'Derived_Density', category: 'Derived', description: 'Bit density per node' },
  50: { id: 50, label: 'Derived_Efficiency', category: 'Derived', description: 'Energy efficiency ratio' },
  
  // ── Neural Dimensions (10D) - NEW ───────────────────────────────
  51: { id: 51, label: 'Neural_Layer_Depth', category: 'Neural', description: 'Neural network layer depth', dynamic: true },
  52: { id: 52, label: 'Neural_Weights', category: 'Neural', description: 'Weight magnitude distribution', dynamic: true },
  53: { id: 53, label: 'Neural_Activation', category: 'Neural', description: 'Activation strength', dynamic: true },
  54: { id: 54, label: 'Neural_Gradient', category: 'Neural', description: 'Gradient flow', dynamic: true },
  55: { id: 55, label: 'Neural_Bias', category: 'Neural', description: 'Bias vector', dynamic: true },
  56: { id: 56, label: 'Neural_Dropout', category: 'Neural', description: 'Dropout mask', dynamic: true },
  57: { id: 57, label: 'Neural_Momentum', category: 'Neural', description: 'Momentum parameter', dynamic: true },
  58: { id: 58, label: 'Neural_LearningRate', category: 'Neural', description: 'Learning rate scalar', dynamic: true },
  59: { id: 59, label: 'Neural_Attention', category: 'Neural', description: 'Attention weights', dynamic: true },
  60: { id: 60, label: 'Neural_Embeddings', category: 'Neural', description: 'Embedding vector magnitude', dynamic: true },

  // ── Semantic Dimensions (10D) - NEW ────────────────────────
  61: { id: 61, label: 'Semantic_Topic', category: 'Semantic', description: 'Topic cluster', dynamic: true },
  62: { id: 62, label: 'Semantic_Context', category: 'Semantic', description: 'Context vector', dynamic: true },
  63: { id: 63, label: 'Semantic_Similarity', category: 'Semantic', description: 'Semantic similarity score', dynamic: true },
  64: { id: 64, label: 'Semantic_Intent', category: 'Semantic', description: 'User intent classification', dynamic: true },
  65: { id: 65, label: 'Semantic_Sentiment', category: 'Semantic', description: 'Sentiment polarity', dynamic: true },
  66: { id: 66, label: 'Semantic_Entities', category: 'Semantic', description: 'Named entity density', dynamic: true },
  67: { id: 67, label: 'Semantic_Relations', category: 'Semantic', description: 'Semantic relation strength', dynamic: true },
  68: { id: 68, label: 'Semantic_Ambiguity', category: 'Semantic', description: 'Ambiguity score', dynamic: true },
  69: { id: 69, label: 'Semantic_Coverage', category: 'Semantic', description: 'Coverage of domain', dynamic: true },
  70: { id: 70, label: 'Semantic_Freshness', category: 'Semantic', description: 'Recency of data', dynamic: true },

  // ── CrossModal Dimensions (10D) - NEW ───────────────────────
  71: { id: 71, label: 'CrossModal_Vision', category: 'CrossModal', description: 'Visual feature alignment', dynamic: true },
  72: { id: 72, label: 'CrossModal_Audio', category: 'CrossModal', description: 'Audio-visual correlation', dynamic: true },
  73: { id: 73, label: 'CrossModal_Text', category: 'CrossModal', description: 'Text-image alignment', dynamic: true },
  74: { id: 74, label: 'CrossModal_Motion', category: 'CrossModal', description: 'Motion representation', dynamic: true },
  75: { id: 75, label: 'CrossModal_3D', category: 'CrossModal', description: '3D spatial mapping', dynamic: true },
  76: { id: 76, label: 'CrossModal_Code', category: 'CrossModal', description: 'Code-text bridging', dynamic: true },
  77: { id: 77, label: 'CrossModal_Time', category: 'CrossModal', description: 'Temporal alignment', dynamic: true },
  78: { id: 78, label: 'CrossModal_Language', category: 'CrossModal', description: 'Multi-lingual mapping', dynamic: true },
  79: { id: 79, label: 'CrossModal_Knowledge', category: 'CrossModal', description: 'Knowledge transfer', dynamic: true },
  80: { id: 80, label: 'CrossModal_Reasoning', category: 'CrossModal', description: 'Cross-domain reasoning', dynamic: true },

  // ── Extended ANGHV Dimensions (81-500) - Reserved for future ─
  // These can be dynamically allocated based on content complexity
};

// Extended dimension schema for scaling beyond 80
export const EXTENDED_DIMENSION_SCHEMA: Record<number, DimensionMetadata> = {
  // Additional dimensions for high-complexity content
  81: { id: 81, label: 'Extended_01', category: 'Derived', description: 'Reserved for content-specific encoding', dynamic: true },
  82: { id: 82, label: 'Extended_02', category: 'Derived', description: 'Reserved for content-specific encoding', dynamic: true },
  83: { id: 83, label: 'Extended_03', category: 'Derived', description: 'Reserved for content-specific encoding', dynamic: true },
  84: { id: 84, label: 'Extended_04', category: 'Derived', description: 'Reserved for content-specific encoding', dynamic: true },
  85: { id: 85, label: 'Extended_05', category: 'Derived', description: 'Reserved for content-specific encoding', dynamic: true },
  // ... up to 500 can be added as needed
};

export type PhotonicVector = number[]; // Variable length (50-500)

// Dynamic dimension scaler
export class DimensionScaler {
  private config: DimensionConfig;
  private currentDimensions: number;

  constructor(config: Partial<DimensionConfig> = {}) {
    this.config = { ...DEFAULT_DIMENSION_CONFIG, ...config };
    this.currentDimensions = this.config.baseDimensions;
  }

  /**
   * Calculate required dimensions based on content complexity
   */
  calculateDimensions(contentComplexity: number): number {
    if (!this.config.autoScale) {
      return this.config.baseDimensions;
    }

    // Scale dimensions based on complexity (0-1)
    const scalingFactor = Math.min(10, Math.ceil(contentComplexity * 10));
    const requiredDimensions = this.config.baseDimensions + (scalingFactor * 10);
    
    return Math.min(requiredDimensions, this.config.maxDimensions);
  }

  /**
   * Get active dimension metadata based on current scale
   */
  getActiveDimensions(limit?: number): DimensionMetadata[] {
    const max = limit || this.currentDimensions;
    const activeDims: DimensionMetadata[] = [];
    
    for (let i = 1; i <= max && i <= 500; i++) {
      if (DIMENSION_SCHEMA[i] || EXTENDED_DIMENSION_SCHEMA[i]) {
        activeDims.push(DIMENSION_SCHEMA[i] || EXTENDED_DIMENSION_SCHEMA[i]);
      }
    }
    
    return activeDims;
  }

  /**
   * Get dimensions by category
   */
  getDimensionsByCategory(category: string): DimensionMetadata[] {
    return Object.values(DIMENSION_SCHEMA).filter(d => d.category === category);
  }

  /**
   * Set current dimension count
   */
  setDimensions(count: number): void {
    this.currentDimensions = Math.min(count, this.config.maxDimensions);
  }

  /**
   * Get current dimension count
   */
  getDimensions(): number {
    return this.currentDimensions;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<DimensionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get config
   */
  getConfig(): DimensionConfig {
    return this.config;
  }
}

// Default scaler instance
export const dimensionScaler = new DimensionScaler();
