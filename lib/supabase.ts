import { createClient } from '@supabase/supabase-js';
import { addLog, updateLog } from './api-logger';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://placeholder.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (url, options) => {
      const method = options?.method ?? 'GET';
      const path = typeof url === 'string' ? url.replace(supabaseUrl, '') : String(url);
      const id = addLog(method, path);
      const start = Date.now();
      return fetch(url, options).then((res) => {
        updateLog(id, res.status, Date.now() - start);
        return res;
      });
    },
  },
});
