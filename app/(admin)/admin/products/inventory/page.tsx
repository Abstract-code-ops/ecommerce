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
  AlertTriangle,
  Package,
  Search,
  Filter,
  Download,
  Plus,
  Minus,
  History,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock inventory data
const inventoryItems = [
  {
    id: '1',
    name: 'Premium Paper Bags (50pc)',
    sku: 'PPB-50',
    category: 'Paper Bags',
    stock: 150,
    reserved: 12,
    available: 138,
    lowStockThreshold: 20,
    lastRestocked: '2024-01-15',
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Kraft Shopping Bags (100pc)',
    sku: 'KSB-100',
    category: 'Kraft Bags',
    stock: 12,
    reserved: 5,
    available: 7,
    lowStockThreshold: 30,
    lastRestocked: '2024-01-10',
    status: 'low-stock'
  },
  {
    id: '3',
    name: 'Luxury Gift Bags (25pc)',
    sku: 'LGB-25',
    category: 'Gift Bags',
    stock: 0,
    reserved: 0,
    available: 0,
    lowStockThreshold: 25,
    lastRestocked: '2024-01-05',
    status: 'out-of-stock'
  },
  {
    id: '4',
    name: 'Eco-Friendly Bags (200pc)',
    sku: 'EFB-200',
    category: 'Eco Bags',
    stock: 75,
    reserved: 8,
    available: 67,
    lowStockThreshold: 15,
    lastRestocked: '2024-01-12',
    status: 'in-stock'
  },
  {
    id: '5',
    name: 'Custom Print Bags (75pc)',
    sku: 'CPB-75',
    category: 'Custom Bags',
    stock: 5,
    reserved: 0,
    available: 5,
    lowStockThreshold: 20,
    lastRestocked: '2024-01-08',
    status: 'low-stock'
  },
]

const categories = ['All Categories', 'Paper Bags', 'Kraft Bags', 'Gift Bags', 'Eco Bags', 'Custom Bags']
const stockStatuses = ['All Status', 'in-stock', 'low-stock', 'out-of-stock']

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'in-stock':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'low-stock':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'out-of-stock':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [adjustingStock, setAdjustingStock] = useState<string | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState('')

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory
    const matchesStatus = selectedStatus === 'All Status' || item.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const lowStockCount = inventoryItems.filter(i => i.status === 'low-stock').length
  const outOfStockCount = inventoryItems.filter(i => i.status === 'out-of-stock').length
  const totalProducts = inventoryItems.length
  const totalStock = inventoryItems.reduce((acc, i) => acc + i.stock, 0)

  const handleStockAdjustment = (itemId: string, type: 'add' | 'remove') => {
    const amount = parseInt(adjustmentAmount) || 0
    if (amount <= 0) return
    
    // TODO: Implement actual stock adjustment API call
    console.log(`${type} ${amount} units to item ${itemId}`)
    
    setAdjustingStock(null)
    setAdjustmentAmount('')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor stock levels and manage inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            View History
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Inventory
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stock</p>
                <p className="text-2xl font-bold">{totalStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
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
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                {stockStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All Status' ? status : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SKU</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Total Stock</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Reserved</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Available</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Last Restocked</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.sku}</td>
                    <td className="px-4 py-3 text-sm">{item.category}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "font-medium",
                        item.stock === 0 && "text-red-600 dark:text-red-400",
                        item.stock > 0 && item.stock <= item.lowStockThreshold && "text-yellow-600 dark:text-yellow-400",
                        item.stock > item.lowStockThreshold && "text-green-600 dark:text-green-400"
                      )}>
                        {item.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">{item.reserved}</td>
                    <td className="px-4 py-3 text-center font-medium">{item.available}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium capitalize",
                        getStatusStyles(item.status)
                      )}>
                        {item.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.lastRestocked}</td>
                    <td className="px-4 py-3 text-right">
                      {adjustingStock === item.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <Input
                            type="number"
                            placeholder="Qty"
                            className="w-20 h-8"
                            value={adjustmentAmount}
                            onChange={(e) => setAdjustmentAmount(e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockAdjustment(item.id, 'add')}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStockAdjustment(item.id, 'remove')}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAdjustingStock(null)
                              setAdjustmentAmount('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAdjustingStock(item.id)}
                        >
                          Adjust Stock
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <Card className="border-yellow-200 dark:border-yellow-900/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <CardTitle>Stock Alerts</CardTitle>
            </div>
            <CardDescription>
              Products that need attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventoryItems.filter(i => i.status !== 'in-stock').map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    item.status === 'out-of-stock'
                      ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50"
                      : "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50"
                  )}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.status === 'out-of-stock'
                        ? 'Out of stock - Needs immediate restocking'
                        : `Low stock - ${item.stock} remaining (threshold: ${item.lowStockThreshold})`
                      }
                    </p>
                  </div>
                  <Button size="sm">
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
