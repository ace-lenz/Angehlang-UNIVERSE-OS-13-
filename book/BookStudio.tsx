import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, ChevronLeft, ChevronRight, Search, Bookmark, BookmarkPlus
} from 'lucide-react';
import { BookContent, BookPage } from '@/types';
import { ThreeDViewer } from '@/features/threed/ThreeDViewer';
import { VideoPlayer } from '@/features/video';
import { SovereignVirtualList } from '@/features/shared/SovereignVirtualList';
import { StudioHeader, SovereignButton } from '@/components/ui/StudioHeader';
import { cn } from '@/utils/sovereign-utils';
import { useBookNav } from './useBookNav';

interface BookStudioProps {
  data?: BookContent;
  status?: string;
}

/**
 * BookStudio Component - Feature Sliced
 * Extracted logic to useBookNav hook.
 * Standardized with the Sovereign Design System.
 */
export const BookStudio: React.FC<BookStudioProps> = ({ data: externalData, status }) => {
  const {
    data,
    currentPage,
    searchQuery,
    setSearchQuery,
    bookmarks,
    page,
    totalPages,
    toggleBookmark,
    filteredPages,
    goToPage
  } = useBookNav(externalData);

  const renderElement = (element: BookPage['elements'][0]) => {
    switch (element.type) {
      case '3d':
        return <ThreeDViewer data={element.data as any} />;
      case 'video':
        return <VideoPlayer data={element.data as any} />;
      case 'image':
        return <img src={(element.data as any).url} alt="" className="w-full rounded-2xl border border-zinc-900 shadow-xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[#02020a] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col shadow-2xl min-h-[700px] relative">
      <StudioHeader 
        title="Book Studio" 
        subtitle={`${data.title} • ${data.author}`}
        icon={BookOpen}
        badge={status || 'Reading'}
        badgeColor="indigo"
      >
        <div className="flex items-center gap-3">
            <div className="relative group flex items-center gap-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-400 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search knowledge lattice (50D)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-14 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500/50 transition-all w-48 focus:w-64 font-mono"
                />
                <div className="absolute right-3 flex items-center gap-1.5 opacity-60">
                   <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                   <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">50D_SYNC</span>
                </div>
            </div>
            <SovereignButton 
                variant="ghost" 
                size="xs" 
                icon={bookmarks.includes(currentPage) ? Bookmark : BookmarkPlus} 
                onClick={toggleBookmark}
                className={bookmarks.includes(currentPage) ? "text-indigo-400" : "text-zinc-600"}
            />
        </div>
      </StudioHeader>

      <div className="flex-1 flex flex-col overflow-hidden">
         <div className="flex-1 relative p-12 overflow-y-auto custom-scrollbar scroll-smooth">
            <AnimatePresence mode="wait">
               <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="max-w-3xl mx-auto space-y-12"
               >
                  <div className="space-y-6 text-center">
                     <span className="text-[10px] font-mono text-indigo-500 uppercase tracking-[0.5em] block">SUBSTRATE_INDEX_{(currentPage + 1).toString().padStart(2, '0')}</span>
                     <h1 className="text-5xl font-black text-white tracking-tighter leading-tight ultra-glow-text">{page.title}</h1>
                     <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
                  </div>

                  <p className="text-2xl text-zinc-400 leading-[1.8] font-medium tracking-tight">
                     {page.content}
                  </p>

                  <div className="space-y-12 mt-16 pb-20 min-h-[400px]">
                     {page.elements.length > 0 ? (
                        <SovereignVirtualList 
                          items={page.elements}
                          height={800} // Virtual window height
                          itemHeight={400} // Estimated high-fidelity element height
                          renderItem={(el, i) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, scale: 0.95 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              className="rounded-3xl border border-zinc-900 bg-zinc-950/30 p-1 group hover:border-indigo-500/20 transition-all duration-500 mb-12"
                            >
                               {renderElement(el)}
                            </motion.div>
                          )}
                        />
                     ) : (
                        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl text-zinc-600 italic text-sm">
                           No additional substrate elements detected on this page.
                        </div>
                     )}
                  </div>
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Navigation Bottom Bar */}
         <div className="px-8 py-5 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-900/50 flex items-center justify-between">
            <div className="flex gap-2">
               {data.pages.map((_, i) => (
                  <button 
                     key={i}
                     onClick={() => goToPage(i)}
                     className={cn(
                        "h-1.5 rounded-full transition-all duration-500",
                        currentPage === i ? "bg-indigo-500 w-10 shadow-[0_0_10px_#6366f1]" : "bg-zinc-800 w-3 hover:bg-zinc-700"
                     )}
                     title={`Go to Page ${i + 1}`}
                  />
               ))}
            </div>

            <div className="flex items-center gap-6">
               <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest font-black">PAGE {currentPage + 1} // {totalPages}</span>
               <div className="flex gap-2">
                  <SovereignButton 
                     variant="secondary" 
                     size="sm" 
                     icon={ChevronLeft} 
                     disabled={currentPage === 0} 
                     onClick={() => goToPage(currentPage - 1)} 
                  />
                  <SovereignButton 
                     variant="secondary" 
                     size="sm" 
                     icon={ChevronRight} 
                     disabled={currentPage === totalPages - 1} 
                     onClick={() => goToPage(currentPage + 1)} 
                  />
               </div>
            </div>
         </div>
      </div>

      <AnimatePresence>
         {searchQuery && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="absolute top-24 right-8 w-80 bg-zinc-950/95 backdrop-blur-2xl border border-zinc-800 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] p-6 z-50 overflow-hidden ring-1 ring-white/5"
            >
               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">Neural Matches</h4>
               <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                  {filteredPages?.length ? filteredPages.map((p) => (
                     <button 
                        key={p.index}
                        onClick={() => { goToPage(p.index); setSearchQuery(''); }}
                        className="w-full text-left p-3 rounded-2xl border border-zinc-900 bg-zinc-900/20 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all group"
                     >
                        <p className="text-[12px] font-bold text-zinc-300 group-hover:text-indigo-400 transition-colors line-clamp-1">{p.title}</p>
                        <p className="text-[9px] text-zinc-600 mt-1 uppercase tracking-tighter">Manifest_Page_{p.index + 1}</p>
                     </button>
                  )) : (
                     <div className="py-8 text-center space-y-2">
                        <p className="text-[10px] text-zinc-700 italic">No patterns detected in current manifest.</p>
                     </div>
                  )}
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};
