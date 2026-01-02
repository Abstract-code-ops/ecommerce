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
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Archive
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
import Image from 'next/image'

// Mock products data - Replace with real data from API
const products = [
  {
    id: '1',
    name: 'Premium Paper Bags (50pc)',
    slug: 'premium-paper-bags-50pc',
    category: 'Paper Bags',
    price: 299,
    listPrice: 350,
    stock: 150,
    status: 'published',
    sales: 1245,
    image: '/images/products/paper-bag-1.jpg',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Kraft Shopping Bags (100pc)',
    slug: 'kraft-shopping-bags-100pc',
    category: 'Kraft Bags',
    price: 450,
    listPrice: null,
    stock: 12,
    status: 'published',
    sales: 890,
    image: '/images/products/kraft-bag-1.jpg',
    createdAt: '2024-01-12',
  },
  {
    id: '3',
    name: 'Luxury Gift Bags (25pc)',
    slug: 'luxury-gift-bags-25pc',
    category: 'Gift Bags',
    price: 175,
    listPrice: 200,
    stock: 0,
    status: 'out-of-stock',
    sales: 654,
    image: '/images/products/gift-bag-1.jpg',
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    name: 'Eco-Friendly Bags (200pc)',
    slug: 'eco-friendly-bags-200pc',
    category: 'Eco Bags',
    price: 820,
    listPrice: null,
    stock: 75,
    status: 'published',
    sales: 432,
    image: '/images/products/eco-bag-1.jpg',
    createdAt: '2024-01-08',
  },
  {
    id: '5',
    name: 'Custom Print Bags (75pc)',
    slug: 'custom-print-bags-75pc',
    category: 'Custom Bags',
    price: 560,
    listPrice: 650,
    stock: 200,
    status: 'draft',
    sales: 0,
    image: '/images/products/custom-bag-1.jpg',
    createdAt: '2024-01-05',
  },
]

const categories = ['All Categories', 'Paper Bags', 'Kraft Bags', 'Gift Bags', 'Eco Bags', 'Custom Bags']
const statuses = ['All Status', 'published', 'draft', 'out-of-stock']

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'draft':
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    case 'out-of-stock':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStockStyles = (stock: number) => {
  if (stock === 0) return 'text-red-600 dark:text-red-400'
  if (stock < 20) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [selectedStatus, setSelectedStatus] = useState('All Status')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory
    const matchesStatus = selectedStatus === 'All Status' || product.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog. Add, edit, or remove products.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
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

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === 'All Status' ? status : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sales</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            <span className="text-xs text-muted-foreground">IMG</span>
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.category}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">AED {product.price}</p>
                          {product.listPrice && (
                            <p className="text-sm text-muted-foreground line-through">
                              AED {product.listPrice}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("font-medium", getStockStyles(product.stock))}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{product.sales}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          getStatusStyles(product.status)
                        )}>
                          {product.status.replace('-', ' ')}
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
                              <Link href={`/admin/products/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 dark:text-red-400">
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

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">1</span> to{' '}
                <span className="font-medium">{filteredProducts.length}</span> of{' '}
                <span className="font-medium">{products.length}</span> products
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
      )}

      {/* Products Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-muted-foreground">Image</span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">AED {product.price}</p>
                    {product.listPrice && (
                      <p className="text-sm text-muted-foreground line-through">
                        AED {product.listPrice}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium capitalize",
                    getStatusStyles(product.status)
                  )}>
                    {product.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                  <span className={cn(getStockStyles(product.stock))}>
                    {product.stock} in stock
                  </span>
                  <span>{product.sales} sold</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
