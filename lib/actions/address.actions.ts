'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  Address, 
  AddressInsert, 
  AddressUpdate 
} from '@/types/supabase'
import { revalidatePath } from 'next/cache'

// =============================================================================
// ADDRESS ACTIONS
// =============================================================================

/**
 * Get all addresses for the current user
 */
export async function getAddresses(): Promise<{
  success: boolean
  data?: Address[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching addresses:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Address[] }
  } catch (error) {
    console.error('Error in getAddresses:', error)
    return { success: false, error: 'Failed to fetch addresses' }
  }
}

/**
 * Get a single address by ID
 */
export async function getAddressById(id: string): Promise<{
  success: boolean
  data?: Address
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching address:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Address }
  } catch (error) {
    console.error('Error in getAddressById:', error)
    return { success: false, error: 'Failed to fetch address' }
  }
}

/**
 * Get the default address for the current user
 */
export async function getDefaultAddress(): Promise<{
  success: boolean
  data?: Address | null
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .maybeSingle()

    if (error) {
      console.error('Error fetching default address:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data as Address | null }
  } catch (error) {
    console.error('Error in getDefaultAddress:', error)
    return { success: false, error: 'Failed to fetch default address' }
  }
}

/**
 * Create a new address
 */
export async function createAddress(
  address: Omit<AddressInsert, 'user_id'>
): Promise<{
  success: boolean
  data?: Address
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        ...address,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/profile/addresses')
    return { success: true, data: data as Address }
  } catch (error) {
    console.error('Error in createAddress:', error)
    return { success: false, error: 'Failed to create address' }
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(
  id: string,
  address: AddressUpdate
): Promise<{
  success: boolean
  data?: Address
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
      .from('addresses')
      .update(address)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/profile/addresses')
    return { success: true, data: data as Address }
  } catch (error) {
    console.error('Error in updateAddress:', error)
    return { success: false, error: 'Failed to update address' }
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting address:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/profile/addresses')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteAddress:', error)
    return { success: false, error: 'Failed to delete address' }
  }
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // The database trigger will automatically unset other defaults
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error setting default address:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/profile/addresses')
    return { success: true }
  } catch (error) {
    console.error('Error in setDefaultAddress:', error)
    return { success: false, error: 'Failed to set default address' }
  }
}
