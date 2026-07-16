'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Zap, Crown, Building2, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const plans = [
  {
    name: 'Free',
    icon: Zap,
    price: { monthly: 0, yearly: 0 },
    description: 'For individual developers getting started',
    features: [
      'Unlimited private blobs',
      '50 MB storage',
      'Monaco editor + tree view',
      'Basic search & filters',
      'Community support',
    ],
    cta: 'Get started',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    icon: Crown,
    price: { monthly: 9, yearly: 90 },
    description: 'For professional developers who need more',
    features: [
      'Everything in Free',
      '10 GB storage',
      'Version history & restore',
      'Advanced search & filters',
      'Password-protected sharing',
      'API access',
      'Priority support',
    ],
    cta: 'Start Pro trial',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Team',
    icon: Building2,
    price: { monthly: 29, yearly: 290 },
    description: 'For teams collaborating on JSON documents',
    features: [
      'Everything in Pro',
      '100 GB storage',
      'Shared workspaces',
      'Editable share links',
      'Audit logs',
      'Team management',
      'SSO ready',
    ],
    cta: 'Start Team trial',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: { monthly: -1, yearly: -1 },
    description: 'For organizations with advanced needs',
    features: [
      'Everything in Team',
      'Unlimited storage',
      'Custom SSO & SAML',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
      'Custom integrations',
    ],
    cta: 'Contact sales',
    href: '/contact',
    highlighted: false,
  },
];

const comparisonFeatures = [
  { feature: 'Private blobs', free: true, pro: true, team: true, enterprise: true },
  { feature: 'Monaco editor + tree view', free: true, pro: true, team: true, enterprise: true },
  { feature: 'Storage', free: '50 MB', pro: '10 GB', team: '100 GB', enterprise: 'Unlimited' },
  { feature: 'Version history', free: false, pro: true, team: true, enterprise: true },
  { feature: 'Advanced search', free: false, pro: true, team: true, enterprise: true },
  { feature: 'Password-protected links', free: false, pro: true, team: true, enterprise: true },
  { feature: 'Editable share links', free: false, pro: false, team: true, enterprise: true },
  { feature: 'API access', free: false, pro: true, team: true, enterprise: true },
  { feature: 'Audit logs', free: false, pro: false, team: true, enterprise: true },
  { feature: 'Team management', free: false, pro: false, team: true, enterprise: true },
  { feature: 'SSO / SAML', free: false, pro: false, team: false, enterprise: true },
  { feature: 'SLA guarantee', free: false, pro: false, team: false, enterprise: true },
  { feature: 'On-premise option', free: false, pro: false, team: false, enterprise: true },
  { feature: 'Support', free: 'Community', pro: 'Priority', team: 'Priority', enterprise: 'Dedicated' },
];

const faqs = [
  { question: 'Can I change plans anytime?', answer: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately and we prorate the difference.' },
  { question: 'Is there a free trial?', answer: 'The Free plan is free forever. Pro and Team plans offer a 14-day free trial with no credit card required.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and invoice-based billing for Enterprise plans.' },
  { question: 'Can I get a refund?', answer: 'We offer a 30-day money-back guarantee on all paid plans. No questions asked.' },
  { question: 'Do you offer discounts for startups?', answer: 'Yes! We offer 50% off Pro and Team plans for eligible early-stage startups. Contact us to learn more.' },
];

export default function PricingPage() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <div className="pt-16">
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border p-1">
              <button
                onClick={() => setYearly(false)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${yearly ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Yearly
                <span className="ml-1 text-xs text-primary">Save 17%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-primary border-2 shadow-xl shadow-primary/10'
                    : 'glass-card'
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <plan.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{plan.description}</p>
                <div className="mb-6">
                  {plan.price.monthly === -1 ? (
                    <span className="text-3xl font-bold">Custom</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ${yearly ? Math.floor(plan.price.yearly / 12) : plan.price.monthly}
                      </span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full mb-6"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Compare all features
          </h2>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Free</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Pro</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Team</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? '' : 'bg-card/30'}>
                    <td className="py-3 px-4 text-sm">{row.feature}</td>
                    {(['free', 'pro', 'team', 'enterprise'] as const).map((tier) => (
                      <td key={tier} className="text-center py-3 px-4">
                        {typeof row[tier] === 'boolean' ? (
                          row[tier] ? (
                            <Check className="h-4 w-4 text-primary mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-sm">{row[tier]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-t border-border/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Pricing FAQ
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card rounded-lg px-5 border border-border/50">
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
      <section className="py-20 border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of developers managing their JSON with JsonVault.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
