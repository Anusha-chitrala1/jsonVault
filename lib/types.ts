export type Visibility = 'private' | 'public' | 'shared';
export type BlobStatus = 'active' | 'archived';
export type LinkType = 'readonly' | 'editable';

export interface JsonBlob {
  id: string;
  title: string;
  description: string | null;
  content: Record<string, unknown> | null;
  size_bytes: number;
  visibility: Visibility;
  status: BlobStatus;
  is_favorite: boolean;
  folder_id: string | null;
  user_id: string;
  tags: string[];
  share_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface BlobVersion {
  id: string;
  blob_id: string;
  content: Record<string, unknown> | null;
  size_bytes: number;
  version_number: number;
  message: string | null;
  user_id: string;
  created_at: string;
}

export interface Share {
  id: string;
  blob_id: string;
  token: string;
  link_type: LinkType;
  is_password_protected: boolean;
  password_hash: string | null;
  expires_at: string | null;
  is_active: boolean;
  user_id: string;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
  color: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  user_id: string;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export function computeSize(content: unknown): number {
  try {
    return new Blob([JSON.stringify(content ?? {})]).size;
  } catch {
    return 0;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function safeParseJson(text: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

export function prettyPrintJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function minifyJson(text: string): string {
  try {
    return JSON.stringify(JSON.parse(text));
  } catch {
    return text;
  }
}
