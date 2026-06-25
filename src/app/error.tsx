'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

// ============================================
// Error Page
// ============================================

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex rounded-full bg-red-100 p-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-text-text-primary text-3xl font-bold">
          Something went wrong
        </h1>
        <p className="text-text-text-secondary mt-4">
          Sorry, an unexpected error occurred. Please try again or go back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={reset}
            variant="primary"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-border bg-transparent px-5 text-base font-medium text-text-text-primary transition-all duration-200 hover:bg-bg-bg-secondary"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
