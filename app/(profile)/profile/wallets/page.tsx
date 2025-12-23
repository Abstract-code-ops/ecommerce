'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  CreditCard, Wallet, Clock, Bell
} from 'lucide-react'

export default function WalletsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Payment Methods</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your saved payment methods
        </p>
      </div>

      {/* Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 rounded-2xl p-8 md:p-12 text-center"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Wallet className="w-10 h-10 text-primary" />
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium mb-4">
          <Clock className="w-4 h-4" />
          Coming Soon
        </div>
        
        <h2 className="text-2xl font-bold mb-3">Digital Wallet Integration</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          We&apos;re working on adding secure payment methods including credit cards, 
          Apple Pay, and Google Pay. For now, you can use <strong>Cash on Delivery</strong> for all orders.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          {[
            { icon: CreditCard, label: 'Credit & Debit Cards', desc: 'Visa, Mastercard, Amex' },
            { icon: Wallet, label: 'Digital Wallets', desc: 'Apple Pay, Google Pay' },
            { icon: Bell, label: 'Auto-save Cards', desc: 'Quick checkout next time' },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-card border border-border/50 rounded-xl p-4 text-left"
            >
              <feature.icon className="w-6 h-6 text-muted-foreground mb-2" />
              <p className="font-medium text-sm">{feature.label}</p>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Current Option */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            <strong>💵 Cash on Delivery</strong> is currently available for all orders in the UAE.
          </p>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
