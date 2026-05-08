import { useState, useMemo, useCallback, useEffect } from 'react';
import { BookContent, BookPage } from '@/types';
import { DEFAULT_BOOK_DATA } from './book-types';
import { upeEngine } from '@/engine/UnifiedProcessingEngine';
import { wavefrontExecutor } from '@/engine/WavefrontExecutor';
import { angvCompute } from '@/storage/AngvComputeEngine';

export const useBookNav = (initialData?: BookContent) => {
  const data = initialData || DEFAULT_BOOK_DATA;
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const totalPages = data.pages.length;
  const page = data.pages[currentPage];

  const toggleBookmark = useCallback(() => {
    setBookmarks(prev => 
      prev.includes(currentPage) ? prev.filter(p => p !== currentPage) : [...prev, currentPage]
    );
  }, [currentPage]);

  const [filteredPages, setFilteredPages] = useState<{title: string, content: string, index: number}[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredPages(null);
      return;
    }

    const performPhotonicSearch = async () => {
      setSearching(true);
      
      // 1. Dispatch Semantic Trajectory (UQIS)
      const bundle = `(PH_INTERFERE_ADD "${searchQuery}" (PH_NEURAL_SYNTHESIS 0.85))`;
      const upeRes = await upeEngine.dispatch('logic', bundle, 'photonic');

      // 2. Parallel Correlation via Wavefront
      const matches = await Promise.all(data.pages.map(async (p, i) => {
        const score = await wavefrontExecutor.propagate({
          id: `SEARCH_${i}`,
          ast: ['PH_COHERENCE_GATE', {} as any, 0.95],
          coherence: upeRes.fidelity || 0.99
        });
        
        return score.fidelity > 0.5 ? { ...p, index: i } : null;
      }));

      setFilteredPages(matches.filter(m => m !== null) as any);
      setSearching(false);
    };

    const timer = setTimeout(performPhotonicSearch, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, data.pages]);

  const goToPage = useCallback((index: number) => {
    if (index >= 0 && index < totalPages) {
      setCurrentPage(index);
    }
  }, [totalPages]);

  return {
    data,
    currentPage,
    searchQuery,
    setSearchQuery,
    bookmarks,
    page,
    totalPages,
    toggleBookmark,
    filteredPages,
    searching,
    goToPage
  };
};
