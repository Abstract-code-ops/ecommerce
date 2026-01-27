import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // Check for 'next' param first (used by password reset), then 'redirect' (used by sign in), then default to '/profile'
  const next = searchParams.get('next') || searchParams.get('redirect') || '/profile'

  // Get origin from request URL
  let origin = new URL(request.url).origin

  // 🔒 Railway safety: never allow localhost in production redirects
  // Railway internally routes traffic through localhost:8080, but we need to use the public domain
  if (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    origin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ?? 'https://globaledgeshop.com'
  }

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
