"use client"

import type { ReactNode } from 'react'

import { UserIcon, LogOutIcon, CreditCardIcon, ContainerIcon, Container, ShoppingBag } from 'lucide-react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'


type Props = {
  trigger: ReactNode
  defaultOpen?: boolean
  align?: 'start' | 'center' | 'end'
}

const ProfileDropdown = ({ trigger, defaultOpen, align = 'end' }: Props) => {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const displayName =
    user?.user_metadata?.full_name || user?.email || 'Account'
  const email = user?.email || ''
  const avatarSrc = user?.user_metadata?.avatar_url || 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png'

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger className='cursor-pointer' asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-80 px-4" align={align || 'end'}>
        <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
          <div className="relative">
            <Avatar className="size-10">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback>{(displayName || 'U').slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
          </div>
          <div className="flex flex-1 flex-col items-start">
            <span className="text-foreground text-lg font-semibold">{displayName}</span>
            <span className="text-muted-foreground text-base">{email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="px-4 py-2.5 text-base hover:bg-[#f7f7f7] cursor-pointer">
            <Link href="/profile">
              <UserIcon className="text-foreground size-5 mr-2" />
              <span>Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="px-4 py-2.5 text-base hover:bg-[#f7f7f7] cursor-pointer">
            <Link href="/profile/orders">
              <ShoppingBag className="text-foreground size-5 mr-2" />
              <span>Orders</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="px-4 py-2.5 text-base hover:bg-[#f7f7f7] cursor-pointer">
            <Link href="/profile/wallets">
              <CreditCardIcon className="text-foreground size-5 mr-2" />
              <span>Wallet</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="px-4 py-2.5 text-base hover:bg-[#f7f7f7] cursor-pointer"
          onSelect={async () => {
            await signOut()
            router.push('/')
          }}
        >
          <LogOutIcon className="size-5 mr-2" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileDropdown
