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

  // 🔧 FIX: Use forwarded headers instead of request.origin
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')

  const origin = forwardedProto && forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : new URL(request.url).origin

  return NextResponse.redirect(`${origin}${redirect}`)
}
