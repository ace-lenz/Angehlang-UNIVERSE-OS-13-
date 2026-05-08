/**
 * useTypewriter.ts
 * Animates AI response text character by character for a streaming feel.
 * Uses requestAnimationFrame for ultra-smooth, CPU-light rendering.
 */
import { useState, useEffect, useRef } from 'react';

export function useTypewriter(
  text: string,
  speed: number = 12,   // chars per frame tick
  enabled: boolean = true
): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const rafRef  = useRef<number>(0);
  const prevText = useRef('');

  useEffect(() => {
    // If text hasn't changed or typewriter is disabled, show full text immediately
    if (!enabled || text === prevText.current) return;

    // On new text, reset
    prevText.current = text;
    indexRef.current = 0;
    setDisplayed('');
    setIsDone(false);

    cancelAnimationFrame(rafRef.current);

    const tick = () => {
      indexRef.current = Math.min(indexRef.current + speed, text.length);
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current < text.length) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsDone(true);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [text, speed, enabled]);

  // If disabled, always return full text
  if (!enabled) return { displayed: text, isDone: true };
  return { displayed, isDone };
}
