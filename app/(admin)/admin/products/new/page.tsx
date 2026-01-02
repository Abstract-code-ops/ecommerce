'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  ArrowLeft,
  Save,
  Eye,
  Upload,
  X,
  Plus,
  GripVertical,
  ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const categories = ['Paper Bags', 'Kraft Bags', 'Gift Bags', 'Eco Bags', 'Custom Bags']
const tags = ['Featured', 'New Arrival', 'Best Seller', 'Sale', 'Limited Edition']

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category: '',
    price: '',
    listPrice: '',
    countInStock: '',
    isPublished: true,
    tags: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
    dimensions: {
      width: '',
      height: '',
      depth: ''
    }
  })

  const [newSize, setNewSize] = useState('')
  const [newColor, setNewColor] = useState('')
  const [newTag, setNewTag] = useState('')

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }))
  }

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, newSize] }))
      setNewSize('')
    }
  }

  const removeSize = (size: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }))
  }

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, newColor] }))
      setNewColor('')
    }
  }

  const removeColor = (color: string) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }))
  }

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // TODO: Implement product creation API call
    console.log('Creating product:', formData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsLoading(false)
    router.push('/admin/products')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
            <p className="text-muted-foreground">
              Fill in the details to create a new product
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={isLoading}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Product name, description, and other basic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug *</label>
                  <Input
                    placeholder="product-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    URL-friendly version of the name. Auto-generated from product name.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <textarea
                    className="w-full min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Enter product description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload product images. First image will be the main display image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Upload Box */}
                  <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload Image</span>
                    <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                  </div>
                  
                  {/* Placeholder for uploaded images */}
                  {[1, 2].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg border bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative group">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Set your product pricing and compare at price
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price (AED) *</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compare at Price (AED)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.listPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, listPrice: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Original price to show discount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  Manage stock levels and inventory tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Quantity *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.countInStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, countInStock: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensions</CardTitle>
                <CardDescription>
                  Product dimensions in centimeters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (cm)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={formData.dimensions.width}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, width: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height (cm)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={formData.dimensions.height}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, height: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Depth (cm)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={formData.dimensions.depth}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, depth: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>
                  Add sizes and colors for your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sizes */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Sizes</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add size (e.g., Small, Medium, Large)"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                    />
                    <Button type="button" variant="outline" onClick={addSize}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.sizes.map((size) => (
                        <span
                          key={size}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
                        >
                          {size}
                          <button
                            type="button"
                            onClick={() => removeSize(size)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Colors</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add color (e.g., Red, Blue, Green)"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                    />
                    <Button type="button" variant="outline" onClick={addColor}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.colors.map((color) => (
                        <span
                          key={color}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => removeColor(color)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.isPublished ? 'published' : 'draft'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isPublished: value === 'published' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.isPublished ? 'Product will be visible in the store' : 'Product will be hidden from customers'}
                </p>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category *</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Select tags to categorize your product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        formData.tags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" type="button">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview Product
                </Button>
                <Button variant="outline" className="w-full justify-start" type="button">
                  <Upload className="mr-2 h-4 w-4" />
                  Import from CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
