// Plan Item ID: TI-1
/**
 * VersionControlEngine.ts — Sovereign Logic Versioning and Branching
 * 
 * Provides simulated Git operations for the Code Studio, enabling
 * history tracking, branching, and state rollbacks.
 */

export interface Commit {
  id: string;
  message: string;
  timestamp: string;
  author: string;
  filesChanged: string[];
  parent?: string;
}

export interface Branch {
  name: string;
  head: string; // Commit ID
}

class VersionControlEngine {
  private commits: Map<string, Commit> = new Map();
  private branches: Map<string, Branch> = new Map();
  private currentBranch: string = 'main';

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initial root commit
    const rootCommit: Commit = {
      id: 'root-001',
      message: 'Initial sovereign manifest',
      timestamp: new Date().toISOString(),
      author: 'Sovereign Architect',
      filesChanged: ['src/App.tsx', 'package.json']
    };
    this.commits.set(rootCommit.id, rootCommit);
    this.branches.set('main', { name: 'main', head: rootCommit.id });
    
    // Load from storage if available
    const saved = localStorage.getItem('angeh_vc_state');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.commits = new Map(Object.entries(state.commits));
        this.branches = new Map(Object.entries(state.branches));
        this.currentBranch = state.currentBranch;
      } catch (e) {
        console.warn('[VC Engine] Failed to load state:', e);
      }
    }
  }

  private save() {
    const state = {
      commits: Object.fromEntries(this.commits),
      branches: Object.fromEntries(this.branches),
      currentBranch: this.currentBranch
    };
    localStorage.setItem('angeh_vc_state', JSON.stringify(state));
  }

  public commit(message: string, filesChanged: string[]): Commit {
    const branch = this.branches.get(this.currentBranch)!;
    const commit: Commit = {
      id: `commit-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      author: 'User',
      filesChanged,
      parent: branch.head
    };
    
    this.commits.set(commit.id, commit);
    branch.head = commit.id;
    this.save();
    return commit;
  }

  public createBranch(name: string): void {
    const parentHead = this.branches.get(this.currentBranch)!.head;
    this.branches.set(name, { name, head: parentHead });
    this.currentBranch = name;
    this.save();
  }

  public checkout(name: string): void {
    if (this.branches.has(name)) {
      this.currentBranch = name;
      this.save();
    }
  }

  public getHistory(): Commit[] {
    const history: Commit[] = [];
    let currentId: string | undefined = this.branches.get(this.currentBranch)?.head;
    
    while (currentId) {
      const commit = this.commits.get(currentId);
      if (commit) {
        history.push(commit);
        currentId = commit.parent;
      } else {
        break;
      }
    }
    return history;
  }

  public getCurrentBranch(): string {
    return this.currentBranch;
  }

  public getBranches(): string[] {
    return Array.from(this.branches.keys());
  }
}

export const vcEngine = new VersionControlEngine();

// Plan Item ID: TI-1 /* Auto-fix 1777793363847 */
