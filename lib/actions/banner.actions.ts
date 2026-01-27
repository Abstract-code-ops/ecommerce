'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Banner {
  id: string
  title: string
  image_url: string
  link_url?: string
  button_caption?: string
  is_active: boolean
  sort_order: number
}

export async function getBanners() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Error fetching banners (table might not exist yet):', error.message)
    return []
  }

  return data as Banner[]
}

export async function createBanner(prevState: any, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const image_url = formData.get('image_url') as string
  const link_url = formData.get('link_url') as string
  const button_caption = formData.get('button_caption') as string
  const is_active = formData.get('is_active') === 'on'
  const sort_order = parseInt(formData.get('sort_order') as string) || 0

  if (!image_url) {
    return { error: 'Image URL is required' }
  }

  const { error } = await supabase
    .from('banners')
    .insert({
      title,
      image_url,
      link_url,
      button_caption,
      is_active,
      sort_order
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/shop')
  revalidatePath('/admin/settings')
  return { success: true }
}

export async function deleteBanner(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/shop')
  revalidatePath('/admin/settings')
}

export async function toggleBannerStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('banners')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/shop')
  revalidatePath('/admin/settings')
}
