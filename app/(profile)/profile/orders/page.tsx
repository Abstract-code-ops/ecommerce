'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { 
  Package, Truck, CheckCircle2, Clock, ChevronRight, 
  Search, Filter, Calendar, Eye, RotateCcw, Download,
  MapPin, X, AlertCircle, Loader2
} from 'lucide-react'
import { getOrders, cancelOrder } from '@/lib/actions/order.actions'
import { FormattedOrder, ShippingAddressSnapshot } from '@/types/supabase'
import { toast } from 'react-toastify'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

type OrderItem = {
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

type Order = FormattedOrder

const statusConfig: Record<OrderStatus, { 
  label: string
  color: string
  bgColor: string
  icon: typeof Package 
}> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock
  },
  processing: {
    label: 'Processing',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: Package
  },
  shipped: {
    label: 'Shipped',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: Truck
  },
  delivered: {
    label: 'Delivered',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: CheckCircle2
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: AlertCircle
  }
}

// Helper to format address object to string
const formatAddress = (address: ShippingAddressSnapshot): string => {
  const parts = [address.street, address.city, address.emirate, address.country].filter(Boolean)
  return parts.join(', ')
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)

  // Fetch orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const result = await getOrders()
        if (result.success && result.data) {
          setOrders(result.data)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Handle cancel order
  const handleCancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderNumber}? This action cannot be undone.`)) {
      return
    }
    
    setCancellingOrderId(orderId)
    try {
      const result = await cancelOrder(orderId)
      if (result.success) {
        // Update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' as OrderStatus } : order
        ))
        toast.success('Order cancelled successfully')
      } else {
        toast.error(result.error || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Something went wrong')
    } finally {
      setCancellingOrderId(null)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage your past orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: Package, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { label: 'In Transit', value: orders.filter(o => o.status === 'shipped').length, icon: Truck, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle2, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
          { label: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, icon: AlertCircle, color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as OrderStatus | 'all')}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-dashed border-border rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No orders found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : "You haven't placed any orders yet"}
          </p>
          <Button asChild>
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, index) => {
              const statusInfo = statusConfig[order.status]
              const isExpanded = expandedOrder === order.id
              const StatusIcon = statusInfo.icon

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border/50 rounded-2xl overflow-hidden"
                >
                  {/* Order Header */}
                  <div 
                    className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Preview Images */}
                        <div className="relative w-16 h-16 shrink-0">
                          <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden border-2 border-background absolute top-0 left-0">
                            <Image
                              src={order.items[0]?.image || '/images/placeholder.jpg'}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          {order.items.length > 1 && (
                            <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden border-2 border-background absolute bottom-0 right-0 flex items-center justify-center text-xs font-medium">
                              +{order.items.length - 1}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{order.orderNumber}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatDate(order.date)}
                          </p>
                          {order.trackingNumber && order.status === 'shipped' && (
                            <p className="text-xs text-primary mt-1">
                              Tracking: {order.trackingNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(order.total)}</p>
                          {order.estimatedDelivery && order.status === 'shipped' && (
                            <p className="text-xs text-muted-foreground">
                              Est. {formatDate(order.estimatedDelivery)}
                            </p>
                          )}
                        </div>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <Separator className="bg-border/50" />
                        
                        <div className="p-5 space-y-5">
                          {/* Order Progress */}
                          {order.status !== 'cancelled' && (
                            <div className="relative">
                              <div className="flex items-center justify-between">
                                {['pending', 'processing', 'shipped', 'delivered'].map((step, i) => {
                                  const stepIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status)
                                  const isComplete = i <= stepIndex
                                  const isCurrent = i === stepIndex
                                  const StepIcon = statusConfig[step as OrderStatus].icon

                                  return (
                                    <div key={step} className="flex flex-col items-center z-10">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        isComplete 
                                          ? 'bg-primary text-primary-foreground' 
                                          : 'bg-muted text-muted-foreground'
                                      } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                                        <StepIcon className="w-4 h-4" />
                                      </div>
                                      <span className={`text-[10px] mt-1 ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {step.charAt(0).toUpperCase() + step.slice(1)}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                              {/* Progress Line */}
                              <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-0">
                                <div 
                                  className="h-full bg-primary transition-all" 
                                  style={{ 
                                    width: `${(['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) / 3) * 100}%` 
                                  }} 
                                />
                              </div>
                            </div>
                          )}

                          {/* Items */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium">Order Items</h4>
                            {order.items.map((item) => (
                              <Link
                                key={item.id}
                                href={`/shop/products/${item.slug}`}
                                className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                              >
                                <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden relative shrink-0">
                                  <Image
                                    src={item.image || '/images/placeholder.jpg'}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <p className="font-medium text-sm">
                                  {formatCurrency(item.totalPrice)}
                                </p>
                              </Link>
                            ))}
                          </div>

                          {/* Summary */}
                          <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping</span>
                              <span className={order.shipping === 0 ? 'text-emerald-600' : ''}>
                                {order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tax</span>
                              <span>{formatCurrency(order.tax)}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="text-emerald-600">-{formatCurrency(order.discount)}</span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between font-semibold">
                              <span>Total</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="flex items-start gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium">Delivery Address</p>
                              <p className="text-muted-foreground">{order.address.fullName}</p>
                              <p className="text-muted-foreground">{formatAddress(order.address)}</p>
                              {order.address.phone && (
                                <p className="text-muted-foreground text-xs mt-1">{order.address.phone}</p>
                              )}
                            </div>
                          </div>

                          {/* Cancellation Notice */}
                          {order.status === 'pending' && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <p>Orders can only be cancelled while pending. Once processing starts, the order cannot be cancelled.</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {order.status === 'pending' && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={cancellingOrderId === order.id}
                                onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                              >
                                {cancellingOrderId === order.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelling...
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel Order
                                  </>
                                )}
                              </Button>
                            )}
                            {order.status === 'shipped' && order.trackingNumber && (
                              <Button variant="outline" size="sm">
                                <Truck className="w-4 h-4 mr-2" />
                                Track Package
                              </Button>
                            )}
                            {order.status === 'delivered' && (
                              <Button variant="outline" size="sm">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reorder
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Invoice
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
