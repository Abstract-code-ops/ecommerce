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
  Users,
  User,
  Mail,
  Phone,
  ShoppingCart,
  Eye,
  MoreHorizontal,
  DollarSign,
  Calendar,
  MapPin,
  Star,
  UserCheck,
  UserX,
  MessageSquare
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

// Mock customers data
const customers = [
  {
    id: '1',
    name: 'Ahmed Hassan',
    email: 'ahmed@email.com',
    phone: '+971 50 123 4567',
    location: 'Dubai, UAE',
    totalOrders: 12,
    totalSpent: 5420,
    lastOrder: '2024-01-15',
    joinedDate: '2023-06-15',
    status: 'active',
    tier: 'gold'
  },
  {
    id: '2',
    name: 'Sara Al-Rashid',
    email: 'sara@email.com',
    phone: '+971 55 987 6543',
    location: 'Abu Dhabi, UAE',
    totalOrders: 8,
    totalSpent: 3200,
    lastOrder: '2024-01-14',
    joinedDate: '2023-08-20',
    status: 'active',
    tier: 'silver'
  },
  {
    id: '3',
    name: 'Mohammed Ali',
    email: 'mohammed@email.com',
    phone: '+971 56 456 7890',
    location: 'Sharjah, UAE',
    totalOrders: 25,
    totalSpent: 12500,
    lastOrder: '2024-01-10',
    joinedDate: '2022-12-01',
    status: 'active',
    tier: 'platinum'
  },
  {
    id: '4',
    name: 'Fatima Khan',
    email: 'fatima@email.com',
    phone: '+971 52 111 2222',
    location: 'Dubai, UAE',
    totalOrders: 3,
    totalSpent: 890,
    lastOrder: '2024-01-05',
    joinedDate: '2024-01-01',
    status: 'active',
    tier: 'bronze'
  },
  {
    id: '5',
    name: 'Omar Youssef',
    email: 'omar@email.com',
    phone: '+971 58 333 4444',
    location: 'Ajman, UAE',
    totalOrders: 0,
    totalSpent: 0,
    lastOrder: null,
    joinedDate: '2024-01-12',
    status: 'inactive',
    tier: 'bronze'
  },
]

const statuses = ['All Status', 'active', 'inactive']
const tiers = ['All Tiers', 'platinum', 'gold', 'silver', 'bronze']

const getTierStyles = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'gold':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'silver':
      return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
    case 'bronze':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'inactive':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedTier, setSelectedTier] = useState('All Tiers')

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery)
    const matchesStatus = selectedStatus === 'All Status' || customer.status === selectedStatus
    const matchesTier = selectedTier === 'All Tiers' || customer.tier === selectedTier
    return matchesSearch && matchesStatus && matchesTier
  })

  // Stats
  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const newThisMonth = customers.filter(c => new Date(c.joinedDate) > new Date('2024-01-01')).length
  const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            View and manage your customer base
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New This Month</p>
                <p className="text-2xl font-bold">{newThisMonth}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <User className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">AED {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
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
                placeholder="Search by name, email, or phone..."
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
            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                {tiers.map((tier) => (
                  <SelectItem key={tier} value={tier}>
                    {tier === 'All Tiers' ? tier : tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Orders</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Spent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tier</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {customer.joinedDate}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-32">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{customer.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {customer.totalOrders}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      AED {customer.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {customer.lastOrder || 'No orders'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize",
                        getTierStyles(customer.tier)
                      )}>
                        <Star className="h-3 w-3" />
                        {customer.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                        getStatusStyles(customer.status)
                      )}>
                        {customer.status}
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
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Orders
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {customer.status === 'active' ? (
                            <DropdownMenuItem className="text-red-600">
                              <UserX className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">{filteredCustomers.length}</span> of{' '}
              <span className="font-medium">{customers.length}</span> customers
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
