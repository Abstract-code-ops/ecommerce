'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { connectToDB } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { revalidatePath } from 'next/cache'
import {
  Return,
  ReturnInsert,
  ReturnUpdate,
  ReturnStatus,
  ReturnReason,
  FormattedReturn,
  ReturnWithDetails,
  RETURN_REASON_LABELS,
  centsToCurrency,
  currencyToCents,
} from '@/types/supabase'

// =============================================================================
// CUSTOMER RETURN ACTIONS
// =============================================================================

/**
 * Create a new return request for an order item
 */
export async function createReturn(data: {
  orderId: string
  orderItemId: string
  reason: ReturnReason
  reasonDetails?: string
  quantity?: number
  images?: string[]
}): Promise<{
  success: boolean
  data?: Return
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify the order belongs to this user and is delivered
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, user_id')
      .eq('id', data.orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return { success: false, error: 'Order not found' }
    }

    if (order.status !== 'delivered') {
      return { success: false, error: 'Returns can only be requested for delivered orders' }
    }

    // Check if a return already exists for this specific item
    const { data: existingReturns } = await supabase
      .from('returns')
      .select('id')
      .eq('order_item_id', data.orderItemId)
      .eq('user_id', user.id)
      .not('status', 'eq', 'rejected')

    if (existingReturns && existingReturns.length > 0) {
      return { success: false, error: 'A return request already exists for this item. Please check your returns page or contact us for assistance.' }
    }

    // Get order item to calculate refund amount
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .select('*')
      .eq('id', data.orderItemId)
      .eq('order_id', data.orderId)
      .single()

    if (itemError || !orderItem) {
      return { success: false, error: 'Order item not found' }
    }

    const quantity = data.quantity || orderItem.quantity
    const refundAmountCents = Math.round((orderItem.unit_price_cents * quantity))

    // Create the return
    const returnData: ReturnInsert = {
      order_id: data.orderId,
      order_item_id: data.orderItemId,
      user_id: user.id,
      reason: data.reason,
      reason_details: data.reasonDetails || null,
      quantity: quantity,
      refund_amount_cents: refundAmountCents,
      images: data.images || [],
      status: 'pending',
    }

    const { data: newReturn, error: insertError } = await supabase
      .from('returns')
      .insert(returnData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating return:', insertError)
      return { success: false, error: 'Failed to create return request' }
    }

    revalidatePath('/profile/orders')
    revalidatePath('/profile/returns')
    revalidatePath('/admin/returns')

    return { success: true, data: newReturn }
  } catch (error) {
    console.error('Error in createReturn:', error)
    return { success: false, error: 'Failed to create return request' }
  }
}

/**
 * Get all returns for the current user
 */
export async function getReturns(options?: {
  status?: ReturnStatus
  limit?: number
  offset?: number
}): Promise<{
  success: boolean
  data?: FormattedReturn[]
  total?: number
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    let query = supabase
      .from('returns')
      .select(`
        *,
        order:orders!inner(id, order_number),
        order_item:order_items!inner(id, product_snapshot)
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching returns:', error)
      return { success: false, error: error.message }
    }

    const formattedReturns: FormattedReturn[] = (data || []).map((ret: any) => ({
      id: ret.id,
      returnNumber: ret.return_number,
      orderId: ret.order_id,
      orderNumber: ret.order?.order_number || '',
      orderItemId: ret.order_item_id,
      productName: ret.order_item?.product_snapshot?.name || 'Unknown Product',
      productImage: ret.order_item?.product_snapshot?.image || '/images/placeholder.jpg',
      quantity: ret.quantity,
      reason: ret.reason,
      reasonLabel: RETURN_REASON_LABELS[ret.reason as ReturnReason],
      reasonDetails: ret.reason_details || undefined,
      status: ret.status,
      adminNotes: ret.admin_notes || undefined,
      rejectionReason: ret.rejection_reason || undefined,
      refundAmount: ret.refund_amount_cents ? centsToCurrency(ret.refund_amount_cents) : undefined,
      images: ret.images || [],
      createdAt: ret.created_at,
      updatedAt: ret.updated_at,
      resolvedAt: ret.resolved_at || undefined,
      refundedAt: ret.refunded_at || undefined,
    }))

    return { 
      success: true, 
      data: formattedReturns,
      total: count ?? 0
    }
  } catch (error) {
    console.error('Error in getReturns:', error)
    return { success: false, error: 'Failed to fetch returns' }
  }
}

/**
 * Get a single return by ID
 */
export async function getReturnById(id: string): Promise<{
  success: boolean
  data?: FormattedReturn
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        order:orders!inner(id, order_number),
        order_item:order_items!inner(id, product_snapshot)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching return:', error)
      return { success: false, error: error.message }
    }

    const formattedReturn: FormattedReturn = {
      id: data.id,
      returnNumber: data.return_number,
      orderId: data.order_id,
      orderNumber: (data as any).order?.order_number || '',
      orderItemId: data.order_item_id,
      productName: (data as any).order_item?.product_snapshot?.name || 'Unknown Product',
      productImage: (data as any).order_item?.product_snapshot?.image || '/images/placeholder.jpg',
      quantity: data.quantity,
      reason: data.reason as ReturnReason,
      reasonLabel: RETURN_REASON_LABELS[data.reason as ReturnReason],
      reasonDetails: data.reason_details || undefined,
      status: data.status as ReturnStatus,
      adminNotes: data.admin_notes || undefined,
      rejectionReason: data.rejection_reason || undefined,
      refundAmount: data.refund_amount_cents ? centsToCurrency(data.refund_amount_cents) : undefined,
      images: data.images || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at || undefined,
      refundedAt: data.refunded_at || undefined,
    }

    return { success: true, data: formattedReturn }
  } catch (error) {
    console.error('Error in getReturnById:', error)
    return { success: false, error: 'Failed to fetch return' }
  }
}

/**
 * Update a pending return (customer can update details before admin review)
 */
export async function updateReturn(
  id: string,
  data: {
    reasonDetails?: string
    images?: string[]
  }
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('returns')
      .update({
        reason_details: data.reasonDetails,
        images: data.images,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('status', 'pending')

    if (error) {
      console.error('Error updating return:', error)
      return { success: false, error: 'Failed to update return' }
    }

    revalidatePath('/profile/returns')
    return { success: true }
  } catch (error) {
    console.error('Error in updateReturn:', error)
    return { success: false, error: 'Failed to update return' }
  }
}

// =============================================================================
// ADMIN RETURN ACTIONS
// =============================================================================

const ADMIN_EMAILS = ['support@globaledgeshop.com']

async function isAdminUser(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  return ADMIN_EMAILS.includes(user.email || '') ||
         user.user_metadata?.role === 'admin' ||
         user.app_metadata?.role === 'admin'
}

/**
 * Get all returns for admin dashboard
 */
export async function getAdminReturns(options?: {
  search?: string
  status?: ReturnStatus | 'all'
  reason?: ReturnReason | 'all'
  limit?: number
  offset?: number
}): Promise<{
  success: boolean
  data?: FormattedReturn[]
  total?: number
  error?: string
}> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    let query = supabase
      .from('returns')
      .select(`
        *,
        order:orders!inner(id, order_number, shipping_address),
        order_item:order_items!inner(id, product_snapshot)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status)
    }

    if (options?.reason && options.reason !== 'all') {
      query = query.eq('reason', options.reason)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching admin returns:', error)
      return { success: false, error: error.message }
    }

    let filteredData = data || []

    // Get user IDs and fetch profiles separately
    const userIds = [...new Set(filteredData.map((ret: any) => ret.user_id).filter(Boolean))]
    const userProfiles: Record<string, { full_name: string | null; phone: string | null }> = {}
    const userEmails: Record<string, string> = {}
    
    if (userIds.length > 0) {
      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds)
      
      if (profiles) {
        profiles.forEach((p: any) => {
          userProfiles[p.id] = { full_name: p.full_name, phone: p.phone }
        })
      }

      // Get emails for all users
      for (const userId of userIds) {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId as string)
        if (authUser?.user?.email) {
          userEmails[userId as string] = authUser.user.email
        }
      }
    }

    // Client-side search filtering
    if (options?.search) {
      const searchLower = options.search.toLowerCase()
      filteredData = filteredData.filter((ret: any) => {
        const profile = userProfiles[ret.user_id]
        return ret.return_number?.toLowerCase().includes(searchLower) ||
          ret.order?.order_number?.toLowerCase().includes(searchLower) ||
          profile?.full_name?.toLowerCase().includes(searchLower) ||
          ret.order_item?.product_snapshot?.name?.toLowerCase().includes(searchLower)
      })
    }

    const formattedReturns: FormattedReturn[] = filteredData.map((ret: any) => {
      const profile = userProfiles[ret.user_id]
      return {
        id: ret.id,
        returnNumber: ret.return_number,
        orderId: ret.order_id,
        orderNumber: ret.order?.order_number || '',
        orderItemId: ret.order_item_id,
        productName: ret.order_item?.product_snapshot?.name || 'Unknown Product',
        productImage: ret.order_item?.product_snapshot?.image || '/images/placeholder.jpg',
        quantity: ret.quantity,
        reason: ret.reason,
        reasonLabel: RETURN_REASON_LABELS[ret.reason as ReturnReason],
        reasonDetails: ret.reason_details || undefined,
        status: ret.status,
        adminNotes: ret.admin_notes || undefined,
        rejectionReason: ret.rejection_reason || undefined,
        refundAmount: ret.refund_amount_cents ? centsToCurrency(ret.refund_amount_cents) : undefined,
        images: ret.images || [],
        createdAt: ret.created_at,
        updatedAt: ret.updated_at,
        resolvedAt: ret.resolved_at || undefined,
        refundedAt: ret.refunded_at || undefined,
        customer: ret.user_id ? {
          id: ret.user_id,
          name: profile?.full_name || ret.order?.shipping_address?.fullName || 'Unknown',
          email: userEmails[ret.user_id] || 'N/A',
          phone: profile?.phone || ret.order?.shipping_address?.phone || undefined,
        } : undefined,
      }
    })

    return { 
      success: true, 
      data: formattedReturns,
      total: count ?? 0
    }
  } catch (error) {
    console.error('Error in getAdminReturns:', error)
    return { success: false, error: 'Failed to fetch returns' }
  }
}

/**
 * Get admin return statistics
 */
export async function getAdminReturnStats(): Promise<{
  success: boolean
  data?: {
    pending: number
    approved: number
    processing: number
    refunded: number
    rejected: number
    total: number
    totalRefunded: number
  }
  error?: string
}> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('returns')
      .select('status, refund_amount_cents')

    if (error) {
      console.error('Error fetching return stats:', error)
      return { success: false, error: error.message }
    }

    const stats = {
      pending: data.filter(r => r.status === 'pending').length,
      approved: data.filter(r => r.status === 'approved').length,
      processing: data.filter(r => r.status === 'processing').length,
      refunded: data.filter(r => r.status === 'refunded').length,
      rejected: data.filter(r => r.status === 'rejected').length,
      total: data.length,
      totalRefunded: data
        .filter(r => r.status === 'refunded')
        .reduce((sum, r) => sum + (r.refund_amount_cents || 0), 0) / 100,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error in getAdminReturnStats:', error)
    return { success: false, error: 'Failed to fetch return statistics' }
  }
}

/**
 * Approve a return request
 */
export async function approveReturn(
  id: string,
  adminNotes?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('returns')
      .update({
        status: 'approved',
        admin_notes: adminNotes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'pending')

    if (error) {
      console.error('Error approving return:', error)
      return { success: false, error: 'Failed to approve return' }
    }

    revalidatePath('/admin/returns')
    revalidatePath('/profile/returns')
    return { success: true }
  } catch (error) {
    console.error('Error in approveReturn:', error)
    return { success: false, error: 'Failed to approve return' }
  }
}

/**
 * Reject a return request
 */
export async function rejectReturn(
  id: string,
  rejectionReason: string,
  adminNotes?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('returns')
      .update({
        status: 'rejected',
        rejection_reason: rejectionReason,
        admin_notes: adminNotes,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('status', 'pending')

    if (error) {
      console.error('Error rejecting return:', error)
      return { success: false, error: 'Failed to reject return' }
    }

    revalidatePath('/admin/returns')
    revalidatePath('/profile/returns')
    return { success: true }
  } catch (error) {
    console.error('Error in rejectReturn:', error)
    return { success: false, error: 'Failed to reject return' }
  }
}

/**
 * Start processing a return (after approval)
 */
export async function processReturn(
  id: string,
  adminNotes?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('returns')
      .update({
        status: 'processing',
        admin_notes: adminNotes,
      })
      .eq('id', id)
      .eq('status', 'approved')

    if (error) {
      console.error('Error processing return:', error)
      return { success: false, error: 'Failed to start processing return' }
    }

    revalidatePath('/admin/returns')
    revalidatePath('/profile/returns')
    return { success: true }
  } catch (error) {
    console.error('Error in processReturn:', error)
    return { success: false, error: 'Failed to process return' }
  }
}

/**
 * Complete refund for a return
 * Also restores stock in MongoDB
 */
export async function completeRefund(
  id: string,
  refundAmountCents?: number,
  adminNotes?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    // Get the return with order item details for stock restoration
    const { data: returnData, error: fetchError } = await supabase
      .from('returns')
      .select(`
        status, 
        order_id, 
        order_item_id,
        quantity,
        refund_amount_cents,
        order_item:order_items!inner(mongo_product_id)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !returnData) {
      return { success: false, error: 'Return not found' }
    }

    if (returnData.status !== 'approved' && returnData.status !== 'processing') {
      return { success: false, error: 'Return must be approved or processing to complete refund' }
    }

    const updateData: any = {
      status: 'refunded',
      admin_notes: adminNotes,
      refunded_at: new Date().toISOString(),
    }

    if (refundAmountCents !== undefined) {
      updateData.refund_amount_cents = refundAmountCents
    }

    const { error } = await supabase
      .from('returns')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error completing refund:', error)
      return { success: false, error: 'Failed to complete refund' }
    }

    // Restore stock in MongoDB for the returned product
    try {
      await connectToDB()
      
      const orderItem = returnData.order_item as any
      const mongoProductId = orderItem?.mongo_product_id
      
      if (mongoProductId) {
        await Product.findByIdAndUpdate(
          mongoProductId,
          { 
            $inc: { 
              countInStock: returnData.quantity,
              numSales: -returnData.quantity 
            } 
          }
        )
        console.log(`Stock restored for product ${mongoProductId}: +${returnData.quantity}`)
      }
    } catch (stockError) {
      console.error('Error restoring stock (refund still completed):', stockError)
      // Note: Refund is still completed, stock restoration failed
    }

    revalidatePath('/admin/returns')
    revalidatePath('/profile/returns')
    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error in completeRefund:', error)
    return { success: false, error: 'Failed to complete refund' }
  }
}

/**
 * Update admin notes on a return
 */
export async function updateAdminNotes(
  id: string,
  adminNotes: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('returns')
      .update({ admin_notes: adminNotes })
      .eq('id', id)

    if (error) {
      console.error('Error updating admin notes:', error)
      return { success: false, error: 'Failed to update notes' }
    }

    revalidatePath('/admin/returns')
    return { success: true }
  } catch (error) {
    console.error('Error in updateAdminNotes:', error)
    return { success: false, error: 'Failed to update notes' }
  }
}
