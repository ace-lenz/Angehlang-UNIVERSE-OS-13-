import { AngvFrame } from './AngvComputeEngine';

export interface DimensionMetadata {
  index: number;
  label: string;
  unit: string;
  category: string;
  range: [number, number];
  description: string;
}

export const DIMENSION_MAP: Record<number, DimensionMetadata> = {
  1:  { index: 1,  label: 'X_Spatial',      unit: 'units',   category: 'Spatial',       range: [-1000, 1000],      description: 'X coordinate in node lattice' },
  2:  { index: 2,  label: 'Y_Spatial',      unit: 'units',   category: 'Spatial',       range: [-1000, 1000],      description: 'Y coordinate in node lattice' },
  3:  { index: 3,  label: 'Z_Spatial',      unit: 'units',   category: 'Spatial',       range: [-1000, 1000],      description: 'Z coordinate in node lattice' },
  4:  { index: 4,  label: 'Wavelength',     unit: 'nm',       category: 'Spectral',      range: [300, 1500],        description: 'Photon wavelength λ' },
  5:  { index: 5,  label: 'Frequency',      unit: 'THz',      category: 'Spectral',      range: [100, 1000],        description: 'Optical frequency f' },
  6:  { index: 6,  label: 'Phase',          unit: 'rad',      category: 'Spectral',      range: [0, 2*Math.PI],    description: 'Phase φ' },
  7:  { index: 7,  label: 'Time',           unit: 'ps',       category: 'Spectral',      range: [0, 10000],        description: 'Temporal position t' },
  8:  { index: 8,  label: 'Bandwidth',      unit: 'nm',       category: 'Spectral',      range: [0, 500],          description: 'Spectral bandwidth' },
  9:  { index: 9,  label: 'Stokes_S0',      unit: 'norm',     category: 'Polarization', range: [0, 1],            description: 'Total intensity' },
  10: { index: 10, label: 'Stokes_S1',      unit: 'norm',     category: 'Polarization', range: [-1, 1],           description: 'Horizontal-Linear' },
  11: { index: 11, label: 'Stokes_S2',      unit: 'norm',     category: 'Polarization', range: [-1, 1],           description: '45° Linear' },
  12: { index: 12, label: 'Stokes_S3',      unit: 'norm',     category: 'Polarization', range: [-1, 1],           description: 'Circular (RCP/LCP)' },
  13: { index: 13, label: 'OAM_l',          unit: 'ħ',        category: 'OAM',          range: [-10, 10],         description: 'Orbital angular momentum' },
  14: { index: 14, label: 'OAM_p',          unit: 'rad/λ',    category: 'OAM',          range: [0, 2*Math.PI],   description: 'OAM polarization' },
  15: { index: 15, label: 'OAM_charge',     unit: 'e',        category: 'OAM',          range: [-5, 5],          description: 'Topological charge' },
  16: { index: 16, label: 'Mode_TEM',       unit: 'index',    category: 'Mode',         range: [0, 20],          description: 'Transverse mode' },
  17: { index: 17, label: 'Mode_order',     unit: 'order',    category: 'Mode',         range: [0, 10],          description: 'Mode order indices' },
  18: { index: 18, label: 'Mode_coupling',  unit: 'norm',     category: 'Mode',         range: [0, 1],           description: 'Coupling coefficient' },
  19: { index: 19, label: 'Mode_ortho',     unit: 'deg',      category: 'Mode',         range: [0, 90],          description: 'Orthogonality angle' },
  20: { index: 20, label: 'Timing',         unit: 'ns',       category: 'Temporal',     range: [0, 10000],       description: 'Pulse timing' },
  21: { index: 21, label: 'Delay',          unit: 'ns',       category: 'Temporal',     range: [0, 1000],        description: 'Propagation delay' },
  22: { index: 22, label: 'Rate',           unit: 'GHz',       category: 'Temporal',     range: [0.1, 100],       description: 'Repetition rate' },
  23: { index: 23, label: 'Entanglement',   unit: 'norm',     category: 'Quantum',      range: [0, 1],           description: 'Entanglement measure' },
  24: { index: 24, label: 'Superposition',  unit: 'norm',     category: 'Quantum',      range: [0, 1],           description: 'Coherence state' },
  25: { index: 25, label: 'Coherence',      unit: 'norm',     category: 'Quantum',      range: [0, 1],           description: 'Phase coherence' },
  26: { index: 26, label: 'Squeezing',      unit: 'dB',       category: 'Quantum',      range: [0, 20],          description: 'Quadrature squeezing' },
  27: { index: 27, label: 'Harmonic',       unit: 'order',    category: 'Nonlinear',    range: [1, 10],          description: 'Harmonic order' },
  28: { index: 28, label: 'Mixing',         unit: 'norm',     category: 'Nonlinear',    range: [0, 1],           description: 'Mixing efficiency' },
  29: { index: 29, label: 'Gain',           unit: 'dB',       category: 'Nonlinear',    range: [0, 60],          description: 'Amplification gain' },
  30: { index: 30, label: 'Kerr',           unit: '1/W/km',   category: 'Nonlinear',    range: [0, 10],          description: 'Kerr coefficient' },
  31: { index: 31, label: 'Vortex',        unit: 'index',    category: 'Topological',  range: [0, 10],          description: 'Vortex number' },
  32: { index: 32, label: 'Skyrmion',       unit: 'norm',     category: 'Topological',  range: [0, 1],           description: 'Skyrmion density' },
  33: { index: 33, label: 'Hopfion',        unit: 'index',    category: 'Topological',  range: [0, 5],           description: 'Hopf invariant' },
  34: { index: 34, label: 'Monopole',       unit: 'charge',   category: 'Topological',  range: [0, 1],           description: 'Magnetic charge' },
  35: { index: 35, label: 'Temperature',    unit: 'K',        category: 'Environmental',range: [0, 1000],        description: 'System temperature' },
  36: { index: 36, label: 'Pressure',       unit: 'Pa',        category: 'Environmental',range: [0, 1e6],         description: 'Ambient pressure' },
  37: { index: 37, label: 'Humidity',       unit: '%',        category: 'Environmental',range: [0, 100],         description: 'Relative humidity' },
  38: { index: 38, label: 'Gas_Composition',unit: 'norm',      category: 'Environmental',range: [0, 1],           description: 'Gas mixture ratio' },
  39: { index: 39, label: 'Density',        unit: 'kg/m³',    category: 'Environmental',range: [0, 5000],        description: 'Medium density' },
  40: { index: 40, label: 'Feedback',       unit: 'norm',     category: 'Control',       range: [0, 1],           description: 'Feedback gain' },
  41: { index: 41, label: 'Feedforward',     unit: 'norm',     category: 'Control',       range: [0, 1],           description: 'Feedforward gain' },
  42: { index: 42, label: 'Adaptation',      unit: 'rate',     category: 'Control',       range: [0, 1],           description: 'Adaptation rate' },
  43: { index: 43, label: 'Learning',        unit: 'epoch',    category: 'Control',       range: [0, 1000],        description: 'Training epoch' },
  44: { index: 44, label: 'Quality',         unit: 'score',    category: 'User_Pref',    range: [0, 1],           description: 'Output quality' },
  45: { index: 45, label: 'Performance',     unit: 'score',    category: 'User_Pref',    range: [0, 1],           description: 'Performance mode' },
  46: { index: 46, label: 'Power',           unit: 'W',        category: 'User_Pref',    range: [0, 500],         description: 'Power budget' },
  47: { index: 47, label: 'Latency',         unit: 'ms',       category: 'User_Pref',    range: [0, 1000],        description: 'Max latency' },
  48: { index: 48, label: 'Entropy',        unit: 'bits',     category: 'Derived',      range: [0, 50],          description: 'Information entropy' },
  49: { index: 49, label: 'Density',        unit: 'norm',      category: 'Derived',      range: [0, 1],           description: 'State density' },
  50: { index: 50, label: 'Efficiency',     unit: 'ratio',    category: 'Derived',      range: [0, 1],           description: 'Energy efficiency' },
};

export const DIMENSION_CATEGORIES = {
  Spatial:        [1, 2, 3],
  Spectral:       [4, 5, 6, 7, 8],
  Polarization:  [9, 10, 11, 12],
  OAM:            [13, 14, 15],
  Mode:           [16, 17, 18, 19],
  Temporal:       [20, 21, 22],
  Quantum:        [23, 24, 25, 26],
  Nonlinear:      [27, 28, 29, 30],
  Topological:    [31, 32, 33, 34],
  Environmental:  [35, 36, 37, 38, 39],
  Control:        [40, 41, 42, 43],
  User_Pref:      [44, 45, 46, 47],
  Derived:        [48, 49, 50],
};

export function getVectorLabel(index: number): string {
  return DIMENSION_MAP[index]?.label ?? `D${index}_Unknown`;
}

export function getDimensionMetadata(index: number): DimensionMetadata | undefined {
  return DIMENSION_MAP[index];
}

export function getCategoryDimensions(category: keyof typeof DIMENSION_CATEGORIES): number[] {
  return DIMENSION_CATEGORIES[category] ?? [];
}

export function vectorToDimensions(vector: number[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < Math.min(vector.length, 50); i++) {
    const meta = DIMENSION_MAP[i + 1];
    if (meta) {
      result[meta.label] = vector[i];
    } else {
      result[`D${i + 1}`] = vector[i];
    }
  }
  return result;
}

export function dimensionsToVector(dims: Record<string, number>): number[] {
  const vector = new Array(50).fill(0);
  for (const [label, value] of Object.entries(dims)) {
    const index = Object.entries(DIMENSION_MAP).find(([_, m]) => m.label === label)?.[0];
    if (index) {
      vector[parseInt(index) - 1] = value;
    }
  }
  return vector;
}

export function validateVector(vector: number[]): { valid: boolean; populated: number; missing: number[] } {
  const missing: number[] = [];
  let populated = 0;
  
  for (let i = 0; i < 50; i++) {
    if (vector[i] === undefined || vector[i] === 0) {
      missing.push(i + 1);
    } else {
      populated++;
    }
  }
  
  return { valid: missing.length === 0, populated, missing };
}

export class DimensionMapper {
  static getLabel(index: number): string {
    return getVectorLabel(index);
  }

  static getMetadata(index: number): DimensionMetadata | undefined {
    return getDimensionMetadata(index);
  }

  static toDimensions(vector: number[]): Record<string, number> {
    return vectorToDimensions(vector);
  }

  static fromDimensions(dims: Record<string, number>): number[] {
    return dimensionsToVector(dims);
  }

  static getCategoryIndex(category: keyof typeof DIMENSION_CATEGORIES): number[] {
    return getCategoryDimensions(category);
  }

  static validate(vector: number[]): { valid: boolean; populated: number; missing: number[] } {
    return validateVector(vector);
  }

  static createSemanticVector(params: {
    intentDomain?: string;
    promptKey?: string;
    moteScore?: number;
    zetaScalar?: number;
    temperature?: number;
    pressure?: number;
    coherence?: number;
    entropy?: number;
    quality?: number;
    performance?: number;
    latency?: number;
  }): number[] {
    const vector = new Array(50).fill(0);
    
    const {
      intentDomain = 'general',
      promptKey = '',
      moteScore = 0.5,
      zetaScalar = 1.0,
      temperature = 273,
      pressure = 101325,
      coherence = 0.8,
      entropy = 10,
      quality = 0.9,
      performance = 0.8,
      latency = 50
    } = params;

    const domainHash = this.hashString(intentDomain + promptKey);
    
    vector[0] = Math.sin(domainHash * 0.1) * 100;
    vector[1] = Math.cos(domainHash * 0.2) * 100;
    vector[2] = Math.sin(domainHash * 0.3) * 100;
    
    vector[3] = 450 + (domainHash % 300);
    vector[4] = 200 + (domainHash % 500);
    vector[5] = (domainHash % 1000) / 1000 * 2 * Math.PI;
    vector[6] = (domainHash % 10000);
    vector[7] = 50 + (domainHash % 100);
    
    vector[8] = moteScore;
    vector[9] = Math.sin(moteScore * Math.PI) > 0 ? 1 : -1;
    vector[10] = Math.cos(moteScore * Math.PI / 2);
    vector[11] = Math.sin(moteScore * Math.PI / 4);
    
    vector[12] = Math.floor(domainHash % 10);
    vector[13] = (domainHash % 1000) / 1000 * 2 * Math.PI;
    vector[14] = domainHash % 5;
    vector[15] = 0;
    vector[16] = 1;
    vector[17] = 0.5;
    vector[18] = 45;
    
    vector[19] = Math.random() * 100;
    vector[20] = 10 + (domainHash % 100);
    vector[21] = 10 + (domainHash % 50);
    
    vector[22] = Math.min(coherence, 1);
    vector[23] = Math.min(coherence * 0.9, 1);
    vector[24] = coherence;
    vector[25] = Math.max(0, 10 - Math.abs(zetaScalar - 1) * 5);
    
    vector[26] = 1 + Math.floor(domainHash % 5);
    vector[27] = 0.7;
    vector[28] = 20;
    vector[29] = 1;
    
    vector[30] = Math.floor(domainHash % 5);
    vector[31] = 0.5;
    vector[32] = 1;
    vector[33] = 0;
    
    vector[34] = temperature;
    vector[35] = pressure;
    vector[36] = 50;
    vector[37] = 0.78;
    vector[38] = 1.0;
    
    vector[39] = 0.5;
    vector[40] = 0.5;
    vector[41] = 0.7;
    vector[42] = Math.floor(domainHash % 100);
    
    vector[43] = quality;
    vector[44] = performance;
    vector[45] = 50;
    vector[46] = latency;
    
    vector[47] = entropy;
    vector[48] = 0.5;
    vector[49] = 0.8;

    return vector;
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export function createPhotonicVector(
  domain: string,
  key: string,
  moteScore: number,
  zetaScalar: number,
  envOverrides?: { temperature?: number; pressure?: number }
): number[] {
  return DimensionMapper.createSemanticVector({
    intentDomain: domain,
    promptKey: key,
    moteScore,
    zetaScalar,
    temperature: envOverrides?.temperature ?? 273,
    pressure: envOverrides?.pressure ?? 101325,
    coherence: Math.min(moteScore + 0.2, 1),
    entropy: 10 + (1 - moteScore) * 20,
    quality: moteScore,
    performance: 0.8,
    latency: 50
  });
}