import { cn } from '@/lib/utils'
import React from 'react'

const Container = (
    { children, className }: {children: React.ReactNode, className?: string}
) => {
  return (
    <div className={cn("max-w-xl mx-auto px-10", className)}>
        {children}
    </div>
  )
}

export default Container