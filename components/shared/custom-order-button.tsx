'use client'

import { useState } from 'react'
import { Package, X, Loader2, Upload, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'
import { submitCustomOrder, CustomOrderInput } from '@/lib/actions/custom-order.actions'

interface CustomOrderButtonProps {
  variant?: 'floating' | 'inline' | 'header'
  className?: string
}

const productTypes = [
  { value: 'paper_bags', label: 'Paper Bags' },
  { value: 'gift_boxes', label: 'Gift Boxes' },
  { value: 'packaging', label: 'Custom Packaging' },
  { value: 'other', label: 'Other' },
] as const

const quantityRanges = [
  { value: '100-500', label: '100 - 500 units' },
  { value: '500-1000', label: '500 - 1,000 units' },
  { value: '1000-5000', label: '1,000 - 5,000 units' },
  { value: '5000+', label: '5,000+ units' },
] as const

export default function CustomOrderButton({ variant = 'floating', className }: CustomOrderButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    productType: '' as CustomOrderInput['productType'] | '',
    quantityRange: '' as CustomOrderInput['quantityRange'] | '',
    description: '',
    budgetRange: '',
    timeline: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    if (!formData.productType || !formData.quantityRange) {
      setStatus('error')
      setErrorMessage('Please select product type and quantity')
      return
    }

    const result = await submitCustomOrder({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company || undefined,
      productType: formData.productType as CustomOrderInput['productType'],
      quantityRange: formData.quantityRange as CustomOrderInput['quantityRange'],
      description: formData.description,
      budgetRange: formData.budgetRange || undefined,
      timeline: formData.timeline || undefined,
    })

    if (result.success) {
      setStatus('success')
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsOpen(false)
        setStatus('idle')
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          productType: '',
          quantityRange: '',
          description: '',
          budgetRange: '',
          timeline: '',
        })
      }, 8000)
    } else {
      setStatus('error')
      setErrorMessage(result.error || 'Failed to submit request')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Button styles based on variant
  const buttonStyles = {
    floating: "fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-[#1B3022] to-[#2a4633] text-white px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 font-semibold group",
    inline: "inline-flex items-center gap-2 bg-[#1B3022] text-white px-6 py-3 rounded-full hover:bg-[#2a4633] transition-colors font-medium",
    header: "flex items-center gap-2 bg-[#9DBE91] text-white px-4 py-2 rounded-full hover:bg-[#8AAE7E] transition-colors text-sm font-medium",
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(buttonStyles[variant], className)}
      >
        <Package className={cn(
          "w-5 h-5",
          variant === 'floating' && "group-hover:rotate-12 transition-transform"
        )} />
        <span>Custom Order</span>
        {variant === 'floating' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#9DBE91] rounded-full animate-pulse" />
        )}
      </button>

      {/* Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => status !== 'loading' && setIsOpen(false)}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-[#1B3022]">Custom Order Request</h2>
                <p className="text-sm text-[#5A6B5E]">Tell us about your packaging needs</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                disabled={status === 'loading'}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {status === 'success' ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#9DBE91]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#9DBE91]" />
                </div>
                <h3 className="text-xl font-bold text-[#1B3022] mb-2">Request Submitted!</h3>
                <p className="text-[#5A6B5E]">
                  Thank you! Our team will review your request and get back to you within 1-2 business days.
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#1B3022]">Contact Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                        Phone (UAE) *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all"
                        placeholder="+971 5X XXX XXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all"
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#1B3022]">Product Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                        Product Type *
                      </label>
                      <select
                        name="productType"
                        value={formData.productType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all bg-white"
                      >
                        <option value="">Select type</option>
                        {productTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                        Quantity *
                      </label>
                      <select
                        name="quantityRange"
                        value={formData.quantityRange}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all bg-white"
                      >
                        <option value="">Select quantity</option>
                        {quantityRanges.map(range => (
                          <option key={range.value} value={range.value}>{range.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                        Budget Range (Optional)
                      </label>
                      <input
                        type="text"
                        name="budgetRange"
                        value={formData.budgetRange}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all"
                        placeholder="e.g., AED 5,000 - 10,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#5A6B5E] mb-1">Timeline (Optional)</label>
                      <input
                        type="text"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all"
                        placeholder="e.g., 2 weeks, 1 month"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#5A6B5E] mb-1">
                      Describe Your Requirements *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] transition-all resize-none"
                      placeholder="Describe the size, colors, materials, printing requirements, etc."
                    />
                  </div>
                </div>

                {/* Error Message */}
                {status === 'error' && errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={status === 'loading'}
                    className="px-6 py-3 text-[#5A6B5E] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-3 bg-[#1B3022] text-white rounded-lg hover:bg-[#2a4633] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>, document.body)
      }
    </>
  )
}
