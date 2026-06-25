'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

// ============================================
// 404 Page
// ============================================

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-text-text-primary text-6xl font-bold md:text-8xl">404</h1>
        <h2 className="text-text-text-primary mt-4 text-2xl font-semibold">Page not found</h2>
        <p className="text-text-text-secondary mx-auto mt-2 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <button 
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-border bg-transparent px-5 text-base font-medium text-text-text-primary transition-all duration-200 hover:bg-bg-bg-secondary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
