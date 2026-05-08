export interface Nucleotide {
  base: 'A' | 'T' | 'G' | 'C';
  pair: 'T' | 'A' | 'C' | 'G';
  color: string;
  pairColor: string;
}

export interface BioData {
  strand?: Nucleotide[];
}

export const BASE_COLORS: Record<string, string> = {
  A: '#f43f5e',  // Adenine
  T: '#06b6d4',  // Thymine
  G: '#10b981',  // Guanine
  C: '#f59e0b',  // Cytosine
};

export const PAIRS: Record<string, 'T' | 'A' | 'C' | 'G'> = { A: 'T', T: 'A', G: 'C', C: 'G' };
