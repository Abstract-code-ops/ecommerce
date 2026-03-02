'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Save password changed date to localStorage for display in settings
      localStorage.setItem('gmqg_password_changed_at', new Date().toISOString())

      toast.success('Password updated successfully!')
      router.push('/sign-in')
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
          
          <div>
            <h3 className="mb-1.5 text-2xl text-center font-semibold text-[#1B3022]">Set New Password</h3>
            <p className="text-[#1B3022]/70 text-center">Enter your new password below.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-text text-[#1B3022]" htmlFor="password">New Password*</label>
              <div className="input bg-white border-[#E5E7EB] rounded-xl focus-within:border-[#9DBE91] focus-within:ring-1 focus-within:ring-[#9DBE91] flex items-center">
                <input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="············" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="block cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-5 shrink-0 text-[#1B3022]/50" />
                  ) : (
                    <Eye className="size-5 shrink-0 text-[#1B3022]/50" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="label-text text-[#1B3022]" htmlFor="confirmPassword">Confirm Password*</label>
              <div className="input bg-white border-[#E5E7EB] rounded-xl focus-within:border-[#9DBE91] focus-within:ring-1 focus-within:ring-[#9DBE91] flex items-center">
                <input 
                  id="confirmPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="············" 
                  required 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              className="btn btn-lg w-full bg-[#9DBE91] hover:bg-[#8AAE7E] text-white rounded-full uppercase tracking-wider font-medium border-none"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
