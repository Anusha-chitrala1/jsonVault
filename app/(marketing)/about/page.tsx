import { Badge } from '@/components/ui/badge';
import { Braces, Target, Users, Heart, Zap } from 'lucide-react';

const values = [
  { icon: Zap, title: 'Developer-first', desc: 'Every decision starts with the question: does this make a developer\'s life easier?' },
  { icon: Heart, title: 'Quality matters', desc: 'We sweat the details — from keyboard shortcuts to loading states — because polish builds trust.' },
  { icon: Users, title: 'Open and transparent', desc: 'We publish our roadmap, listen to feedback, and ship based on what users actually need.' },
  { icon: Target, title: 'Security by default', desc: 'Row-level security, encrypted credentials, and least-privilege access are not add-ons — they are the foundation.' },
];

const team = [
  { name: 'Alex Rivera', role: 'Founder & CEO', avatar: 'AR' },
  { name: 'Sara Kim', role: 'Head of Engineering', avatar: 'SK' },
  { name: 'James Okafor', role: 'Lead Designer', avatar: 'JO' },
  { name: 'Mei Lin', role: 'Backend Architect', avatar: 'ML' },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mx-auto mb-6 shadow-xl shadow-primary/20">
            <Braces className="h-8 w-8" />
          </div>
          <Badge variant="outline" className="mb-4">About</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            We build tools we wish we had
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            JsonVault was born from a simple frustration: managing JSON documents
            meant juggling a text editor, a validator, a version control system,
            and a sharing tool. We thought there should be one place for all of it.
            So we built it.
          </p>
        </div>
      </section>

      <section className="py-16 border-t border-border/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To give every developer a premium, secure, and delightful
                environment for working with JSON. We believe that the tools you
                use every day should be fast, beautiful, and reliable — and that
                your data should always be yours.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-gradient">50K+</div>
                <div className="text-sm text-muted-foreground">Developers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient">2M+</div>
                <div className="text-sm text-muted-foreground">Blobs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gradient">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/50 bg-card/20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">Our values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="glass-card rounded-xl p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border/50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-12">The team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="glass-card rounded-xl p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-lg mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
