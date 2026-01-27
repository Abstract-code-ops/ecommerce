import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const code = searchParams.get('code')
  const redirect =
    searchParams.get('redirect') ??
    searchParams.get('next') ??
    '/'

  const supabase = await createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  let origin = new URL(request.url).origin

  // 🔒 Railway safety: never allow localhost in production redirects
  if (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://globaledgeshop.com'
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}

