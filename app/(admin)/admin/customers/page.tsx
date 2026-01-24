'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Users,
  User,
  Mail,
  Phone,
  ShoppingCart,
  Eye,
  MoreHorizontal,
  Calendar,
  UserCheck,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  MapPin,
  X
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
import { getAdminCustomers, getAdminCustomerById } from '@/lib/actions/admin.actions'

type Customer = {
  id: string
  fullName: string
  email?: string
  phone?: string
  avatarUrl?: string
  totalOrders: number
  totalSpent: number
  lastOrderDate?: string
  createdAt: string
}

type CustomerDetail = {
  id: string
  fullName: string
  email?: string
  phone?: string
  avatarUrl?: string
  createdAt: string
  addresses: Array<{
    id: string
    full_name: string
    street: string
    city: string
    state: string
    postal_code: string
    country: string
    phone?: string
    is_default?: boolean
  }>
  totalOrders: number
  totalSpent: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Modal state
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)

  const fetchCustomers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getAdminCustomers({
        search: searchQuery || undefined,
        page,
        limit: 20,
      })
      
      if (result.success) {
        setCustomers(result.data || [])
        setTotalPages(result.totalPages || 1)
        setTotal(result.total || 0)
      } else {
        setError(result.error || 'Failed to fetch customers')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const openCustomerModal = async (customerId: string, customerEmail?: string) => {
    setIsModalOpen(true)
    setIsLoadingCustomer(true)
    try {
      const result = await getAdminCustomerById(customerId)
      if (result.success && result.data) {
        setSelectedCustomer({
          ...result.data,
          email: customerEmail
        })
      }
    } catch (err) {
      console.error('Error fetching customer:', err)
    } finally {
      setIsLoadingCustomer(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCustomer(null)
  }

  useEffect(() => {
    fetchCustomers()
  }, [page])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchCustomers()
      } else {
        setPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Stats
  const totalCustomers = total
  const activeCustomers = customers.filter(c => c.totalOrders > 0).length

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

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
          <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={isLoading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
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
                <p className="text-sm text-muted-foreground">Active (Has Orders)</p>
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
                <p className="text-sm text-muted-foreground">New (No Orders Yet)</p>
                <p className="text-2xl font-bold">{customers.filter(c => c.totalOrders === 0).length}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <User className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Customers</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchCustomers}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && customers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Customers Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Customers will appear here once they sign up'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Customers Table */}
      {!isLoading && !error && customers.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Orders</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Total Spent</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Order</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium overflow-hidden">
                            {customer.avatarUrl ? (
                              <img 
                                src={customer.avatarUrl} 
                                alt={customer.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              customer.fullName?.charAt(0)?.toUpperCase() || '?'
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{customer.fullName || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {customer.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          {customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate max-w-40">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {!customer.email && !customer.phone && (
                            <span className="text-muted-foreground">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          customer.totalOrders > 0 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {customer.totalOrders}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        AED {customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'No orders'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(customer.createdAt)}
                        </div>
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
                            <DropdownMenuItem onClick={() => openCustomerModal(customer.id, customer.email)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders?customer=${customer.id}`}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                View Orders
                              </Link>
                            </DropdownMenuItem>
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
                Page <span className="font-medium">{page}</span> of{' '}
                <span className="font-medium">{totalPages}</span>{' '}
                ({total} total customers)
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="relative bg-background rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Customer Profile</h2>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4">
              {isLoadingCustomer ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : selectedCustomer ? (
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-medium overflow-hidden">
                      {selectedCustomer.avatarUrl ? (
                        <img 
                          src={selectedCustomer.avatarUrl} 
                          alt={selectedCustomer.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        selectedCustomer.fullName?.charAt(0)?.toUpperCase() || '?'
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedCustomer.fullName || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Customer since {formatDate(selectedCustomer.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h4>
                    <div className="space-y-2">
                      {selectedCustomer.email && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCustomer.email}</span>
                        </div>
                      )}
                      {selectedCustomer.phone && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCustomer.phone}</span>
                        </div>
                      )}
                      {!selectedCustomer.email && !selectedCustomer.phone && (
                        <p className="text-muted-foreground text-sm">No contact information available</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold">{selectedCustomer.totalOrders}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <p className="text-2xl font-bold">AED {selectedCustomer.totalSpent.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Addresses ({selectedCustomer.addresses.length})
                    </h4>
                    {selectedCustomer.addresses.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCustomer.addresses.map((address) => (
                          <div 
                            key={address.id} 
                            className={cn(
                              "p-3 rounded-lg border",
                              address.is_default && "border-primary bg-primary/5"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{address.full_name}</p>
                                  {address.is_default && (
                                    <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {address.street}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {address.city}, {address.state} {address.postal_code}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {address.country}
                                </p>
                                {address.phone && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    <Phone className="h-3 w-3 inline mr-1" />
                                    {address.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No addresses saved</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Failed to load customer details
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={closeModal}>
                Close
              </Button>
              {selectedCustomer && (
                <Button asChild>
                  <Link href={`/admin/orders?customer=${selectedCustomer.id}`}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Orders
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
