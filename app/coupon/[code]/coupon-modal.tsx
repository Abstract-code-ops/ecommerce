'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Gift, X, AlertCircle, PartyPopper, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Confetti from './confetti'

interface CouponModalProps {
  coupon: {
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    description: string | null
    minOrderAmount: number
    expiresAt: string | null
  }
  isValid: boolean
  invalidReason?: string
}

export default function CouponModal({ coupon, isValid, invalidReason }: CouponModalProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  useEffect(() => {
    if (isValid) {
      setShowConfetti(true)
      // Store coupon in localStorage for checkout
      localStorage.setItem('appliedCoupon', JSON.stringify({
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount
      }))
    }
  }, [isValid, coupon])
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const formatDiscount = () => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`
    }
    return `AED ${coupon.discountValue}`
  }
  
  const formatExpiry = () => {
    if (!coupon.expiresAt) return null
    const date = new Date(coupon.expiresAt)
    return date.toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-[#1B3022] via-[#2a4633] to-[#1B3022]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#9DBE91]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#9DBE91]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {showConfetti && <Confetti />}
      
      {/* Close button */}
      <button
        onClick={() => router.push('/shop')}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md">
        {isValid ? (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-bounce-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#9DBE91] to-[#7aa970] p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 animate-bounce-slow">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Congratulations! 🎉
              </h1>
              <p className="text-white/90 text-lg">
                You&apos;ve unlocked a special discount
              </p>
            </div>
            
            {/* Discount Display */}
            <div className="p-8 text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#9DBE91]/20 rounded-2xl transform rotate-3" />
                <div className="relative bg-white border-4 border-dashed border-[#9DBE91] rounded-2xl px-8 py-6">
                  <p className="text-sm text-[#5A6B5E] uppercase tracking-wider mb-2">
                    Your Discount
                  </p>
                  <p className="text-5xl font-black text-[#1B3022] mb-2">
                    {formatDiscount()}
                  </p>
                  <p className="text-[#5A6B5E]">OFF</p>
                </div>
              </div>
              
              {coupon.description && (
                <p className="mt-6 text-[#5A6B5E]">{coupon.description}</p>
              )}
              
              {/* Coupon Code */}
              <div className="mt-8">
                <p className="text-sm text-[#5A6B5E] mb-2">Your coupon code:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="text-2xl font-mono font-bold text-[#1B3022] bg-[#F4F5F2] px-6 py-3 rounded-lg tracking-widest">
                    {coupon.code}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="p-3 bg-[#1B3022] text-white rounded-lg hover:bg-[#2a4633] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-[#9DBE91]" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-sm text-[#9DBE91] mt-2 animate-fade-in">
                    Copied to clipboard!
                  </p>
                )}
              </div>
              
              {/* Info */}
              <div className="mt-6 space-y-2 text-sm text-[#5A6B5E]">
                {coupon.minOrderAmount > 0 && (
                  <p>Minimum order: AED {coupon.minOrderAmount}</p>
                )}
                {formatExpiry() && (
                  <p>Valid until: {formatExpiry()}</p>
                )}
              </div>
              
              {/* CTA */}
              <Link
                href="/shop/products"
                className="inline-flex items-center gap-2 mt-8 bg-[#1B3022] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#2a4633] hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B3022] mb-2">
              Coupon Not Available
            </h1>
            <p className="text-[#5A6B5E] mb-2">
              {invalidReason || 'This coupon is no longer valid.'}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Code: {coupon.code}
            </p>
            <Link
              href="/shop/products"
              className="inline-flex items-center gap-2 bg-[#1B3022] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#2a4633] transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Browse Products</span>
            </Link>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
