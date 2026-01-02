'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Tag,
  Percent,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock discounts data
const discounts = [
  {
    id: 'DISC001',
    code: 'SUMMER25',
    name: 'Summer Sale 25%',
    type: 'percentage',
    value: 25,
    usageLimit: 100,
    usageCount: 45,
    minOrder: 100,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    status: 'active',
    applicableTo: 'all'
  },
  {
    id: 'DISC002',
    code: 'NEWUSER50',
    name: 'New User Discount',
    type: 'fixed',
    value: 50,
    usageLimit: 500,
    usageCount: 234,
    minOrder: 200,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableTo: 'new_customers'
  },
  {
    id: 'DISC003',
    code: 'FREESHIP',
    name: 'Free Shipping',
    type: 'free_shipping',
    value: 0,
    usageLimit: null,
    usageCount: 1250,
    minOrder: 150,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableTo: 'all'
  },
  {
    id: 'DISC004',
    code: 'FLASH10',
    name: 'Flash Sale 10%',
    type: 'percentage',
    value: 10,
    usageLimit: 50,
    usageCount: 50,
    minOrder: 0,
    startDate: '2024-05-01',
    endDate: '2024-05-03',
    status: 'expired',
    applicableTo: 'all'
  },
  {
    id: 'DISC005',
    code: 'VIP100',
    name: 'VIP 100 AED Off',
    type: 'fixed',
    value: 100,
    usageLimit: 20,
    usageCount: 8,
    minOrder: 500,
    startDate: '2024-06-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableTo: 'vip_customers'
  },
  {
    id: 'DISC006',
    code: 'WINTER30',
    name: 'Winter Sale 30%',
    type: 'percentage',
    value: 30,
    usageLimit: 200,
    usageCount: 0,
    minOrder: 150,
    startDate: '2024-12-01',
    endDate: '2025-02-28',
    status: 'scheduled',
    applicableTo: 'all'
  },
]

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expired: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  disabled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const typeIcons: Record<string, React.ReactNode> = {
  percentage: <Percent className="h-4 w-4" />,
  fixed: <Tag className="h-4 w-4" />,
  free_shipping: <CheckCircle className="h-4 w-4" />,
}

export default function DiscountsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Filter discounts
  const filteredDiscounts = discounts.filter(discount => {
    const matchesSearch = discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discount.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || discount.status === statusFilter
    const matchesType = typeFilter === 'all' || discount.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate stats
  const activeDiscounts = discounts.filter(d => d.status === 'active').length
  const totalUsage = discounts.reduce((acc, d) => acc + d.usageCount, 0)
  const avgDiscount = discounts.reduce((acc, d) => d.type !== 'free_shipping' ? acc + d.value : acc, 0) / 
                      discounts.filter(d => d.type !== 'free_shipping').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discounts & Coupons</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for your store
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/discounts/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Discount
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDiscounts}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time usage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDiscount.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Avg value offered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Est. Savings Given</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">AED 45,200</div>
            <p className="text-xs text-muted-foreground">Customer savings</p>
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
                placeholder="Search by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="free_shipping">Free Shipping</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Discounts List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Code & Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Valid Period
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredDiscounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono font-medium">
                            {discount.code}
                          </code>
                          <button
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => navigator.clipboard.writeText(discount.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{discount.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {typeIcons[discount.type]}
                        <span className="text-sm capitalize">
                          {discount.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium">
                        {discount.type === 'percentage' && `${discount.value}%`}
                        {discount.type === 'fixed' && `AED ${discount.value}`}
                        {discount.type === 'free_shipping' && 'Free'}
                      </span>
                      {discount.minOrder > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Min. AED {discount.minOrder}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{discount.usageCount}</span>
                        {discount.usageLimit && (
                          <span className="text-muted-foreground">
                            / {discount.usageLimit}
                          </span>
                        )}
                      </div>
                      {discount.usageLimit && (
                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(discount.startDate).toLocaleDateString()}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{new Date(discount.endDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                        statusStyles[discount.status]
                      )}>
                        {discount.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
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
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(discount.code)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Code
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {discount.status === 'active' ? (
                            <DropdownMenuItem className="text-amber-600">
                              <XCircle className="mr-2 h-4 w-4" />
                              Disable
                            </DropdownMenuItem>
                          ) : discount.status === 'disabled' && (
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Enable
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDiscounts.length === 0 && (
            <div className="p-8 text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No discounts found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Percentage Discount</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Takes a percentage off the order total. Great for seasonal sales.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Fixed Amount</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Deducts a fixed amount from the order. Perfect for welcome offers.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Free Shipping</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Waives shipping fees. Can be combined with minimum order value.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
