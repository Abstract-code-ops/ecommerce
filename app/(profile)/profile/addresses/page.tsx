'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { toast } from 'react-toastify'
import { 
  MapPin, Plus, Edit2, Trash2, Home, Building2, 
  Star, Check, Loader2, Navigation, X
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Import Supabase actions
import { 
  getAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from '@/lib/actions/address.actions'
import { Address, Address as SupabaseAddress } from '@/types/supabase'

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import('@/components/shared/map'), { ssr: false })

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman", 
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"
]

// Local address type for form handling (maps to Supabase Address)
type AddressFormData = {
  id?: string
  label: string
  type: 'home' | 'work' | 'other'
  fullName: string
  phone: string
  street: string
  city: string
  emirate: string
  country: string
  lat?: number | null
  lng?: number | null
  isDefault: boolean
}

// Helper to convert Supabase address to local format
const toLocalAddress = (addr: SupabaseAddress): AddressFormData => ({
  id: addr.id,
  label: addr.label,
  type: addr.type as 'home' | 'work' | 'other',
  fullName: addr.full_name,
  phone: addr.phone || '',
  street: addr.street,
  city: addr.city,
  emirate: addr.emirate,
  country: addr.country || 'UAE',
  lat: addr.lat,
  lng: addr.lng,
  isDefault: addr.is_default || false,
})

// Helper to convert local format to Supabase format
const toSupabaseAddress = (addr: AddressFormData) => ({
  label: addr.label,
  type: addr.type,
  full_name: addr.fullName,
  phone: addr.phone || null,
  street: addr.street,
  city: addr.city,
  emirate: addr.emirate,
  country: addr.country,
  lat: addr.lat || null,
  lng: addr.lng || null,
  is_default: addr.isDefault,
})

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressFormData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<AddressFormData | null>(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
    type: 'home',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    emirate: '',
    country: 'UAE',
    lat: null,
    lng: null,
    isDefault: false,
  })

  // Fetch addresses from Supabase on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      setIsLoading(true)
      try {
        const result = await getAddresses()
        if (result.success && result.data) {
          setAddresses(result.data.map(toLocalAddress))
        } else if (result.error) {
          // If not authenticated, show empty state (user needs to sign in)
          if (result.error === 'Not authenticated') {
            toast.info('Please sign in to view your addresses')
          } else {
            toast.error(result.error)
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error)
        toast.error('Failed to load addresses')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAddresses()
  }, [])

  const resetForm = () => {
    setFormData({
      label: '',
      type: 'home',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      emirate: '',
      country: 'UAE',
      lat: null,
      lng: null,
      isDefault: false,
    })
    setEditingAddress(null)
  }

  const openAddModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  const openEditModal = (address: AddressFormData) => {
    setEditingAddress(address)
    setFormData(address)
    setIsModalOpen(true)
  }

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }))
  }

  const handleSave = async () => {
    if (!formData.fullName || !formData.street || !formData.city || !formData.emirate) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSaving(true)
    try {
      const supabaseData = toSupabaseAddress(formData)
      
      if (editingAddress && editingAddress.id) {
        // Update existing address
        const result = await updateAddress(editingAddress.id, supabaseData)
        
        if (result.success && result.data) {
          const updatedAddress = toLocalAddress(result.data)
          setAddresses(prev => prev.map(addr => 
            addr.id === editingAddress.id 
              ? updatedAddress
              : formData.isDefault ? { ...addr, isDefault: false } : addr
          ))
          toast.success('Address updated successfully')
        } else {
          toast.error(result.error || 'Failed to update address')
          return
        }
      } else {
        // Create new address
        const result = await createAddress(supabaseData)
        
        if (result.success && result.data) {
          const newAddress = toLocalAddress(result.data)
          if (newAddress.isDefault) {
            setAddresses(prev => [...prev.map(a => ({ ...a, isDefault: false })), newAddress])
          } else {
            setAddresses(prev => [...prev, newAddress])
          }
          toast.success('Address added successfully')
        } else {
          toast.error(result.error || 'Failed to create address')
          return
        }
      }

      setIsModalOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to save address')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      const result = await deleteAddress(id)
      
      if (result.success) {
        setAddresses(prev => prev.filter(addr => addr.id !== id))
        toast.success('Address deleted')
      } else {
        toast.error(result.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('Failed to delete address')
    }
  }

  const handleSetAsDefault = async (id: string) => {
    try {
      const result = await setDefaultAddress(id)
      
      if (result.success) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: addr.id === id
        })))
        toast.success('Default address updated')
      } else {
        toast.error(result.error || 'Failed to set default address')
      }
    } catch (error) {
      console.error('Error setting default address:', error)
      toast.error('Failed to set default address')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return Home
      case 'work': return Building2
      default: return MapPin
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved Addresses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your delivery addresses for faster checkout
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : addresses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-dashed border-border rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">No addresses saved</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add your first address for faster checkout
          </p>
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {addresses.map((address, index) => {
              const TypeIcon = getTypeIcon(address.type)
              return (
                <motion.div
                  key={address.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative bg-card border rounded-2xl p-5 transition-all duration-200 hover:border-primary/30 ${
                    address.isDefault ? 'border-primary/50 ring-1 ring-primary/20' : 'border-border/50'
                  }`}
                >
                  {/* Default Badge */}
                  {address.isDefault && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" fill="currentColor" />
                      Default
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        address.type === 'home' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : address.type === 'work'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{address.label || address.type}</h3>
                        <p className="text-xs text-muted-foreground">{address.fullName}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(address)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id!)}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-1 text-sm text-muted-foreground mb-4">
                    <p>{address.street}</p>
                    <p>{address.city}, {address.emirate}</p>
                    <p>{address.country}</p>
                    {address.phone && <p className="text-foreground">{address.phone}</p>}
                  </div>

                  {/* Location Badge */}
                  {address.lat && address.lng && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mb-4">
                      <Navigation className="w-3 h-3" />
                      <span>Location saved</span>
                    </div>
                  )}

                  {/* Set as Default */}
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetAsDefault(address.id!)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Set as default
                    </button>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Address Type */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'home', label: 'Home', icon: Home },
                { type: 'work', label: 'Work', icon: Building2 },
                { type: 'other', label: 'Other', icon: MapPin },
              ].map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type as Address['type'], label }))}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.type === type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="John Doe"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Phone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+971 50 123 4567"
              />
            </div>

            {/* Street Address */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Street Address *</label>
              <Input
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                placeholder="123 Main St, Apt 4B"
              />
            </div>

            {/* City & Emirate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">City *</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Dubai Marina"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Emirate *</label>
                <Select
                  value={formData.emirate}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, emirate: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select emirate" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map(emirate => (
                      <SelectItem key={emirate} value={emirate}>{emirate}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Map Button */}
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {formData.lat && formData.lng ? 'Update location on map' : 'Pin location on map'}
              </span>
              {formData.lat && formData.lng && (
                <Check className="w-4 h-4 text-emerald-500 ml-1" />
              )}
            </button>

            {/* Default Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">Set as default address</span>
            </label>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {editingAddress ? 'Update' : 'Save'} Address
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Map Modal */}
      <Modal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Select Location</h2>
            <button
              onClick={() => setIsMapOpen(false)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-[400px] rounded-xl overflow-hidden border border-border">
            <Map onLocationSelect={handleLocationSelect} />
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsMapOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => setIsMapOpen(false)}
            >
              Confirm Location
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
