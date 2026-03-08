'use client'

import { useState } from 'react'
import { Tag, Loader2, Check, X, AlertCircle, Percent, Ticket } from 'lucide-react'
import { validateCoupon, type Coupon } from '@/lib/actions/coupon.actions'
import { cn, formatCurrency } from '@/lib/utils'

interface CouponInputProps {
  subtotal: number
  userId?: string
  guestEmail?: string
  onApply: (coupon: Coupon) => void
  onRemove: () => void
  appliedCoupon: Coupon | null
  className?: string
}

export default function CouponInput({
  subtotal,
  userId,
  guestEmail,
  onApply,
  onRemove,
  appliedCoupon,
  className
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState('')
  
  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code')
      return
    }
    
    setValidating(true)
    setError('')
    
    const result = await validateCoupon(code, subtotal, userId, guestEmail)
    
    if (result.success && result.coupon) {
      // Convert validation result to Coupon type
      const coupon: Coupon = {
        id: result.coupon.id,
        code: result.coupon.code,
        description: result.coupon.description || null,
        discount_type: result.coupon.discount_type,
        discount_value: result.coupon.discount_value,
        min_order_amount: 0,
        max_discount_amount: result.coupon.max_discount_amount || null,
        usage_limit: null,
        times_used: 0,
        is_active: true,
        starts_at: new Date().toISOString(),
        expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      onApply(coupon)
      setCode('')
    } else {
      setError(result.error || 'Invalid coupon code')
    }
    
    setValidating(false)
  }
  
  const handleClear = () => {
    setCode('')
    setError('')
    onRemove()
  }

  // Calculate display discount
  const displayDiscount = appliedCoupon 
    ? appliedCoupon.discount_type === 'percentage'
      ? Math.min(
          (subtotal * appliedCoupon.discount_value) / 100,
          appliedCoupon.max_discount_amount || Infinity
        )
      : appliedCoupon.discount_value
    : 0
  
  return (
    <div className={cn("bg-white border border-[#E5E7EB] rounded-xl p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Ticket className="w-5 h-5 text-[#9DBE91]" />
        <span className="font-medium text-[#1B3022]">Discount Code</span>
      </div>
      
      {appliedCoupon ? (
        /* Applied Coupon Display */
        <div className="bg-[#9DBE91]/10 rounded-xl p-4 border border-[#9DBE91]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#9DBE91]/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#9DBE91]" />
              </div>
              <div>
                <div className="font-mono font-semibold text-[#1B3022] tracking-wide">
                  {appliedCoupon.code}
                </div>
                <div className="text-sm text-[#5A6B5E]">
                  {appliedCoupon.discount_type === 'percentage' 
                    ? `${appliedCoupon.discount_value}% off`
                    : `${formatCurrency(appliedCoupon.discount_value)} off`
                  }
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-[#5A6B5E]">You save</div>
              <div className="font-semibold text-[#9DBE91]">
                -{formatCurrency(displayDiscount)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="mt-3 w-full py-2 text-sm text-[#5A6B5E] hover:text-red-500 transition-colors flex items-center justify-center gap-1"
          >
            <X className="w-4 h-4" />
            Remove code
          </button>
        </div>
      ) : (
        /* Coupon Input Form */
        <>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase().replace(/\s/g, ''))
                  if (error) setError('')
                }}
                placeholder="Enter code"
                className={cn(
                  "w-full px-4 h-11 border rounded-xl uppercase text-sm font-medium focus:outline-none focus:ring-2 transition-all",
                  error 
                    ? "border-red-300 bg-red-50/50 focus:ring-red-200" 
                    : "border-[#E5E7EB] focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
                )}
              />
            </div>
            <button
              type="button"
              onClick={handleApply}
              disabled={validating || !code.trim()}
              className="px-5 h-11 bg-[#1B3022] text-white rounded-xl hover:bg-[#2a4633] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap text-sm font-medium"
            >
              {validating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 mt-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
