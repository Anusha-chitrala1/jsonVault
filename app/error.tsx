'use client';

import Link from 'next/link';
import { Braces, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="relative text-center max-w-md">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto mb-6">
          <Braces className="h-8 w-8" />
        </div>
        <h1 className="text-7xl font-bold text-destructive mb-2">500</h1>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. Please try again or return home.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
