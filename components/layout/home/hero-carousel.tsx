'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroCarouselProps {
  items: {
    title?: string
    buttonCaption?: string
    imageUrl: string
    href: string
    isPublished?: boolean
  }[]
}

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const publishedItems = items.filter(item => item.isPublished !== false)

  const goToSlide = useCallback((index: number, dir: 'left' | 'right' = 'right') => {
    if (isAnimating) return
    setIsAnimating(true)
    setDirection(dir)
    setCurrentIndex(index)
    setTimeout(() => setIsAnimating(false), 600)
  }, [isAnimating])

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex === 0 ? publishedItems.length - 1 : currentIndex - 1
    goToSlide(newIndex, 'left')
  }, [currentIndex, publishedItems.length, goToSlide])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === publishedItems.length - 1 ? 0 : currentIndex + 1
    goToSlide(newIndex, 'right')
  }, [currentIndex, publishedItems.length, goToSlide])

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(goToNext, 6000)
    return () => clearInterval(timer)
  }, [goToNext])

  if (publishedItems.length === 0) return null

  const currentItem = publishedItems[currentIndex]

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] lg:h-[85vh] overflow-hidden bg-muted">
      {/* Slides */}
      {publishedItems.map((item, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-all duration-700 ease-out",
            index === currentIndex 
              ? "opacity-100 z-10" 
              : "opacity-0 z-0",
            index === currentIndex && isAnimating && direction === 'right' && "animate-slide-in-right",
            index === currentIndex && isAnimating && direction === 'left' && "animate-slide-in-left"
          )}
        >
          {/* Background Image */}
          <Image
            src={item.imageUrl}
            alt={item.title || 'Hero image'}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
            unoptimized
          />
          
          {/* Clickable Link Overlay */}
          <Link href={item.href} className="absolute inset-0 z-[5]">
            <span className="sr-only">View {item.title || 'collection'}</span>
          </Link>
        </div>
      ))}

      {/* Navigation Arrows */}
      {publishedItems.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 md:p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {publishedItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {publishedItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index, index > currentIndex ? 'right' : 'left')}
              className={cn(
                "transition-all duration-300 rounded-full",
                index === currentIndex 
                  ? "w-8 h-2 bg-white" 
                  : "w-2 h-2 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {publishedItems.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ 
              width: `${((currentIndex + 1) / publishedItems.length) * 100}%` 
            }}
          />
        </div>
      )}
    </div>
  )
}
