"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="max-w-md text-center p-8 animate-scale-in">
        {/* Error Icon */}
        <div className="mb-6 relative">
          <div className="inline-flex rounded-full bg-error/10 p-4">
            <AlertCircle className="h-10 w-10 text-error" />
          </div>
          {/* Decorative ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-error/20 animate-ping"></div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-text-primary text-3xl font-bold mb-3">
          Something went wrong
        </h1>
        <p className="text-text-secondary mt-4 mb-8">
          Sorry, an unexpected error occurred. Please try again or go back to the homepage.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={reset}
            variant="primary"
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => window.location.href = '/'}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
