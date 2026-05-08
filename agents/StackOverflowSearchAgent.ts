/**
 * StackOverflowSearchAgent.ts - StackOverflow/Q&A Search Agent
 * 
 * Searches StackOverflow for programming questions and answers
 * Uses Stack Exchange API (free, no auth required)
 * 
 * Features:
 * - Question search
 * - Answer extraction
 * - Tag-based search
 * - Featured/hot questions
 */

import { PlatformSearchAgent, PlatformSearchResult, PlatformConfig } from './PlatformSearchAgent';

const STACKOVERFLOW_CONFIG: PlatformConfig = {
  platformName: 'StackOverflow',
  apiEndpoint: 'https://api.stackexchange.com/2.3',
  fallbackEndpoints: [],
  cacheExpiry: 1000 * 60 * 60, // 1 hour
  rateLimit: 1000,
  authRequired: false
};

export interface StackOverflowQuestion {
  questionId: number;
  title: string;
  body: string;
  tags: string[];
  score: number;
  answerCount: number;
  viewCount: number;
  isAnswered: boolean;
  owner: string;
  creationDate: number;
  link: string;
}

export class StackOverflowSearchAgent extends PlatformSearchAgent {
  constructor() {
    super(STACKOVERFLOW_CONFIG);
  }

  /**
   * Perform StackOverflow search
   */
  protected async performSearch(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];

    try {
      const apiResults = await this.searchViaApi(query);
      results.push(...apiResults);
    } catch (e) {
      console.warn('[StackOverflowSearchAgent] API failed:', e);
    }

    return results.slice(0, 10);
  }

  /**
   * Search via Stack Exchange API
   */
  private async searchViaApi(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const site = 'stackoverflow';
    const url = `${this.config.apiEndpoint}/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=${site}&pagesize=10`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) return results;
      
      const data = await response.json();
      
      for (const item of data.items || []) {
        // Skip closed/deleted questions
        if (item.closed_reason) continue;
        
        results.push(this.normalizeResult(
          item.title || '',
          (item.body?.substring(0, 300) || item.excerpt || ''),
          item.link || `https://stackoverflow.com/questions/${item.question_id}`,
          {
            questionId: item.question_id,
            tags: item.tags,
            score: item.score,
            answerCount: item.answer_count,
            viewCount: item.view_count,
            isAnswered: item.is_answered,
            owner: item.owner?.display_name,
            creationDate: item.creation_date,
            link: item.link
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[StackOverflowSearchAgent] API search error:', e);
    }
    
    return results;
  }

  /**
   * Get questions by tag
   */
  async getByTag(tag: string, sort: 'votes' | 'activity' | 'creation' = 'votes'): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const site = 'stackoverflow';
    const url = `${this.config.apiEndpoint}/questions?order=desc&sort=${sort}&tagged=${encodeURIComponent(tag)}&site=${site}&pagesize=10`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) return results;
      
      const data = await response.json();
      
      for (const item of data.items || []) {
        results.push(this.normalizeResult(
          item.title || '',
          (item.body?.substring(0, 200) || ''),
          item.link || `https://stackoverflow.com/questions/${item.question_id}`,
          {
            questionId: item.question_id,
            tags: item.tags,
            score: item.score,
            answerCount: item.answer_count,
            isAnswered: item.is_answered
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[StackOverflowSearchAgent] Tag search error:', e);
    }
    
    return results;
  }

  /**
   * Get featured/hot questions
   */
  async getHot(): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    // Get from multiple programming sites
    const sites = ['stackoverflow', 'serverfault', 'superuser'];
    
    for (const site of sites) {
      try {
        const url = `${this.config.apiEndpoint}/questions?order=desc&sort=hot&site=${site}&pagesize=5`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
  
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
  
        if (!response.ok) continue;
  
        const data = await response.json();
  
        for (const item of data.items || []) {
          results.push(this.normalizeResult(
            item.title || '',
            '',
            item.link || `https://${site}.com/questions/${item.question_id}`,
            {
              questionId: item.question_id,
              site,
              score: item.score,
              answerCount: item.answer_count
            }
          ));
        }
      } catch (e) {
        console.warn(`[StackOverflowSearchAgent] ${site} failed:`, e);
      }
    }
    
    return results.slice(0, 10);
  }

  /**
   * Get question with answers
   */
  async getQuestionWithAnswers(questionId: number): Promise<{ question: any; answers: any[] }> {
    const site = 'stackoverflow';
    
    try {
      // Get question
      const qUrl = `${this.config.apiEndpoint}/questions/${questionId}?site=${site}&filter=withbody`;
      const qRes = await fetch(qUrl);
      const qData = await qRes.json();
      
      // Get answers
      const aUrl = `${this.config.apiEndpoint}/questions/${questionId}/answers?site=${site}&filter=withbody&order=desc&sort=votes&pagesize=5`;
      const aRes = await fetch(aUrl);
      const aData = await aRes.json();
      
      return {
        question: qData.items?.[0],
        answers: aData.items || []
      };
    } catch (e) {
      console.warn('[StackOverflowSearchAgent] Get Q&A failed:', e);
      return { question: null, answers: [] };
    }
  }
}

export const stackOverflowSearchAgent = new StackOverflowSearchAgent();
export default StackOverflowSearchAgent;