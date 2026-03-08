'use client'

import { useState } from 'react'
import { subscribeToNewsletter } from '@/lib/actions/newsletter.actions'
import { Loader2, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterFormProps {
  source?: string
  variant?: 'footer' | 'section' | 'inline'
  className?: string
}

export default function NewsletterForm({ 
  source = 'website', 
  variant = 'section',
  className 
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }
    
    setStatus('loading')
    
    const result = await subscribeToNewsletter(email, source)
    
    if (result.success) {
      setStatus('success')
      setMessage(result.message || 'Successfully subscribed!')
      setEmail('')
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } else {
      setStatus('error')
      setMessage(result.error || 'Failed to subscribe')
    }
  }

  if (status === 'success') {
    return (
      <div className={cn(
        "flex items-center gap-2 text-[#9DBE91]",
        variant === 'footer' && "text-[#9DBE91]",
        variant === 'section' && "justify-center py-4",
        className
      )}>
        <CheckCircle className="w-5 h-5" />
        <span className={cn(
          "text-sm font-medium",
          variant === 'footer' && "text-white"
        )}>{message}</span>
      </div>
    )
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "flex gap-2",
        variant === 'section' && "flex-col sm:flex-row gap-3 max-w-md mx-auto",
        variant === 'inline' && "flex-row",
        className
      )}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        disabled={status === 'loading'}
        className={cn(
          "flex-1 px-4 py-3 text-sm focus:outline-none transition-colors disabled:opacity-50",
          variant === 'footer' && "bg-white/10 border border-white/20 rounded-full placeholder:text-white/50 focus:border-[#9DBE91] text-white",
          variant === 'section' && "px-5 py-4 bg-white border border-[#E5E7EB] rounded-full text-base text-[#1B3022] focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] placeholder:text-[#5A6B5E]/60",
          variant === 'inline' && "bg-white/10 border border-white/20 rounded-full placeholder:text-white/50 focus:border-[#9DBE91]"
        )}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className={cn(
          "bg-[#9DBE91] hover:bg-[#8AAE7E] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
          variant === 'footer' && "px-6 py-3 text-sm",
          variant === 'section' && "px-8 py-4 hover:-translate-y-0.5 whitespace-nowrap",
          variant === 'inline' && "px-6 py-3 text-sm"
        )}
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Subscribing...</span>
          </>
        ) : (
          'Subscribe'
        )}
      </button>
      
      {status === 'error' && message && (
        <p className={cn(
          "text-xs text-red-400 mt-1",
          variant === 'section' && "text-center w-full"
        )}>{message}</p>
      )}
    </form>
  )
}
