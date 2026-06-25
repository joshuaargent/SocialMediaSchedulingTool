import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

// ============================================
// Base Skeleton Component
// ============================================

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', width, height, ...props }, ref) => {
    const variantClasses = {
      text: 'rounded-md h-4',
      circular: 'rounded-full',
      rectangular: 'rounded-lg',
    };

    return (
      <div
        ref={ref}
        className={cn('skeleton', variantClasses[variant], className)}
        style={{ width, height }}
        aria-hidden="true"
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// ============================================
// Skeleton Presets
// ============================================

export const SkeletonText = forwardRef<HTMLDivElement, { lines?: number }>(({ lines = 3 }, ref) => (
  <div ref={ref} className="space-y-2" aria-hidden="true">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
    ))}
  </div>
));

SkeletonText.displayName = 'SkeletonText';

// Card skeleton with subtle background
export const SkeletonCard = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="bg-bg-secondary/30 rounded-xl border border-border p-6" aria-hidden="true">
    <Skeleton className="h-48 w-full mb-4" variant="rectangular" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-2/3" />
  </div>
));

SkeletonCard.displayName = 'SkeletonCard';

// Video card skeleton
export const SkeletonVideoCard = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="space-y-3" aria-hidden="true">
    <Skeleton className="aspect-video w-full rounded-xl" variant="rectangular" />
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-4 w-1/2" />
  </div>
));

SkeletonVideoCard.displayName = 'SkeletonVideoCard';

// Image card skeleton
export const SkeletonImageCard = forwardRef<HTMLDivElement, { aspectRatio?: string }>(
  ({ aspectRatio = 'aspect-[4/3]' }, ref) => (
    <div ref={ref} className="space-y-3" aria-hidden="true">
      <Skeleton className={`${aspectRatio} w-full rounded-xl`} variant="rectangular" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
);

SkeletonImageCard.displayName = 'SkeletonImageCard';

// Stats card skeleton for dashboards
export const SkeletonStatsCard = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="p-6 bg-bg-secondary/30 rounded-xl border border-border" aria-hidden="true">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl" variant="rectangular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
));

SkeletonStatsCard.displayName = 'SkeletonStatsCard';

// Profile skeleton
export const SkeletonProfile = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="flex items-center gap-4" aria-hidden="true">
    <Skeleton className="w-16 h-16 rounded-full" variant="circular" />
    <div className="space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
));

SkeletonProfile.displayName = 'SkeletonProfile';

// Table row skeleton
export const SkeletonTableRow = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="flex items-center gap-4 p-4 border-b border-border" aria-hidden="true">
    <Skeleton className="w-10 h-10 rounded-lg" variant="rectangular" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-6 w-16" />
  </div>
));

SkeletonTableRow.displayName = 'SkeletonTableRow';

// List skeleton with multiple items
export const SkeletonList = forwardRef<HTMLDivElement, { count?: number }>(
  ({ count = 5 }, ref) => (
    <div ref={ref} className="space-y-3" aria-hidden="true">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-bg-secondary/20 rounded-lg">
          <Skeleton className="w-10 h-10 rounded-lg" variant="rectangular" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
);

SkeletonList.displayName = 'SkeletonList';

// Grid skeleton for cards
export const SkeletonGrid = forwardRef<HTMLDivElement, { count?: number; cols?: string }>(
  ({ count = 6, cols = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' }, ref) => (
    <div ref={ref} className={`grid ${cols} gap-4`} aria-hidden="true">
      {[...Array(count)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
);

SkeletonGrid.displayName = 'SkeletonGrid';

// Chart skeleton
export const SkeletonChart = forwardRef<HTMLDivElement, { height?: string }>(
  ({ height = 'h-64' }, ref) => (
    <div ref={ref} className={`bg-bg-secondary/30 rounded-xl border border-border p-4 ${height}`} aria-hidden="true">
      <div className="flex items-end justify-between h-full gap-2 pb-4">
        {[...Array(12)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  )
);

SkeletonChart.displayName = 'SkeletonChart';

// Dashboard stats grid skeleton
export const SkeletonDashboardStats = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
    <SkeletonStatsCard />
    <SkeletonStatsCard />
    <SkeletonStatsCard />
    <SkeletonStatsCard />
  </div>
));

SkeletonDashboardStats.displayName = 'SkeletonDashboardStats';

// Calendar skeleton
export const SkeletonCalendar = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="bg-bg-secondary/30 rounded-xl border border-border p-4" aria-hidden="true">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-32" />
      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" variant="rectangular" />
        <Skeleton className="w-8 h-8 rounded-lg" variant="rectangular" />
      </div>
    </div>
    {/* Days grid */}
    <div className="grid grid-cols-7 gap-2">
      {[...Array(7)].map((_, i) => (
        <Skeleton key={`header-${i}`} className="h-4 w-full" />
      ))}
      {[...Array(35)].map((_, i) => (
        <Skeleton key={`day-${i}`} className="aspect-square rounded-lg" variant="rectangular" />
      ))}
    </div>
  </div>
));

SkeletonCalendar.displayName = 'SkeletonCalendar';

// Post card skeleton
export const SkeletonPostCard = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="p-4 bg-bg-secondary/30 rounded-xl border border-border" aria-hidden="true">
    <div className="flex items-start gap-3">
      {/* Platform icon */}
      <Skeleton className="w-10 h-10 rounded-full" variant="circular" />
      <div className="flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Content */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Media thumbnail */}
        <Skeleton className="aspect-video w-full rounded-lg" variant="rectangular" />
        {/* Footer stats */}
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  </div>
));

SkeletonPostCard.displayName = 'SkeletonPostCard';

// Post list skeleton
export const SkeletonPostList = forwardRef<HTMLDivElement, { count?: number }>(
  ({ count = 3 }, ref) => (
    <div ref={ref} className="space-y-4" aria-hidden="true">
      {[...Array(count)].map((_, i) => (
        <SkeletonPostCard key={i} />
      ))}
    </div>
  )
);

SkeletonPostList.displayName = 'SkeletonPostList';

// Platform connection skeleton
export const SkeletonPlatformCard = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="flex items-center gap-4 p-4 bg-bg-secondary/30 rounded-xl border border-border" aria-hidden="true">
    <Skeleton className="w-12 h-12 rounded-full" variant="circular" />
    <div className="flex-1 space-y-1">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="h-8 w-20 rounded-lg" variant="rectangular" />
  </div>
));

SkeletonPlatformCard.displayName = 'SkeletonPlatformCard';

// Sidebar skeleton
export const SkeletonSidebar = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref} className="space-y-4" aria-hidden="true">
    <Skeleton className="h-8 w-32" />
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  </div>
));

SkeletonSidebar.displayName = 'SkeletonSidebar';
