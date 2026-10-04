import React, { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

/** Labelled input with proper a11y wiring, validation state and optional leading icon. */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              'w-full rounded-xl border bg-app-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
              'transition-colors duration-150 focus:outline-none focus:ring-2',
              icon && 'pl-10',
              error
                ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
                : 'border-app-border focus:border-primary focus:ring-primary/25',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
