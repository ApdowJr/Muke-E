/**
 * MUKE E DESIGN SYSTEM - Design Tokens
 * Central source of truth for all design values
 */

export const tokens = {
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0eeff',
      200: '#bae1ff',
      300: '#7cc5ff',
      400: '#36aaff',
      500: '#0b88ff',
      600: '#0170d8',
      700: '#015ab8',
      800: '#034695',
      900: '#063078',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      500: '#a78bfa',
      600: '#9370db',
      700: '#7c5cdb',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    danger: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      950: '#030712',
    },
  },
  bg: {
    primary: '#020817',
    secondary: '#0f172a',
    tertiary: '#1e293b',
    elevated: '#334155',
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
  },
  border: '#475569',
  radius: {
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
  },
} as const;
