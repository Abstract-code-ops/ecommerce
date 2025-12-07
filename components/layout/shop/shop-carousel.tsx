'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react' // Assuming you have lucide-react

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

// Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function ShopCarousel({
    items,
}: {
    items: {
        title?: string,
        buttonCaption?: string,
        imageUrl: string,
        href: string,
        isPublished?: boolean
    }[]
}) {
    // Refs for navigation buttons to bind them to Swiper
    const prevRef = useRef<HTMLButtonElement>(null)
    const nextRef = useRef<HTMLButtonElement>(null)

    return (
        <div className="relative w-full flex items-center justify-center py-8 group">
            
            {/* Custom Previous Button (Left "Empty Space") */}
            <button
                ref={prevRef}
                className="absolute left-[2%] md:left-[3%] z-10 p-2 text-primary cursor-pointer hover:bg-primary hover:text-white hover:border border-black rounded-full hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed hidden md:block"
                aria-label="Previous Slide"
            >
                <ChevronLeft size={48} />
            </button>

            {/* Swiper Container - Taking up approx 85% of width */}
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                speed={800} // Smooth scroll transition duration in ms
                autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                pagination={{
                    clickable: true,
                    // See styling section below for customizing dots
                }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
                // This ensures the refs are available when Swiper initializes
                onBeforeInit={(swiper: SwiperType) => {
                    // @ts-ignore
                    swiper.params.navigation.prevEl = prevRef.current;
                    // @ts-ignore
                    swiper.params.navigation.nextEl = nextRef.current;
                }}
                className="w-full md:w-[85%] h-full rounded-xl overflow-hidden shadow-lg"
            >
                {items.map((item, index) => (
                    <SwiperSlide key={`${item.href}-${index}`}>
                        <Link href={item.href} className="block relative w-full aspect-[3/1]">
                            {/* Image Container */}
                            <div className="relative w-full h-full">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title || 'Carousel Image'}
                                    fill
                                    className="object-cover"
                                    priority={index === 0} // Load first image faster
                                    sizes='(max-width: 768px) 100vw, (max-width: 1440px) 85vw, 1920px'
                                />
                                
                                {/* Overlay Content */}
                                <div className="absolute inset-0 bg-black/10 transition-colors hover:bg-black/0" />
                                
                                {/* <div className="absolute w-1/3 left-8 md:left-16 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    {item.title && (
                                        <h2 className="text-xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">
                                            {item.title}
                                        </h2>
                                    )}
                                    {item.buttonCaption && (
                                        <Button className="hidden md:flex pointer-events-auto">
                                            {item.buttonCaption}
                                        </Button>
                                    )}
                                </div> */}
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Next Button (Right "Empty Space") */}
            <button
                ref={nextRef}
                className="absolute right-[2%] md:right-[3%] z-10 p-2 text-primary cursor-pointer hover:bg-primary hover:text-white hover:border border-black rounded-full hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed hidden md:block"
                aria-label="Next Slide"
            >
                <ChevronRight size={48} />
            </button>
            
            {/* Custom Styles for Pagination Dots */}
            <style jsx global>{`
                .swiper-pagination-bullet {
                    background-color: white;
                    opacity: 0.5;
                    width: 10px;
                    height: 10px;
                }
                .swiper-pagination-bullet-active {
                    background-color: var(--primary) !important; /* Uses Tailwind primary color */
                    opacity: 1;
                    width: 12px;
                    height: 12px;
                }
            `}</style>
        </div>
    )
}