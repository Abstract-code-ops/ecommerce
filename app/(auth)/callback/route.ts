import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('redirect') || '/profile'

  // 1. DONT use request.url for the domain. 
  // 2. Force the domain from your environment variable.
  const domain = process.env.NEXT_PUBLIC_WEBSITE_DOMAIN || 'https://globaledgeshop.com'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch { /* Handled by middleware */ }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // ✅ SUCCESS: Redirect to the production domain + the path
      return NextResponse.redirect(`${domain}${next}`)
    }
  }

  // ❌ FAILURE: Redirect back to sign-in on the production domain
  return NextResponse.redirect(`${domain}/sign-in?error=auth_failed`)
}