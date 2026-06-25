"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Home, ArrowLeft, Compass } from 'lucide-react';

// ============================================
// 404 Page
// ============================================

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <Card className="max-w-lg text-center p-8 animate-scale-in">
        {/* 404 Display */}
        <div className="mb-6 relative">
          <h1 className="text-8xl font-bold text-gradient-primary">404</h1>
          {/* Decorative elements */}
          <div className="absolute -top-2 -left-4 w-16 h-16 border-l-2 border-t-2 border-border rounded-tl-lg opacity-50"></div>
          <div className="absolute -bottom-2 -right-4 w-16 h-16 border-r-2 border-b-2 border-border rounded-br-lg opacity-50"></div>
        </div>

        {/* Icon */}
        <div className="mb-4">
          <Compass className="h-12 w-12 text-text-muted mx-auto animate-float" />
        </div>

        {/* Message */}
        <h2 className="text-text-primary text-2xl font-semibold mb-3">
          Page not found
        </h2>
        <p className="text-text-secondary mx-auto mb-8 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => typeof window !== 'undefined' && window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
