import { createClient } from '@supabase/supabase-js';

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
      console.log(`[Supabase] ${method} ${path}`);
      return fetch(url, options).then((res) => {
        console.log(`[Supabase] ${method} ${path} → ${res.status}`);
        return res;
      });
    },
  },
});
