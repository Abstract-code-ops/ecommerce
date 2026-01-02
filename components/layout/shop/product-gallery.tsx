'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

// Swiper styles
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

interface ProductGalleryProps {
  images: string[]
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="max-w-4xl flex flex-col gap-4 relative mx-auto">
      
      {/* Main Swiper */}
      <div className="relative w-full overflow-hidden bg-muted rounded-xl group">
        <Swiper
          loop={true}
          spaceBetween={10}
          navigation={{
            prevEl: '.custom-prev',
            nextEl: '.custom-next',
          }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          modules={[FreeMode, Navigation, Thumbs]}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full h-full"
        >
          {images.map((img, index) => (
            <SwiperSlide key={`main-${index}`}>
              <div className={cn(
                "relative w-full overflow-hidden",
                // Mobile: Takes up most of the screen height
                "h-[75vh]", 
                // Desktop: Fixed height or dynamic
                "lg:h-[800px] lg:aspect-auto"
              )}>
                <Image
                  src={img}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Arrows (Hidden on mobile, visible on desktop hover) */}
        <button className="custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden lg:flex items-center justify-center shadow-lg border border-border cursor-pointer hover:scale-105">
          <ChevronLeft size={20} />
        </button>
        <button className="custom-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-card/90 backdrop-blur-sm hover:bg-card text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hidden lg:flex items-center justify-center shadow-lg border border-border cursor-pointer hover:scale-105">
          <ChevronRight size={20} />
        </button>

        {/* Mobile Page Counter overlay */}
        <div className="absolute top-4 right-4 z-10 bg-foreground/80 backdrop-blur-sm text-background text-xs font-medium px-3 py-1.5 rounded-full lg:hidden">
          {activeIndex + 1} / {images.length}
        </div>

        {/* Thumbs Swiper Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-4 flex justify-center">
            <div className="w-full max-w-md">
                <Swiper
                    onSwiper={setThumbsSwiper}
                    loop={false}
                    spaceBetween={12}
                    slidesPerView={4}
                    freeMode={true}
                    watchSlidesProgress={true}
                    modules={[FreeMode, Navigation, Thumbs]}
                    className="thumbs-swiper"
                    breakpoints={{
                        // Slight adjustments for larger screens if needed
                        768: {
                            slidesPerView: 5,
                            spaceBetween: 16
                        }
                    }}
                >
                    {images.map((img, index) => (
                    <SwiperSlide key={`thumb-${index}`} className="!w-20 !h-20 rounded-lg overflow-hidden cursor-pointer">
                        <div className="relative w-full h-full">
                            <Image
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover transition-transform duration-300 hover:scale-110"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent transition-all" />
                            {/* Active State Overlay handled by CSS below */}
                            <div className="absolute inset-0 ring-2 ring-transparent transition-all thumb-border rounded-lg" />
                        </div>
                    </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
      </div>

      {/* Styles for the active thumbnail state */}
      <style jsx global>{`
        .thumbs-swiper .swiper-slide-thumb-active .thumb-border {
            border-color: var(--primary) !important; /* Uses your Tailwind primary color var */
            box-shadow: 0 0 0 2px hsl(var(--primary)); /* Creates the ring effect */
        }
        .thumbs-swiper .swiper-slide {
            opacity: 0.6;
            transition: opacity 0.3s;
        }
        .thumbs-swiper .swiper-slide-thumb-active {
            opacity: 1;
        }
      `}</style>

    </div>
  )
}