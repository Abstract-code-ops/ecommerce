'use client'

import { useState } from 'react'
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
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  MessageSquare,
  Printer
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Mock orders data
const orders = [
  {
    id: 'ORD-001',
    customer: 'Ahmed Hassan',
    email: 'ahmed@email.com',
    phone: '+971 50 123 4567',
    items: 3,
    total: 'AED 899.00',
    status: 'pending',
    paymentStatus: 'paid',
    date: '2024-01-15 14:32',
    shippingAddress: 'Dubai Marina, Tower A, Apt 1204',
  },
  {
    id: 'ORD-002',
    customer: 'Sara Al-Rashid',
    email: 'sara@email.com',
    phone: '+971 55 987 6543',
    items: 2,
    total: 'AED 450.00',
    status: 'processing',
    paymentStatus: 'paid',
    date: '2024-01-15 12:15',
    shippingAddress: 'Abu Dhabi, Al Reem Island, Sky Tower',
  },
  {
    id: 'ORD-003',
    customer: 'Mohammed Ali',
    email: 'mohammed@email.com',
    phone: '+971 56 456 7890',
    items: 5,
    total: 'AED 1,275.00',
    status: 'shipped',
    paymentStatus: 'paid',
    date: '2024-01-14 16:45',
    shippingAddress: 'Sharjah, Al Majaz, Building 12',
    trackingNumber: 'TRK123456789',
  },
  {
    id: 'ORD-004',
    customer: 'Fatima Khan',
    email: 'fatima@email.com',
    phone: '+971 52 111 2222',
    items: 1,
    total: 'AED 175.00',
    status: 'delivered',
    paymentStatus: 'paid',
    date: '2024-01-13 10:20',
    shippingAddress: 'Dubai, JBR, Rimal 3',
    trackingNumber: 'TRK987654321',
  },
  {
    id: 'ORD-005',
    customer: 'Omar Youssef',
    email: 'omar@email.com',
    phone: '+971 58 333 4444',
    items: 4,
    total: 'AED 560.00',
    status: 'cancelled',
    paymentStatus: 'refunded',
    date: '2024-01-12 09:00',
    shippingAddress: 'Ajman, Al Nuaimia',
    cancelReason: 'Customer requested cancellation',
  },
]

const statuses = ['All Status', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']
const paymentStatuses = ['All Payment', 'pending', 'paid', 'failed', 'refunded']

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

const getPaymentStatusStyles = (status: string) => {
  switch (status) {
    case 'paid':
      return 'text-green-600 dark:text-green-400'
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'failed':
      return 'text-red-600 dark:text-red-400'
    case 'refunded':
      return 'text-purple-600 dark:text-purple-400'
    default:
      return 'text-gray-600'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return Clock
    case 'processing':
      return Package
    case 'shipped':
      return Truck
    case 'delivered':
      return CheckCircle2
    case 'cancelled':
      return XCircle
    default:
      return Clock
  }
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedPayment, setSelectedPayment] = useState('All Payment')
  const [dateRange, setDateRange] = useState('all')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'All Status' || order.status === selectedStatus
    const matchesPayment = selectedPayment === 'All Payment' || order.paymentStatus === selectedPayment
    return matchesSearch && matchesStatus && matchesPayment
  })

  // Stats
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const processingOrders = orders.filter(o => o.status === 'processing').length
  const shippedOrders = orders.filter(o => o.status === 'shipped').length
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{processingOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shipped</p>
                <p className="text-2xl font-bold">{shippedOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Truck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{deliveredOrders}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All Status' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPayment} onValueChange={setSelectedPayment}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All Payment' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="font-medium text-primary hover:underline">
                          {order.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{order.date}</td>
                      <td className="px-4 py-3 text-center">{order.items}</td>
                      <td className="px-4 py-3 font-medium">{order.total}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-sm font-medium capitalize", getPaymentStatusStyles(order.paymentStatus))}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                          getStatusStyles(order.status)
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Contact Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {order.status === 'pending' && (
                              <DropdownMenuItem>
                                <Package className="mr-2 h-4 w-4" />
                                Mark as Processing
                              </DropdownMenuItem>
                            )}
                            {order.status === 'processing' && (
                              <DropdownMenuItem>
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            {order.status === 'shipped' && (
                              <DropdownMenuItem>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            {(order.status === 'pending' || order.status === 'processing') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredOrders.length}</span> of{' '}
              <span className="font-medium">{orders.length}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
