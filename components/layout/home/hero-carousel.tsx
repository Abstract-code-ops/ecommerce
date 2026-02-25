'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeroCarouselProps {
  items: {
    title?: string
    subtitle?: string | null
    buttonCaption?: string
    imageUrl: string
    imageUrlTablet?: string | null
    imageUrlMobile?: string | null
    imagePosition?: 'left' | 'right'
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
    <div className="relative w-full overflow-hidden bg-muted h-[70vh] md:h-[80vh] lg:h-[600px] xl:h-[700px] 2xl:h-[800px]">
      {/* Slides */}
      {publishedItems.map((item, index) => {
        const imageOnLeft = item.imagePosition === 'left'
        
        return (
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
          {/* Desktop: Split Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 h-full">
            {/* Text Side */}
            <div className={cn(
              "flex flex-col justify-center px-12 xl:px-20 bg-background",
              imageOnLeft ? "order-2" : "order-1"
            )}>
              <div className="max-w-2xl">
                {item.title && (
                  <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold text-foreground mb-6 xl:mb-8 font-spectral leading-tight tracking-tight">
                    {item.title}
                  </h1>
                )}
                {item.subtitle && (
                  <p className="text-xl xl:text-2xl 2xl:text-3xl text-muted-foreground mb-10 xl:mb-12 leading-relaxed font-light">
                    {item.subtitle}
                  </p>
                )}
                <Link href={item.href}>
                  <Button size="lg" className="text-base xl:text-lg px-10 py-7 xl:px-12 xl:py-8 rounded-none font-semibold tracking-wide hover:scale-105 transition-transform duration-300">
                    {item.buttonCaption || 'Shop Now'}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image Side */}
            <div className={cn(
              "relative h-full",
              imageOnLeft ? "order-1" : "order-2"
            )}>
              <Image
                src={item.imageUrl}
                alt={item.title || 'Hero image'}
                fill
                className="object-cover"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="50vw"
              />
            </div>
          </div>

          {/* Tablet & Mobile: Full Image with Button */}
          <div className="lg:hidden relative h-full">
            <picture>
              {item.imageUrlMobile && (
                <source media="(max-width: 767px)" srcSet={item.imageUrlMobile} />
              )}
              {item.imageUrlTablet && (
                <source media="(min-width: 768px)" srcSet={item.imageUrlTablet} />
              )}
              <Image
                src={item.imageUrl}
                alt={item.title || 'Hero image'}
                fill
                className="object-cover"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="100vw"
              />
            </picture>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Button at Bottom */}
            <div className="absolute bottom-8 md:bottom-12 left-0 right-0 flex justify-center px-4">
              <Link href={item.href}>
                <Button size="lg" className="text-base md:text-lg px-10 py-7 md:px-12 md:py-8 rounded-none font-semibold tracking-wide shadow-2xl hover:scale-105 transition-transform duration-300">
                  {item.buttonCaption || 'Shop Now'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )})}


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
