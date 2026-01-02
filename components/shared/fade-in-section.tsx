'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FadeInSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  threshold?: number
}

export default function FadeInSection({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 700,
  threshold = 0.1
}: FadeInSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold, rootMargin: '50px' }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(30px)'
      case 'down': return 'translateY(-30px)'
      case 'left': return 'translateX(30px)'
      case 'right': return 'translateX(-30px)'
      case 'none': return 'none'
      default: return 'translateY(30px)'
    }
  }

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
