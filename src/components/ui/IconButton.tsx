import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

type IconButtonVariant = 'surface' | 'ghost' | 'primary' | 'success' | 'danger';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  /** Required for accessibility — describes the action for screen readers & tooltips. */
  label: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  surface:
    'bg-app-elevated border border-app-border text-text-secondary hover:text-text-primary hover:border-primary/40',
  ghost: 'bg-transparent border border-transparent text-text-secondary hover:text-text-primary hover:bg-app-elevated',
  primary: 'bg-primary border border-transparent text-white hover:bg-primary-hover shadow-sm shadow-primary/25',
  success: 'bg-success border border-transparent text-white hover:brightness-95',
  danger: 'bg-danger border border-transparent text-white hover:brightness-95',
};

const sizeStyles = {
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-2xl',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'surface', size = 'md', label, className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg',
        'active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);

IconButton.displayName = 'IconButton';
