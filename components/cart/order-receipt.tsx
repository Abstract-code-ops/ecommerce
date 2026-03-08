'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Tag, Truck, 
  Edit3, FileText, Check, Receipt
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

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

interface OrderReceiptProps {
  receiptData: ReceiptData
  subtotal: number
  shippingCost: number
  discount: number
  total: number
  itemCount: number
  isComplete: boolean
  onEditClick: () => void
  isCalculatingShipping?: boolean
}

export default function OrderReceipt({
  receiptData,
  subtotal,
  shippingCost,
  discount,
  total,
  itemCount,
  isComplete,
  onEditClick,
  isCalculatingShipping,
}: OrderReceiptProps) {
  const hasData = receiptData.fullName || receiptData.email || receiptData.address

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden"
    >
      {/* Receipt Header */}
      <div className="bg-[#1B3022] text-white px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-5 h-5" />
            <h3 className="font-semibold">Order Receipt</h3>
          </div>
          <span className="text-xs text-white/60 font-mono">
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Receipt Body */}
      <div className="p-5">
        {!hasData ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F4F5F2] flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#5A6B5E]/50" />
            </div>
            <p className="text-[#5A6B5E] mb-4">
              Complete your order details to see your receipt
            </p>
            <button
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#9DBE91] text-white rounded-full font-medium hover:bg-[#8AAE7E] transition-colors btn-hover-lift"
            >
              <Edit3 className="w-4 h-4" />
              Fill the Receipt
            </button>
          </motion.div>
        ) : (
          /* Filled Receipt */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Customer Info Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6B5E] uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                Customer Details
              </div>
              
              <div className="pl-5 space-y-2 text-sm">
                {receiptData.fullName && (
                  <div className="flex items-start gap-3">
                    <span className="text-[#5A6B5E] w-16 shrink-0">Name</span>
                    <span className="text-[#1B3022] font-medium">{receiptData.fullName}</span>
                  </div>
                )}
                {receiptData.email && (
                  <div className="flex items-start gap-3">
                    <span className="text-[#5A6B5E] w-16 shrink-0">Email</span>
                    <span className="text-[#1B3022]">{receiptData.email}</span>
                  </div>
                )}
                {receiptData.phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-[#5A6B5E] w-16 shrink-0">Phone</span>
                    <span className="text-[#1B3022]">{receiptData.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-[#E5E7EB]" />

            {/* Delivery Address */}
            {receiptData.address && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6B5E] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    Delivery Address
                  </div>
                  
                  <div className="pl-5 text-sm">
                    <p className="text-[#1B3022] font-medium">{receiptData.address.fullName}</p>
                    <p className="text-[#5A6B5E]">{receiptData.address.street}</p>
                    <p className="text-[#5A6B5E]">
                      {receiptData.address.city}, {receiptData.address.emirate}
                    </p>
                    <p className="text-[#5A6B5E]">{receiptData.address.country}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-[#E5E7EB]" />
              </>
            )}

            {/* Order Summary */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5A6B5E] uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                Order Summary
              </div>
              
              <div className="pl-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5A6B5E]">Subtotal ({itemCount} items)</span>
                  <span className="text-[#1B3022]">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-[#5A6B5E] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    Shipping
                  </span>
                  {isCalculatingShipping ? (
                    <span className="text-[#5A6B5E]">Calculating...</span>
                  ) : !receiptData.address ? (
                    <span className="text-[#5A6B5E]">Select address</span>
                  ) : (
                    <span className="text-[#1B3022]">
                      {shippingCost === 0 ? 'Free' : formatCurrency(shippingCost)}
                    </span>
                  )}
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#9DBE91]">Discount</span>
                    <span className="text-[#9DBE91]">-{formatCurrency(discount)}</span>
                  </div>
                )}

                {receiptData.couponCode && (
                  <div className="flex justify-between">
                    <span className="text-[#5A6B5E]">Coupon</span>
                    <span className="text-[#9DBE91] font-mono text-xs bg-[#9DBE91]/10 px-2 py-0.5 rounded">
                      {receiptData.couponCode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E5E7EB]" />

            {/* Total */}
            <div className="flex justify-between items-center py-2">
              <span className="font-semibold text-lg text-[#1B3022]">Total</span>
              <span className="font-bold text-2xl text-[#1B3022]">{formatCurrency(total)}</span>
            </div>

            {/* Payment Method */}
            {receiptData.paymentMethod && (
              <div className="flex items-center gap-2 text-xs text-[#5A6B5E] bg-[#F4F5F2] px-3 py-2 rounded-lg">
                <Check className="w-3.5 h-3.5 text-[#9DBE91]" />
                Payment: {receiptData.paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Card'}
              </div>
            )}

            {/* Edit Button */}
            <button
              onClick={onEditClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-full text-sm font-medium text-[#5A6B5E] hover:bg-[#F4F5F2] hover:border-[#9DBE91] transition-all duration-200"
            >
              <Edit3 className="w-4 h-4" />
              Edit Receipt
            </button>
          </motion.div>
        )}
      </div>

      {/* Receipt Footer - decorative */}
      <div className="h-4 bg-[#F9FAF7] border-t border-[#E5E7EB] relative overflow-hidden">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='16' viewBox='0 0 20 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 16h20L10 0 0 16z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '20px 16px',
          }}
        />
      </div>
    </motion.div>
  )
}
