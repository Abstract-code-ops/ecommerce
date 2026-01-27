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

  // 🔒 Railway-safe origin (do NOT use request.url)
  const origin =
    process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ??
    'https://globaledgeshop.com'

  return NextResponse.redirect(`${origin}${redirect}`)
}

