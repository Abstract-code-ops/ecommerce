'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { generateCouponCode } from './coupon.actions'

const resend = new Resend(process.env.RESEND_API_KEY)
const NEWSLETTER_DISCOUNT_PERCENT = 10

const EmailSchema = z.string().email('Please enter a valid email address')

export async function subscribeToNewsletter(email: string, source: string = 'website') {
  try {
    const validatedEmail = EmailSchema.parse(email.toLowerCase().trim())
    
    const supabase = createAdminClient()
    
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active, coupon_sent')
      .eq('email', validatedEmail)
      .single()
    
    if (existing) {
      if (existing.is_active) {
        return { success: false, error: 'This email is already subscribed!' }
      }
      // Reactivate subscription
      await supabase
        .from('newsletter_subscribers')
        .update({ is_active: true, unsubscribed_at: null })
        .eq('id', existing.id)
      
      return { success: true, message: 'Welcome back! Your subscription has been reactivated.' }
    }
    
    // Generate a unique coupon code for this subscriber
    const couponCode = await generateCouponCode('WELCOME')
    
    // Set coupon expiry to 30 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    
    // Create the coupon in the database
    const { error: couponError } = await supabase
      .from('coupons')
      .insert({
        code: couponCode,
        description: `Newsletter welcome discount for ${validatedEmail}`,
        discount_type: 'percentage',
        discount_value: NEWSLETTER_DISCOUNT_PERCENT,
        min_order_amount: 0,
        usage_limit: 1, // Single use per subscriber
        is_active: true,
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
    
    if (couponError) {
      console.error('Failed to create welcome coupon:', couponError)
      // Continue with subscription even if coupon fails
    }
    
    // Create new subscription
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: validatedEmail,
        source,
        is_active: true,
        coupon_code: couponCode,
        coupon_sent: false,
      })
    
    if (error) {
      console.error('Newsletter subscription error:', error)
      return { success: false, error: 'Failed to subscribe. Please try again.' }
    }
    
    // Send welcome email with coupon via Resend
    try {
      const emailHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 30px;">
            <h2 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">GLOBAL EDGE</h2>
          </div>
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 32px; margin: 0 0 10px 0; color: #1B3022;">Welcome to the Family!</h1>
            <p style="color: #666; margin: 0; font-size: 16px;">Thank you for subscribing to our newsletter</p>
          </div>
          <div style="margin-bottom: 30px; line-height: 1.6; color: #444;">
            <p>As a thank you for joining our community, here's an exclusive discount just for you!</p>
          </div>
          <div style="background: linear-gradient(135deg, #1B3022 0%, #2d4a36 100%); border-radius: 16px; padding: 40px 30px; text-align: center; margin-bottom: 30px;">
            <p style="color: #9DBE91; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">Your Exclusive Code</p>
            <div style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 4px; margin-bottom: 15px; font-family: monospace;">${couponCode}</div>
            <div style="font-size: 24px; color: #9DBE91; font-weight: 600;">${NEWSLETTER_DISCOUNT_PERCENT}% OFF</div>
            <p style="color: #9DBE91; font-size: 12px; margin: 15px 0 0 0; opacity: 0.8;">Valid until ${expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://globaledge.ae'}/shop" style="display: inline-block; background-color: #9DBE91; color: #ffffff; padding: 16px 48px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px;">Shop Now & Save</a>
          </div>
          <div style="background-color: #F4F5F2; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1B3022;">How to use your code:</p>
            <ol style="margin: 0; padding-left: 20px; color: #5A6B5E; font-size: 14px; line-height: 1.8;">
              <li>Browse our collection and add items to your cart</li>
              <li>Go to checkout and enter your coupon code</li>
              <li>Enjoy your exclusive ${NEWSLETTER_DISCOUNT_PERCENT}% discount!</li>
            </ol>
          </div>
        </div>
      `
      
      await resend.emails.send({
        from: 'Global Edge <noreply@globaledge.ae>',
        to: validatedEmail,
        subject: `Welcome! Here's your ${NEWSLETTER_DISCOUNT_PERCENT}% discount code`,
        html: emailHtml,
      })
      
      // Mark coupon as sent
      await supabase
        .from('newsletter_subscribers')
        .update({ coupon_sent: true })
        .eq('email', validatedEmail)
        
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the subscription if email fails
    }
    
    return { 
      success: true, 
      message: `Successfully subscribed! Check your email for a ${NEWSLETTER_DISCOUNT_PERCENT}% discount code.` 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Newsletter subscription error:', error)
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    const validatedEmail = EmailSchema.parse(email.toLowerCase().trim())
    
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ 
        is_active: false, 
        unsubscribed_at: new Date().toISOString() 
      })
      .eq('email', validatedEmail)
    
    if (error) {
      return { success: false, error: 'Failed to unsubscribe.' }
    }
    
    return { success: true, message: 'You have been unsubscribed.' }
  } catch (error) {
    return { success: false, error: 'Invalid email address.' }
  }
}

// Admin: Get all subscribers
export async function getNewsletterSubscribers(page: number = 1, limit: number = 50) {
  const supabase = createAdminClient()
  
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching subscribers:', error)
    return { success: false, error: 'Failed to fetch subscribers' }
  }
  
  return { 
    success: true, 
    data, 
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  }
}
