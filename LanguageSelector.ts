/**
 * LanguageSelector.ts - Smart Language Selection Engine
 * 
 * Auto-selects best language based on engineering standards,
 * architecture requirements, capability, power, and industry standards.
 * User can override at any time.
 */

import type { LanguageType } from './IntentAnalyzer';

export interface LanguageConfig {
  id: LanguageType;
  name: string;
  fullName: string;
  extensions: string[];
  primaryUse: string[];
  performance: number;
  safety: number;
  ecosystem: number;
  learning: number;
  errors: ErrorPrevention;
}

export interface ErrorPrevention {
  strictTypes: boolean;
  nullSafety: boolean;
  boundsCheck: boolean;
  networkSafety: boolean;
  inputSanitization: boolean;
  memorySafety: boolean;
  concurrencySafety: boolean;
}

export interface LanguageSelection {
  primary: LanguageConfig;
  fallbacks: LanguageConfig[];
  multiLanguage: boolean;
  totalLanguages: number;
  selectionReason: string[];
}

// Language scoring matrix
const LANGUAGE_CONFIGS: Record<LanguageType, LanguageConfig> = {
  typescript: {
    id: 'typescript',
    name: 'TS',
    fullName: 'TypeScript',
    extensions: ['.ts', '.tsx'],
    primaryUse: ['Web Apps', 'Full Stack', 'Mobile', 'APIs'],
    performance: 85,
    safety: 95,
    ecosystem: 98,
    learning: 90,
    errors: {
      strictTypes: true,
      nullSafety: true,
      boundsCheck: true,
      networkSafety: true,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: true
    }
  },
  javascript: {
    id: 'javascript',
    name: 'JS',
    fullName: 'JavaScript',
    extensions: ['.js', '.jsx'],
    primaryUse: ['Web Apps', 'Browser Extensions'],
    performance: 80,
    safety: 70,
    ecosystem: 100,
    learning: 95,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: true,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  python: {
    id: 'python',
    name: 'PY',
    fullName: 'Python',
    extensions: ['.py'],
    primaryUse: ['AI/ML', 'Backend', 'Data Science', 'Automation'],
    performance: 75,
    safety: 85,
    ecosystem: 95,
    learning: 100,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: true,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  go: {
    id: 'go',
    name: 'GO',
    fullName: 'Golang',
    extensions: ['.go'],
    primaryUse: ['Backend', 'APIs', 'CLI Tools', 'DevOps'],
    performance: 95,
    safety: 85,
    ecosystem: 85,
    learning: 95,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: true,
      networkSafety: true,
      inputSanitization: true,
      memorySafety: true,
      concurrencySafety: true
    }
  },
  rust: {
    id: 'rust',
    name: 'RS',
    fullName: 'Rust',
    extensions: ['.rs'],
    primaryUse: ['Systems', 'Game Engines', 'WebAssembly', 'CLI'],
    performance: 100,
    safety: 100,
    ecosystem: 80,
    learning: 60,
    errors: {
      strictTypes: true,
      nullSafety: true,
      boundsCheck: true,
      networkSafety: true,
      inputSanitization: true,
      memorySafety: true,
      concurrencySafety: true
    }
  },
  c: {
    id: 'c',
    name: 'C',
    fullName: 'C',
    extensions: ['.c', '.h'],
    primaryUse: ['Systems', 'Kernels', 'Drivers', 'Embedded'],
    performance: 100,
    safety: 60,
    ecosystem: 90,
    learning: 70,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    fullName: 'C++',
    extensions: ['.cpp', '.hpp', '.cc'],
    primaryUse: ['Game Engines', 'Graphics', 'High Performance'],
    performance: 100,
    safety: 70,
    ecosystem: 95,
    learning: 65,
    errors: {
      strictTypes: true,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: true,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  csharp: {
    id: 'csharp',
    name: 'C#',
    fullName: 'C#',
    extensions: ['.cs'],
    primaryUse: ['.NET Apps', 'Game (Unity)', 'Enterprise'],
    performance: 90,
    safety: 90,
    ecosystem: 85,
    learning: 80,
    errors: {
      strictTypes: true,
      nullSafety: true,
      boundsCheck: true,
      networkSafety: true,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: true
    }
  },
  lua: {
    id: 'lua',
    name: 'LUA',
    fullName: 'Lua',
    extensions: ['.lua'],
    primaryUse: ['Scripting', 'Game Logic', 'Embedded'],
    performance: 90,
    safety: 60,
    ecosystem: 70,
    learning: 95,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  html: {
    id: 'html',
    name: 'HTML',
    fullName: 'HTML5',
    extensions: ['.html', '.htm'],
    primaryUse: ['Web Pages', 'Email Templates'],
    performance: 90,
    safety: 80,
    ecosystem: 95,
    learning: 100,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  css: {
    id: 'css',
    name: 'CSS',
    fullName: 'CSS3',
    extensions: ['.css', '.scss', '.sass'],
    primaryUse: ['Styling', 'Animations', 'Responsive Design'],
    performance: 85,
    safety: 90,
    ecosystem: 95,
    learning: 100,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: false,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  sql: {
    id: 'sql',
    name: 'SQL',
    fullName: 'PostgreSQL/MySQL',
    extensions: ['.sql'],
    primaryUse: ['Queries', 'Database', 'Migrations'],
    performance: 95,
    safety: 85,
    ecosystem: 90,
    learning: 85,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: true,
      memorySafety: true,
      concurrencySafety: true
    }
  },
  bash: {
    id: 'bash',
    name: 'SH',
    fullName: 'Bash/Shell',
    extensions: ['.sh', '.bash'],
    primaryUse: ['Automation', 'Scripts', 'CI/CD'],
    performance: 80,
    safety: 60,
    ecosystem: 85,
    learning: 80,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: false,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  yaml: {
    id: 'yaml',
    name: 'YAML',
    fullName: 'YAML',
    extensions: ['.yaml', '.yml'],
    primaryUse: ['Configuration', 'DevOps', 'K8s'],
    performance: 90,
    safety: 80,
    ecosystem: 90,
    learning: 90,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  },
  json: {
    id: 'json',
    name: 'JSON',
    fullName: 'JSON',
    extensions: ['.json'],
    primaryUse: ['Configuration', 'Data Exchange', 'APIs'],
    performance: 95,
    safety: 80,
    ecosystem: 100,
    learning: 100,
    errors: {
      strictTypes: false,
      nullSafety: false,
      boundsCheck: false,
      networkSafety: false,
      inputSanitization: true,
      memorySafety: false,
      concurrencySafety: false
    }
  }
};

class LanguageSelector {
  private userOverride: LanguageType | null = null;
  
  selectLanguage(
    intentRequirements: string[],
    userPreference?: LanguageType,
    forceUserChoice: boolean = false
  ): LanguageSelection {
    if (forceUserChoice && userPreference) {
      this.userOverride = userPreference;
      const primary = LANGUAGE_CONFIGS[userPreference];
      return {
        primary,
        fallbacks: [],
        multiLanguage: false,
        totalLanguages: 1,
        selectionReason: ['User specified language override']
      };
    }

    if (this.userOverride && !userPreference) {
      const primary = LANGUAGE_CONFIGS[this.userOverride];
      return {
        primary,
        fallbacks: [],
        multiLanguage: false,
        totalLanguages: 1,
        selectionReason: ['User previously specified language']
      };
    }

    if (userPreference) {
      const primary = LANGUAGE_CONFIGS[userPreference];
      return {
        primary,
        fallbacks: [],
        multiLanguage: false,
        totalLanguages: 1,
        selectionReason: ['User selected language']
      };
    }

    return this.autoSelect(intentRequirements);
  }

  private autoSelect(requirements: string[]): LanguageSelection {
    const scores = new Map<LanguageType, number>();
    
    for (const [langId, config] of Object.entries(LANGUAGE_CONFIGS)) {
      let score = 0;
      
      for (const req of requirements) {
        const reqLower = req.toLowerCase();
        
        for (const use of config.primaryUse) {
          if (use.toLowerCase().includes(reqLower) || reqLower.includes(use.toLowerCase())) {
            score += 10;
          }
        }
      }
      
      score += (config.performance + config.safety + config.ecosystem) / 30;
      
      scores.set(langId as LanguageType, score);
    }

    const sortedLanguages = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const primary = LANGUAGE_CONFIGS[sortedLanguages[0][0]];
    const fallbacks = sortedLanguages.slice(1, 4).map(([id]) => LANGUAGE_CONFIGS[id]);

    return {
      primary,
      fallbacks,
      multiLanguage: sortedLanguages.length > 1,
      totalLanguages: sortedLanguages.length,
      selectionReason: [
        `Best for: ${primary.primaryUse.join(', ')}`,
        `Performance: ${primary.performance}%`,
        `Safety Score: ${primary.safety}%`,
        `Ecosystem: ${primary.ecosystem}%`
      ]
    };
  }

  setUserOverride(language: LanguageType): void {
    this.userOverride = language;
  }

  clearUserOverride(): void {
    this.userOverride = null;
  }

  getLanguageConfig(language: LanguageType): LanguageConfig {
    return LANGUAGE_CONFIGS[language];
  }

  getAllLanguages(): LanguageConfig[] {
    return Object.values(LANGUAGE_CONFIGS);
  }

  getErrorPreventionLevel(language: LanguageType): ErrorPrevention {
    return LANGUAGE_CONFIGS[language].errors;
  }

  getBestFor(useCase: string): LanguageConfig[] {
    return Object.values(LANGUAGE_CONFIGS)
      .filter(config => 
        config.primaryUse.some(use => 
          use.toLowerCase().includes(useCase.toLowerCase())
        )
      )
      .sort((a, b) => b.safety - a.safety);
  }
}

export const languageSelector = new LanguageSelector();
export default languageSelector;