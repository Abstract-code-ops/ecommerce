'use client'

import { useState, useRef, useEffect, use } from 'react'
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
  Upload,
  X,
  Plus,
  Link as LinkIcon,
  Loader2,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getAdminProductById, updateProduct, deleteProduct } from '@/lib/actions/admin.actions'
import { uploadMultipleToCloudinary, deleteFromCloudinary } from '@/lib/actions/upload.actions'
import { toast } from 'react-toastify'

// Default categories and tags
const defaultCategories = ['Paper Bags', 'Kraft Bags', 'Gift Bags', 'Eco Bags', 'Custom Bags', 'Shopping Bags', 'Food Packaging']
const defaultTags: string[] = []  // Empty - only shows existing tags from products

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [availableTags, setAvailableTags] = useState<string[]>(defaultTags)
  const [newCategory, setNewCategory] = useState('')
  const [newTagInput, setNewTagInput] = useState('')
  const [showImageUrlInput, setShowImageUrlInput] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)

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

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      try {
        const result = await getAdminProductById(id)
        
        if (result.success && result.data) {
          const product = result.data
          setFormData({
            name: product.name || '',
            slug: product.slug || '',
            description: product.description || '',
            category: product.category || '',
            price: product.price?.toString() || '',
            listPrice: product.listPrice?.toString() || '',
            countInStock: product.countInStock?.toString() || '',
            isPublished: product.isPublished ?? true,
            tags: product.tags || [],
            sizes: product.sizes || [],
            colors: product.colors || [],
            images: product.images || [],
            dimensions: {
              width: product.dimensions?.width?.toString() || '',
              height: product.dimensions?.height?.toString() || '',
              depth: product.dimensions?.depth?.toString() || ''
            }
          })
          
          // Set categories and tags
          if (result.categories) {
            setCategories([...new Set([...defaultCategories, ...result.categories])])
          }
          if (result.tags) {
            setAvailableTags([...new Set([...defaultTags, ...result.tags])])
          }
        } else {
          toast.error(result.error || 'Failed to load product')
          router.push('/admin/products')
        }
      } catch (error) {
        console.error('Error loading product:', error)
        toast.error('An error occurred while loading the product')
        router.push('/admin/products')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProduct()
  }, [id, router])

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

  const addNewCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories(prev => [...prev, newCategory])
      setFormData(prev => ({ ...prev, category: newCategory }))
      setNewCategory('')
    }
  }

  const addNewTag = () => {
    if (newTagInput && !availableTags.includes(newTagInput)) {
      setAvailableTags(prev => [...prev, newTagInput])
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTagInput] }))
      setNewTagInput('')
    }
  }

  // Handle file upload to Cloudinary
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check file sizes
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
    }

    setUploadingImages(true)
    
    try {
      // Convert files to base64 for upload
      const base64Files: string[] = []
      
      for (const file of Array.from(files)) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        base64Files.push(base64)
      }
      
      // Upload to Cloudinary
      const result = await uploadMultipleToCloudinary(base64Files, 'products')
      
      if (result.success && result.urls) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...result.urls!]
        }))
        toast.success(`${result.urls.length} image(s) uploaded successfully`)
      } else {
        toast.error(result.errors?.[0] || 'Failed to upload images')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('An error occurred while uploading images')
    } finally {
      setUploadingImages(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Add image by URL
  const addImageByUrl = () => {
    if (imageUrl && !formData.images.includes(imageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }))
      setImageUrl('')
      setShowImageUrlInput(false)
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = formData.images[index]
    
    // Try to delete from Cloudinary if it's a Cloudinary URL
    if (imageToRemove.includes('cloudinary.com')) {
      try {
        await deleteFromCloudinary(imageToRemove)
      } catch (error) {
        console.error('Failed to delete from Cloudinary:', error)
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.slug || !formData.category || !formData.price || !formData.countInStock) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.images.length === 0) {
      toast.error('Please add at least one product image')
      return
    }

    setIsSaving(true)
    
    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        listPrice: formData.listPrice ? parseFloat(formData.listPrice) : undefined,
        countInStock: parseInt(formData.countInStock),
        isPublished: formData.isPublished,
        tags: formData.tags,
        sizes: formData.sizes,
        colors: formData.colors,
        images: formData.images,
        dimensions: {
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0,
          depth: parseFloat(formData.dimensions.depth) || 0
        }
      }

      const result = await updateProduct(id, productData)
      
      if (result.success) {
        toast.success('Product updated successfully!')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('An error occurred while updating the product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    
    try {
      const result = await deleteProduct(id)
      
      if (result.success) {
        toast.success('Product deleted successfully!')
        router.push('/admin/products')
      } else {
        toast.error(result.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('An error occurred while deleting the product')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <p className="text-muted-foreground">
              Update product details
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting || isSaving}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || isDeleting}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
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
                  Product name, description, and identifiers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="product-slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL-friendly identifier
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter product description..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload or add images for this product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                      <Image
                        src={image}
                        alt={`Product image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Upload Box */}
                  <div 
                    className={cn(
                      "aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2 transition-colors",
                      uploadingImages ? "cursor-wait opacity-50" : "cursor-pointer hover:border-primary"
                    )}
                    onClick={() => !uploadingImages && fileInputRef.current?.click()}
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload Image</span>
                        <span className="text-xs text-muted-foreground">PNG, JPG up to 10MB</span>
                      </>
                    )}
                  </div>
                  
                  {/* URL Input Box */}
                  {showImageUrlInput ? (
                    <div className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2 p-4">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="text-xs"
                      />
                      <div className="flex gap-2">
                        <Button type="button" size="sm" onClick={addImageByUrl}>
                          Add
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => {
                          setShowImageUrlInput(false)
                          setImageUrl('')
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setShowImageUrlInput(true)}
                    >
                      <LinkIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add by URL</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Variants</CardTitle>
                <CardDescription>
                  Add sizes and colors for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sizes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sizes</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.sizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-sm"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
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
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Colors</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.colors.map((color) => (
                      <span
                        key={color}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-sm"
                      >
                        {color}
                        <button
                          type="button"
                          onClick={() => removeColor(color)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
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
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card>
              <CardHeader>
                <CardTitle>Dimensions</CardTitle>
                <CardDescription>
                  Physical dimensions of the product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (cm)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
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
                      step="0.1"
                      placeholder="0"
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
                      step="0.1"
                      placeholder="0"
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
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Category <span className="text-red-500">*</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <div className="flex gap-2">
                  <Input
                    placeholder="New category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewCategory())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addNewCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm border transition-colors",
                        formData.tags.includes(tag)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-secondary"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="New tag"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTag())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addNewTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Price (AED) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Compare at Price (AED)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.listPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, listPrice: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Original price for showing discounts
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.countInStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, countInStock: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
