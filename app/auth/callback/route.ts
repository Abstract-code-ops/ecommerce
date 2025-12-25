import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Check for 'next' param first (used by password reset), then 'redirect' (used by sign in), then default to '/profile'
  const next = searchParams.get('next') || searchParams.get('redirect') || '/profile'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to sign-in page on error
  return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
}
