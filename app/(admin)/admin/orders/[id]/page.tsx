'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  FileText,
  Printer,
  MessageSquare,
  Edit2,
  Save,
  Copy,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Mock order data - In real app, fetch from API based on ID
const orderData = {
  id: 'ORD-001',
  customer: {
    name: 'Ahmed Hassan',
    email: 'ahmed@email.com',
    phone: '+971 50 123 4567',
    totalOrders: 12,
    totalSpent: 'AED 5,420.00'
  },
  status: 'processing',
  paymentStatus: 'paid',
  paymentMethod: 'Credit Card (Visa ****4242)',
  date: '2024-01-15 14:32',
  shippingAddress: {
    street: 'Dubai Marina, Tower A, Apt 1204',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'UAE'
  },
  trackingNumber: '',
  estimatedDelivery: '2024-01-18',
  items: [
    {
      id: '1',
      name: 'Premium Paper Bags (50pc)',
      sku: 'PPB-50',
      price: 299,
      quantity: 2,
      total: 598,
      image: '/images/products/paper-bag-1.jpg'
    },
    {
      id: '2',
      name: 'Kraft Shopping Bags (100pc)',
      sku: 'KSB-100',
      price: 450,
      quantity: 1,
      total: 450,
      image: '/images/products/kraft-bag-1.jpg'
    }
  ],
  subtotal: 1048,
  shipping: 50,
  tax: 52.40,
  discount: 0,
  total: 1150.40,
  notes: {
    customer: 'Please deliver before 5 PM',
    internal: 'Regular customer - priority shipping'
  },
  timeline: [
    { status: 'Order Placed', date: '2024-01-15 14:32', description: 'Order confirmed' },
    { status: 'Payment Confirmed', date: '2024-01-15 14:33', description: 'Payment received via Credit Card' },
    { status: 'Processing', date: '2024-01-15 15:00', description: 'Order is being prepared' },
  ]
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'processing':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'shipped':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'delivered':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState(orderData)
  const [isEditing, setIsEditing] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber)
  const [internalNote, setInternalNote] = useState(order.notes.internal)
  const [newStatus, setNewStatus] = useState(order.status)

  const handleStatusUpdate = () => {
    // TODO: Implement API call to update status
    setOrder(prev => ({ ...prev, status: newStatus }))
    console.log('Updating status to:', newStatus)
  }

  const handleSaveTracking = () => {
    // TODO: Implement API call to update tracking
    setOrder(prev => ({ ...prev, trackingNumber }))
    setIsEditing(false)
    console.log('Saved tracking number:', trackingNumber)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Order {orderId}</h1>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                getStatusStyles(order.status)
              )}>
                {order.status}
              </span>
            </div>
            <p className="text-muted-foreground">
              Placed on {order.date}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button variant="outline" size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Customer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                {order.items.length} item{order.items.length > 1 ? 's' : ''} in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                    <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">AED {item.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">@ AED {item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>AED {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>AED {order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span>AED {order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-AED {order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>AED {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Delivery details and tracking</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Shipping Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{order.shippingAddress.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.city}, {order.shippingAddress.emirate}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Estimated Delivery</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Tracking Number</label>
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                    <Button onClick={handleSaveTracking}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    {order.trackingNumber ? (
                      <>
                        <span className="font-medium">{order.trackingNumber}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not yet shipped</span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
              <CardDescription>Track order progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {order.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    <div className="relative">
                      <div className={cn(
                        "h-3 w-3 rounded-full mt-1.5",
                        index === order.timeline.length - 1
                          ? "bg-primary"
                          : "bg-green-500"
                      )} />
                      {index < order.timeline.length - 1 && (
                        <div className="absolute top-4 left-1.5 w-0.5 h-full -ml-px bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.notes.customer && (
                <div>
                  <label className="text-sm text-muted-foreground">Customer Note</label>
                  <p className="mt-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    {order.notes.customer}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-muted-foreground">Internal Note</label>
                <textarea
                  className="w-full mt-1 min-h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Add internal notes..."
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                />
                <Button size="sm" className="mt-2">
                  Save Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleStatusUpdate} disabled={newStatus === order.status}>
                Update Status
              </Button>
              
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Button variant="destructive" className="w-full">
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Order
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  {order.customer.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.totalOrders} orders</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-lg font-semibold">{order.customer.totalSpent}</p>
              </div>

              <Button variant="outline" className="w-full">
                View Customer Profile
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={cn(
                  "font-medium capitalize",
                  order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                )}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentStatus === 'paid' && (
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                  Process Refund
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Truck className="mr-2 h-4 w-4" />
                Create Shipping Label
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
