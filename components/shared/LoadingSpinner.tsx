import React from 'react';
import { motion } from 'motion/react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';
type SpinnerVariant = 'ring' | 'dots' | 'pulse' | 'bars';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: string;
  label?: string;
}

const SIZE_PX: Record<SpinnerSize, number> = { xs: 14, sm: 18, md: 24, lg: 36 };

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'ring',
  color = '#6366f1',
  label,
}) => {
  const px = SIZE_PX[size];

  const spinner = (() => {
    switch (variant) {
      case 'ring':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
            style={{
              width: px,
              height: px,
              borderRadius: '50%',
              border: `${Math.max(2, px / 8)}px solid ${color}20`,
              borderTopColor: color,
              flexShrink: 0,
            }}
          />
        );

      case 'dots':
        return (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                style={{ width: px / 3.5, height: px / 3.5, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <motion.div
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: px, height: px, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }}
          />
        );

      case 'bars':
        return (
          <div className="flex items-end gap-0.5">
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ height: [px * 0.3, px, px * 0.3] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                style={{ width: Math.max(3, px / 6), backgroundColor: color, borderRadius: 2, flexShrink: 0 }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  })();

  if (label) {
    return (
      <div className="flex items-center gap-2">
        {spinner}
        <span className="text-xs text-zinc-400">{label}</span>
      </div>
    );
  }

  return <>{spinner}</>;
};
