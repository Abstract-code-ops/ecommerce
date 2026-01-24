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
  MapPin, X, AlertCircle, Loader2, Camera, Upload
} from 'lucide-react'
import { getOrders, cancelOrder } from '@/lib/actions/order.actions'
import { createReturn, getReturns } from '@/lib/actions/return.actions'
import { FormattedOrder, ShippingAddressSnapshot, ReturnReason, RETURN_REASON_LABELS } from '@/types/supabase'
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
  
  // Return request state
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null)
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<{
    id: string
    name: string
    image: string
    quantity: number
    price: number
  } | null>(null)
  const [returnReason, setReturnReason] = useState<ReturnReason>('damaged')
  const [returnDetails, setReturnDetails] = useState('')
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
  
  // Success modal state (shown after return request is submitted)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successOrderNumber, setSuccessOrderNumber] = useState<string>('')
  
  // Track items that already have return requests (Set of order_item_ids)
  const [itemsWithReturns, setItemsWithReturns] = useState<Set<string>>(new Set())

  // Fetch orders and existing returns from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch orders and returns in parallel
        const [ordersResult, returnsResult] = await Promise.all([
          getOrders(),
          getReturns()
        ])
        
        if (ordersResult.success && ordersResult.data) {
          setOrders(ordersResult.data)
        }
        
        // Build set of order_item_ids that have active returns (not rejected)
        if (returnsResult.success && returnsResult.data) {
          const itemIds = new Set(
            returnsResult.data
              .filter(r => r.status !== 'rejected')
              .map(r => r.orderItemId)
          )
          setItemsWithReturns(itemIds)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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

  // Handle return request
  const handleReturnRequest = async () => {
    if (!selectedOrderForReturn || !selectedItemForReturn) return
    
    setIsSubmittingReturn(true)
    try {
      const result = await createReturn({
        orderId: selectedOrderForReturn.id,
        orderItemId: selectedItemForReturn.id,
        reason: returnReason,
        reasonDetails: returnDetails || undefined,
        quantity: selectedItemForReturn.quantity,
      })
      
      if (result.success) {
        // Store order number and item id for success modal
        const orderNum = selectedOrderForReturn.orderNumber
        const itemId = selectedItemForReturn.id
        
        // Add item to the set of items with returns
        setItemsWithReturns(prev => new Set([...prev, itemId]))
        
        // Reset return modal state
        setShowReturnModal(false)
        setSelectedOrderForReturn(null)
        setSelectedItemForReturn(null)
        setReturnReason('damaged')
        setReturnDetails('')
        
        // Show success modal with contact info
        setSuccessOrderNumber(orderNum)
        setShowSuccessModal(true)
      } else {
        toast.error(result.error || 'Failed to submit return request')
      }
    } catch (error) {
      console.error('Error submitting return:', error)
      toast.error('Something went wrong')
    } finally {
      setIsSubmittingReturn(false)
    }
  }

  // Open return modal for an item
  const openReturnModal = (order: Order, item: { id: string; name: string; image: string; quantity: number; price: number }) => {
    setSelectedOrderForReturn(order)
    setSelectedItemForReturn(item)
    setShowReturnModal(true)
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
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                              >
                                <Link
                                  href={`/shop/products/${item.slug}`}
                                  className="w-14 h-14 rounded-lg bg-muted overflow-hidden relative shrink-0"
                                >
                                  <Image
                                    src={item.image || '/images/placeholder.jpg'}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/shop/products/${item.slug}`}>
                                    <p className="font-medium text-sm truncate hover:text-primary">{item.name}</p>
                                  </Link>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {item.quantity} × {formatCurrency(item.price)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="font-medium text-sm">
                                    {formatCurrency(item.totalPrice)}
                                  </p>
                                  {order.status === 'delivered' && (
                                    itemsWithReturns.has(item.id) ? (
                                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                        Return Requested
                                      </span>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-8 px-2"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openReturnModal(order, item)
                                        }}
                                      >
                                        <RotateCcw className="w-3 h-3 mr-1" />
                                        Return
                                      </Button>
                                    )
                                  )}
                                </div>
                              </div>
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
                              // Only show Request Return button if at least one item doesn't have a return
                              order.items.some(item => !itemsWithReturns.has(item.id)) && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Find the first item without a return request
                                    const itemWithoutReturn = order.items.find(item => !itemsWithReturns.has(item.id))
                                    if (itemWithoutReturn) {
                                      openReturnModal(order, itemWithoutReturn)
                                    } else {
                                      // Expand to show items with return buttons
                                      setExpandedOrder(order.id)
                                    }
                                  }}
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Request Return
                                </Button>
                              )
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

      {/* Return Request Modal */}
      {showReturnModal && selectedOrderForReturn && selectedItemForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowReturnModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-background rounded-2xl shadow-lg w-full max-w-md m-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Request Return</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowReturnModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={selectedItemForReturn.image || '/images/placeholder.jpg'}
                    alt={selectedItemForReturn.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="font-medium">{selectedItemForReturn.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty: {selectedItemForReturn.quantity} × {formatCurrency(selectedItemForReturn.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Order: {selectedOrderForReturn.orderNumber}
                  </p>
                </div>
              </div>

              {/* Return Reason */}
              <div>
                <label className="text-sm font-medium block mb-2">Reason for return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value as ReturnReason)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {(Object.entries(RETURN_REASON_LABELS) as [ReturnReason, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Additional Details */}
              <div>
                <label className="text-sm font-medium block mb-2">Additional details (optional)</label>
                <textarea
                  value={returnDetails}
                  onChange={(e) => setReturnDetails(e.target.value)}
                  placeholder="Please describe the issue in more detail..."
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* Info Notice */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium">Return Policy</p>
                  <p className="mt-1">Returns are accepted within 14 days of delivery. Items must be in original condition with tags attached.</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleReturnRequest}
                disabled={isSubmittingReturn}
              >
                {isSubmittingReturn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Submit Return Request
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Return Success Modal - Contact Info */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowSuccessModal(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-background rounded-2xl shadow-lg w-full max-w-md m-4"
          >
            <div className="p-6 space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Return Request Submitted!</h2>
                <p className="text-muted-foreground text-sm">
                  Your return request has been received. Our team will review it and get back to you within 1-2 business days.
                </p>
              </div>

              {/* Order Reference */}
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Order Reference</p>
                <p className="font-mono font-semibold text-lg">{successOrderNumber}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Use this number to check your refund status
                </p>
              </div>

              {/* Contact Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-3">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Need Help?</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  For any questions about your return or refund status, please contact us:
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-blue-700 dark:text-blue-300">Email:</span>
                  <a 
                    href="mailto:support@gmqg.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    support@gmqg.com
                  </a>
                </div>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                  Please include your order number ({successOrderNumber}) in your email for faster assistance.
                </p>
              </div>

              {/* View Returns Link */}
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/profile/returns">View My Returns</Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
