'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const faqs = [
  { category: 'General', question: 'What is JsonVault?', answer: 'JsonVault is a modern JSON document management platform that combines a Monaco-powered editor, a live synchronized tree view, version history, advanced search, and secure sharing into one polished interface.' },
  { category: 'General', question: 'Who is JsonVault for?', answer: 'JsonVault is built for developers, API architects, data engineers, and anyone who works with JSON regularly. Whether you manage API configs, data schemas, or test fixtures, JsonVault streamlines your workflow.' },
  { category: 'Account', question: 'How do I create an account?', answer: 'Click "Get started" on the homepage or any pricing page. Enter your name, email, and password — no credit card required for the Free plan.' },
  { category: 'Account', question: 'Can I delete my account?', answer: 'Yes. Go to Settings > Security and click "Delete Account". This permanently deletes all your blobs, versions, and share links. This action cannot be undone.' },
  { category: 'Pricing', question: 'Is there a free tier?', answer: 'Yes. The Free plan includes unlimited private blobs, 50 MB of storage, and core editor features. It is free forever.' },
  { category: 'Pricing', question: 'Can I change plans anytime?', answer: 'Yes. You can upgrade or downgrade at any time. Changes take effect immediately and we prorate the difference.' },
  { category: 'Pricing', question: 'Do you offer refunds?', answer: 'We offer a 30-day money-back guarantee on all paid plans, no questions asked.' },
  { category: 'Features', question: 'How does version history work?', answer: 'Every time you save a blob, JsonVault creates a version snapshot. You can view the full history, compare any two versions side by side, and restore a previous version with a single click.' },
  { category: 'Features', question: 'Can I share blobs with people who do not have an account?', answer: 'Yes. You can generate public share links that anyone can access without signing in. You can also password-protect links and set expiry dates.' },
  { category: 'Features', question: 'Does the editor support drag and drop?', answer: 'Yes. You can drag JSON files from your file system directly onto the editor to import them instantly.' },
  { category: 'Security', question: 'Is my data secure?', answer: 'Yes. Every document is protected by row-level security policies at the database level. Only you can access your own blobs — no other user can read or modify your data.' },
  { category: 'Security', question: 'Are share links secure?', answer: 'Share links use random tokens. You can add password protection, set expiry dates, and disable any link at any time. Only links you explicitly create are accessible.' },
  { category: 'API', question: 'Can I access my blobs programmatically?', answer: 'Yes. Pro and Team plans include API keys for programmatic access. Generate keys from the API Keys page and use them to integrate JsonVault into your CI/CD pipelines and automation.' },
  { category: 'API', question: 'How do I generate an API key?', answer: 'Go to API Keys in the sidebar, click "Generate Key", give it a name, and copy the key. Store it securely — you will not be able to see it again after generation.' },
];

export default function FAQPage() {
  const categories = Array.from(new Set(faqs.map((f) => f.category)));

  return (
    <div className="pt-16">
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Frequently asked questions
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about JsonVault. Can&apos;t find an answer?{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
              .
            </p>
          </div>

          {categories.map((cat) => (
            <div key={cat} className="mb-10">
              <h2 className="text-lg font-semibold mb-4 text-primary">{cat}</h2>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.filter((f) => f.category === cat).map((faq, i) => (
                  <AccordionItem key={i} value={`${cat}-${i}`} className="glass-card rounded-lg px-5 border border-border/50">
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
          ))}

          <div className="text-center mt-16 glass-card rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">Our team is here to help.</p>
            <Button asChild>
              <Link href="/contact">
                Contact support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
