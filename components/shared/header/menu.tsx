import AnimatedButton from "@/components/ui/animatedButton"
import { ShoppingCartIcon, UserIcon } from "lucide-react"
import Link from "next/link"

export default function Menu() {
  return (
    <div className="flex justify-end">
        <nav className="flex items-center gap-5 w-full">
                <h3 className="">
                  Not Signed in ? <Link href="/sign-up" className="hover:text-blue-600 hover:underline px-2">Sign Up</Link> </h3>
            <Link href="/sign-in">
                <AnimatedButton className="">Sign-In</AnimatedButton>
            </Link>
            <Link href="/cart">
                <ShoppingCartIcon className="h-6 w-6"/>
                {/* <span className="font-bold text-sm">Cart</span> */}
            </Link>
        </nav>
    </div>
  )
}