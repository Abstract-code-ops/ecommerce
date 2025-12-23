'use client'
import AnimatedButton from "@/components/ui/animatedButton"
import { ShoppingCartIcon } from "lucide-react"
import Link from "next/link"
import useCartStore from "@/lib/hooks/useCartStore"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import ProfileDropdown from '@/components/ui/shadcn-studio/block/profile-dropdown'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

type MenuProps = {
  layout?: "desktop" | "mobile"
  onNavigate?: () => void
}

export default function Menu({ layout = "desktop", onNavigate }: MenuProps) {
  const { cart } = useCartStore()
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0)
  const isMobile = layout === "mobile"
  const { user, signOut } = useAuth()

  return (
    <div className={cn(isMobile ? "w-full" : "flex justify-end")}>
      <nav
        className={cn(
          "flex items-center gap-5 w-full",
          isMobile && "flex-col items-stretch gap-3 text-sm"
        )}
      >
        {user ? (
          // When logged in show profile dropdown (desktop) or full links (mobile)
          isMobile ? (
            <div className="w-full">
              <Link
                href="/profile"
                onClick={onNavigate}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium truncate">{user.user_metadata?.full_name || user.email}</div>
                  <div className="text-xs text-white/70 truncate">View profile</div>
                </div>
              </Link>
              <nav className="mt-2 space-y-2">
                <Link href="/profile" onClick={onNavigate} className="block px-3 py-2 rounded-md hover:bg-white/5">Account</Link>
                <Link href="/profile/orders" onClick={onNavigate} className="block px-3 py-2 rounded-md hover:bg-white/5">Orders</Link>
                <Link href="/profile/wallets" onClick={onNavigate} className="block px-3 py-2 rounded-md hover:bg-white/5">Wallet</Link>
                <button
                  onClick={async () => {
                    await signOut()
                    onNavigate?.()
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-white/5"
                >
                  Sign Out
                </button>
              </nav>
            </div>
          ) : (
            <div>
              <ProfileDropdown
                align="end"
                trigger={
                  <button className="rounded-full flex items-center gap-2 px-1 py-1 hover:bg-white/5">
                    <Avatar className="size-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png'} alt={user.user_metadata?.full_name || user.email || 'User'} />
                      <AvatarFallback>{user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                }
              />
            </div>
          )
        ) : (
          <>
            <div
              className={cn(
                "flex items-center gap-3",
                isMobile ? "w-full flex-col items-start" : ""
              )}
            >
              <span className={cn("text-sm", isMobile ? "text-white/80" : "text-white/70")}>
                Not signed in?
              </span>
              <Link
                href="/sign-up"
                className={cn(
                  "text-sm font-medium px-3 py-2 rounded-md transition-all",
                  "bg-secondary hover:bg-secondary/90 hover:text-white",
                  isMobile && "w-full text-center"
                )}
                onClick={onNavigate}
              >
                Sign Up
              </Link>
            </div>
            <Link
              href="/sign-in"
              onClick={onNavigate}
              className={cn(isMobile && "w-full")}
            >
              <AnimatedButton className={cn(isMobile && "w-full justify-center")}>
                Sign-In
              </AnimatedButton>
            </Link>
          </>
        )}
        <Link
          href="/cart"
          onClick={onNavigate}
          className={cn(
            "relative flex items-center justify-center",
            isMobile && "w-full gap-2 rounded-md border border-white/20 px-4 py-2"
          )}
        >
          <ShoppingCartIcon className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
          {isMobile && <span className="text-sm font-medium">View Cart</span>}
        </Link>
      </nav>
    </div>
  )
}