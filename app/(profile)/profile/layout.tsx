'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, MapPin, CreditCard, Package, 
  Settings, LogOut, ChevronRight, ShoppingBag, RotateCcw
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'
import Header from '@/components/shared/header'

const sidebarItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/profile/addresses', label: 'Addresses', icon: MapPin },
  { href: '/profile/wallets', label: 'Wallets', icon: CreditCard },
  { href: '/profile/orders', label: 'Orders', icon: Package },
  { href: '/profile/returns', label: 'Returns', icon: RotateCcw },
  { href: '/profile/settings', label: 'Settings', icon: Settings },
]

export default function ProfileLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { user, signOut, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Content */}

      <div className="max-w-6xl mx-auto px-4 py-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-card border border-border/50 rounded-2xl p-4 lg:sticky lg:top-24">
              {/* User Info */}
              <div className="flex items-center gap-3 p-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">
                    {user?.user_metadata?.full_name || 'User'}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href !== '/profile' && pathname.startsWith(item.href))
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                        isActive 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </Link>
                  )
                })}

                {/* Sign Out */}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}