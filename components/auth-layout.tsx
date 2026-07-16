'use client';

import Link from 'next/link';
import { Braces, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Braces className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">
              Json<span className="text-primary">Vault</span>
            </span>
          </Link>
        </div>
        <div className="w-full max-w-sm mx-auto pt-12">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      {/* Right: visual */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center bg-card/30 border-l border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="relative max-w-md text-center p-8">
          <div className="glass-card rounded-2xl p-8 shadow-2xl">
            <Braces className="h-12 w-12 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Your JSON, organized and secure
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create, version, and share JSON documents with a premium editor
              experience. Join thousands of developers on JsonVault.
            </p>
            <Button variant="ghost" size="sm" asChild className="mt-6">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
