'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { connectToDB } from '@/lib/db'
import Product from '@/lib/db/models/product.model'
import { 
  Order,
  OrderInsert,
  OrderItemInsert,
  OrderWithItems,
  FormattedOrder,
  ProductSnapshot,
  ShippingAddressSnapshot,
  currencyToCents,
  formatOrderForDisplay,
} from '@/types/supabase'
import { revalidatePath } from 'next/cache'
import { OrderItem } from "@/types";
import { round2Decimals } from "../utils";
import { Resend } from 'resend';
import { OrderStatusEmail } from '@/components/emails/orderStatusEmail';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderUpdateEmail(
  orderId: string,
  emailType: 'confirmation' | 'status_update' | 'cancellation',
  additionalData?: {
    newStatus?: string
    trackingNumber?: string
    estimatedDelivery?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabaseAdmin = createAdminClient()
    
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()
    
    if (orderError || !order) {
      console.error('Error fetching order for email:', orderError)
      return { success: false, error: 'Order not found' }
    }
    
    // Resolve recipient email
    let recipientEmail: string | null = null
    let customerName: string = order.shipping_address?.fullName || 'Customer'
    
    if (order.user_id) {
      // Authenticated user - fetch name from profiles table and email from auth
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', order.user_id)
        .single()
      
      if (profile?.full_name) {
        customerName = profile.full_name
      }
      
      // Get email from Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(order.user_id)
      
      if (authError) {
        console.error('Error fetching auth user for email:', authError)
      }
      
      if (authData?.user?.email) {
        recipientEmail = authData.user.email
      }
    } else {
      // Guest order - use guest_email from order
      recipientEmail = order.guest_email
    }
    
    if (!recipientEmail) {
      console.error('No recipient email found for order:', orderId)
      return { success: false, error: 'No recipient email available' }
    }
    
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Global Edge'
    
    // Prepare email based on type
    let subject: string;
    let emailContent: React.ReactElement;

    const commonProps = {
      customerName,
      orderNumber: order.order_number,
      items: order.order_items.map((item: any) => ({
        name: item.product_snapshot.name,
        quantity: item.quantity,
        totalPrice: item.total_price_cents / 100,
        size: item.size,
      })),
      total: order.total_cents / 100,
      shippingAddress: order.shipping_address,
    };
    
    switch (emailType) {
      case 'confirmation':
        subject = `Order Confirmed - ${order.order_number}`;
        emailContent = React.createElement(OrderStatusEmail, {
          ...commonProps,
          statusTitle: "Thanks for your order.",
          statusDescription: "We've received your order and are getting it ready for shipment.",
        });
        break;

      case 'status_update':
        const isShipped = additionalData?.newStatus === 'shipped';
        subject = isShipped ? `Your order is on the way!` : `Order Update - ${order.order_number}`;
        emailContent = React.createElement(OrderStatusEmail, {
          ...commonProps,
          statusTitle: isShipped ? "Your order has shipped." : `Order Status: ${additionalData?.newStatus}`,
          statusDescription: isShipped 
            ? "Great news! Your package is with our courier and will be with you shortly."
            : `Your order status has been updated to: ${additionalData?.newStatus}.`,
          trackingNumber: additionalData?.trackingNumber,
        });
        break;

      case 'cancellation':
        subject = `Order Cancelled - ${order.order_number}`;
        emailContent = React.createElement(OrderStatusEmail, {
          ...commonProps,
          statusTitle: "Order Cancelled",
          statusDescription: "Your order has been successfully cancelled. If you were charged, a refund will be processed automatically.",
          accentColor: "#FF0000",
        });
        break;
        
      default:
        return { success: false, error: 'Invalid email type' };
}
    
    // Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || `${appName} <onboarding@resend.dev>`,
      to: recipientEmail,
      subject,
      react: emailContent,
    })
    
    if (emailError) {
      console.error('Resend API error:', emailError)
      return { success: false, error: emailError.message }
    }
    
    console.log(`${emailType} email sent to:`, recipientEmail, 'Email ID:', emailData?.id)
    return { success: true }
    
  } catch (error) {
    console.error('Error sending order email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

/**
 * Calculate order pricing including tax and shipping
 * 
 * NOTE: This is now a synchronous function for better performance in the cart store.
 */
export const calculateDateAndPrice = async ({
    deliveryDateIndex,
    items,
}: {
    items: OrderItem[]
    deliveryDateIndex?: number
}) => {
    const itemPrice = round2Decimals(
        items.reduce((acc, item) => acc + item.totalPrice, 0)
    )

    // Fixed shipping price of 10 AED
    const shippingPrice = 10;
    
    // No tax
    const taxPrice = 0;
    
    const totalPrice = round2Decimals(
        shippingPrice + itemPrice
    )

    return {
        itemPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    }
}

// =============================================================================
// ORDER ACTIONS
// =============================================================================

/**
 * Get all orders for the current user with their items
 */
export async function getOrders(options?: {
  status?: Order['status']
  limit?: number
  offset?: number
}): Promise<{
  success: boolean
  data?: FormattedOrder[]
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
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
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
      console.error('Error fetching orders:', error)
      return { success: false, error: error.message }
    }

    const formattedOrders = (data as OrderWithItems[]).map(formatOrderForDisplay)
    
    return { 
      success: true, 
      data: formattedOrders,
      total: count ?? 0
    }
  } catch (error) {
    console.error('Error in getOrders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}

/**
 * Get a single order by ID with items
 */
export async function getOrderById(id: string): Promise<{
  success: boolean
  data?: FormattedOrder
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: formatOrderForDisplay(data as OrderWithItems) }
  } catch (error) {
    console.error('Error in getOrderById:', error)
    return { success: false, error: 'Failed to fetch order' }
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<{
  success: boolean
  data?: FormattedOrder
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('order_number', orderNumber)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: formatOrderForDisplay(data as OrderWithItems) }
  } catch (error) {
    console.error('Error in getOrderByNumber:', error)
    return { success: false, error: 'Failed to fetch order' }
  }
}

/**
 * Get order statistics for the current user
 */
export async function getOrderStats(): Promise<{
  success: boolean
  data?: {
    totalOrders: number
    totalSpent: number
    pendingOrders: number
    deliveredOrders: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('orders')
      .select('status, total_cents')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching order stats:', error)
      return { success: false, error: error.message }
    }

    const stats = {
      totalOrders: data.length,
      totalSpent: data.reduce((sum, order) => sum + order.total_cents, 0) / 100,
      pendingOrders: data.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length,
      deliveredOrders: data.filter(o => o.status === 'delivered').length,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error in getOrderStats:', error)
    return { success: false, error: 'Failed to fetch order stats' }
  }
}

/**
 * Generate a unique order number
 */
function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${year}${month}${day}-${random}`
}

/**
 * Validate stock availability for cart items
 * Returns items with their current stock status
 */
export async function validateCartStock(items: Array<{
  mongoProductId: string
  quantity: number
  name: string
}>): Promise<{
  success: boolean
  data?: Array<{
    mongoProductId: string
    name: string
    requestedQuantity: number
    availableStock: number
    isAvailable: boolean
  }>
  error?: string
}> {
  try {
    await connectToDB()
    
    const stockChecks = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.mongoProductId).select('countInStock name').lean()
        const availableStock = (product as { countInStock?: number } | null)?.countInStock ?? 0
        
        return {
          mongoProductId: item.mongoProductId,
          name: item.name,
          requestedQuantity: item.quantity,
          availableStock,
          isAvailable: availableStock >= item.quantity,
        }
      })
    )
    
    return { success: true, data: stockChecks }
  } catch (error) {
    console.error('Error validating stock:', error)
    return { success: false, error: 'Failed to validate stock availability' }
  }
}

/**
 * Create a new order with items
 * This is the main function for checkout that creates product snapshots
 */
export async function createOrder(orderData: {
  items: Array<{
    mongoProductId?: string
    productSnapshot: ProductSnapshot
    quantity: number
    unitPrice: number  // In AED, not cents
    size?: string
    color?: string
  }>
  shippingAddress: ShippingAddressSnapshot
  billingAddress?: ShippingAddressSnapshot
  subtotal: number    // In AED
  shipping: number    // In AED
  tax: number         // In AED
  discount?: number   // In AED
  paymentMethod?: string
  guestEmail?: string  // For guest checkout
}): Promise<{
  success: boolean
  data?: { orderId: string; orderNumber: string; isGuest: boolean }
  error?: string
  outOfStockItems?: Array<{ name: string; available: number; requested: number }>
}> {
  try {
    // Use regular client to check user authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Use admin client for order insertion (bypasses RLS - correct for server-side operations)
    const supabaseAdmin = createAdminClient()

    // Validate stock availability before creating order
    await connectToDB()
    
    const outOfStockItems: Array<{ name: string; available: number; requested: number }> = []
    
    for (const item of orderData.items) {
      if (item.mongoProductId) {
        const product = await Product.findById(item.mongoProductId).select('countInStock name').lean()
        const availableStock = (product as { countInStock?: number } | null)?.countInStock ?? 0
        
        if (availableStock < item.quantity) {
          outOfStockItems.push({
            name: item.productSnapshot.name,
            available: availableStock,
            requested: item.quantity,
          })
        }
      }
    }
    
    if (outOfStockItems.length > 0) {
      return { 
        success: false, 
        error: 'Some items are out of stock',
        outOfStockItems 
      }
    }

    const total = orderData.subtotal + orderData.shipping + orderData.tax - (orderData.discount || 0)
    const orderNumber = generateOrderNumber()

    // Prepare order data
    const orderInsertData = {
      user_id: user?.id || null,  // Allow null for guest orders
      order_number: orderNumber,
      status: 'pending',
      subtotal_cents: currencyToCents(orderData.subtotal),
      shipping_cents: currencyToCents(orderData.shipping),
      tax_cents: currencyToCents(orderData.tax),
      discount_cents: currencyToCents(orderData.discount || 0),
      total_cents: currencyToCents(total),
      shipping_address: orderData.shippingAddress,
      billing_address: orderData.billingAddress || null,
      payment_method: orderData.paymentMethod,
      payment_status: 'pending',
      guest_email: !user ? orderData.guestEmail : null,  // Store guest email if not logged in
    } as OrderInsert

    // DEBUG: Log what we're trying to insert
    console.log('=== ORDER INSERT DEBUG ===')
    console.log('User authenticated:', !!user)
    console.log('User ID:', user?.id || 'null')
    console.log('Guest Email:', orderInsertData.guest_email)
    console.log('Order Data:', JSON.stringify(orderInsertData, null, 2))
    console.log('============ using ADMIN client (bypasses RLS)')
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderInsertData)
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      console.error('Error creating order:', orderError)
      return { success: false, error: orderError?.message || 'Failed to create order' }
    }

    // Create order items with product snapshots using ADMIN client
    const orderItems: OrderItemInsert[] = orderData.items.map(item => ({
      order_id: order.id,
      mongo_product_id: item.mongoProductId || null,
      product_snapshot: item.productSnapshot,
      quantity: item.quantity,
      unit_price_cents: currencyToCents(item.unitPrice),
      total_price_cents: currencyToCents(item.unitPrice * item.quantity),
      size: item.size || null,
      color: item.color || null,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback: delete the order using admin client
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      return { success: false, error: itemsError.message }
    }

    // Reduce stock in MongoDB for each product
    try {
      await connectToDB()
      
      for (const item of orderData.items) {
        if (item.mongoProductId) {
          await Product.findByIdAndUpdate(
            item.mongoProductId,
            { 
              $inc: { 
                countInStock: -item.quantity,
                numSales: item.quantity 
              } 
            }
          )
        }
      }
    } catch (stockError) {
      console.error('Error reducing stock (order still created):', stockError)
      // Note: We don't rollback the order here - stock reduction is secondary
      // In a production system, you might want to queue this for retry
    }

    // Send order confirmation email
    try {
      await sendOrderUpdateEmail(order.id, 'confirmation')
    } catch (emailError) {
      console.error('Error sending order confirmation email (order still created):', emailError);
      // Note: We don't rollback the order here - email sending is secondary
    }

    revalidatePath('/orders')
    revalidatePath('/profile')
    revalidatePath('/shop')
    revalidatePath('/shop/products')
    
    return { 
      success: true, 
      data: { 
        orderId: order.id, 
        orderNumber: order.order_number,
        isGuest: !user  // Flag to indicate if this is a guest order
      } 
    }
  } catch (error) {
    console.error('Error in createOrder:', error)
    return { success: false, error: 'Failed to create order' }
  }
}

/**
 * Cancel an order (only if status is pending)
 * Also restores stock in MongoDB
 */
export async function cancelOrder(orderId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if order exists and is pending, also get order items for stock restoration
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('status, order_items(mongo_product_id, quantity)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (!existingOrder) {
      return { success: false, error: 'Order not found' }
    }

    if (existingOrder.status !== 'pending') {
      return { success: false, error: 'Only pending orders can be cancelled' }
    }

    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error cancelling order:', error)
      return { success: false, error: error.message }
    }

    // Restore stock in MongoDB for each product
    try {
      await connectToDB()
      
      const orderItems = existingOrder.order_items as { mongo_product_id: string | null, quantity: number }[]
      for (const item of orderItems) {
        if (item.mongo_product_id) {
          await Product.findByIdAndUpdate(
            item.mongo_product_id,
            { 
              $inc: { 
                countInStock: item.quantity,
                numSales: -item.quantity 
              } 
            }
          )
        }
      }
    } catch (stockError) {
      console.error('Error restoring stock (order still cancelled):', stockError)
      // Note: Order is still cancelled, stock restoration failed
    }

    // Send cancellation email
    try {
      await sendOrderUpdateEmail(orderId, 'cancellation')
    } catch (emailError) {
      console.error('Error sending cancellation email (order still cancelled):', emailError)
      // Note: Order is still cancelled, email sending is secondary
    }

    revalidatePath('/orders')
    return { success: true }
  } catch (error) {
    console.error('Error in cancelOrder:', error)
    return { success: false, error: 'Failed to cancel order' }
  }
}

/**
 * Helper function to create a product snapshot from MongoDB product data
 * Call this when adding items to an order
 */
// export async function createProductSnapshot(product: {
//   _id?: string
//   name: string
//   slug: string
//   images: string[]
//   category: string
//   description?: string
//   price: number
//   listPrice?: number
// }): Promise<ProductSnapshot> {
//   return {
//     name: product.name,
//     slug: product.slug,
//     image: product.images[0] || '',
//     images: product.images,
//     category: product.category,
//     description: product.description,
//     price: product.price,
//     listPrice: product.listPrice,
//   }
// }
