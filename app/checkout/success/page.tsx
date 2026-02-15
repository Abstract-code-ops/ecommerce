'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowRight, ShoppingBag, User, Loader2, Check 
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()
  
  const orderNumber = searchParams.get('orderNumber')
  const isGuest = searchParams.get('guest') === 'true'
  const guestEmail = searchParams.get('email')
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!orderNumber && mounted) router.push('/cart')
  }, [orderNumber, router, mounted])

  if (!mounted || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-6 h-6 animate-spin text-black" />
      </div>
    )
  }

  if (!orderNumber) return null

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <div className="max-w-2xl mx-auto px-6 py-20">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Check className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            Order <br /> Confirmed
          </h1>
          <p className="text-zinc-500 font-medium pt-2">
            Thank you for shopping with Global Edge.
          </p>
        </div>

        {/* Essential Info - Sharp & Minimal */}
        <div className="border-t border-b border-black py-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Order Number</p>
              <p className="text-lg sm:text-xl font-mono font-bold break-all">{orderNumber}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Confirmation Email</p>
              <p className="text-lg sm:text-xl font-bold break-all">{guestEmail || user?.email}</p>
            </div>
          </div>
        </div>

        {/* Status Messaging */}
        <div className="mb-16 space-y-6">
          <p className="text-lg leading-relaxed">
            Your order is being processed and will be shipped soon. 
            You will receive a shipping confirmation with a tracking number as soon as your package leaves our warehouse.
          </p>
          
          {isGuest && (
            <div className="pt-6 border-t border-zinc-100">
              <Link 
                href="/sign-up"
                className="group flex items-center gap-2 text-sm font-bold uppercase tracking-tighter hover:gap-4 transition-all link"
              >
                Create an account to track orders <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* The Next Steps Grid */}
        <div className="grid grid-cols-1 gap-px bg-zinc-200 border border-zinc-200 mb-16">
          {[
            { step: "01", title: "Processing", desc: "Verifying items and preparing packaging." },
            { step: "02", title: "Shipping", desc: "Handed over to our premium courier partners." },
            { step: "03", title: "Delivery", desc: "Estimated arrival in 3-5 business days." }
          ].map((item) => (
            <div key={item.step} className="bg-white p-6">
              <span className="text-[10px] font-bold text-zinc-400 block mb-2">{item.step}</span>
              <h3 className="font-black uppercase tracking-tight mb-1">{item.title}</h3>
              <p className="text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Area */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/shop"
            className="btn btn-primary btn-block text-sm font-bold uppercase tracking-widest py-5"
          >
            Continue Shopping
          </Link>
          
          {user ? (
            <Link 
              href="/profile/orders"
              className="w-full bg-white text-black border border-black text-center py-5 text-sm font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors"
            >
              View My Orders
            </Link>
          ) : (
            <Link 
              href="/"
              className="w-full bg-white text-black border border-black text-center py-5 text-sm font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors"
            >
              Back to Home
            </Link>
          )}
        </div>

        {/* Support Section */}
        <div className="mt-20 py-10 border-t border-zinc-100 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-4">
            Need Assistance?
          </p>
          <a 
            href="mailto:support@globaledgeshop.com" 
            className="text-base text-md md:text-2xl font-black uppercase tracking-tight sm:tracking-tighter hover:text-zinc-500 transition-colors underline underline-offset-8 break-all"
          >
            support@globaledgeshop.com
          </a>
        </div>
      </div>
    </div>
  )
}