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
  Download,
  RotateCcw,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  MoreHorizontal,
  RefreshCw,
  DollarSign,
  MessageSquare,
  AlertTriangle
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

// Mock returns data
const returns = [
  {
    id: 'RTN-001',
    orderId: 'ORD-001',
    customer: 'Ahmed Hassan',
    email: 'ahmed@email.com',
    product: 'Premium Paper Bags (50pc)',
    reason: 'Damaged during shipping',
    status: 'pending',
    requestDate: '2024-01-15',
    amount: 299,
    quantity: 1,
    notes: 'Box was crushed, product unusable',
    images: ['image1.jpg', 'image2.jpg']
  },
  {
    id: 'RTN-002',
    orderId: 'ORD-003',
    customer: 'Mohammed Ali',
    email: 'mohammed@email.com',
    product: 'Luxury Gift Bags (25pc)',
    reason: 'Wrong item received',
    status: 'approved',
    requestDate: '2024-01-14',
    amount: 175,
    quantity: 1,
    notes: 'Received Kraft bags instead of Gift bags',
    images: ['image3.jpg']
  },
  {
    id: 'RTN-003',
    orderId: 'ORD-005',
    customer: 'Omar Youssef',
    email: 'omar@email.com',
    product: 'Eco-Friendly Bags (200pc)',
    reason: 'Not as described',
    status: 'processing',
    requestDate: '2024-01-13',
    amount: 820,
    quantity: 1,
    notes: 'Color is different from website images',
    images: []
  },
  {
    id: 'RTN-004',
    orderId: 'ORD-002',
    customer: 'Sara Al-Rashid',
    email: 'sara@email.com',
    product: 'Kraft Shopping Bags (100pc)',
    reason: 'Changed my mind',
    status: 'rejected',
    requestDate: '2024-01-12',
    amount: 450,
    quantity: 1,
    notes: 'Outside return window',
    rejectionReason: 'Return requested after 14-day return window'
  },
  {
    id: 'RTN-005',
    orderId: 'ORD-006',
    customer: 'Fatima Khan',
    email: 'fatima@email.com',
    product: 'Custom Print Bags (75pc)',
    reason: 'Defective product',
    status: 'refunded',
    requestDate: '2024-01-10',
    amount: 560,
    quantity: 1,
    notes: 'Print quality was poor',
    refundedDate: '2024-01-12',
    refundAmount: 560
  },
]

const statuses = ['All Status', 'pending', 'approved', 'processing', 'refunded', 'rejected']
const reasons = ['All Reasons', 'Damaged during shipping', 'Wrong item received', 'Not as described', 'Defective product', 'Changed my mind']

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'approved':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'processing':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'refunded':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'rejected':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return Clock
    case 'approved':
      return CheckCircle2
    case 'processing':
      return RotateCcw
    case 'refunded':
      return DollarSign
    case 'rejected':
      return XCircle
    default:
      return Clock
  }
}

export default function ReturnsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedReason, setSelectedReason] = useState('All Reasons')

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ret.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ret.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ret.product.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'All Status' || ret.status === selectedStatus
    const matchesReason = selectedReason === 'All Reasons' || ret.reason === selectedReason
    return matchesSearch && matchesStatus && matchesReason
  })

  // Stats
  const pendingReturns = returns.filter(r => r.status === 'pending').length
  const processingReturns = returns.filter(r => r.status === 'processing').length
  const totalRefunded = returns.filter(r => r.status === 'refunded').reduce((acc, r) => acc + r.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Returns & Refunds</h1>
          <p className="text-muted-foreground">
            Handle customer returns and process refunds
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
        <Card className="border-yellow-200 dark:border-yellow-900/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingReturns}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold">{processingReturns}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <RotateCcw className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">{returns.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Refunded Amount</p>
                <p className="text-2xl font-bold">AED {totalRefunded}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <DollarSign className="h-5 w-5" />
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
                placeholder="Search by return ID, order ID, customer, or product..."
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
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Returns Alert */}
      {pendingReturns > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  {pendingReturns} return{pendingReturns > 1 ? 's' : ''} awaiting review
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Please review and process pending returns promptly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Returns List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Return ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Reason</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredReturns.map((ret) => {
                  const StatusIcon = getStatusIcon(ret.status)
                  return (
                    <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <span className="font-medium">{ret.id}</span>
                        <p className="text-xs text-muted-foreground">{ret.requestDate}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${ret.orderId}`} className="text-primary hover:underline">
                          {ret.orderId}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{ret.customer}</p>
                        <p className="text-sm text-muted-foreground">{ret.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-xs truncate">{ret.product}</p>
                        <p className="text-sm text-muted-foreground">Qty: {ret.quantity}</p>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs">
                        <p className="truncate">{ret.reason}</p>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        AED {ret.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                          getStatusStyles(ret.status)
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {ret.status}
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Contact Customer
                            </DropdownMenuItem>
                            {ret.status === 'pending' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve Return
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject Return
                                </DropdownMenuItem>
                              </>
                            )}
                            {ret.status === 'approved' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Process Refund
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
        </CardContent>
      </Card>
    </div>
  )
}
