/**
 * GitHubSearchAgent.ts - GitHub Platform Search Agent
 * 
 * Searches GitHub repositories, code, issues, and users
 * Uses official GitHub REST API with fallback to web scraping
 * 
 * Features:
 * - Repository search
 * - Code search
 * - Issue/PR search
 * - User search
 * - Commit search
 * - Caching and self-learning
 */

import { PlatformSearchAgent, PlatformSearchResult, PlatformConfig } from './PlatformSearchAgent';
import { sovereignVault } from '@/storage/SovereignVault';

export interface GitHubSearchOptions {
  type?: 'repo' | 'code' | 'issue' | 'user' | 'commit';
  language?: string;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
  limit?: number;
}

export interface GitHubRepoMetadata {
  repoId: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  htmlUrl: string;
  owner: string;
  ownerUrl: string;
  language?: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  license?: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  topics?: string[];
  defaultBranch: string;
}

const GITHUB_CONFIG: PlatformConfig = {
  platformName: 'GitHub',
  apiEndpoint: 'https://api.github.com',
  fallbackEndpoints: [
    'https://github.com/search?q={query}&type=repositories'
  ],
  cacheExpiry: 1000 * 60 * 60, // 1 hour
  rateLimit: 1000, // 1 second between requests
  authRequired: false // Works without auth but has lower rate limit
};

export class GitHubSearchAgent extends PlatformSearchAgent {
  private userCache: Map<string, any> = new Map();

  constructor() {
    super(GITHUB_CONFIG);
  }

  /**
   * Perform GitHub search
   */
  protected async performSearch(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const hasToken = this.hasApiKey();

    // Try repository search first (has best rate limit)
    try {
      const repoResults = await this.searchRepos(query);
      results.push(...repoResults);
    } catch (e) {
      console.warn('[GitHubSearchAgent] Repo search failed:', e);
    }

    // If no results, try code search
    if (results.length === 0) {
      try {
        const codeResults = await this.searchCode(query);
        results.push(...codeResults);
      } catch (e) {
        console.warn('[GitHubSearchAgent] Code search failed:', e);
      }
    }

    // Fallback to issue search
    if (results.length === 0) {
      try {
        const issueResults = await this.searchIssues(query);
        results.push(...issueResults);
      } catch (e) {
        console.warn('[GitHubSearchAgent] Issue search failed:', e);
      }
    }

    return results.slice(0, 10);
  }

  /**
   * Search repositories
   */
  async searchRepos(query: string, options?: GitHubSearchOptions): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();
    
    let url = `${this.config.apiEndpoint}/search/repositories?q=${encodeURIComponent(query)}&per_page=${options?.limit || 10}`;
    
    if (options?.sort) {
      url += `&sort=${options.sort}`;
    }
    if (options?.order) {
      url += `&order=${options.order}`;
    }
    if (options?.language) {
      url += `+language:${encodeURIComponent(options.language)}`;
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `token ${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal, headers });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('[GitHubSearchAgent] Repo search HTTP:', response.status);
        return results;
      }

      const data = await response.json();

      for (const repo of data.items || []) {
        results.push(this.normalizeResult(
          repo.full_name || repo.name || '',
          repo.description?.substring(0, 200) || '',
          repo.html_url || repo.url || '',
          {
            repoId: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            owner: repo.owner?.login,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            description: repo.description,
            topics: repo.topics,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[GitHubSearchAgent] Repo search failed:', e);
    }

    return results;
  }

  /**
   * Search code
   */
  async searchCode(query: string, options?: GitHubSearchOptions): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();
    
    // Note: Code search requires auth
    if (!apiKey) {
      console.log('[GitHubSearchAgent] Code search requires API key');
      return results;
    }
    
    let url = `${this.config.apiEndpoint}/search/code?q=${encodeURIComponent(query)}&per_page=${options?.limit || 10}`;
    
    if (options?.language) {
      url += `+language:${encodeURIComponent(options.language)}`;
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${apiKey}`
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal, headers });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const item of data.items || []) {
        const fileName = item.name || '';
        const repoName = item.repository?.full_name || '';
        
        results.push(this.normalizeResult(
          `${repoName}/${fileName}`,
          item.path || '',
          item.html_url || item.url || '',
          {
            repoName,
            fileName,
            path: item.path,
            sha: item.sha,
            repository: item.repository
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[GitHubSearchAgent] Code search failed:', e);
    }

    return results;
  }

  /**
   * Search issues and PRs
   */
  async searchIssues(query: string, options?: GitHubSearchOptions): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();
    
    let url = `${this.config.apiEndpoint}/search/issues?q=${encodeURIComponent(query)}&per_page=${options?.limit || 10}`;
    
    if (options?.sort) {
      url += `&sort=${options.sort}`;
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `token ${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal, headers });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const issue of data.items || []) {
        const isPR = issue.pull_request !== undefined;
        results.push(this.normalizeResult(
          issue.title || '',
          issue.body?.substring(0, 200) || '',
          issue.html_url || issue.url || '',
          {
            number: issue.number,
            state: issue.state,
            isPullRequest: isPR,
            user: issue.user?.login,
            labels: issue.labels,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[GitHubSearchAgent] Issue search failed:', e);
    }

    return results;
  }

  /**
   * Search users
   */
  async searchUsers(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const url = `${this.config.apiEndpoint}/search/users?q=${encodeURIComponent(query)}&per_page=10`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const user of data.items || []) {
        results.push(this.normalizeResult(
          user.login || '',
          user.bio || user.type || '',
          user.html_url || `https://github.com/${user.login}`,
          {
            username: user.login,
            type: user.type,
            score: user.score,
            avatarUrl: user.avatar_url
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[GitHubSearchAgent] User search failed:', e);
    }

    return results;
  }

  /**
   * Get repository metadata
   */
  async getRepoMetadata(owner: string, repo: string): Promise<GitHubRepoMetadata | null> {
    const cacheKey = `github_repo_${owner}_${repo}`;
    const cached = await sovereignVault.get<GitHubRepoMetadata>(cacheKey);
    
    if (cached) return cached;
    
    const apiKey = this.getApiKey();
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `token ${apiKey}`;
    }

    try {
      const url = `${this.config.apiEndpoint}/repos/${owner}/${repo}`;
      const response = await fetch(url, { headers });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      const metadata: GitHubRepoMetadata = {
        repoId: data.id,
        name: data.name,
        fullName: data.full_name,
        description: data.description,
        url: data.url,
        htmlUrl: data.html_url,
        owner: data.owner?.login,
        ownerUrl: data.owner?.html_url,
        language: data.language,
        stars: data.stargazers_count,
        forks: data.forks_count,
        watchers: data.watchers_count,
        openIssues: data.open_issues_count,
        license: data.license?.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        pushedAt: data.pushed_at,
        topics: data.topics,
        defaultBranch: data.default_branch
      };
      
      await sovereignVault.set(cacheKey, metadata);
      return metadata;
    } catch (e) {
      console.warn('[GitHubSearchAgent] Get repo failed:', e);
      return null;
    }
  }

  /**
   * Get trending repositories
   */
  async getTrending(language?: string, limit: number = 10): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();
    
    let url = `${this.config.apiEndpoint}/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=${limit}`;
    
    if (language) {
      url += `+language:${encodeURIComponent(language)}`;
    }

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };
    
    if (apiKey) {
      headers['Authorization'] = `token ${apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal, headers });
      clearTimeout(timeoutId);

      if (!response.ok) return results;

      const data = await response.json();

      for (const repo of data.items || []) {
        results.push(this.normalizeResult(
          repo.full_name || '',
          repo.description?.substring(0, 200) || '',
          repo.html_url || '',
          {
            repoId: repo.id,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            createdAt: repo.created_at
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[GitHubSearchAgent] Trending failed:', e);
    }

    return results;
  }

  /**
   * Parse fallback results
   */
  protected parseFallbackResults(data: any): PlatformSearchResult[] {
    const results: PlatformSearchResult[] = [];
    
    // Handle HTML scraping fallback if needed
    if (typeof data === 'string') {
      // Basic HTML parsing for GitHub search page
      const repoLinks = data.match(/href="\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+"/g) || [];
      const titles = data.match(/<h3 class="repo-title[^]*?>.*?<\/h3>/g) || [];
      
      for (let i = 0; i < Math.min(repoLinks.length, 10); i++) {
        const linkMatch = repoLinks[i].match(/href="([^"]+)"/);
        const titleMatch = titles[i]?.match(/>([^<]+)</);
        
        if (linkMatch) {
          results.push(this.normalizeResult(
            titleMatch ? titleMatch[1] : linkMatch[1],
            '',
            `https://github.com${linkMatch[1]}`,
            {}
          ));
        }
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const githubSearchAgent = new GitHubSearchAgent();

export default GitHubSearchAgent;