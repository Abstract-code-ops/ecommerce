'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      const getURL = () => {
        let url =
          process.env.NEXT_PUBLIC_WEBSITE_DOMAIN ?? // Set this to your site URL in production env.
          process.env.NEXT_PUBLIC_SITE_URL ?? // Alternative site URL env var.
          process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
          'http://localhost:3000/' // Fallback to localhost for development.
        console.log('Original URL for password reset:', url)
        url = url.startsWith('http') ? url : `https://${url}`
        // Make sure to include a trailing `/`.
        url = url.endsWith('/') ? url : `${url}/`
        console.log('Redirect URL for password reset:', url)
        return url
      }
      console.log('Using redirect URL:', `${getURL()}auth/callback?redirect=/reset-password`)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}auth/callback?redirect=/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setIsSubmitted(true)
      toast.success('Password reset link sent!')
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-auto min-h-screen items-center justify-center overflow-x-hidden bg-[#F9FAF7] py-10">
      <div className="relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-white z-1 w-full space-y-6 rounded-3xl p-6 shadow-lg sm:min-w-md lg:p-8">
          <div className="flex items-center justify-center gap-3">
            <Image src="/images/logo-full.png" alt="logo" width={120} height={110} />
          </div>
          
          {!isSubmitted ? (
            <>
              <div>
                <h3 className="mb-1.5 text-2xl text-center font-semibold text-[#1B3022]">Forgot Password?</h3>
                <p className="text-[#1B3022]/70 text-center">Enter your email to reset your password.</p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="label-text text-[#1B3022]" htmlFor="email">Email address*</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="input bg-white border-[#E5E7EB] rounded-xl focus:border-[#9DBE91] focus:ring-[#9DBE91] placeholder:text-[#1B3022]/50" 
                    id="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button 
                  className="btn btn-lg w-full bg-[#9DBE91] hover:bg-[#8AAE7E] text-white rounded-full uppercase tracking-wider font-medium border-none"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Reset Link
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-[#9DBE91]/10 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-[#9DBE91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[#1B3022]">Check your email</h3>
              <p className="text-[#1B3022]/70">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="btn btn-ghost btn-sm text-[#9DBE91] hover:text-[#8AAE7E] hover:bg-[#9DBE91]/10"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="text-center">
            <Link href="/sign-in" className="text-sm flex items-center justify-center gap-2 text-[#1B3022]/70 hover:text-[#9DBE91] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
