'use client'

// Dynamically import Swiper to reduce initial bundle size
import dynamic from 'next/dynamic'

// Swiper styles - import only what's needed
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const SwiperComponent = dynamic(
    () => import('@/components/layout/shop/swiper-carousel'),
    { 
        ssr: false,
        loading: () => (
            <div className="w-full md:w-[85%] aspect-3/1 bg-gray-200 animate-pulse rounded-xl" />
        )
    }
)

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
    return (
        <div className="relative w-full flex items-center justify-center py-8 group">
            <SwiperComponent items={items} />
            
            {/* Custom Styles for Pagination Dots */}
            <style jsx global>{`
                .swiper-pagination-bullet {
                    background-color: white;
                    opacity: 0.5;
                    width: 12px;
                    height: 12px;
                }
                .swiper-pagination-bullet-active {
                    background-color: var(--primary) !important;
                    opacity: 1;
                    width: 14px;
                    height: 14px;
                }
            `}</style>
        </div>
    )
}