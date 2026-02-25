'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  getAllCategoryImages,
  upsertCategoryImage,
  deleteCategoryImage,
  toggleCategoryImageStatus,
  CategoryImage,
} from '@/lib/actions/storefront.actions'
import { Trash2, Plus, Image as ImageIcon, Loader2, Edit, GripVertical } from 'lucide-react'
import Image from 'next/image'
import { uploadToCloudinary } from '@/lib/actions/upload.actions'
import { toast } from 'sonner'

export default function CategoryImagesTab() {
  const [categories, setCategories] = useState<CategoryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    image_url: '',
    link_url: '',
    description: '',
    sort_order: 0,
    is_active: true,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const data = await getAllCategoryImages()
      setCategories(data)
    } catch (error) {
      toast.error('Failed to load category images')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const result = await uploadToCloudinary(base64, 'categories')

        if (result.success && result.url) {
          setFormData((prev) => ({ ...prev, image_url: result.url! }))
          toast.success('Image uploaded successfully')
        } else {
          toast.error(result.error || 'Upload failed')
        }
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast.error('Error uploading image')
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.image_url || !formData.name) {
      toast.error('Please provide a name and upload an image')
      return
    }

    try {
      const result = await upsertCategoryImage(formData)
      if (result.success) {
        toast.success(editingId ? 'Category updated' : 'Category created')
        resetForm()
        fetchCategories()
      } else {
        toast.error(result.error || 'Failed to save category')
      }
    } catch (error) {
      toast.error('Error saving category')
    }
  }

  const handleEdit = (category: CategoryImage) => {
    setFormData({
      id: category.id,
      name: category.name,
      image_url: category.image_url,
      link_url: category.link_url,
      description: category.description,
      sort_order: category.sort_order,
      is_active: category.is_active,
    })
    setEditingId(category.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category image?')) return

    try {
      const result = await deleteCategoryImage(id)
      if (result.success) {
        toast.success('Category deleted')
        setCategories((prev) => prev.filter((c) => c.id !== id))
      } else {
        toast.error(result.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Error deleting category')
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const result = await toggleCategoryImageStatus(id, currentStatus)
      if (result.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
        )
        toast.success('Status updated')
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Error updating status')
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      image_url: '',
      link_url: '',
      description: '',
      sort_order: 0,
      is_active: true,
    })
    setEditingId(null)
  }

  if (isLoading) return <div>Loading category images...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Shop by Category Images</h3>
          <p className="text-sm text-muted-foreground">
            Manage the 3 category images displayed on the homepage. These are loaded from Cloudinary.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Category Image' : 'Add Category Image'}</CardTitle>
          <CardDescription>
            {categories.length >= 3 && !editingId
              ? 'You can have up to 3 category images. Edit or delete an existing one to add a new one.'
              : 'Upload an image from Cloudinary to display on the homepage.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Paper Bags"
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL *</Label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="/shop/products?category=Paper+Bags"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image *</Label>
            <div className="flex items-center gap-4">
              {formData.image_url ? (
                <div className="relative w-48 h-32 rounded-md overflow-hidden border">
                  <Image
                    src={formData.image_url}
                    alt="Preview"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="192px"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 w-6 h-6"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-48 h-32 rounded-md border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              )}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <div className="text-sm text-muted-foreground">
                Recommended size: 800x1000px (portrait). Max 5MB.
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={categories.length >= 3 && !editingId}>
              {editingId ? 'Update Category' : 'Add Category'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* List of Categories */}
      <div className="grid gap-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
            No category images found. Add up to 3 images to display on your homepage.
          </div>
        ) : (
          categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
              <div className="flex items-center p-4 gap-4">
                <div className="cursor-move text-muted-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="relative w-32 h-24 rounded bg-muted shrink-0">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover rounded"
                    loading="lazy"
                    sizes="128px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate">{category.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">{category.link_url}</p>
                  <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      Order: {category.sort_order}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={category.is_active}
                    onCheckedChange={() => handleToggle(category.id, category.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
