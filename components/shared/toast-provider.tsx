'use client'

import { Toaster } from 'sonner'

export default function ToastProvider() {
  return (
    <Toaster 
      position="bottom-right"
      duration={3000}
      closeButton
      richColors
      toastOptions={{
        className: 'mt-16',
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          color: '#1f2937',
        },
      }}
    />
  )
}
