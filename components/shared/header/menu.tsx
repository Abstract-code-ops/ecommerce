'use client'
import AnimatedButton from "@/components/ui/animatedButton"
import { ShoppingCartIcon } from "lucide-react"
import Link from "next/link"
import useCartStore from "@/lib/hooks/useCartStore"
import { cn } from "@/lib/utils"

type MenuProps = {
  layout?: "desktop" | "mobile"
  onNavigate?: () => void
}

export default function Menu({ layout = "desktop", onNavigate }: MenuProps) {
  const { cart } = useCartStore()
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0)
  const isMobile = layout === "mobile"

  return (
    <div className={cn(isMobile ? "w-full" : "flex justify-end")}>
      <nav
        className={cn(
          "flex items-center gap-5 w-full",
          isMobile && "flex-col items-stretch gap-3 text-sm"
        )}
      >
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