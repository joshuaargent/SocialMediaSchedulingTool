'use client';

import { Skeleton } from '@/components/ui/Skeleton';

// ============================================
// Loading State
// ============================================

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-text-primary border-r-transparent"></div>
        </div>
        <p className="text-text-text-secondary">Loading your dashboard...</p>
      </div>
    </div>
  );
}
