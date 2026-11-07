import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // 環境変数未設定時でもアプリがクラッシュしないようダミー値をフォールバック
    return createBrowserClient(
      'https://dummy-placeholder.supabase.co',
      'dummy-anon-key'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
