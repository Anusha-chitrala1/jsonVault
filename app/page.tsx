'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Braces,
  GitBranch,
  Share2,
  Search,
  Shield,
  Zap,
  Code2,
  TreePine,
  History,
  Star,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { LiveEditorDemo } from '@/components/live-editor-demo';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Code2,
    title: 'Monaco Editor',
    description: 'Full IntelliSense, syntax highlighting, auto-formatting, find & replace, and error detection powered by the VS Code editor.',
  },
  {
    icon: TreePine,
    title: 'Live Tree View',
    description: 'A synchronized JSON tree that expands, collapses, and edits nodes — instantly reflecting changes in the editor.',
  },
  {
    icon: History,
    title: 'Version History',
    description: 'Every save creates a version. Compare, restore, and track changes across the entire lifecycle of your documents.',
  },
  {
    icon: Share2,
    title: 'Secure Sharing',
    description: 'Generate public or private links with read-only or editable access, password protection, and expiry dates.',
  },
  {
    icon: Search,
    title: 'Advanced Search',
    description: 'Search by title, content, tags, owner, or date. Apply multiple filters simultaneously for precise results.',
  },
  {
    icon: Shield,
    title: 'Row-Level Security',
    description: 'Every document is owner-scoped with database-level RLS policies. Your data is never exposed to other users.',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Staff Engineer, Stripe',
    content: 'JsonVault replaced three internal tools for us. The split-screen editor with the live tree view is genuinely the best JSON workflow I have used.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Weber',
    role: 'API Architect, Shopify',
    content: 'Version history alone is worth it. Being able to compare and restore previous versions of our API schemas has saved my team countless hours.',
    avatar: 'MW',
  },
  {
    name: 'Priya Nair',
    role: 'Backend Lead, Atlassian',
    content: 'The sharing features are fantastic. Password-protected links with expiry dates let us share config snapshots with contractors safely.',
    avatar: 'PN',
  },
];

const faqs = [
  {
    question: 'What is JsonVault?',
    answer: 'JsonVault is a modern JSON document management platform. It combines a Monaco-powered editor, a live synchronized tree view, version history, advanced search, and secure sharing into one polished interface.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. Every document is protected by row-level security policies at the database level. Only you can access your own blobs — no other user, not even an authenticated one, can read or modify your data.',
  },
  {
    question: 'Can I share JSON documents publicly?',
    answer: 'Absolutely. You can generate public links, private links, read-only or editable links, password-protected links, and links with custom expiry dates. You can also disable any link at any time.',
  },
  {
    question: 'Does it support version history?',
    answer: 'Yes. Every save automatically creates a version snapshot. You can view the full history, compare any two versions side by side, and restore a previous version with a single click.',
  },
  {
    question: 'Is there a free tier?',
    answer: 'Yes. The Free plan includes unlimited private blobs, 50 MB of storage, and core editor features. Pro and Team plans add more storage, version history, and collaboration features.',
  },
  {
    question: 'Can I use the API programmatically?',
    answer: 'Yes. Pro and Team plans include API keys for programmatic access to your blobs, so you can integrate JsonVault into your CI/CD pipelines and automation workflows.',
  },
];

const stats = [
  { value: '50K+', label: 'Developers' },
  { value: '2M+', label: 'Blobs stored' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'User rating' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px] opacity-60" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 animate-slide-up">
              <Badge variant="secondary" className="mb-6 gap-1.5">
                <Zap className="h-3 w-3 text-primary" />
                Now with live tree view sync
              </Badge>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                The modern home for your{' '}
                <span className="text-gradient">JSON documents</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Create, edit, validate, version, and share JSON with a premium
                split-screen editor, synchronized live tree view, and secure
                sharing links. Built for developers who care about their data.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" asChild className="group">
                  <Link href="/register">
                    Start for free
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">View dashboard</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required. Free plan forever.
              </p>
            </div>

            <div className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <LiveEditorDemo />
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-gradient">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">Features</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Everything you need to manage JSON
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                A complete toolkit for working with JSON documents, from editing
                to sharing to versioning.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:scale-105 transition-transform">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="py-20 border-t border-border/50 bg-card/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4">Why JsonVault</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                  Built like a developer tool, polished like a SaaS product
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  JsonVault combines the editing power of VS Code, the versioning
                  of GitHub, the organization of Notion, and the API focus of
                  Postman — in one cohesive platform.
                </p>
                <ul className="space-y-4">
                  {[
                    'Split-screen Monaco editor with synchronized live tree view',
                    'Automatic version snapshots on every save with diff comparison',
                    'Public, private, password-protected, and expiring share links',
                    'Advanced multi-filter search across titles, content, and tags',
                    'Database-level row-level security for every document',
                    'Programmatic API access with scoped API keys',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary shrink-0 mt-0.5">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Braces, label: 'Monaco Editor', color: 'text-chart-1' },
                  { icon: TreePine, label: 'Live Tree', color: 'text-chart-2' },
                  { icon: GitBranch, label: 'Versioning', color: 'text-chart-3' },
                  { icon: Share2, label: 'Sharing', color: 'text-chart-4' },
                  { icon: Search, label: 'Search', color: 'text-chart-5' },
                  { icon: Shield, label: 'Security', color: 'text-primary' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="glass-card rounded-xl p-6 text-center hover:scale-105 transition-transform"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <item.icon className={`h-8 w-8 mx-auto mb-3 ${item.color}`} />
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <Badge variant="outline" className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Loved by developers worldwide
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="glass-card rounded-xl p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-chart-3 text-chart-3" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-border/50 bg-card/20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Frequently asked questions
              </h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="glass-card rounded-lg px-5 border border-border/50"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-border/50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative glass-card rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-chart-2/10" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Start managing your JSON the right way
                </h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of developers who trust JsonVault with their
                  JSON documents. Free to start, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild className="group">
                    <Link href="/register">
                      Create your first blob
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/pricing">View pricing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
