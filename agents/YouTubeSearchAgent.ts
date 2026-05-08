/**
 * YouTubeSearchAgent.ts - YouTube Platform Search Agent
 * 
 * Searches YouTube videos, channels, and playlists via official API
 * Falls back to RSS feeds and scrapping when API unavailable
 * 
 * Features:
 * - Video search with metadata
 * - Channel search
 * - Playlist exploration
 * - Transcript extraction (where available)
 * - Caching and self-learning
 */

import { PlatformSearchAgent, PlatformSearchResult, PlatformConfig } from './PlatformSearchAgent';
import { sovereignVault } from '@/storage/SovereignVault';

export interface YouTubeSearchOptions {
  type?: 'video' | 'channel' | 'playlist';
  order?: 'relevance' | 'date' | 'viewCount' | 'rating';
  limit?: number;
  publishedAfter?: string;
}

export interface YouTubeVideoMetadata {
  videoId: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags?: string[];
  categoryId?: string;
}

const YOUTUBE_CONFIG: PlatformConfig = {
  platformName: 'YouTube',
  apiEndpoint: 'https://www.googleapis.com/youtube/v3',
  fallbackEndpoints: [
    'https://www.youtube.com/feeds/videos.xml?v={query}',
    'https://rss.app/feeds/v1.0/recent/youtube/{query}.xml'
  ],
  cacheExpiry: 1000 * 60 * 30, // 30 minutes
  rateLimit: 1000, // 1 second between requests
  authRequired: true
};

export class YouTubeSearchAgent extends PlatformSearchAgent {
  private channelCache: Map<string, any> = new Map();

  constructor() {
    super(YOUTUBE_CONFIG);
  }

  /**
   * Perform YouTube search
   */
  protected async performSearch(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();

    // Use official API if key available
    if (apiKey) {
      try {
        const apiResults = await this.searchViaApi(query, apiKey);
        results.push(...apiResults);
      } catch (e) {
        console.warn('[YouTubeSearchAgent] API failed, trying fallback:', e);
      }
    }

    // Fallback to RSS or alternative
    if (results.length === 0) {
      const fallbackResults = await this.performFallbackSearch(query);
      results.push(...fallbackResults);
    }

    // Still no results? Try web scraping fallback
    if (results.length === 0) {
      const scrapResults = await this.searchViaScraping(query);
      results.push(...scrapResults);
    }

    return results.slice(0, 10);
  }

  /**
   * Search via official YouTube Data API
   */
  private async searchViaApi(query: string, apiKey: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    const searchUrl = `${this.config.apiEndpoint}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${apiKey}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(searchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        for (const item of data.items) {
          if (item.id?.videoId && item.snippet) {
            const videoId = item.id.videoId;
            const snippet = item.snippet;
            
            results.push(this.normalizeResult(
              snippet.title || '',
              snippet.description?.substring(0, 200) || '',
              `https://www.youtube.com/watch?v=${videoId}`,
              {
                videoId,
                channelId: snippet.channelId,
                channelTitle: snippet.channelTitle,
                publishedAt: snippet.publishedAt,
                thumbnail: snippet.thumbnails?.medium?.url
              }
            ));
          }
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      console.warn('[YouTubeSearchAgent] API search failed:', e);
    }
    
    return results;
  }

  /**
   * Search via web scraping fallback
   */
  private async searchViaScraping(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    
    // Try Invidious instance (privacy-friendly YouTube frontend)
    const invidiousInstances = [
      'https://yewtu.be',
      'https://invidious.jingl.xyz',
      'https://invidious.snopyta.org'
    ];
    
    for (const instance of invidiousInstances) {
      try {
        const searchUrl = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&limit=10`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(searchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          
          if (Array.isArray(data)) {
            for (const item of data.slice(0, 10)) {
              results.push(this.normalizeResult(
                item.title || '',
                item.description?.substring(0, 200) || '',
                `${instance}/watch?v=${item.videoId}`,
                {
                  videoId: item.videoId,
                  channelId: item.channelId,
                  channelTitle: item.author,
                  publishedAt: item.published,
                  thumbnail: item.thumbnails?.[0]?.url
                }
              ));
            }
          }
          
          if (results.length > 0) break;
        }
      } catch (e) {
        console.warn(`[YouTubeSearchAgent] Invidious ${instance} failed:`, e);
      }
    }
    
    return results;
  }

  /**
   * Parse fallback results (RSS)
   */
  protected parseFallbackResults(data: any): PlatformSearchResult[] {
    const results: PlatformSearchResult[] = [];
    
    if (data?.feed?.entry) {
      const entries = Array.isArray(data.feed.entry) ? data.feed.entry : [data.feed.entry];
      
      for (const entry of entries.slice(0, 10)) {
        const videoId = this.extractVideoId(entry.id || '');
        
        results.push(this.normalizeResult(
          entry.title || '',
          entry.subtitle || entry.summary || '',
          `https://www.youtube.com/watch?v=${videoId}`,
          { videoId }
        ));
      }
    }
    
    return results;
  }

  /**
   * Extract video ID from YouTube URL or ID
   */
  private extractVideoId(idOrUrl: string): string {
    if (!idOrUrl) return '';
    
    // Already just ID
    if (!idOrUrl.includes('/') && !idOrUrl.includes('=')) {
      return idOrUrl;
    }
    
    // Extract from URL - match video ID pattern
    const videoIdMatch = idOrUrl.match(/[a-zA-Z0-9_-]{11}/);
    return videoIdMatch ? videoIdMatch[0] : idOrUrl;
  }

  /**
   * Get video metadata
   */
  async getVideoMetadata(videoId: string): Promise<YouTubeVideoMetadata | null> {
    const cacheKey = `youtube_video_${videoId}`;
    const cached = await sovereignVault.get<YouTubeVideoMetadata>(cacheKey);
    
    if (cached) return cached;
    
    const apiKey = this.getApiKey();
    if (!apiKey) return null;
    
    try {
      const url = `${this.config.apiEndpoint}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) return null;
      
      const data = await response.json();
      const item = data.items?.[0];
      
      if (!item) return null;
      
      const metadata: YouTubeVideoMetadata = {
        videoId: item.id,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        channelId: item.snippet?.channelId || '',
        channelTitle: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || '',
        duration: item.contentDetails?.duration || '',
        viewCount: parseInt(item.statistics?.viewCount || '0'),
        likeCount: parseInt(item.statistics?.likeCount || '0'),
        commentCount: parseInt(item.statistics?.commentCount || '0'),
        tags: item.snippet?.tags,
        categoryId: item.snippet?.categoryId
      };
      
      await sovereignVault.set(cacheKey, metadata);
      return metadata;
    } catch (e) {
      console.warn('[YouTubeSearchAgent] Get metadata failed:', e);
      return null;
    }
  }

  /**
   * Search channels
   */
  async searchChannels(query: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();
    
    if (!apiKey) return results;
    
    try {
      const url = `${this.config.apiEndpoint}/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=10&key=${apiKey}`;
      
      const response = await fetch(url);
      if (!response.ok) return results;
      
      const data = await response.json();
      
      for (const item of data.items || []) {
        if (item.id?.channelId && item.snippet) {
          results.push(this.normalizeResult(
            item.snippet.title || '',
            item.snippet.description || '',
            `https://www.youtube.com/channel/${item.id.channelId}`,
            {
              channelId: item.id.channelId,
              thumbnail: item.snippet.thumbnails?.medium?.url
            }
          ));
        }
      }
    } catch (e) {
      console.warn('[YouTubeSearchAgent] Channel search failed:', e);
    }
    
    return results;
  }

  /**
   * Get trending videos
   */
  async getTrending(categoryId?: string): Promise<PlatformSearchResult[]> {
    const results: PlatformSearchResult[] = [];
    const apiKey = this.getApiKey();
    
    if (!apiKey) return results;
    
    try {
      let url = `${this.config.apiEndpoint}/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&key=${apiKey}`;
      
      if (categoryId) {
        url += `&videoCategoryId=${categoryId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) return results;
      
      const data = await response.json();
      
      for (const item of data.items || []) {
        results.push(this.normalizeResult(
          item.snippet?.title || '',
          item.snippet?.description || '',
          `https://www.youtube.com/watch?v=${item.id}`,
          {
            videoId: item.id,
            channelId: item.snippet?.channelId,
            channelTitle: item.snippet?.channelTitle,
            viewCount: item.statistics?.viewCount
          }
        ));
      }
    } catch (e) {
      console.warn('[YouTubeSearchAgent] Trending failed:', e);
    }
    
    return results;
  }
}

// Export singleton instance
export const youtubeSearchAgent = new YouTubeSearchAgent();

export default YouTubeSearchAgent;