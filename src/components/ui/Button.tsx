'use client';

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
  type ReactElement,
  cloneElement,
  isValidElement,
} from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ============================================
// Types
// ============================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
}

// ============================================
// Component
// ============================================

const sizeStyles: Record<string, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

const buttonBaseStyles =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    let variantStyles = '';

    switch (variant) {
      case 'primary':
        variantStyles = 'bg-primary text-white hover:bg-primary-hover shadow-sm';
        break;
      case 'secondary':
        variantStyles = 'bg-secondary text-white hover:bg-secondary-hover shadow-sm';
        break;
      case 'outline':
        variantStyles = 'border border-border bg-transparent text-text-primary hover:bg-bg-secondary';
        break;
      case 'ghost':
        variantStyles = 'text-text-primary hover:bg-bg-secondary';
        break;
      case 'link':
        variantStyles = 'text-primary hover:text-primary-hover underline-offset-4 hover:underline';
        break;
      case 'danger':
        variantStyles = 'bg-error text-white hover:bg-error/90 shadow-sm';
        break;
      default:
        variantStyles = 'bg-primary text-white hover:bg-primary-hover shadow-sm';
    }

    const buttonStyles = cn(buttonBaseStyles, variantStyles, sizeStyles[size], className);

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string; [key: string]: unknown }>;
      const childClassName = child.props.className;
      const mergedClassName = cn(buttonStyles, childClassName);

      return cloneElement(child, {
        className: mergedClassName,
        ref,
        ...props,
      } as any);
    }

    return (
      <button ref={ref} className={buttonStyles} disabled={disabled || isLoading} {...props}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
