'use client'
import React from 'react'
import { Button } from '../ui/button'
import { ChevronUp, Link } from 'lucide-react'
import { App_NAME } from '@/lib/constants'

const Footer = () => {
  return (
    <footer className="bg-primary text-white underline-link">
      <div className="w-full">
        <Button
          variant="ghost"
          className='bg-gray-800 w-full rounded-none'
          onClick={
            () => window.scrollTo({ top:0, behavior: 'smooth' })
          }
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          Back to top
        </Button>
      </div>
      <div className="p-4">
        <div className="flex justify-center gap-3 text-sm">
          <Link></Link>
          <Link></Link>
          <Link></Link>
        </div>
        <div className="flex justify-center text-sm">{`© ${new Date().getFullYear()} ${App_NAME}. All rights reserved.`}</div>
        <div className="mt-8 flex justify-center text-sm text-gray-400">
          Built with ❤️ by GMQG
        </div>
      </div>
    </footer>
  )
}

export default Footer