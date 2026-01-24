'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { 
  Package, CheckCircle2, Clock, XCircle, ChevronRight, 
  Search, Loader2, DollarSign, RotateCcw, AlertCircle, Eye
} from 'lucide-react'
import { getReturns } from '@/lib/actions/return.actions'
import { FormattedReturn, ReturnStatus, RETURN_STATUS_LABELS } from '@/types/supabase'
import { toast } from 'react-toastify'

const statusConfig: Record<ReturnStatus, { 
  label: string
  color: string
  bgColor: string
  icon: typeof Package 
}> = {
  pending: {
    label: 'Pending Review',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Clock
  },
  approved: {
    label: 'Approved',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: CheckCircle2
  },
  processing: {
    label: 'Processing',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: RotateCcw
  },
  refunded: {
    label: 'Refunded',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: DollarSign
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    icon: XCircle
  }
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<FormattedReturn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'all'>('all')
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null)

  // Fetch returns from Supabase
  useEffect(() => {
    const fetchReturns = async () => {
      setIsLoading(true)
      try {
        const result = await getReturns()
        if (result.success && result.data) {
          setReturns(result.data)
        }
      } catch (error) {
        console.error('Error fetching returns:', error)
        toast.error('Failed to load returns')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReturns()
  }, [])

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = ret.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.productName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ret.status === statusFilter
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
          <p className="text-muted-foreground text-sm">Loading your returns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Returns</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage your return requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Returns', value: returns.length, icon: Package, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
          { label: 'Pending', value: returns.filter(r => r.status === 'pending').length, icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
          { label: 'Approved', value: returns.filter(r => ['approved', 'processing'].includes(r.status)).length, icon: CheckCircle2, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
          { label: 'Refunded', value: returns.filter(r => r.status === 'refunded').length, icon: DollarSign, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
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
            placeholder="Search returns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['all', 'pending', 'approved', 'processing', 'refunded', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
            >
              {status === 'all' ? 'All' : RETURN_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Returns List */}
      {filteredReturns.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-dashed border-border rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No returns found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : "You haven't requested any returns yet"}
          </p>
          <Button asChild>
            <Link href="/profile/orders">View Orders</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReturns.map((ret, index) => {
              const statusInfo = statusConfig[ret.status]
              const isExpanded = expandedReturn === ret.id
              const StatusIcon = statusInfo.icon

              return (
                <motion.div
                  key={ret.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border/50 rounded-2xl overflow-hidden"
                >
                  {/* Return Header */}
                  <div 
                    className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedReturn(isExpanded ? null : ret.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="relative w-16 h-16 shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden">
                            <Image
                              src={ret.productImage}
                              alt={ret.productName}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{ret.returnNumber}</h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {ret.productName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Requested: {formatDate(ret.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">
                            {ret.refundAmount ? formatCurrency(ret.refundAmount) : 'Pending'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ret.status === 'refunded' ? 'Refunded' : 'Refund Amount'}
                          </p>
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
                          {/* Status Progress */}
                          {ret.status !== 'rejected' && (
                            <div className="relative">
                              <div className="flex items-center justify-between">
                                {(['pending', 'approved', 'processing', 'refunded'] as const).map((step, i) => {
                                  const stepOrder = ['pending', 'approved', 'processing', 'refunded']
                                  const currentIndex = stepOrder.indexOf(ret.status)
                                  const isComplete = i <= currentIndex
                                  const isCurrent = ret.status === step
                                  const StepIcon = statusConfig[step].icon

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
                                        {RETURN_STATUS_LABELS[step]}
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
                                    width: `${((['pending', 'approved', 'processing', 'refunded'].indexOf(ret.status)) / 3) * 100}%` 
                                  }} 
                                />
                              </div>
                            </div>
                          )}

                          {/* Rejection Notice */}
                          {ret.status === 'rejected' && (
                            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-medium text-red-700 dark:text-red-300">Return Rejected</p>
                                {ret.rejectionReason && (
                                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{ret.rejectionReason}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Return Details */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Order Number</p>
                              <Link href={`/profile/orders`} className="font-medium text-primary hover:underline">
                                {ret.orderNumber}
                              </Link>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Quantity</p>
                              <p className="font-medium">{ret.quantity}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Reason</p>
                              <p className="font-medium">{ret.reasonLabel}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Refund Amount</p>
                              <p className="font-medium text-primary">
                                {ret.refundAmount ? formatCurrency(ret.refundAmount) : 'Pending Review'}
                              </p>
                            </div>
                          </div>

                          {/* Additional Details */}
                          {ret.reasonDetails && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Additional Details</p>
                              <p className="text-sm bg-muted/30 rounded-lg p-3">{ret.reasonDetails}</p>
                            </div>
                          )}

                          {/* Evidence Images */}
                          {ret.images && ret.images.length > 0 && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Evidence Images</p>
                              <div className="flex gap-2 flex-wrap">
                                {ret.images.map((img, i) => (
                                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
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

                          {/* Timestamps */}
                          {(ret.resolvedAt || ret.refundedAt) && (
                            <div className="flex flex-wrap gap-4 text-sm pt-2 border-t">
                              {ret.resolvedAt && (
                                <div>
                                  <p className="text-muted-foreground">Resolved on</p>
                                  <p className="font-medium">{formatDate(ret.resolvedAt)}</p>
                                </div>
                              )}
                              {ret.refundedAt && (
                                <div>
                                  <p className="text-muted-foreground">Refunded on</p>
                                  <p className="font-medium">{formatDate(ret.refundedAt)}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Help Info for Pending */}
                          {ret.status === 'pending' && (
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                              <div className="text-sm text-blue-700 dark:text-blue-300">
                                <p className="font-medium">Under Review</p>
                                <p className="mt-1">Your return request is being reviewed by our team. We&apos;ll notify you once a decision has been made.</p>
                              </div>
                            </div>
                          )}
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
