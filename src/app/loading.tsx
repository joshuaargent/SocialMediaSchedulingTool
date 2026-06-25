"use client";

import { Skeleton } from '@/components/ui/Skeleton';

// ============================================
// Premium Loading State
// ============================================

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        {/* Logo/Brand Animation */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute w-20 h-20 rounded-full border-2 border-primary/30 animate-ping"></div>
            {/* Main spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-border"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-r-primary/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
          </div>
        </div>

        {/* Loading text with skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>

        {/* Decorative dots */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
