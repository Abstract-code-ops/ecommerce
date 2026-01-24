'use client'
import { ShoppingBag, User, LogIn, Heart, Shield } from "lucide-react"
import Link from "next/link"
import useCartStore from "@/lib/hooks/useCartStore"
import useWishlistStore from "@/lib/hooks/useWishlistStore"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import ProfileDropdown from '@/components/ui/shadcn-studio/block/profile-dropdown'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useState, useEffect } from 'react'

type MenuProps = {
  layout?: "desktop" | "mobile" | "mobile-cart-only"
  onNavigate?: () => void
}

export default function Menu({ layout = "desktop", onNavigate }: MenuProps) {
  const { cart } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0)
  const wishlistCount = mounted ? wishlistItems.length : 0
  const isMobile = layout === "mobile"
  const isMobileCartOnly = layout === "mobile-cart-only"
  const { user, signOut, isAdmin } = useAuth()
  
  // Animation state for cart badge
  const [cartBounce, setCartBounce] = useState(false)
  
  useEffect(() => {
    if (itemCount > 0) {
      setCartBounce(true)
      const timer = setTimeout(() => setCartBounce(false), 500)
      return () => clearTimeout(timer)
    }
  }, [itemCount])

  // Mobile cart only version
  if (isMobileCartOnly) {
    return (
      <Link
        href="/cart"
        onClick={onNavigate}
        className="relative p-2 hover:bg-muted rounded-full transition-colors duration-200"
      >
        <ShoppingBag className="w-5 h-5 text-foreground" />
        {itemCount > 0 && (
          <span className={cn(
            "absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
            cartBounce && "animate-cart-bounce"
          )}>
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Link>
    )
  }

  return (
    <div className={cn(isMobile ? "w-full" : "flex justify-end")}>
      <nav
        className={cn(
          "flex items-center gap-2 w-full",
          isMobile && "flex-col items-stretch gap-3"
        )}
      >
        {user ? (
          // When logged in show profile dropdown (desktop) or full links (mobile)
          isMobile ? (
            <div className="w-full space-y-4">
              {/* User Info Card */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage 
                    src={user.user_metadata?.avatar_url || undefined} 
                    alt={user.user_metadata?.full_name || user.email || 'User'} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || 'Welcome back'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              {/* Navigation Links */}
              <div className="space-y-1">
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    onClick={onNavigate} 
                    className="flex items-center gap-3 px-4 py-3 text-primary font-medium hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link 
                  href="/profile" 
                  onClick={onNavigate} 
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span>My Account</span>
                </Link>
                <Link 
                  href="/profile/orders" 
                  onClick={onNavigate} 
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                  <span>Orders</span>
                </Link>
                <Link 
                  href="/profile/wishlist" 
                  onClick={onNavigate} 
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="ml-auto bg-rose-100 text-rose-600 text-xs font-medium px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={async () => {
                  await signOut()
                  onNavigate?.()
                }}
                className="w-full px-4 py-3 text-left text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ProfileDropdown
                align="end"
                trigger={
                  <button className="p-1.5 hover:bg-muted rounded-full transition-colors duration-200">
                    <Avatar className="w-8 h-8 border border-border">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url || undefined} 
                        alt={user.user_metadata?.full_name || user.email || 'User'} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
            </div>
          )
        ) : (
          <>
            {isMobile ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground px-1">
                  Sign in to access your account
                </p>
                <div className="flex gap-3">
                  <Link
                    href="/sign-in"
                    onClick={onNavigate}
                    className="flex-1 btn btn-primary btn-soft text-center text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={onNavigate}
                    className="flex-1 btn btn-outline btn-soft text-center text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-full transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </>
        )}
        
        {/* Admin Button - Desktop (only for admins) */}
        {!isMobile && isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-all duration-200"
            title="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </Link>
        )}
        
        {/* Wishlist Button - Desktop */}
        {!isMobile && (
          <Link
            href="/profile/wishlist"
            onClick={onNavigate}
            className="relative p-2.5 hover:bg-muted rounded-full transition-colors duration-200 group"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 text-foreground group-hover:scale-105 transition-transform duration-200" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>
        )}
        
        {/* Cart Button - Desktop */}
        {!isMobile && (
          <Link
            href="/cart"
            onClick={onNavigate}
            className="relative p-2.5 hover:bg-muted rounded-full transition-colors duration-200 group"
          >
            <ShoppingBag className="w-5 h-5 text-foreground group-hover:scale-105 transition-transform duration-200" />
            {itemCount > 0 && (
              <span className={cn(
                "absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
                cartBounce && "animate-cart-bounce"
              )}>
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>
        )}
        
        {/* Cart Link - Mobile */}
        {isMobile && (
          <Link
            href="/cart"
            onClick={onNavigate}
            className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground rounded-lg mt-2"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">View Cart</span>
            </div>
            {itemCount > 0 && (
              <span className="bg-white/20 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </Link>
        )}
      </nav>
    </div>
  )
}