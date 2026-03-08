'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

// UAE phone number regex
// Accepts: +971XXXXXXXXX, 971XXXXXXXXX, 05XXXXXXXX, 5XXXXXXXX
const UAEPhoneRegex = /^(?:\+?971|0)?(?:5[0-9])(\d{7})$/

const PhoneSchema = z.string()
  .transform(val => val.replace(/[\s\-()]/g, '')) // Remove spaces, dashes, parentheses
  .refine(val => UAEPhoneRegex.test(val), {
    message: 'Please enter a valid UAE mobile number (starting with 05 or +971 5)'
  })

function normalizeUAEPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  
  // If starts with +971, keep it
  if (cleaned.startsWith('+971')) {
    return cleaned
  }
  
  // If starts with 971, add +
  if (cleaned.startsWith('971')) {
    return '+' + cleaned
  }
  
  // If starts with 05, convert to +971 5
  if (cleaned.startsWith('05')) {
    return '+971' + cleaned.slice(1)
  }
  
  // If starts with 5, convert to +971 5
  if (cleaned.startsWith('5')) {
    return '+971' + cleaned
  }
  
  return '+971' + cleaned
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export interface PhoneVerificationResult {
  success: boolean
  error?: string
  verificationId?: string
  expiresAt?: string
}

// Send OTP to phone number
export async function sendPhoneOTP(
  phone: string, 
  userId?: string,
  sessionId?: string
): Promise<PhoneVerificationResult> {
  try {
    // Validate phone number
    const validatedPhone = PhoneSchema.parse(phone)
    const normalizedPhone = normalizeUAEPhone(validatedPhone)
    
    const supabase = createAdminClient()
    
    // Check for recent OTP requests (rate limiting - max 3 per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { count } = await supabase
      .from('phone_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('phone', normalizedPhone)
      .gte('created_at', oneHourAgo)
    
    if (count && count >= 3) {
      return { 
        success: false, 
        error: 'Too many verification attempts. Please try again in an hour.' 
      }
    }
    
    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    
    // Store verification record
    const { data, error } = await supabase
      .from('phone_verifications')
      .insert({
        phone: normalizedPhone,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
        user_id: userId,
        session_id: sessionId || crypto.randomUUID()
      })
      .select('id, session_id, expires_at')
      .single()
    
    if (error) {
      console.error('Phone verification insert error:', error)
      return { success: false, error: 'Failed to initiate verification' }
    }
    
    // TODO: Integrate with SMS provider (Twilio, etc.)
    // For now, log OTP for development
    console.log(`[DEV] OTP for ${normalizedPhone}: ${otp}`)
    
    // In production, you would send SMS here:
    // await sendSMS(normalizedPhone, `Your Global Edge verification code is: ${otp}`)
    
    return { 
      success: true, 
      verificationId: data.session_id,
      expiresAt: data.expires_at
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Send OTP error:', error)
    return { success: false, error: 'Failed to send verification code' }
  }
}

// Verify OTP
export async function verifyPhoneOTP(
  phone: string,
  otp: string,
  sessionId: string
): Promise<{ success: boolean; error?: string; verified?: boolean }> {
  try {
    const normalizedPhone = normalizeUAEPhone(phone.replace(/[\s\-()]/g, ''))
    
    const supabase = createAdminClient()
    
    // Find verification record
    const { data: verification, error } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', normalizedPhone)
      .eq('session_id', sessionId)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error || !verification) {
      return { success: false, error: 'Verification not found. Please request a new code.' }
    }
    
    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return { success: false, error: 'Verification code has expired. Please request a new one.' }
    }
    
    // Check attempts
    if (verification.attempts >= 5) {
      return { success: false, error: 'Too many failed attempts. Please request a new code.' }
    }
    
    // Verify OTP
    if (verification.otp_code !== otp) {
      // Increment attempts
      await supabase
        .from('phone_verifications')
        .update({ attempts: verification.attempts + 1 })
        .eq('id', verification.id)
      
      return { success: false, error: 'Invalid verification code' }
    }
    
    // Mark as verified
    await supabase
      .from('phone_verifications')
      .update({ 
        verified: true, 
        verified_at: new Date().toISOString() 
      })
      .eq('id', verification.id)
    
    return { success: true, verified: true }
  } catch (error) {
    console.error('Verify OTP error:', error)
    return { success: false, error: 'Verification failed' }
  }
}

// Check if phone is verified (for checkout)
export async function isPhoneVerified(
  phone: string,
  sessionId?: string,
  userId?: string
): Promise<boolean> {
  try {
    const normalizedPhone = normalizeUAEPhone(phone.replace(/[\s\-()]/g, ''))
    
    const supabase = createAdminClient()
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    let query = supabase
      .from('phone_verifications')
      .select('id')
      .eq('phone', normalizedPhone)
      .eq('verified', true)
      .gte('verified_at', oneHourAgo)
    
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    } else if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query.limit(1).single()
    
    return !error && !!data
  } catch {
    return false
  }
}

// Validate UAE phone number format only (no OTP)
export function validateUAEPhoneFormat(phone: string): { isValid: boolean; error?: string; formatted?: string } {
  try {
    const cleaned = phone.replace(/[\s\-()]/g, '')
    
    if (!UAEPhoneRegex.test(cleaned)) {
      return { 
        isValid: false, 
        error: 'Please enter a valid UAE mobile number (starting with 05 or +971 5)' 
      }
    }
    
    return { 
      isValid: true, 
      formatted: normalizeUAEPhone(cleaned) 
    }
  } catch {
    return { isValid: false, error: 'Invalid phone number format' }
  }
}
