'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { getBanners, createBanner, deleteBanner, toggleBannerStatus, Banner } from '@/lib/actions/banner.actions'
import { Trash2, Plus, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { uploadToCloudinary } from '@/lib/actions/upload.actions'
import { toast } from 'react-toastify'

export default function BannersTab() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  
  // New banner state
  const [isAdding, setIsAdding] = useState(false)
  const [newBanner, setNewBanner] = useState({
    title: '',
    image_url: '',
    link_url: '',
    button_caption: 'Shop Now',
    is_active: true,
    sort_order: 0
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    try {
      const data = await getBanners()
      setBanners(data)
    } catch (error) {
      toast.error('Failed to load banners')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result as string
        const result = await uploadToCloudinary(base64, 'banners')
        
        if (result.success && result.url) {
          setNewBanner(prev => ({ ...prev, image_url: result.url! }))
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

  const handleCreate = async () => {
    if (!newBanner.image_url) {
      toast.error('Please upload an image')
      return
    }

    const formData = new FormData()
    formData.append('title', newBanner.title)
    formData.append('image_url', newBanner.image_url)
    formData.append('link_url', newBanner.link_url)
    formData.append('button_caption', newBanner.button_caption)
    formData.append('is_active', newBanner.is_active ? 'on' : 'off')
    formData.append('sort_order', newBanner.sort_order.toString())

    try {
      const result = await createBanner(null, formData)
      if (result.success) {
        toast.success('Banner created')
        setNewBanner({
          title: '',
          image_url: '',
          link_url: '',
          button_caption: 'Shop Now',
          is_active: true,
          sort_order: 0
        })
        setIsAdding(false)
        fetchBanners()
      } else {
        toast.error(result.error as string)
      }
    } catch (error) {
      toast.error('Failed to create banner')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    try {
      await deleteBanner(id)
      setBanners(prev => prev.filter(b => b.id !== id))
      toast.success('Banner deleted')
    } catch (error) {
      toast.error('Failed to delete banner')
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleBannerStatus(id, currentStatus)
      setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !currentStatus } : b))
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (isLoading) return <div>Loading banners...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Storefront Banners</h3>
          <p className="text-sm text-muted-foreground">Manage the carousel banners on the home page.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Banner
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>New Banner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title (Optional)</Label>
                <Input 
                  value={newBanner.title} 
                  onChange={e => setNewBanner({...newBanner, title: e.target.value})} 
                  placeholder="e.g. Summer Sale"
                />
              </div>
              <div className="space-y-2">
                <Label>Button Caption</Label>
                <Input 
                  value={newBanner.button_caption} 
                  onChange={e => setNewBanner({...newBanner, button_caption: e.target.value})} 
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input 
                  value={newBanner.link_url} 
                  onChange={e => setNewBanner({...newBanner, link_url: e.target.value})} 
                  placeholder="/shop/products?category=sale"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input 
                  type="number"
                  value={newBanner.sort_order} 
                  onChange={e => setNewBanner({...newBanner, sort_order: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-4">
                {newBanner.image_url ? (
                  <div className="relative w-40 h-24 rounded-md overflow-hidden border">
                    <Image src={newBanner.image_url} alt="Preview" fill className="object-cover" />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-1 right-1 w-6 h-6"
                      onClick={() => setNewBanner({...newBanner, image_url: ''})}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="w-40 h-24 rounded-md border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
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
                  Recommended size: 1920x600px. Max 5MB.
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={newBanner.is_active} 
                  onCheckedChange={c => setNewBanner({...newBanner, is_active: c})} 
                />
                <Label>Active</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate}>Save Banner</Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="flex items-center p-4 gap-4">
              <div className="cursor-move text-muted-foreground"><GripVertical className="w-5 h-5" /></div>
              <div className="relative w-32 h-20 rounded bg-muted flex-shrink-0">
                <Image src={banner.image_url} alt={banner.title} fill className="object-cover rounded" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{banner.title || 'Untitled Banner'}</h4>
                <p className="text-sm text-muted-foreground truncate">{banner.link_url}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${banner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    Order: {banner.sort_order}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <Switch 
                  checked={banner.is_active} 
                  onCheckedChange={() => handleToggle(banner.id, banner.is_active)} 
                />
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(banner.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {banners.length === 0 && !isAdding && (
          <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
            No banners found. Click "Add Banner" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
