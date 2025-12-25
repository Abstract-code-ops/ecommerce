'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'

interface SwiperCarouselProps {
    items: {
        title?: string
        buttonCaption?: string
        imageUrl: string
        href: string
        isPublished?: boolean
    }[]
}

export default function SwiperCarousel({ items }: SwiperCarouselProps) {
    const prevRef = useRef<HTMLButtonElement>(null)
    const nextRef = useRef<HTMLButtonElement>(null)

    return (
        <>
            {/* Custom Previous Button */}
            <button
                ref={prevRef}
                className="absolute left-[2%] md:left-[3%] z-10 p-2 text-primary cursor-pointer hover:bg-primary hover:text-white hover:border border-black rounded-full hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed hidden md:block"
                aria-label="Previous Slide"
            >
                <ChevronLeft size={48} />
            </button>

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                loop={true}
                speed={800}
                autoplay={{
                    delay: 5000, // Increased delay to reduce CPU usage
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={{
                    prevEl: prevRef.current,
                    nextEl: nextRef.current,
                }}
                onBeforeInit={(swiper: SwiperType) => {
                    // @ts-ignore
                    swiper.params.navigation.prevEl = prevRef.current
                    // @ts-ignore
                    swiper.params.navigation.nextEl = nextRef.current
                }}
                className="w-full md:w-[85%] h-full rounded-xl overflow-hidden shadow-lg"
            >
                {items.map((item, index) => (
                    <SwiperSlide key={`${item.href}-${index}`}>
                        <Link href={item.href} className="block relative w-full aspect-3/1">
                            <div className="relative w-full h-full">
                                <Image
                                    src={item.imageUrl}
                                    alt={item.title || 'Carousel Image'}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1440px) 85vw, 1200px"
                                />
                                <div className="absolute inset-0 bg-black/10 transition-colors hover:bg-black/0" />
                            </div>
                        </Link>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom Next Button */}
            <button
                ref={nextRef}
                className="absolute right-[2%] md:right-[3%] z-10 p-2 text-primary cursor-pointer hover:bg-primary hover:text-white hover:border border-black rounded-full hover:scale-110 transition-transform disabled:opacity-30 disabled:cursor-not-allowed hidden md:block"
                aria-label="Next Slide"
            >
                <ChevronRight size={48} />
            </button>
        </>
    )
}
