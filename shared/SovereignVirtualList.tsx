import React, { useRef, useState, useEffect, useMemo } from 'react';

interface SovereignVirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

/**
 * SovereignVirtualList - A zero-dependency lightweight virtual scroll implementation.
 * Designed to minimize DOM nodes and maintain high performance in the Sovereign OS.
 */
export function SovereignVirtualList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className 
}: SovereignVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  
  const range = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(items.length, Math.ceil((scrollTop + height) / itemHeight));
    // Add buffer for smooth scrolling
    const bufferStart = Math.max(0, start - 5);
    const bufferEnd = Math.min(items.length, end + 5);
    return { start: bufferStart, end: bufferEnd };
  }, [scrollTop, items.length, height, itemHeight]);

  const visibleItems = useMemo(() => {
    return items.slice(range.start, range.end).map((item, index) => {
      const realIndex = range.start + index;
      return (
        <div 
          key={realIndex} 
          style={{ 
            position: 'absolute', 
            top: realIndex * itemHeight, 
            height: itemHeight, 
            width: '100%' 
          }}
        >
          {renderItem(item, realIndex)}
        </div>
      );
    });
  }, [items, range, itemHeight, renderItem]);

  return (
    <div 
      ref={containerRef}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className={className}
      style={{ 
        height, 
        overflowY: 'auto', 
        position: 'relative' 
      }}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}
