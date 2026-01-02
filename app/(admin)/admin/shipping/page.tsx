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
  Truck,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Navigation,
  Phone
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

// Mock shipments data
const shipments = [
  {
    id: 'SHP-001',
    orderId: 'ORD-001',
    customer: 'Ahmed Hassan',
    phone: '+971 50 123 4567',
    address: 'Dubai Marina, Tower A, Apt 1204, Dubai',
    trackingNumber: 'TRK123456789',
    carrier: 'Aramex',
    status: 'in-transit',
    estimatedDelivery: '2024-01-18',
    shippedDate: '2024-01-16',
    items: 3,
    weight: '2.5 kg',
  },
  {
    id: 'SHP-002',
    orderId: 'ORD-002',
    customer: 'Sara Al-Rashid',
    phone: '+971 55 987 6543',
    address: 'Abu Dhabi, Al Reem Island, Sky Tower, Abu Dhabi',
    trackingNumber: 'TRK987654321',
    carrier: 'Emirates Post',
    status: 'out-for-delivery',
    estimatedDelivery: '2024-01-17',
    shippedDate: '2024-01-15',
    items: 2,
    weight: '1.8 kg',
  },
  {
    id: 'SHP-003',
    orderId: 'ORD-003',
    customer: 'Mohammed Ali',
    phone: '+971 56 456 7890',
    address: 'Sharjah, Al Majaz, Building 12, Sharjah',
    trackingNumber: 'TRK456789123',
    carrier: 'DHL',
    status: 'delivered',
    estimatedDelivery: '2024-01-16',
    shippedDate: '2024-01-14',
    deliveredDate: '2024-01-16',
    items: 5,
    weight: '4.2 kg',
  },
  {
    id: 'SHP-004',
    orderId: 'ORD-004',
    customer: 'Fatima Khan',
    phone: '+971 52 111 2222',
    address: 'Dubai, JBR, Rimal 3, Dubai',
    trackingNumber: '',
    carrier: 'Aramex',
    status: 'pending',
    estimatedDelivery: '2024-01-20',
    items: 1,
    weight: '0.5 kg',
  },
]

const statuses = ['All Status', 'pending', 'in-transit', 'out-for-delivery', 'delivered', 'failed']
const carriers = ['All Carriers', 'Aramex', 'Emirates Post', 'DHL', 'FedEx']

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'in-transit':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    case 'out-for-delivery':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'delivered':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return Clock
    case 'in-transit':
      return Truck
    case 'out-for-delivery':
      return Navigation
    case 'delivered':
      return CheckCircle2
    case 'failed':
      return Package
    default:
      return Clock
  }
}

export default function ShippingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [selectedCarrier, setSelectedCarrier] = useState('All Carriers')

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'All Status' || shipment.status === selectedStatus
    const matchesCarrier = selectedCarrier === 'All Carriers' || shipment.carrier === selectedCarrier
    return matchesSearch && matchesStatus && matchesCarrier
  })

  // Stats
  const pendingShipments = shipments.filter(s => s.status === 'pending').length
  const inTransitShipments = shipments.filter(s => s.status === 'in-transit').length
  const outForDeliveryShipments = shipments.filter(s => s.status === 'out-for-delivery').length
  const deliveredShipments = shipments.filter(s => s.status === 'delivered').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shipping & Delivery</h1>
          <p className="text-muted-foreground">
            Track and manage all shipments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Status
          </Button>
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
                <p className="text-sm text-muted-foreground">Pending Pickup</p>
                <p className="text-2xl font-bold">{pendingShipments}</p>
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
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{inTransitShipments}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Truck className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out for Delivery</p>
                <p className="text-2xl font-bold">{outForDeliveryShipments}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Navigation className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered Today</p>
                <p className="text-2xl font-bold">{deliveredShipments}</p>
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
                placeholder="Search by shipment ID, order ID, customer, or tracking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All Status' ? status : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCarrier} onValueChange={setSelectedCarrier}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Carrier" />
              </SelectTrigger>
              <SelectContent>
                {carriers.map((carrier) => (
                  <SelectItem key={carrier} value={carrier}>
                    {carrier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Shipments List */}
      <div className="grid gap-4">
        {filteredShipments.map((shipment) => {
          const StatusIcon = getStatusIcon(shipment.status)
          return (
            <Card key={shipment.id}>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Shipment Info */}
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-lg",
                      getStatusStyles(shipment.status)
                    )}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{shipment.id}</span>
                        <span className="text-muted-foreground">•</span>
                        <Link href={`/admin/orders/${shipment.orderId}`} className="text-primary hover:underline">
                          {shipment.orderId}
                        </Link>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {shipment.customer} • {shipment.items} items • {shipment.weight}
                      </p>
                      {shipment.trackingNumber && (
                        <p className="text-sm mt-1">
                          <span className="text-muted-foreground">Tracking:</span>{' '}
                          <span className="font-mono">{shipment.trackingNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground line-clamp-1 max-w-xs">
                          {shipment.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>{shipment.carrier}</span>
                      </div>
                    </div>

                    <div className="text-sm md:text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize",
                        getStatusStyles(shipment.status)
                      )}>
                        {shipment.status.replace('-', ' ')}
                      </span>
                      <p className="text-muted-foreground mt-1">
                        Est. {shipment.estimatedDelivery}
                      </p>
                    </div>

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
                          <Link href={`/admin/orders/${shipment.orderId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Order
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Navigation className="mr-2 h-4 w-4" />
                          Track Shipment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="mr-2 h-4 w-4" />
                          Contact Customer
                        </DropdownMenuItem>
                        {shipment.status === 'pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </DropdownMenuItem>
                          </>
                        )}
                        {shipment.status === 'out-for-delivery' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredShipments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">No shipments found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
