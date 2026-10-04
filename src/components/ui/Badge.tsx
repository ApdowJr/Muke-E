import React from 'react';
import { cn } from '../../utils/cn';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-blue-500/10 text-blue-200 border border-blue-500/20',
  success: 'bg-green-500/10 text-green-200 border border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-200 border border-amber-500/20',
  danger: 'bg-red-500/10 text-red-200 border border-red-500/20',
  secondary: 'bg-purple-500/10 text-purple-200 border border-purple-500/20',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2.5 py-1 text-[11px] font-semibold rounded-lg',
  md: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'primary', size = 'sm', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center gap-2',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';
