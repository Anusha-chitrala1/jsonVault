'use client';

import * as React from 'react';
import { Mail, MessageSquare, Send, Loader2, Github, Twitter, Linkedin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export default function ContactPage() {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setForm({ name: '', email: '', subject: '', message: '' });
    toast({ title: 'Message sent!', description: 'We\'ll get back to you within 24 hours.' });
  };

  return (
    <div className="pt-16">
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Contact</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Get in touch
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Have a question, feature request, or just want to say hello?
              We&apos;d love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send message
                </Button>
              </form>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Email</h3>
                </div>
                <p className="text-sm text-muted-foreground">support@jsonvault.app</p>
                <p className="text-xs text-muted-foreground mt-1">We respond within 24 hours.</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Community</h3>
                </div>
                <p className="text-sm text-muted-foreground">Join our community for help and discussions.</p>
                <div className="flex gap-2 mt-3">
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
