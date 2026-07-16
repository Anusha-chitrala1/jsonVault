'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  FilePlus2,
  LayoutDashboard,
  Star,
  Archive,
  Share2,
  Settings,
  User,
  Key,
  Activity,
  Bell,
  Search,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const commands = [
  { label: 'Go to Dashboard', href: '/dashboard', icon: LayoutDashboard, group: 'Navigation' },
  { label: 'Create New Blob', href: '/editor/new', icon: FilePlus2, group: 'Actions' },
  { label: 'View Favorites', href: '/dashboard?filter=favorites', icon: Star, group: 'Navigation' },
  { label: 'View Archived', href: '/dashboard?filter=archived', icon: Archive, group: 'Navigation' },
  { label: 'View Shared', href: '/dashboard?filter=shared', icon: Share2, group: 'Navigation' },
  { label: 'Profile', href: '/profile', icon: User, group: 'Account' },
  { label: 'Settings', href: '/settings', icon: Settings, group: 'Account' },
  { label: 'API Keys', href: '/api-keys', icon: Key, group: 'Account' },
  { label: 'Activity Logs', href: '/activity', icon: Activity, group: 'Account' },
  { label: 'Notifications', href: '/notifications', icon: Bell, group: 'Account' },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const groups = Array.from(new Set(commands.map((c) => c.group)));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((group) => (
          <CommandGroup key={group} heading={group}>
            {commands
              .filter((c) => c.group === group)
              .map((cmd) => (
                <CommandItem
                  key={cmd.label}
                  onSelect={() => {
                    router.push(cmd.href);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <cmd.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {cmd.label}
                </CommandItem>
              ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
