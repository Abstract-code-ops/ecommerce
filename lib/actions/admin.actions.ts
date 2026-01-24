'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { connectToDB } from '@/lib/db'
import Product, { IProduct } from '@/lib/db/models/product.model'
import { revalidatePath } from 'next/cache'

// Helper to serialize Mongoose documents
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}

// =============================================================================
// ADMIN AUTHENTICATION CHECK
// =============================================================================

const ADMIN_EMAILS = ['admin@globaledge.ae']

async function isAdminUser(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  return ADMIN_EMAILS.includes(user.email || '') ||
         user.user_metadata?.role === 'admin' ||
         user.app_metadata?.role === 'admin'
}

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export async function getAdminDashboardStats() {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    // Use admin client to bypass RLS and get all data
    const supabase = createAdminClient()
    await connectToDB()

    // Get orders stats from Supabase
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_cents, status, created_at, payment_status')

    if (ordersError) throw ordersError

    // Calculate order stats
    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100 || 0
    const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
    const processingOrders = orders?.filter(o => o.status === 'processing').length || 0
    const shippedOrders = orders?.filter(o => o.status === 'shipped').length || 0
    const deliveredOrders = orders?.filter(o => o.status === 'delivered').length || 0
    const cancelledOrders = orders?.filter(o => o.status === 'cancelled').length || 0

    // Calculate revenue by time period
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const todayRevenue = orders?.filter(o => new Date(o.created_at) >= todayStart)
      .reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100 || 0
    const weekRevenue = orders?.filter(o => new Date(o.created_at) >= weekStart)
      .reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100 || 0
    const monthRevenue = orders?.filter(o => new Date(o.created_at) >= monthStart)
      .reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100 || 0

    // Get products stats from MongoDB
    const totalProducts = await Product.countDocuments()
    const publishedProducts = await Product.countDocuments({ isPublished: true })
    const lowStockProducts = await Product.countDocuments({ countInStock: { $lte: 10, $gt: 0 } })
    const outOfStockProducts = await Product.countDocuments({ countInStock: 0 })

    // Get customer count from Supabase profiles
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Recent orders (last 5)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, order_number, total_cents, status, created_at, shipping_address')
      .order('created_at', { ascending: false })
      .limit(5)

    // Low stock products
    const lowStockItems = await Product.find({ countInStock: { $lte: 10 } })
      .select('name slug countInStock images price')
      .sort({ countInStock: 1 })
      .limit(5)
      .lean()

    return {
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          today: todayRevenue,
          week: weekRevenue,
          month: monthRevenue,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        products: {
          total: totalProducts,
          published: publishedProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
        },
        customers: {
          total: totalCustomers || 0,
        },
        recentOrders: recentOrders?.map(o => ({
          id: o.id,
          orderNumber: o.order_number,
          total: (o.total_cents || 0) / 100,
          status: o.status,
          createdAt: o.created_at,
          customerName: (o.shipping_address as any)?.full_name || 'Guest',
        })) || [],
        lowStockItems: lowStockItems.map(item => ({
          _id: item._id.toString(),
          name: item.name,
          slug: item.slug,
          countInStock: item.countInStock,
          price: item.price,
          images: item.images,
        })),
      }
    }
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    return { success: false, error: 'Failed to fetch dashboard stats' }
  }
}

// =============================================================================
// PRODUCTS MANAGEMENT
// =============================================================================

export async function getAdminProducts(options?: {
  search?: string
  category?: string
  status?: 'all' | 'published' | 'draft' | 'low-stock' | 'out-of-stock'
  limit?: number
  page?: number
}) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectToDB()

    const limit = options?.limit || 20
    const page = options?.page || 1
    const skip = (page - 1) * limit

    // Build query conditions
    const conditions: any = {}

    if (options?.search) {
      conditions.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { slug: { $regex: options.search, $options: 'i' } },
        { category: { $regex: options.search, $options: 'i' } },
      ]
    }

    if (options?.category && options.category !== 'all') {
      conditions.category = options.category
    }

    if (options?.status) {
      switch (options.status) {
        case 'published':
          conditions.isPublished = true
          break
        case 'draft':
          conditions.isPublished = false
          break
        case 'low-stock':
          conditions.countInStock = { $lte: 10, $gt: 0 }
          break
        case 'out-of-stock':
          conditions.countInStock = 0
          break
      }
    }

    const [products, total] = await Promise.all([
      Product.find(conditions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(conditions)
    ])

    // Get all unique categories
    const categories = await Product.distinct('category')

    return {
      success: true,
      data: serialize(products) as IProduct[],
      total,
      totalPages: Math.ceil(total / limit),
      categories,
    }
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return { success: false, error: 'Failed to fetch products' }
  }
}

export async function getAdminProductById(productId: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectToDB()

    const product = await Product.findById(productId).lean()

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    // Get all categories for the dropdown
    const categories = await Product.distinct('category')
    const tags = await Product.distinct('tags')

    return {
      success: true,
      data: serialize(product) as IProduct,
      categories,
      tags
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Failed to fetch product' }
  }
}

export async function updateProductStock(productId: string, newStock: number) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectToDB()

    const product = await Product.findByIdAndUpdate(
      productId,
      { countInStock: newStock },
      { new: true }
    )

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    revalidatePath('/admin/products')
    revalidatePath('/admin/products/inventory')
    return { success: true, data: serialize(product) }
  } catch (error) {
    console.error('Error updating product stock:', error)
    return { success: false, error: 'Failed to update stock' }
  }
}

export async function updateProduct(productId: string, data: Partial<IProduct>) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectToDB()

    const product = await Product.findByIdAndUpdate(
      productId,
      { ...data, updatedAt: new Date() },
      { new: true }
    )

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    revalidatePath('/admin/products')
    revalidatePath(`/shop/products/${product.slug}`)
    return { success: true, data: serialize(product) }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectToDB()

    const product = await Product.findByIdAndDelete(productId)

    if (!product) {
      return { success: false, error: 'Product not found' }
    }

    revalidatePath('/admin/products')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Failed to delete product' }
  }
}

export async function createProduct(data: Partial<IProduct>) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    await connectToDB()

    const product = await Product.create(data)

    revalidatePath('/admin/products')
    return { success: true, data: serialize(product) }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

// =============================================================================
// ORDERS MANAGEMENT
// =============================================================================

export async function getAdminOrders(options?: {
  search?: string
  status?: string
  paymentStatus?: string
  limit?: number
  page?: number
}) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const limit = options?.limit || 20
    const page = options?.page || 1
    const offset = (page - 1) * limit

    let query = supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (options?.status && options.status !== 'all') {
      query = query.eq('status', options.status)
    }

    if (options?.paymentStatus && options.paymentStatus !== 'all') {
      query = query.eq('payment_status', options.paymentStatus)
    }

    if (options?.search) {
      query = query.or(`order_number.ilike.%${options.search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Get user profiles for orders with user_id
    const userIds = [...new Set(data?.filter(o => o.user_id).map(o => o.user_id) || [])]
    let profilesMap: Record<string, any> = {}
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds)
      
      profiles?.forEach(p => {
        profilesMap[p.id] = p
      })
    }

    // Get auth users for email addresses
    let usersMap: Record<string, any> = {}
    if (userIds.length > 0) {
      const { data: authData } = await supabase.auth.admin.listUsers()
      authData?.users?.forEach(u => {
        if (userIds.includes(u.id)) {
          usersMap[u.id] = u
        }
      })
    }

    // Format orders for display
    const formattedOrders = data?.map(order => {
      const profile = order.user_id ? profilesMap[order.user_id] : null
      const authUser = order.user_id ? usersMap[order.user_id] : null
      
      // Priority: profile name > shipping address name > Guest
      const customerName = profile?.full_name || 
                          (order.shipping_address as any)?.full_name || 
                          'Guest'
      
      // Priority: auth user email > guest_email > N/A
      const customerEmail = authUser?.email || order.guest_email || 'N/A'
      
      // Priority: profile phone > shipping address phone > N/A  
      const customerPhone = profile?.phone ||
                           (order.shipping_address as any)?.phone || 
                           'N/A'

      return {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        total: (order.total_cents || 0) / 100,
        subtotal: (order.subtotal_cents || 0) / 100,
        shipping: (order.shipping_cents || 0) / 100,
        tax: (order.tax_cents || 0) / 100,
        discount: (order.discount_cents || 0) / 100,
        currency: order.currency || 'AED',
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: order.shipping_address,
        trackingNumber: order.tracking_number,
        estimatedDelivery: order.estimated_delivery,
        customerNotes: order.customer_notes,
        internalNotes: order.internal_notes,
        itemCount: order.order_items?.length || 0,
        items: order.order_items?.map((item: any) => ({
          id: item.id,
          productId: item.mongo_product_id,
          quantity: item.quantity,
          price: (item.price_cents || 0) / 100,
          snapshot: item.product_snapshot,
        })),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }
    }) || []

    // Get order stats
    const { data: allOrders } = await supabase.from('orders').select('status')
    const stats = {
      total: allOrders?.length || 0,
      pending: allOrders?.filter(o => o.status === 'pending').length || 0,
      processing: allOrders?.filter(o => o.status === 'processing').length || 0,
      shipped: allOrders?.filter(o => o.status === 'shipped').length || 0,
      delivered: allOrders?.filter(o => o.status === 'delivered').length || 0,
      cancelled: allOrders?.filter(o => o.status === 'cancelled').length || 0,
    }

    return {
      success: true,
      data: formattedOrders,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      stats,
    }
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return { success: false, error: 'Failed to fetch orders' }
  }
}

export async function getAdminOrderById(orderId: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (error) throw error

    // Get user profile if user_id exists
    let customerProfile = null
    let customerEmail = order.guest_email || null
    
    if (order.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single()
      customerProfile = profile
      
      // Get email from auth user
      const { data: authData } = await supabase.auth.admin.getUserById(order.user_id)
      if (authData?.user?.email) {
        customerEmail = authData.user.email
      }
    }

    // Compute display values
    const customerName = customerProfile?.full_name || 
                        (order.shipping_address as any)?.full_name || 
                        'Guest'
    const customerPhone = customerProfile?.phone || 
                         (order.shipping_address as any)?.phone || 
                         null

    return {
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        status: order.status,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        total: (order.total_cents || 0) / 100,
        subtotal: (order.subtotal_cents || 0) / 100,
        shipping: (order.shipping_cents || 0) / 100,
        tax: (order.tax_cents || 0) / 100,
        discount: (order.discount_cents || 0) / 100,
        currency: order.currency || 'AED',
        shippingAddress: order.shipping_address,
        billingAddress: order.billing_address,
        trackingNumber: order.tracking_number,
        estimatedDelivery: order.estimated_delivery,
        deliveredAt: order.delivered_at,
        customerNotes: order.customer_notes,
        internalNotes: order.internal_notes,
        guestEmail: order.guest_email,
        customerName,
        customerEmail,
        customerPhone,
        isRegisteredUser: !!order.user_id,
        items: order.order_items?.map((item: any) => ({
          id: item.id,
          productId: item.mongo_product_id,
          quantity: item.quantity,
          price: (item.price_cents || 0) / 100,
          snapshot: item.product_snapshot,
        })),
        customerProfile,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      }
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { success: false, error: 'Failed to fetch order' }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const updateData: any = { status }
    
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

export async function updateOrderTracking(orderId: string, trackingNumber: string, estimatedDelivery?: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const updateData: any = { tracking_number: trackingNumber }
    if (estimatedDelivery) {
      updateData.estimated_delivery = estimatedDelivery
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating tracking:', error)
    return { success: false, error: 'Failed to update tracking' }
  }
}

export async function updateOrderNotes(orderId: string, internalNotes: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('orders')
      .update({ internal_notes: internalNotes })
      .eq('id', orderId)

    if (error) throw error

    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating notes:', error)
    return { success: false, error: 'Failed to update notes' }
  }
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('orders')
      .update({ payment_status: paymentStatus })
      .eq('id', orderId)

    if (error) throw error

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating payment status:', error)
    return { success: false, error: 'Failed to update payment status' }
  }
}

// =============================================================================
// CUSTOMERS MANAGEMENT
// =============================================================================

export async function getAdminCustomers(options?: {
  search?: string
  limit?: number
  page?: number
}) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    const limit = options?.limit || 20
    const page = options?.page || 1
    const offset = (page - 1) * limit

    // Get profiles with order stats
    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: profiles, error, count } = await query

    if (error) throw error

    // Get all user IDs to fetch emails
    const userIds = profiles?.map(p => p.id) || []
    
    // Get emails from auth.users
    let emailsMap: Record<string, string> = {}
    if (userIds.length > 0) {
      const { data: authData } = await supabase.auth.admin.listUsers()
      if (authData?.users) {
        authData.users.forEach(user => {
          if (user.email) {
            emailsMap[user.id] = user.email
          }
        })
      }
    }

    // Get order stats for each customer
    const customersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: orders } = await supabase
          .from('orders')
          .select('total_cents, status, created_at')
          .eq('user_id', profile.id)

        const totalOrders = orders?.length || 0
        const totalSpent = (orders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0) / 100
        const lastOrder = orders?.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        return {
          id: profile.id,
          fullName: profile.full_name || 'Unknown',
          email: emailsMap[profile.id],
          phone: profile.phone,
          avatarUrl: profile.avatar_url,
          totalOrders,
          totalSpent,
          lastOrderDate: lastOrder?.created_at,
          createdAt: profile.created_at,
        }
      })
    )

    return {
      success: true,
      data: customersWithStats,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { success: false, error: 'Failed to fetch customers' }
  }
}

export async function getAdminCustomerById(customerId: string) {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', customerId)
      .single()

    if (profileError) throw profileError

    // Get email from auth
    let email: string | undefined
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(customerId)
      email = authData?.user?.email
    } catch (e) {
      console.error('Error fetching user email:', e)
    }

    // Get addresses
    const { data: addresses } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', customerId)

    // Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id, order_number, total_cents, status, created_at')
      .eq('user_id', customerId)
      .order('created_at', { ascending: false })

    const totalSpent = (orders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) || 0) / 100

    return {
      success: true,
      data: {
        id: profile.id,
        fullName: profile.full_name,
        email,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
        addresses: addresses || [],
        orders: orders?.map(o => ({
          id: o.id,
          orderNumber: o.order_number,
          total: (o.total_cents || 0) / 100,
          status: o.status,
          createdAt: o.created_at,
        })) || [],
        totalOrders: orders?.length || 0,
        totalSpent,
      }
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
    return { success: false, error: 'Failed to fetch customer' }
  }
}

// =============================================================================
// ANALYTICS
// =============================================================================

export async function getAdminAnalytics(period: 'week' | 'month' | 'year' = 'month') {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = createAdminClient()
    await connectToDB()

    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // Get orders in period
    const { data: orders } = await supabase
      .from('orders')
      .select('total_cents, status, created_at, order_items(product_snapshot, quantity)')
      .gte('created_at', startDate.toISOString())

    // Calculate revenue over time (group by day)
    const revenueByDay: Record<string, number> = {}
    const ordersByDay: Record<string, number> = {}

    orders?.forEach(order => {
      const day = new Date(order.created_at).toISOString().split('T')[0]
      revenueByDay[day] = (revenueByDay[day] || 0) + (order.total_cents || 0) / 100
      ordersByDay[day] = (ordersByDay[day] || 0) + 1
    })

    // Calculate sales by category
    const salesByCategory: Record<string, number> = {}
    orders?.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const category = item.product_snapshot?.category || 'Uncategorized'
        const revenue = (item.product_snapshot?.price || 0) * (item.quantity || 1)
        salesByCategory[category] = (salesByCategory[category] || 0) + revenue
      })
    })

    // Top selling products
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {}
    orders?.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const name = item.product_snapshot?.name || 'Unknown'
        if (!productSales[name]) {
          productSales[name] = { name, quantity: 0, revenue: 0 }
        }
        productSales[name].quantity += item.quantity || 1
        productSales[name].revenue += (item.product_snapshot?.price || 0) * (item.quantity || 1)
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Total metrics
    const totalRevenue = (orders?.reduce((sum, o) => sum + (o.total_cents || 0), 0) ?? 0) / 100
    const totalOrders = orders?.length || 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      success: true,
      data: {
        period,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
        ordersByDay: Object.entries(ordersByDay).map(([date, count]) => ({ date, count })),
        salesByCategory: Object.entries(salesByCategory).map(([category, revenue]) => ({ category, revenue })),
        topProducts,
      }
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return { success: false, error: 'Failed to fetch analytics' }
  }
}
