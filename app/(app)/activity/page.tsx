'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Loader2, FileJson, Key, Share2, User, LogIn, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { supabase } from '@/lib/supabase';
import { type AuditLog } from '@/lib/types';
import { cn } from '@/lib/utils';

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'blob.create': FileJson,
  'blob.update': FileJson,
  'blob.delete': FileJson,
  'share.create': Share2,
  'api_key.create': Key,
  'auth.login': LogIn,
  'auth.logout': LogOut,
  'profile.update': User,
};

export default function ActivityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(true);

  React.useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }
    fetchLogs();
  }, [user, loading, router]);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      setLogs((data as AuditLog[]) || []);
    } catch {
      // non-critical
    } finally {
      setLoadingLogs(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-border/50">
        <h1 className="text-xl font-bold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">A record of all actions taken on your account.</p>
      </header>

      <div className="flex-1 overflow-auto scrollbar-thin p-6">
        {loadingLogs ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Activity className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold">No activity yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Your actions will appear here.</p>
          </div>
        ) : (
          <div className="relative max-w-3xl">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border/50" />
            <div className="space-y-3">
              {logs.map((log) => {
                const Icon = actionIcons[log.action] ?? Activity;
                return (
                  <div key={log.id} className="relative flex items-start gap-4 pl-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border z-10 shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <Card className="glass-card p-3 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{log.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      {log.resource_type && (
                        <Badge variant="outline" className="mt-1.5 text-xs">
                          {log.resource_type}
                        </Badge>
                      )}
                      {log.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">IP: {log.ip_address}</p>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
