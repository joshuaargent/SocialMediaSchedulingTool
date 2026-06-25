import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'outline'
    | 'tiktok'
    | 'facebook'
    | 'instagram'
    | 'youtube';
  size?: 'sm' | 'md' | 'lg';
}

// ============================================
// Component
// ============================================

const variantStyles: Record<string, string> = {
  default: 'bg-bg-secondary text-text-secondary border border-border',
  primary: 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-white',
  secondary: 'bg-secondary-light text-secondary-hover dark:bg-secondary/20 dark:text-white',
  success: 'bg-success-light text-success dark:bg-success dark:text-white',
  warning: 'bg-warning-light text-warning dark:bg-warning dark:text-white',
  error: 'bg-error-light text-error dark:bg-error dark:text-white',
  info: 'bg-info-light text-info dark:bg-info dark:text-white',
  outline: 'border border-border text-text-secondary',
  tiktok: 'bg-black text-white',
  facebook: 'bg-[#1877f2] text-white',
  instagram: 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white',
  youtube: 'bg-[#ff0000] text-white',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full font-medium transition-all duration-200',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
