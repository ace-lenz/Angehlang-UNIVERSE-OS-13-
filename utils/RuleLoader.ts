import { mcpTools } from '@/tools/MCPipeline';

export interface Rule {
  name: string;
  content: string;
  globs: string[];
}

/**
 * RuleLoader - Loads project-specific rules from .angie/rules/
 * Inspired by Cursor's .cursor/rules/ modular instructions.
 */
export class RuleLoader {
  private static RULES_PATH = '.angie/rules';
  private rules: Rule[] = [];

  constructor() {}

  /**
   * Load all rules from the designated directory
   */
  public async loadRules(): Promise<void> {
    try {
        const directory = await mcpTools.callTool('list_directory', { path: RuleLoader.RULES_PATH });
        const loaded: Rule[] = [];

        for (const entry of directory.entries) {
            if (entry.name.endsWith('.md')) {
                const { content } = await mcpTools.callTool('read_file', { path: `${RuleLoader.RULES_PATH}/${entry.name}` });
                
                // Extract globs from frontmatter or first line if available
                const globsMatch = content.match(/globs:\s*\[(.*?)\]/);
                const globs = globsMatch 
                    ? globsMatch[1].split(',').map(g => g.trim().replace(/['"]/g, ''))
                    : ['*'];

                loaded.push({
                    name: entry.name,
                    content,
                    globs
                });
                console.log(`[RuleLoader] Loaded rule: ${entry.name}`);
            }
        }
        this.rules = loaded;
    } catch (e) {
        console.warn(`[RuleLoader] No rules found in ${RuleLoader.RULES_PATH}`);
    }
  }

  /**
   * Get rules that match a specific file path
   */
  public getRulesForFile(path: string): string[] {
    return this.rules
      .filter(rule => rule.globs.some(glob => this.matchesGlob(path, glob)))
      .map(rule => `RULE: ${rule.name}\n${rule.content}`);
  }

  private matchesGlob(path: string, glob: string): boolean {
    if (glob === '*') return true;
    const regex = new RegExp('^' + glob.replace(/\*/g, '.*') + '$');
    return regex.test(path);
  }

  public getAllRulesContent(): string {
    return this.rules.map(r => r.content).join('\n\n---\n\n');
  }
}

export const ruleLoader = new RuleLoader();
