'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, User, Mail, Phone, MapPin, CreditCard, 
  Banknote, ChevronRight, ChevronLeft, Check, Loader2, Navigation,
  Home, Building2, Plus
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import ShippingAddressForm from '@/components/shared/shipping-address-form'
import { Address } from '@/types/supabase'

interface ReceiptData {
  fullName: string
  email: string
  phone: string
  address: {
    fullName: string
    street: string
    city: string
    emirate: string
    country: string
    lat?: number
    lng?: number
  } | null
  couponCode: string
  paymentMethod: 'CashOnDelivery' | 'Card'
}

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: ReceiptData) => void
  initialData: ReceiptData
  shippingCost: number
  isCalculatingShipping: boolean
  onAddressChange: (address: ReceiptData['address']) => void
  isAuthenticated: boolean
  userEmail?: string
  userName?: string
  savedAddresses?: Address[]
}

const steps = [
  { id: 1, title: 'Contact', icon: User },
  { id: 2, title: 'Delivery', icon: MapPin },
  { id: 3, title: 'Payment', icon: CreditCard },
]

export default function ReceiptModal({
  isOpen,
  onClose,
  onComplete,
  initialData,
  shippingCost,
  isCalculatingShipping,
  onAddressChange,
  isAuthenticated,
  userEmail,
  userName,
  savedAddresses = [],
}: ReceiptModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ReceiptData>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)

  // Sync with initialData when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData)
      setCurrentStep(1)
      setErrors({})
      setShowNewAddressForm(false)
    }
  }, [isOpen, initialData])

  // Auto-fill for authenticated users
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      setFormData(prev => ({
        ...prev,
        email: userEmail || prev.email,
        fullName: userName || prev.fullName,
      }))
    }
  }, [isAuthenticated, userEmail, userName, isOpen])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format'
      }
    }

    if (step === 2) {
      if (!formData.address) newErrors.address = 'Delivery address is required'
    }

    if (step === 3) {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1)
      } else {
        onComplete(formData)
        onClose()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleAddressSave = (address: {
    fullName: string
    street: string
    city: string
    emirate: string
    country: string
    lat?: number
    lng?: number
  }) => {
    setFormData(prev => ({ ...prev, address }))
    onAddressChange(address)
    setErrors(prev => ({ ...prev, address: '' }))
    setShowNewAddressForm(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#1B3022]">Complete Your Order</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F4F5F2] rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-[#5A6B5E]" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                        currentStep > step.id
                          ? 'bg-[#9DBE91] text-white'
                          : currentStep === step.id
                          ? 'bg-[#1B3022] text-white'
                          : 'bg-[#F4F5F2] text-[#5A6B5E]'
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-xs mt-2 font-medium',
                        currentStep >= step.id ? 'text-[#1B3022]' : 'text-[#5A6B5E]'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-0.5 mx-2 transition-colors duration-300',
                        currentStep > step.id ? 'bg-[#9DBE91]' : 'bg-[#E5E7EB]'
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {/* Step 1: Contact Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium text-[#1B3022] mb-1.5 block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A6B5E]" />
                      <Input
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter your full name"
                        className={cn(
                          'pl-10 h-12 rounded-xl',
                          errors.fullName && 'border-red-500 focus:border-red-500'
                        )}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#1B3022] mb-1.5 block">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A6B5E]" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="you@example.com"
                        className={cn(
                          'pl-10 h-12 rounded-xl',
                          errors.email && 'border-red-500 focus:border-red-500'
                        )}
                        disabled={isAuthenticated}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[#1B3022] mb-1.5 block">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A6B5E]" />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+971 50 123 4567"
                        className="pl-10 h-12 rounded-xl"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Delivery Address */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Shipping Cost Banner */}
                  <div className="flex items-center justify-between p-3 bg-[#9DBE91]/10 rounded-xl border border-[#9DBE91]/20">
                    <span className="text-sm text-[#1B3022]">Shipping Cost</span>
                    {isCalculatingShipping ? (
                      <span className="flex items-center gap-2 text-sm text-[#5A6B5E]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating...
                      </span>
                    ) : !formData.address ? (
                      <span className="text-sm text-[#5A6B5E]">Select address</span>
                    ) : (
                      <span className="font-semibold text-[#1B3022]">
                        {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                      </span>
                    )}
                  </div>

                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address}</p>
                  )}

                  {/* Show selected address */}
                  {formData.address && !showNewAddressForm ? (
                    <div className="p-4 bg-[#F9FAF7] border border-[#9DBE91] rounded-xl ring-2 ring-[#9DBE91]/20">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#9DBE91] flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1B3022]">{formData.address.fullName}</p>
                          <p className="text-sm text-[#5A6B5E] mt-0.5">{formData.address.street}</p>
                          <p className="text-sm text-[#5A6B5E]">
                            {formData.address.city}, {formData.address.emirate}
                          </p>
                          {formData.address.lat && formData.address.lng && (
                            <div className="flex items-center gap-1 mt-1.5 text-xs text-[#9DBE91]/70">
                              <Navigation className="w-3 h-3" />
                              <span>{formData.address.lat.toFixed(4)}°N, {formData.address.lng.toFixed(4)}°E</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, address: null }))}
                          className="text-sm text-[#9DBE91] hover:text-[#8AAE7E] font-medium"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  ) : showNewAddressForm ? (
                    /* New Address Form */
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-[#1B3022]">Add New Address</h4>
                        {savedAddresses.length > 0 && (
                          <button
                            onClick={() => setShowNewAddressForm(false)}
                            className="text-sm text-[#9DBE91] hover:text-[#8AAE7E] font-medium"
                          >
                            Back to Saved
                          </button>
                        )}
                      </div>
                      <ShippingAddressForm
                        onSave={handleAddressSave}
                        fullName={formData.fullName}
                      />
                    </div>
                  ) : isAuthenticated && savedAddresses.length > 0 ? (
                    /* Saved Addresses List for Authenticated Users */
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-[#1B3022]">Select a Delivery Address</h4>
                      
                      {savedAddresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => {
                            const selectedAddr = {
                              fullName: addr.full_name,
                              street: addr.street,
                              city: addr.city,
                              emirate: addr.emirate,
                              country: addr.country,
                              lat: addr.lat || undefined,
                              lng: addr.lng || undefined,
                            }
                            setFormData(prev => ({ ...prev, address: selectedAddr }))
                            onAddressChange(selectedAddr)
                          }}
                          className="w-full p-4 bg-[#F9FAF7] border border-[#E5E7EB] rounded-xl text-left hover:border-[#9DBE91]/40 hover:bg-[#9DBE91]/5 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                              addr.type === 'home' ? 'bg-blue-100' : addr.type === 'work' ? 'bg-amber-100' : 'bg-gray-100'
                            )}>
                              {addr.type === 'home' ? (
                                <Home className="w-4 h-4 text-blue-600" />
                              ) : addr.type === 'work' ? (
                                <Building2 className="w-4 h-4 text-amber-600" />
                              ) : (
                                <MapPin className="w-4 h-4 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-[#1B3022] text-sm">{addr.label}</p>
                                {addr.is_default && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#9DBE91]/20 text-[#9DBE91] rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#5A6B5E] mt-0.5">{addr.full_name}</p>
                              <p className="text-xs text-[#5A6B5E] truncate">{addr.street}</p>
                              <p className="text-xs text-[#5A6B5E]">{addr.city}, {addr.emirate}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                      
                      {/* Add New Address Button */}
                      <button
                        onClick={() => setShowNewAddressForm(true)}
                        className="w-full p-4 border-2 border-dashed border-[#E5E7EB] rounded-xl text-center hover:border-[#9DBE91]/40 hover:bg-[#9DBE91]/5 transition-all group"
                      >
                        <div className="flex items-center justify-center gap-2 text-[#5A6B5E] group-hover:text-[#9DBE91]">
                          <Plus className="w-5 h-5" />
                          <span className="text-sm font-medium">Add New Address</span>
                        </div>
                      </button>
                    </div>
                  ) : (
                    /* New Address Form for Guests or Users without Saved Addresses */
                    <div>
                      <ShippingAddressForm
                        onSave={handleAddressSave}
                        fullName={formData.fullName}
                      />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium text-[#1B3022] mb-3 block">
                      Payment Method *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Card' }))}
                        disabled
                        className="flex flex-col items-center justify-center p-4 border border-[#E5E7EB] rounded-xl opacity-50 cursor-not-allowed bg-[#F4F5F2]/30"
                      >
                        <CreditCard className="w-6 h-6 text-[#5A6B5E] mb-2" />
                        <span className="text-xs text-[#5A6B5E]">Card Payment</span>
                        <span className="text-[10px] text-[#5A6B5E]/70 mt-1">Coming Soon</span>
                      </button>

                      <button
                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'CashOnDelivery' }))}
                        className={cn(
                          'flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200',
                          formData.paymentMethod === 'CashOnDelivery'
                            ? 'border-[#9DBE91] bg-[#9DBE91]/5 ring-2 ring-[#9DBE91]/20'
                            : 'border-[#E5E7EB] hover:border-[#9DBE91]/40 hover:bg-[#F4F5F2]/30'
                        )}
                      >
                        <Banknote className={cn(
                          'w-6 h-6 mb-2',
                          formData.paymentMethod === 'CashOnDelivery' ? 'text-[#9DBE91]' : 'text-[#5A6B5E]'
                        )} />
                        <span className={cn(
                          'text-xs font-medium',
                          formData.paymentMethod === 'CashOnDelivery' ? 'text-[#9DBE91]' : 'text-[#5A6B5E]'
                        )}>
                          Cash on Delivery
                        </span>
                      </button>
                    </div>
                    {errors.paymentMethod && (
                      <p className="text-xs text-red-500 mt-2">{errors.paymentMethod}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-[#E5E7EB] bg-[#F9FAF7]">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
                  currentStep === 1
                    ? 'opacity-0 pointer-events-none'
                    : 'text-[#5A6B5E] hover:bg-[#F4F5F2]'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#9DBE91] text-white rounded-full text-sm font-medium hover:bg-[#8AAE7E] transition-colors btn-hover-lift"
              >
                {currentStep === 3 ? 'Complete Order' : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
