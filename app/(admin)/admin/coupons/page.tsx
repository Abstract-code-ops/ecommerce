'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  Check, 
  X, 
  QrCode,
  Download,
  Loader2,
  RefreshCw,
  Calendar,
  Percent,
  DollarSign,
  Tag
} from 'lucide-react'
import { 
  getCoupons, 
  createCoupon, 
  deleteCoupon, 
  toggleCouponStatus,
  generateCouponCode,
  Coupon,
  CouponInput
} from '@/lib/actions/coupon.actions'
import { cn } from '@/lib/utils'

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBarcodeModal, setShowBarcodeModal] = useState<Coupon | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  
  const loadCoupons = async () => {
    setLoading(true)
    const result = await getCoupons()
    if (result.success && result.data) {
      setCoupons(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    
    const result = await deleteCoupon(id)
    if (result.success) {
      setCoupons(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleToggleStatus = async (id: string) => {
    const result = await toggleCouponStatus(id)
    if (result.success) {
      setCoupons(prev => prev.map(c => 
        c.id === id ? { ...c, is_active: !c.is_active } : c
      ))
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCoupons}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#1B3022] text-white px-4 py-2 rounded-lg hover:bg-[#2a4633] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Coupons</p>
              <p className="text-xl font-bold">{coupons.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-xl font-bold">{coupons.filter(c => c.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Percentage</p>
              <p className="text-xl font-bold">{coupons.filter(c => c.discount_type === 'percentage').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fixed Amount</p>
              <p className="text-xl font-bold">{coupons.filter(c => c.discount_type === 'fixed').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No coupons created yet. Click &quot;Create Coupon&quot; to get started.
                  </td>
                </tr>
              ) : (
                coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-semibold">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-gray-500 mt-1">{coupon.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}%` 
                          : `AED ${coupon.discount_value}`}
                      </span>
                      {coupon.min_order_amount > 0 && (
                        <p className="text-xs text-gray-500">
                          Min: AED {coupon.min_order_amount}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {coupon.times_used}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(coupon.expires_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(coupon.id)}
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium transition-colors",
                          coupon.is_active 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowBarcodeModal(coupon)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Generate Barcode"
                        >
                          <QrCode className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateCouponModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadCoupons()
          }}
        />
      )}

      {/* Barcode Modal */}
      {showBarcodeModal && (
        <BarcodeModal
          coupon={showBarcodeModal}
          onClose={() => setShowBarcodeModal(null)}
        />
      )}
    </div>
  )
}

// Create Coupon Modal Component
function CreateCouponModal({
  onClose,
  onSuccess
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    expiresAt: '',
  })

  const handleGenerateCode = async () => {
    const code = await generateCouponCode('GE', 6)
    setFormData(prev => ({
      ...prev,
      code
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createCoupon({
      code: formData.code,
      description: formData.description || undefined,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : undefined,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : undefined,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      expiresAt: formData.expiresAt || undefined,
    })

    if (result.success) {
      onSuccess()
    } else {
      setError(result.error || 'Failed to create coupon')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Create Coupon</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  code: e.target.value.toUpperCase().replace(/\s/g, '') 
                }))}
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
                placeholder="e.g., SAVE20"
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
              placeholder="e.g., Summer sale discount"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  discountType: e.target.value as 'percentage' | 'fixed' 
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91] bg-white"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (AED)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
                placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
              />
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Order Amount (AED)
              </label>
              <input
                type="number"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Discount (AED)
              </label>
              <input
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: e.target.value }))}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
                placeholder="No limit"
              />
            </div>
          </div>

          {/* Usage Limit & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit
              </label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9DBE91]/30 focus:border-[#9DBE91]"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#1B3022] text-white rounded-lg hover:bg-[#2a4633] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Barcode Modal Component
function BarcodeModal({
  coupon,
  onClose
}: {
  coupon: Coupon
  onClose: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrGenerated, setQrGenerated] = useState(false)

  useEffect(() => {
    // Generate QR code using canvas
    const generateQR = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Create QR code URL that redirects to the coupon page
      const couponUrl = `${window.location.origin}/coupon/${coupon.code}`
      
      // Simple QR code generation using a free API
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(couponUrl)}`
      
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        canvas.width = 350
        canvas.height = 450
        
        // Background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Brand header
        ctx.fillStyle = '#1B3022'
        ctx.fillRect(0, 0, canvas.width, 60)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 20px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('GLOBAL EDGE', canvas.width / 2, 38)
        
        // QR Code
        ctx.drawImage(img, 25, 80, 300, 300)
        
        // Coupon code
        ctx.fillStyle = '#1B3022'
        ctx.font = 'bold 24px monospace'
        ctx.fillText(coupon.code, canvas.width / 2, 410)
        
        // Discount info
        ctx.fillStyle = '#666666'
        ctx.font = '14px sans-serif'
        const discountText = coupon.discount_type === 'percentage' 
          ? `${coupon.discount_value}% OFF` 
          : `AED ${coupon.discount_value} OFF`
        ctx.fillText(discountText, canvas.width / 2, 435)

        setQrGenerated(true)
      }
      img.src = qrApiUrl
    }

    generateQR()
  }, [coupon])

  const downloadBarcode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `coupon-${coupon.code}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const copyUrl = () => {
    const couponUrl = `${window.location.origin}/coupon/${coupon.code}`
    navigator.clipboard.writeText(couponUrl)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Coupon QR Code</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center">
          <canvas 
            ref={canvasRef} 
            className="border border-gray-200 rounded-lg shadow-sm"
          />

          <div className="mt-6 flex gap-3 w-full">
            <button
              onClick={downloadBarcode}
              disabled={!qrGenerated}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#1B3022] text-white rounded-lg hover:bg-[#2a4633] transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={copyUrl}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Scan this QR code to apply the coupon automatically
          </p>
        </div>
      </div>
    </div>
  )
}
