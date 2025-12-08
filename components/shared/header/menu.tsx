'use client'
import AnimatedButton from "@/components/ui/animatedButton"
import { ShoppingCartIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import useCartStore from "@/lib/hooks/useCartStore"

export default function Menu() {
  const { cart } = useCartStore();
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex justify-end">
        <nav className="flex items-center gap-5 w-full">
                <h3 className="">
                  Not Signed in ? <Link href="/sign-up" className="hover:text-blue-600 hover:underline px-2">Sign Up</Link> </h3>
            <Link href="/sign-in">
                <AnimatedButton className="">Sign-In</AnimatedButton>
            </Link>
            <Link href="/cart" className="relative">
                <ShoppingCartIcon className="h-6 w-6"/>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
            </Link>
        </nav>
    </div>
  )
}