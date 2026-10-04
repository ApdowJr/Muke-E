import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-900/80 p-6 transition-all duration-200',
        elevated && 'shadow-lg border-white/20 bg-slate-900',
        'hover:border-blue-500/30',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';
