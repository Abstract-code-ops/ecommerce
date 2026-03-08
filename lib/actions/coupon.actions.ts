'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Coupon schemas
const CouponSchema = z.object({
  code: z.string().min(3).max(50).transform(val => val.toUpperCase().replace(/\s/g, '')),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
})

export type CouponInput = z.infer<typeof CouponSchema>

export interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  times_used: number
  is_active: boolean
  starts_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

// Generate a random coupon code
export async function generateCouponCode(prefix: string = '', length: number = 8): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = prefix
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

// Create a new coupon
export async function createCoupon(input: CouponInput) {
  try {
    const validated = CouponSchema.parse(input)
    const supabase = createAdminClient()
    
    // Check if code already exists
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', validated.code)
      .single()
    
    if (existing) {
      return { success: false, error: 'Coupon code already exists' }
    }
    
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: validated.code,
        description: validated.description,
        discount_type: validated.discountType,
        discount_value: validated.discountValue,
        min_order_amount: validated.minOrderAmount || 0,
        max_discount_amount: validated.maxDiscountAmount,
        usage_limit: validated.usageLimit,
        starts_at: validated.startsAt || new Date().toISOString(),
        expires_at: validated.expiresAt,
        is_active: true
      })
      .select()
      .single()
    
    if (error) {
      console.error('Create coupon error:', error)
      return { success: false, error: 'Failed to create coupon' }
    }
    
    revalidatePath('/admin/coupons')
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update coupon
export async function updateCoupon(id: string, input: Partial<CouponInput>) {
  try {
    const supabase = createAdminClient()
    
    const updateData: Record<string, unknown> = {}
    
    if (input.code) updateData.code = input.code.toUpperCase().replace(/\s/g, '')
    if (input.description !== undefined) updateData.description = input.description
    if (input.discountType) updateData.discount_type = input.discountType
    if (input.discountValue !== undefined) updateData.discount_value = input.discountValue
    if (input.minOrderAmount !== undefined) updateData.min_order_amount = input.minOrderAmount
    if (input.maxDiscountAmount !== undefined) updateData.max_discount_amount = input.maxDiscountAmount
    if (input.usageLimit !== undefined) updateData.usage_limit = input.usageLimit
    if (input.startsAt) updateData.starts_at = input.startsAt
    if (input.expiresAt !== undefined) updateData.expires_at = input.expiresAt
    
    const { data, error } = await supabase
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Update coupon error:', error)
      return { success: false, error: 'Failed to update coupon' }
    }
    
    revalidatePath('/admin/coupons')
    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Toggle coupon active status
export async function toggleCouponStatus(id: string) {
  const supabase = createAdminClient()
  
  // Get current status
  const { data: currentCoupon } = await supabase
    .from('coupons')
    .select('is_active')
    .eq('id', id)
    .single()
  
  if (!currentCoupon) {
    return { success: false, error: 'Coupon not found' }
  }
  
  const { error } = await supabase
    .from('coupons')
    .update({ is_active: !currentCoupon.is_active })
    .eq('id', id)
  
  if (error) {
    return { success: false, error: 'Failed to update coupon status' }
  }
  
  revalidatePath('/admin/coupons')
  return { success: true }
}

// Delete coupon
export async function deleteCoupon(id: string) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Delete coupon error:', error)
    return { success: false, error: 'Failed to delete coupon' }
  }
  
  revalidatePath('/admin/coupons')
  return { success: true }
}

// Get all coupons (admin)
export async function getCoupons(page: number = 1, limit: number = 20) {
  const supabase = createAdminClient()
  
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('coupons')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Get coupons error:', error)
    return { success: false, error: 'Failed to fetch coupons' }
  }
  
  return {
    success: true,
    data: data as Coupon[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

// Get single coupon by ID
export async function getCouponById(id: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    return { success: false, error: 'Coupon not found' }
  }
  
  return { success: true, data: data as Coupon }
}

// Validate and apply coupon
export async function validateCoupon(code: string, orderTotal: number, userId?: string, guestEmail?: string) {
  const supabase = createAdminClient()
  
  const normalizedCode = code.toUpperCase().trim()
  
  // Fetch coupon
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .eq('is_active', true)
    .single()
  
  if (error || !coupon) {
    return { success: false, error: 'Invalid coupon code' }
  }
  
  const now = new Date()
  
  // Check if coupon has started
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { success: false, error: 'This coupon is not yet active' }
  }
  
  // Check if coupon has expired
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { success: false, error: 'This coupon has expired' }
  }
  
  // Check usage limit
  if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    return { success: false, error: 'This coupon has reached its usage limit' }
  }
  
  // Check minimum order amount
  if (orderTotal < coupon.min_order_amount) {
    return { 
      success: false, 
      error: `Minimum order amount of AED ${coupon.min_order_amount.toFixed(2)} required` 
    }
  }
  
  // Check if user already used this coupon (optional - one use per user)
  if (userId || guestEmail) {
    const { data: usage } = await supabase
      .from('coupon_usage')
      .select('id')
      .eq('coupon_id', coupon.id)
      .or(`user_id.eq.${userId || 'null'},guest_email.eq.${guestEmail || 'null'}`)
      .single()
    
    if (usage) {
      return { success: false, error: 'You have already used this coupon' }
    }
  }
  
  // Calculate discount
  let discountAmount: number
  
  if (coupon.discount_type === 'percentage') {
    discountAmount = (orderTotal * coupon.discount_value) / 100
    // Apply max discount cap if set
    if (coupon.max_discount_amount && discountAmount > coupon.max_discount_amount) {
      discountAmount = coupon.max_discount_amount
    }
  } else {
    discountAmount = Math.min(coupon.discount_value, orderTotal)
  }
  
  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100
  
  return {
    success: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount_amount: coupon.max_discount_amount,
      description: coupon.description
    },
    discountAmount,
    newTotal: Math.max(0, orderTotal - discountAmount)
  }
}

// Record coupon usage
export async function recordCouponUsage(
  couponId: string,
  orderId: string,
  discountApplied: number,
  userId?: string,
  guestEmail?: string
) {
  const supabase = createAdminClient()
  
  // Insert usage record
  const { error: usageError } = await supabase
    .from('coupon_usage')
    .insert({
      coupon_id: couponId,
      order_id: orderId,
      user_id: userId,
      guest_email: guestEmail,
      discount_applied: discountApplied
    })
  
  if (usageError) {
    console.error('Record coupon usage error:', usageError)
    return { success: false }
  }
  
  // Increment times_used
  const { error: updateError } = await supabase.rpc('increment_coupon_usage', { coupon_id: couponId })
  
  // If RPC doesn't exist, do it manually
  if (updateError) {
    await supabase
      .from('coupons')
      .update({ times_used: supabase.rpc('increment', { x: 1 }) })
      .eq('id', couponId)
  }
  
  return { success: true }
}

// Get coupon by code (for barcode scanning)
export async function getCouponByCode(code: string) {
  const supabase = createAdminClient()
  
  const normalizedCode = code.toUpperCase().trim()
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .single()
  
  if (error || !data) {
    return { success: false, error: 'Coupon not found' }
  }
  
  const coupon = data as Coupon
  const now = new Date()
  
  // Check validity
  let isValid = coupon.is_active
  let invalidReason = ''
  
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    isValid = false
    invalidReason = 'Coupon not yet active'
  } else if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    isValid = false
    invalidReason = 'Coupon has expired'
  } else if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
    isValid = false
    invalidReason = 'Coupon usage limit reached'
  }
  
  return {
    success: true,
    data: coupon,
    isValid,
    invalidReason
  }
}
