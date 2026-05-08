import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThumbsUp, ThumbsDown, Star, X, Send } from 'lucide-react';
import { trainingFeedback } from '@/memory/TrainingFeedback';

interface ResponseFeedbackProps {
  prompt: string;
  response: string;
  onClose: () => void;
}

export const ResponseFeedback: React.FC<ResponseFeedbackProps> = ({ 
  prompt, 
  response, 
  onClose 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [improvements, setImprovements] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    
    const improvementList = improvements 
      ? improvements.split(',').map(i => i.trim()).filter(Boolean)
      : [];
    
    trainingFeedback.submitFeedback(prompt, response, rating, improvementList);
    setIsSubmitted(true);
    
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-20 right-4 bg-green-500/20 border border-green-500/30 rounded-xl p-4 z-50"
      >
        <div className="text-green-400 text-sm font-medium">Thank you for your feedback!</div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-50 w-80 overflow-hidden"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <span className="text-sm font-black text-white uppercase tracking-wider">Rate Response</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${
                n <= rating 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-white/10 text-slate-400 hover:bg-white/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setRating(Math.max(1, rating - 2))}
            className={`p-2 rounded-lg transition-colors ${rating <= 4 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-slate-400'}`}
          >
            <ThumbsDown size={16} />
          </button>
          <span className="text-lg font-bold text-white">{rating}/10</span>
          <button
            onClick={() => setRating(Math.min(10, rating + 2))}
            className={`p-2 rounded-lg transition-colors ${rating >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-slate-400'}`}
          >
            <ThumbsUp size={16} />
          </button>
        </div>

        <textarea
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          placeholder="What could be improved? (optional, comma separated)"
          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white placeholder:text-slate-500 resize-none h-16"
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full py-2 bg-violet-500/20 border border-violet-500/30 rounded-lg text-xs font-black text-violet-300 uppercase tracking-wider hover:bg-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={12} />
          Submit Feedback
        </button>
      </div>
    </motion.div>
  );
};

export default ResponseFeedback;