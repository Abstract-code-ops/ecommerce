'use server'

import cloudinary, { getPublicIdFromUrl } from '@/lib/cloudinary'
import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAILS = ['support@globaledgeshop.com']

async function isAdminUser(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  return ADMIN_EMAILS.includes(user.email || '') ||
         user.user_metadata?.role === 'admin' ||
         user.app_metadata?.role === 'admin'
}

export async function uploadToCloudinary(
  base64Image: string,
  folder: string = 'products'
): Promise<{ success: boolean; url?: string; publicId?: string; error?: string }> {
  try {
    // Check admin authorization
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validate base64 string
    if (!base64Image || !base64Image.startsWith('data:image')) {
      return { success: false, error: 'Invalid image data' }
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: `ecommerce/${folder}`,
      resource_type: 'image',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return { success: false, error: 'Failed to upload image' }
  }
}

export async function uploadMultipleToCloudinary(
  base64Images: string[],
  folder: string = 'products'
): Promise<{ success: boolean; urls?: string[]; errors?: string[] }> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, errors: ['Unauthorized'] }
    }

    const uploadPromises = base64Images.map(async (base64Image, index) => {
      try {
        if (!base64Image.startsWith('data:image')) {
          // It's already a URL, just return it
          return { success: true, url: base64Image }
        }

        const result = await cloudinary.uploader.upload(base64Image, {
          folder: `ecommerce/${folder}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        })

        return { success: true, url: result.secure_url }
      } catch (err) {
        console.error(`Failed to upload image ${index}:`, err)
        return { success: false, error: `Image ${index + 1} failed to upload` }
      }
    })

    const results = await Promise.all(uploadPromises)
    
    const urls = results.filter(r => r.success && r.url).map(r => r.url!)
    const errors = results.filter(r => !r.success && r.error).map(r => r.error!)

    return {
      success: errors.length === 0,
      urls,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Cloudinary batch upload error:', error)
    return { success: false, errors: ['Failed to upload images'] }
  }
}

export async function deleteFromCloudinary(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const publicId = getPublicIdFromUrl(imageUrl)
    if (!publicId) {
      return { success: false, error: 'Invalid image URL' }
    }

    await cloudinary.uploader.destroy(publicId)
    
    return { success: true }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return { success: false, error: 'Failed to delete image' }
  }
}

export async function deleteMultipleFromCloudinary(
  imageUrls: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const isAdmin = await isAdminUser()
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized' }
    }

    const publicIds = imageUrls
      .map(url => getPublicIdFromUrl(url))
      .filter((id): id is string => id !== null)

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Cloudinary batch delete error:', error)
    return { success: false, error: 'Failed to delete images' }
  }
}
