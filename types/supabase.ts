// =============================================================================
// SUPABASE DATABASE TYPES
// Auto-generated types for the Supabase tables
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =============================================================================
// DATABASE SCHEMA TYPES
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          type: 'home' | 'work' | 'other'
          full_name: string
          phone: string | null
          street: string
          city: string
          emirate: string
          country: string
          lat: number | null
          lng: number | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          type?: 'home' | 'work' | 'other'
          full_name: string
          phone?: string | null
          street: string
          city: string
          emirate: string
          country?: string
          lat?: number | null
          lng?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          type?: 'home' | 'work' | 'other'
          full_name?: string
          phone?: string | null
          street?: string
          city?: string
          emirate?: string
          country?: string
          lat?: number | null
          lng?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          card_type: 'visa' | 'mastercard' | 'amex' | 'other'
          last_four: string
          cardholder_name: string
          expiry_month: number
          expiry_year: number
          is_default: boolean
          stripe_payment_method_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_type?: 'visa' | 'mastercard' | 'amex' | 'other'
          last_four: string
          cardholder_name: string
          expiry_month: number
          expiry_year: number
          is_default?: boolean
          stripe_payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_type?: 'visa' | 'mastercard' | 'amex' | 'other'
          last_four?: string
          cardholder_name?: string
          expiry_month?: number
          expiry_year?: number
          is_default?: boolean
          stripe_payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal_cents: number
          shipping_cents: number
          tax_cents: number
          discount_cents: number
          total_cents: number
          currency: string
          shipping_address: ShippingAddressSnapshot
          billing_address: ShippingAddressSnapshot | null
          payment_method: string | null
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          tracking_number: string | null
          estimated_delivery: string | null
          delivered_at: string | null
          customer_notes: string | null
          internal_notes: string | null
          guest_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal_cents?: number
          shipping_cents?: number
          tax_cents?: number
          discount_cents?: number
          total_cents?: number
          currency?: string
          shipping_address: ShippingAddressSnapshot
          billing_address?: ShippingAddressSnapshot | null
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          tracking_number?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          customer_notes?: string | null
          internal_notes?: string | null
          guest_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal_cents?: number
          shipping_cents?: number
          tax_cents?: number
          discount_cents?: number
          total_cents?: number
          currency?: string
          shipping_address?: ShippingAddressSnapshot
          billing_address?: ShippingAddressSnapshot | null
          payment_method?: string | null
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          tracking_number?: string | null
          estimated_delivery?: string | null
          delivered_at?: string | null
          customer_notes?: string | null
          internal_notes?: string | null
          guest_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          mongo_product_id: string | null
          product_snapshot: ProductSnapshot
          quantity: number
          unit_price_cents: number
          total_price_cents: number
          size: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          mongo_product_id?: string | null
          product_snapshot: ProductSnapshot
          quantity?: number
          unit_price_cents: number
          total_price_cents: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          mongo_product_id?: string | null
          product_snapshot?: ProductSnapshot
          quantity?: number
          unit_price_cents?: number
          total_price_cents?: number
          size?: string | null
          color?: string | null
          created_at?: string
        }
      }
    }
  }
}

// =============================================================================
// SNAPSHOT TYPES - For denormalized data stored at purchase time
// =============================================================================

/**
 * Product snapshot stored in order_items
 * Contains all product info needed to display the order without MongoDB lookup
 */
export interface ProductSnapshot {
  name: string
  slug: string
  image: string           // Primary image URL
  images?: string[]       // All images at purchase time
  category: string
  description?: string
  price: number          // Price at purchase time (in AED)
  listPrice?: number     // Original price if on sale
}

/**
 * Address snapshot stored in orders
 * Preserves the exact address at time of order
 */
export interface ShippingAddressSnapshot {
  fullName: string
  phone?: string
  street: string
  city: string
  emirate: string
  country: string
  lat?: number
  lng?: number
}

// =============================================================================
// CONVENIENCE TYPE ALIASES
// =============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Address = Database['public']['Tables']['addresses']['Row']
export type AddressInsert = Database['public']['Tables']['addresses']['Insert']
export type AddressUpdate = Database['public']['Tables']['addresses']['Update']

export type Wallet = Database['public']['Tables']['wallets']['Row']
export type WalletInsert = Database['public']['Tables']['wallets']['Insert']
export type WalletUpdate = Database['public']['Tables']['wallets']['Update']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type OrderItemRow = Database['public']['Tables']['order_items']['Row']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']

// =============================================================================
// EXTENDED TYPES FOR API RESPONSES
// =============================================================================

/**
 * Order with items included (from join query)
 */
export interface OrderWithItems extends Order {
  order_items: OrderItemRow[]
}

/**
 * Formatted order for display (prices in AED, not cents)
 */
export interface FormattedOrder {
  id: string
  orderNumber: string
  date: string
  status: Order['status']
  items: FormattedOrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  currency: string
  address: ShippingAddressSnapshot
  trackingNumber?: string
  estimatedDelivery?: string
}

export interface FormattedOrderItem {
  id: string
  name: string
  image: string
  quantity: number
  price: number
  totalPrice: number
  slug: string
  size?: string
  color?: string
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convert cents to currency (e.g., 1000 cents = 10.00 AED)
 */
export function centsToCurrency(cents: number): number {
  return cents / 100
}

/**
 * Convert currency to cents (e.g., 10.00 AED = 1000 cents)
 */
export function currencyToCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Format an OrderWithItems to a display-friendly FormattedOrder
 */
export function formatOrderForDisplay(order: OrderWithItems): FormattedOrder {
  return {
    id: order.id,
    orderNumber: order.order_number,
    date: order.created_at,
    status: order.status,
    items: order.order_items.map(item => ({
      id: item.id,
      name: item.product_snapshot.name,
      image: item.product_snapshot.image,
      quantity: item.quantity,
      price: centsToCurrency(item.unit_price_cents),
      totalPrice: centsToCurrency(item.total_price_cents),
      slug: item.product_snapshot.slug,
      size: item.size ?? undefined,
      color: item.color ?? undefined,
    })),
    subtotal: centsToCurrency(order.subtotal_cents),
    shipping: centsToCurrency(order.shipping_cents),
    tax: centsToCurrency(order.tax_cents),
    discount: centsToCurrency(order.discount_cents),
    total: centsToCurrency(order.total_cents),
    currency: order.currency,
    address: order.shipping_address,
    trackingNumber: order.tracking_number ?? undefined,
    estimatedDelivery: order.estimated_delivery ?? undefined,
  }
}
