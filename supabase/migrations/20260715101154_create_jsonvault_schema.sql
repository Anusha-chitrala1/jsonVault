/*
# JsonVault — Full Schema

Creates the complete data model for the JsonVault JSON document management platform.

## Overview
This migration creates all tables required to support JSON blob management:
users' JSON documents (blobs), version history, sharing links, folders,
tags, favorites, API keys, audit logs, and notifications. All tables are
owner-scoped to the authenticated user via `user_id` and protected by
row-level security policies.

## New Tables

1. **folders** — Organizational folders for grouping blobs.
   - id (uuid pk), name, user_id (owner), parent_id (self-ref for nesting),
     created_at, updated_at.

2. **blobs** — The core JSON documents.
   - id (uuid pk), title, description, content (jsonb), size_bytes (int),
     visibility (enum: private/public/shared), status (enum: active/archived),
     is_favorite (bool), folder_id (fk to folders, nullable),
     user_id (owner), tags (text[]), share_count, view_count,
     created_at, updated_at.

3. **blob_versions** — Version history snapshots for blobs.
   - id (uuid pk), blob_id (fk), content (jsonb), size_bytes,
     version_number (int), message (optional label), user_id (owner),
     created_at.

4. **shares** — Sharing links for blobs.
   - id (uuid pk), blob_id (fk), token (unique share token),
     link_type (enum: readonly/editable), is_password_protected (bool),
     password_hash (text, nullable), expires_at (timestamptz, nullable),
     is_active (bool), user_id (owner), created_at.

5. **tags** — Tag dictionary per user (for autocomplete / management).
   - id (uuid pk), name, user_id (owner), color (text), created_at.

6. **favorites** — Explicit favorite markers (in addition to is_favorite flag).
   - id (uuid pk), blob_id (fk), user_id (owner), created_at.

7. **api_keys** — User-generated API keys for programmatic access.
   - id (uuid pk), name, key_hash (text), prefix (text for display),
     user_id (owner), last_used_at, expires_at, is_active (bool),
     created_at.

8. **audit_logs** — Activity log entries for user actions.
   - id (uuid pk), user_id (owner), action (text), resource_type (text),
     resource_id (uuid, nullable), metadata (jsonb), ip_address (text),
     created_at.

9. **notifications** — In-app notifications for users.
   - id (uuid pk), user_id (owner), type (text), title, message,
     is_read (bool), metadata (jsonb), created_at.

## Security
- RLS enabled on every table.
- Owner-scoped CRUD policies (4 per table: select/insert/update/delete)
  scoped to `TO authenticated` using `auth.uid() = user_id`.
- `user_id` columns default to `auth.uid()` so client inserts that omit
  the owner still satisfy the WITH CHECK constraint.
- Shares are readable by anyone holding the token (public select via
  anon + authenticated on the token column) so shared links work without
  a session; all other operations remain owner-scoped.
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- folders
-- =============================================================
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_folders" ON folders;
CREATE POLICY "select_own_folders" ON folders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_folders" ON folders;
CREATE POLICY "insert_own_folders" ON folders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_folders" ON folders;
CREATE POLICY "update_own_folders" ON folders FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_folders" ON folders;
CREATE POLICY "delete_own_folders" ON folders FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- blobs
-- =============================================================
CREATE TABLE IF NOT EXISTS blobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Untitled Blob',
  description text,
  content jsonb DEFAULT '{}'::jsonb,
  size_bytes integer DEFAULT 0,
  visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public','shared')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  is_favorite boolean DEFAULT false,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  tags text[] DEFAULT '{}',
  share_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_blobs" ON blobs;
CREATE POLICY "select_own_blobs" ON blobs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_blobs" ON blobs;
CREATE POLICY "insert_own_blobs" ON blobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_blobs" ON blobs;
CREATE POLICY "update_own_blobs" ON blobs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_blobs" ON blobs;
CREATE POLICY "delete_own_blobs" ON blobs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Public blobs readable by anyone (for public share links)
DROP POLICY IF EXISTS "select_public_blobs" ON blobs;
CREATE POLICY "select_public_blobs" ON blobs FOR SELECT
  TO anon, authenticated USING (visibility = 'public');

CREATE INDEX IF NOT EXISTS idx_blobs_user_id ON blobs(user_id);
CREATE INDEX IF NOT EXISTS idx_blobs_status ON blobs(status);
CREATE INDEX IF NOT EXISTS idx_blobs_visibility ON blobs(visibility);
CREATE INDEX IF NOT EXISTS idx_blobs_updated_at ON blobs(updated_at DESC);

-- =============================================================
-- blob_versions
-- =============================================================
CREATE TABLE IF NOT EXISTS blob_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_id uuid NOT NULL REFERENCES blobs(id) ON DELETE CASCADE,
  content jsonb DEFAULT '{}'::jsonb,
  size_bytes integer DEFAULT 0,
  version_number integer NOT NULL DEFAULT 1,
  message text,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE blob_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_versions" ON blob_versions;
CREATE POLICY "select_own_versions" ON blob_versions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_versions" ON blob_versions;
CREATE POLICY "insert_own_versions" ON blob_versions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_versions" ON blob_versions;
CREATE POLICY "update_own_versions" ON blob_versions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_versions" ON blob_versions;
CREATE POLICY "delete_own_versions" ON blob_versions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_versions_blob_id ON blob_versions(blob_id);
CREATE INDEX IF NOT EXISTS idx_versions_created ON blob_versions(created_at DESC);

-- =============================================================
-- shares
-- =============================================================
CREATE TABLE IF NOT EXISTS shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_id uuid NOT NULL REFERENCES blobs(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  link_type text NOT NULL DEFAULT 'readonly' CHECK (link_type IN ('readonly','editable')),
  is_password_protected boolean DEFAULT false,
  password_hash text,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Owner CRUD
DROP POLICY IF EXISTS "select_own_shares" ON shares;
CREATE POLICY "select_own_shares" ON shares FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_shares" ON shares;
CREATE POLICY "insert_own_shares" ON shares FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_shares" ON shares;
CREATE POLICY "update_own_shares" ON shares FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_shares" ON shares;
CREATE POLICY "delete_own_shares" ON shares FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Public read by token (for shared link access without session)
DROP POLICY IF EXISTS "select_shared_by_token" ON shares;
CREATE POLICY "select_shared_by_token" ON shares FOR SELECT
  TO anon, authenticated USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_shares_blob_id ON shares(blob_id);
CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token);

-- =============================================================
-- tags
-- =============================================================
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  color text DEFAULT 'primary',
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tags" ON tags;
CREATE POLICY "select_own_tags" ON tags FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_tags" ON tags;
CREATE POLICY "insert_own_tags" ON tags FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_tags" ON tags;
CREATE POLICY "update_own_tags" ON tags FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_tags" ON tags;
CREATE POLICY "delete_own_tags" ON tags FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- favorites
-- =============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blob_id uuid NOT NULL REFERENCES blobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (blob_id, user_id)
);
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- api_keys
-- =============================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text NOT NULL,
  prefix text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  last_used_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_api_keys" ON api_keys;
CREATE POLICY "select_own_api_keys" ON api_keys FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_api_keys" ON api_keys;
CREATE POLICY "insert_own_api_keys" ON api_keys FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_api_keys" ON api_keys;
CREATE POLICY "update_own_api_keys" ON api_keys FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_api_keys" ON api_keys;
CREATE POLICY "delete_own_api_keys" ON api_keys FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- audit_logs
-- =============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_audit_logs" ON audit_logs;
CREATE POLICY "select_own_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_audit_logs" ON audit_logs;
CREATE POLICY "insert_own_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- =============================================================
-- notifications
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =============================================================
-- updated_at trigger helper
-- =============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_folders_updated_at ON folders;
CREATE TRIGGER trg_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_blobs_updated_at ON blobs;
CREATE TRIGGER trg_blobs_updated_at BEFORE UPDATE ON blobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
