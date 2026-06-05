import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/shared/SectionHeading';

// ============================================
// Types
// ============================================

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center';
  size?: 'default' | 'large';
}

// ============================================
// Component
// ============================================

export function PageHeader({
  title,
  description,
  children,
  actions,
  className,
  align = 'center',
  size = 'default',
}: PageHeaderProps) {
  return (
    <header className={cn('py-8 md:py-12', size === 'large' && 'py-12 md:py-16', className)}>
      <div className={cn('container', align === 'center' && 'text-center')}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className={align === 'center' ? 'text-center mx-auto' : ''}>
            <h1
              className={cn(
                'text-text-primary font-bold tracking-tight',
                size === 'default' ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'
              )}
            >
              {title}
            </h1>
            {description && (
              <p
                className={cn(
                  'text-text-secondary mt-2 max-w-2xl text-base',
                  align === 'center' && 'mx-auto'
                )}
              >
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </header>
  );
}
