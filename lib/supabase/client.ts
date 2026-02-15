import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (typeof anonKey === 'string') {
    const looksLikeServiceKey = anonKey.startsWith('sb_') || /secret/i.test(anonKey)
    if (looksLikeServiceKey) {
      throw new Error(
        'Detected a Supabase secret/service_role key in NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
          'Replace it with the public ANON key (from Supabase project settings) and keep the service role key private.'
      )
    }
  }

  return createBrowserClient(url!, anonKey!)
}
