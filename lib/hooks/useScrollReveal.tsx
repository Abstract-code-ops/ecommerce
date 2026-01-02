'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true } = options
  const ref = useRef<T>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsRevealed(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isRevealed }
}

// Hook for staggered children animation
export function useStaggeredReveal<T extends HTMLElement = HTMLDivElement>(
  childCount: number,
  options: ScrollRevealOptions & { staggerDelay?: number } = {}
) {
  const { staggerDelay = 100, ...scrollOptions } = options
  const { ref, isRevealed } = useScrollReveal<T>(scrollOptions)

  const getChildDelay = useCallback(
    (index: number) => ({
      animationDelay: `${index * staggerDelay}ms`,
      transitionDelay: `${index * staggerDelay}ms`,
    }),
    [staggerDelay]
  )

  return { ref, isRevealed, getChildDelay }
}

// Hook for parallax scrolling effect
export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.scrollY
      const elementTop = rect.top + scrolled
      const viewportHeight = window.innerHeight
      
      // Calculate parallax offset based on element position
      const relativeScroll = scrolled - elementTop + viewportHeight
      setOffset(relativeScroll * speed)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return { ref, offset }
}

// Component wrapper for scroll reveal
export function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  ...options
}: {
  children: React.ReactNode
  className?: string
  animation?: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'fade'
  delay?: number
  duration?: number
} & ScrollRevealOptions) {
  const { ref, isRevealed } = useScrollReveal<HTMLDivElement>(options)

  const animationClasses = {
    'fade-up': 'scroll-reveal',
    'fade-down': 'scroll-reveal-down',
    'fade-left': 'scroll-reveal-left',
    'fade-right': 'scroll-reveal-right',
    'scale': 'scroll-reveal-scale',
    'fade': 'scroll-reveal-fade',
  }

  return (
    <div
      ref={ref}
      className={`${animationClasses[animation]} ${isRevealed ? 'revealed' : ''} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  )
}
