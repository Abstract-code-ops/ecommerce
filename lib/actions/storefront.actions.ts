'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CategoryImage {
  id: string
  name: string
  image_url: string
  link_url: string
  description: string
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface StorefrontSettings {
  id: string
  category_images: CategoryImage[]
  created_at?: string
  updated_at?: string
}

/**
 * Get all category images for the storefront
 */
export async function getCategoryImages(): Promise<CategoryImage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('category_images')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(3) // Only return top 3

  if (error) {
    console.warn('Error fetching category images (table might not exist yet):', error.message)
    return []
  }

  return data as CategoryImage[]
}

/**
 * Get all category images (including inactive) for admin
 */
export async function getAllCategoryImages(): Promise<CategoryImage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('category_images')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.warn('Error fetching category images:', error.message)
    return []
  }

  return data as CategoryImage[]
}

/**
 * Create or update a category image
 */
export async function upsertCategoryImage(
  categoryImage: Partial<CategoryImage>
): Promise<{ success: boolean; error?: string; data?: CategoryImage }> {
  const supabase = await createClient()

  if (!categoryImage.image_url || !categoryImage.name) {
    return { success: false, error: 'Name and image URL are required' }
  }

  const payload = {
    name: categoryImage.name,
    image_url: categoryImage.image_url,
    link_url: categoryImage.link_url || '',
    description: categoryImage.description || '',
    sort_order: categoryImage.sort_order ?? 0,
    is_active: categoryImage.is_active ?? true,
  }

  let result
  if (categoryImage.id) {
    // Update existing
    result = await supabase
      .from('category_images')
      .update(payload)
      .eq('id', categoryImage.id)
      .select()
      .single()
  } else {
    // Insert new
    result = await supabase
      .from('category_images')
      .insert(payload)
      .select()
      .single()
  }

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  revalidatePath('/shop')
  revalidatePath('/admin/settings')
  return { success: true, data: result.data as CategoryImage }
}

/**
 * Delete a category image
 */
export async function deleteCategoryImage(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('category_images')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/shop')
  revalidatePath('/admin/settings')
  return { success: true }
}

/**
 * Toggle category image active status
 */
export async function toggleCategoryImageStatus(
  id: string,
  currentStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('category_images')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/shop')
  revalidatePath('/admin/settings')
  return { success: true }
}
