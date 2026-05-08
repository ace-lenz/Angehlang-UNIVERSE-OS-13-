/**
 * TwitterSearchAgent.ts - Twitter/X Platform Search Agent
 * 
 * Searches Twitter/X via rate-limited endpoints
 * Uses official API when available, falls back to web scraping
 */

import { PlatformSearchAgent, PlatformSearchResult, PlatformConfig } from './PlatformSearchAgent';

const TWITTER_CONFIG: PlatformConfig = {
  platformName: 'Twitter',
  apiEndpoint: 'https://api.twitter.com/2',
  fallbackEndpoints: [
    'https://nitter.net/search?type=hashtag&query={query}'
  ],
  cacheExpiry: 1000 * 60 * 15, // 15 minutes
  rateLimit: 1000,
  authRequired: true
};

export interface TweetResult {
  id: string;
  text: string;
  author: string;
  authorId: string;
  createdAt: string;
  likes: number;
  retweets: number;
  replies: number;
  isRetweet: boolean;
}

export class TwitterSearchAgent extends PlatformSearchAgent {
  constructor() {
    super(TWITTER_CONFIG);
  }

  /**
   * Perform Twitter search
   */
  protected async performSearch(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();

    // Try official API if key available
    if (apiKey) {
      try {
        const apiResults = await this.searchViaApi(query, apiKey);
        results.push(...apiResults);
      } catch (e) {
        console.warn('[TwitterSearchAgent] API failed:', e);
      }
    }

    // Fallback - direct web search results
    if (results.length === 0) {
      try {
        const fallbackResults = await this.searchViaWeb(query);
        results.push(...fallbackResults);
      } catch (e) {
        console.warn('[TwitterSearchAgent] Fallback failed:', e);
      }
    }

    return results.slice(0, 10);
  }

  /**
   * Search via Twitter API v2
   */
  private async searchViaApi(query: string, apiKey: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const url = `${this.config.apiEndpoint}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=author_id,created_at,public_metrics`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      for (const tweet of data.data || []) {
        const metrics = tweet.public_metrics || {};
        
        results.push(this.normalizeResult(
          `@${tweet.author_id}: ${tweet.text?.substring(0, 100)}` || '',
          tweet.text || '',
          `https://twitter.com/i/status/${tweet.id}`,
          {
            tweetId: tweet.id,
            authorId: tweet.author_id,
            createdAt: tweet.created_at,
            likes: metrics.like_count || 0,
            retweets: metrics.retweet_count || 0,
            replies: metrics.reply_count || 0
          }
        ));
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[TwitterSearchAgent] API search error:', e);
    }
    
    return results;
  }

  /**
   * Search via web fallback (basic hashtag search)
   */
  private async searchViaWeb(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    // Use a public Twitter-friendly search proxy or direct search
    const searchUrl = `https://ddg-api.vercel.app/search?q=${encodeURIComponent(query + ' twitter')}&num=5`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const response = await fetch(searchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        for (const item of data.results || []) {
          if (item.url?.includes('twitter.com') || item.url?.includes('x.com')) {
            results.push(this.normalizeResult(
              item.title || '',
              item.snippet?.substring(0, 200) || '',
              item.url,
              { platform: 'twitter' }
            ));
          }
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[TwitterSearchAgent] Web search failed:', e);
    }
    
    return results;
  }

  /**
   * Get trending topics
   */
  async getTrending(): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();
    
    if (!apiKey) return results;
    
    try {
      const url = `${this.config.apiEndpoint}/trends/by/place?id=1`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        for (const trend of data.trends || []) {
          results.push(this.normalizeResult(
            `#${trend.name}`,
            `${trend.tweet_count || 0} tweets`,
            `https://twitter.com/search?q=${encodeURIComponent(trend.name)}`,
            { volume: trend.tweet_count }
          ));
        }
      }
    } catch (e) {
      console.warn('[TwitterSearchAgent] Trending failed:', e);
    }
    
    return results.slice(0, 10);
  }
}

export const twitterSearchAgent = new TwitterSearchAgent();
export default TwitterSearchAgent;