'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  AlertTriangle,
  Loader2,
  X,
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
import Image from 'next/image'
import { cn, formatCurrency } from '@/lib/utils'
import {
  getAdminReturns,
  getAdminReturnStats,
  approveReturn,
  rejectReturn,
  processReturn,
  completeRefund,
} from '@/lib/actions/return.actions'
import { FormattedReturn, ReturnStatus, ReturnReason, RETURN_REASON_LABELS } from '@/types/supabase'
import { toast } from 'react-toastify'

const statuses: (ReturnStatus | 'all')[] = ['all', 'pending', 'approved', 'processing', 'refunded', 'rejected']
const reasons: (ReturnReason | 'all')[] = ['all', 'damaged', 'wrong_item', 'not_as_described', 'defective', 'changed_mind', 'other']

const getStatusStyles = (status: ReturnStatus) => {
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

const getStatusIcon = (status: ReturnStatus) => {
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
  const [returns, setReturns] = useState<FormattedReturn[]>([])
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    processing: 0,
    refunded: 0,
    rejected: 0,
    total: 0,
    totalRefunded: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ReturnStatus | 'all'>('all')
  const [selectedReason, setSelectedReason] = useState<ReturnReason | 'all'>('all')
  const [selectedReturn, setSelectedReturn] = useState<FormattedReturn | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [processingAction, setProcessingAction] = useState<string | null>(null)

  // Fetch returns and stats
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [returnsResult, statsResult] = await Promise.all([
        getAdminReturns({ search: searchQuery, status: selectedStatus, reason: selectedReason }),
        getAdminReturnStats(),
      ])

      if (returnsResult.success && returnsResult.data) {
        setReturns(returnsResult.data)
      }
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error('Error fetching returns data:', error)
      toast.error('Failed to load returns')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedStatus, selectedReason])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchData()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleApprove = async (ret: FormattedReturn) => {
    setProcessingAction(ret.id)
    try {
      const result = await approveReturn(ret.id, adminNotes)
      if (result.success) {
        toast.success('Return approved successfully')
        fetchData()
        setShowDetailsModal(false)
        setAdminNotes('')
      } else {
        toast.error(result.error || 'Failed to approve return')
      }
    } finally {
      setProcessingAction(null)
    }
  }

  const handleReject = async () => {
    if (!selectedReturn || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    
    setProcessingAction(selectedReturn.id)
    try {
      const result = await rejectReturn(selectedReturn.id, rejectionReason, adminNotes)
      if (result.success) {
        toast.success('Return rejected')
        fetchData()
        setShowRejectModal(false)
        setShowDetailsModal(false)
        setRejectionReason('')
        setAdminNotes('')
      } else {
        toast.error(result.error || 'Failed to reject return')
      }
    } finally {
      setProcessingAction(null)
    }
  }

  const handleProcess = async (ret: FormattedReturn) => {
    setProcessingAction(ret.id)
    try {
      const result = await processReturn(ret.id)
      if (result.success) {
        toast.success('Return is now being processed')
        fetchData()
      } else {
        toast.error(result.error || 'Failed to process return')
      }
    } finally {
      setProcessingAction(null)
    }
  }

  const handleRefund = async (ret: FormattedReturn) => {
    setProcessingAction(ret.id)
    try {
      const result = await completeRefund(ret.id)
      if (result.success) {
        toast.success('Refund completed successfully')
        fetchData()
      } else {
        toast.error(result.error || 'Failed to complete refund')
      }
    } finally {
      setProcessingAction(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
          <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
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
                <p className="text-2xl font-bold">{stats.pending}</p>
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
                <p className="text-2xl font-bold">{stats.processing}</p>
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
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRefunded)}</p>
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
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as ReturnStatus | 'all')}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedReason} onValueChange={(v) => setSelectedReason(v as ReturnReason | 'all')}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                {reasons.filter(r => r !== 'all').map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {RETURN_REASON_LABELS[reason as ReturnReason]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Returns Alert */}
      {stats.pending > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-300">
                  {stats.pending} return{stats.pending > 1 ? 's' : ''} awaiting review
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : returns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No returns found</h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || selectedStatus !== 'all' || selectedReason !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Return requests will appear here'}
              </p>
            </div>
          ) : (
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
                  {returns.map((ret) => {
                    const StatusIcon = getStatusIcon(ret.status)
                    return (
                      <tr key={ret.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-3">
                          <span className="font-medium">{ret.returnNumber}</span>
                          <p className="text-xs text-muted-foreground">{formatDate(ret.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/admin/orders/${ret.orderId}`} className="text-primary hover:underline">
                            {ret.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{ret.customer?.name || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{ret.customer?.email || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <Image
                                src={ret.productImage}
                                alt={ret.productName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="max-w-xs truncate text-sm">{ret.productName}</p>
                              <p className="text-xs text-muted-foreground">Qty: {ret.quantity}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm max-w-xs">
                          <p className="truncate">{ret.reasonLabel}</p>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {ret.refundAmount ? formatCurrency(ret.refundAmount) : 'N/A'}
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
                              <Button variant="ghost" size="icon" disabled={processingAction === ret.id}>
                                {processingAction === ret.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedReturn(ret)
                                setShowDetailsModal(true)
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {ret.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-green-600"
                                    onClick={() => handleApprove(ret)}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve Return
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedReturn(ret)
                                      setShowRejectModal(true)
                                    }}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject Return
                                  </DropdownMenuItem>
                                </>
                              )}
                              {ret.status === 'approved' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleProcess(ret)}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Start Processing
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleRefund(ret)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Process Refund
                                  </DropdownMenuItem>
                                </>
                              )}
                              {ret.status === 'processing' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleRefund(ret)}>
                                    <DollarSign className="mr-2 h-4 w-4" />
                                    Complete Refund
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
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDetailsModal(false)} />
          <div className="relative bg-background rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Return Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetailsModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Return Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Return Number</p>
                  <p className="font-medium">{selectedReturn.returnNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <Link href={`/admin/orders/${selectedReturn.orderId}`} className="font-medium text-primary hover:underline">
                    {selectedReturn.orderNumber}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">{formatDate(selectedReturn.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                    getStatusStyles(selectedReturn.status)
                  )}>
                    {selectedReturn.status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="font-medium mb-2">Customer</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium">{selectedReturn.customer?.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedReturn.customer?.email || 'N/A'}</p>
                  {selectedReturn.customer?.phone && (
                    <p className="text-sm text-muted-foreground">{selectedReturn.customer.phone}</p>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="font-medium mb-2">Product</h3>
                <div className="flex items-center gap-4 bg-muted/50 rounded-lg p-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={selectedReturn.productImage}
                      alt={selectedReturn.productName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedReturn.productName}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {selectedReturn.quantity}</p>
                    <p className="text-sm font-medium text-primary">
                      Refund: {selectedReturn.refundAmount ? formatCurrency(selectedReturn.refundAmount) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="font-medium mb-2">Return Reason</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium">{selectedReturn.reasonLabel}</p>
                  {selectedReturn.reasonDetails && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedReturn.reasonDetails}</p>
                  )}
                </div>
              </div>

              {/* Images */}
              {selectedReturn.images && selectedReturn.images.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Evidence Images</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReturn.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={img}
                          alt={`Evidence ${i + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedReturn.adminNotes && (
                <div>
                  <h3 className="font-medium mb-2">Admin Notes</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm">{selectedReturn.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedReturn.rejectionReason && (
                <div>
                  <h3 className="font-medium mb-2 text-red-600">Rejection Reason</h3>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-red-700 dark:text-red-300">{selectedReturn.rejectionReason}</p>
                  </div>
                </div>
              )}

              {/* Actions for Pending Returns */}
              {selectedReturn.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={() => handleApprove(selectedReturn)}
                    disabled={processingAction === selectedReturn.id}
                  >
                    {processingAction === selectedReturn.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                    )}
                    Approve Return
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setShowDetailsModal(false)
                      setShowRejectModal(true)
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Return
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRejectModal(false)} />
          <div className="relative bg-background rounded-xl shadow-lg w-full max-w-md m-4">
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Reject Return</h2>
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejecting this return request.
              </p>
              <div>
                <label className="text-sm font-medium">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                  placeholder="Enter the reason for rejection..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Internal Notes (optional)</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                  placeholder="Add any internal notes..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReject}
                  disabled={processingAction === selectedReturn.id || !rejectionReason.trim()}
                >
                  {processingAction === selectedReturn.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
