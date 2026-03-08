'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Custom order schema
const CustomOrderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(9, 'Phone number is required'),
  company: z.string().optional(),
  productType: z.enum(['paper_bags', 'gift_boxes', 'packaging', 'other']),
  quantityRange: z.enum(['100-500', '500-1000', '1000-5000', '5000+']),
  description: z.string().min(10, 'Please describe your requirements'),
  referenceImages: z.array(z.string()).optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
})

export type CustomOrderInput = z.infer<typeof CustomOrderSchema>

export interface CustomOrder {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string
  company: string | null
  product_type: string
  quantity_range: string
  description: string
  reference_images: string[] | null
  budget_range: string | null
  timeline: string | null
  status: 'pending' | 'reviewing' | 'quoted' | 'accepted' | 'in_production' | 'completed' | 'cancelled'
  admin_notes: string | null
  quote_amount: number | null
  created_at: string
  updated_at: string
}

// Submit a custom order request
export async function submitCustomOrder(input: CustomOrderInput) {
  try {
    const validated = CustomOrderSchema.parse(input)
    
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()
    
    const { data, error } = await adminSupabase
      .from('custom_orders')
      .insert({
        user_id: user?.id,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        company: validated.company,
        product_type: validated.productType,
        quantity_range: validated.quantityRange,
        description: validated.description,
        reference_images: validated.referenceImages,
        budget_range: validated.budgetRange,
        timeline: validated.timeline,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Custom order error:', error)
      return { success: false, error: 'Failed to submit order request' }
    }
    
    // Send notification email to admin
    try {
      await resend.emails.send({
        from: 'Global Edge <support@globaledgeshop.com>',
        to: 'support@globaledgeshop.com',
        subject: `New Custom Order Request - ${validated.productType}`,
        html: `
          <h2>New Custom Order Request</h2>
          <p><strong>Name:</strong> ${validated.name}</p>
          <p><strong>Email:</strong> ${validated.email}</p>
          <p><strong>Phone:</strong> ${validated.phone}</p>
          <p><strong>Company:</strong> ${validated.company || 'N/A'}</p>
          <p><strong>Product Type:</strong> ${validated.productType.replace('_', ' ')}</p>
          <p><strong>Quantity:</strong> ${validated.quantityRange}</p>
          <p><strong>Budget:</strong> ${validated.budgetRange || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${validated.timeline || 'Not specified'}</p>
          <h3>Description:</h3>
          <p>${validated.description}</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError)
    }
    
    // Send confirmation email to customer
    try {
      await resend.emails.send({
        from: 'Global Edge <support@globaledgeshop.com>',
        to: validated.email,
        subject: 'Custom Order Request Received - Global Edge',
        html: `
          <h2>Thank you for your custom order request!</h2>
          <p>Hi ${validated.name},</p>
          <p>We have received your custom order request and our team will review it shortly.</p>
          <p>We typically respond within 1-2 business days with a detailed quote.</p>
          <h3>Your Request Summary:</h3>
          <p><strong>Product Type:</strong> ${validated.productType.replace('_', ' ')}</p>
          <p><strong>Quantity:</strong> ${validated.quantityRange}</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br/>Global Edge Team</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send customer confirmation:', emailError)
    }
    
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message }
    }
    console.error('Custom order error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get user's custom orders
export async function getUserCustomOrders() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }
  
  const { data, error } = await supabase
    .from('custom_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return { success: false, error: 'Failed to fetch orders' }
  }
  
  return { success: true, data: data as CustomOrder[] }
}

// Admin: Get all custom orders
export async function getCustomOrders(
  page: number = 1, 
  limit: number = 20,
  status?: string
) {
  const supabase = createAdminClient()
  
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('custom_orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
  
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  
  const { data, error, count } = await query.range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Get custom orders error:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
  
  return {
    success: true,
    data: data as CustomOrder[],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

// Admin: Update custom order status
export async function updateCustomOrderStatus(
  id: string,
  status: CustomOrder['status'],
  adminNotes?: string,
  quoteAmount?: number
) {
  const supabase = createAdminClient()
  
  const updateData: Record<string, unknown> = { status }
  
  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes
  }
  
  if (quoteAmount !== undefined) {
    updateData.quote_amount = quoteAmount
  }
  
  const { data, error } = await supabase
    .from('custom_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    return { success: false, error: 'Failed to update order' }
  }
  
  // Send status update email if status changed to 'quoted'
  if (status === 'quoted' && quoteAmount) {
    try {
      await resend.emails.send({
        from: 'Global Edge <orders@globaledge.ae>',
        to: data.email,
        subject: 'Your Custom Order Quote - Global Edge',
        html: `
          <h2>Your Custom Order Quote is Ready!</h2>
          <p>Hi ${data.name},</p>
          <p>We have reviewed your custom order request and prepared a quote for you.</p>
          <h3>Quote Details:</h3>
          <p><strong>Product Type:</strong> ${data.product_type.replace('_', ' ')}</p>
          <p><strong>Quantity:</strong> ${data.quantity_range}</p>
          <p><strong>Quoted Price:</strong> AED ${quoteAmount.toFixed(2)}</p>
          ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
          <p>Please reply to this email to accept the quote or discuss further.</p>
          <p>Best regards,<br/>Global Edge Team</p>
        `
      })
    } catch (emailError) {
      console.error('Failed to send quote email:', emailError)
    }
  }
  
  revalidatePath('/admin/orders')
  return { success: true, data }
}
