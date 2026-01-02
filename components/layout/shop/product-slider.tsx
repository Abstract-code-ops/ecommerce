import React from "react";
import { 
    Carousel,
    CarouselItem,
    CarouselContent,
    CarouselNext,
    CarouselPrevious
} from "@/components/ui/carousel";
import { ProductCard } from "./shop-card";
import { IProduct } from "@/lib/db/models/product.model";

interface ProductSliderProps {
    title?: string;
    subTitle?: string
    products: IProduct[];
    showBottom?: boolean
}

export default function ProductSlider({ title, subTitle, products, showBottom = true }: ProductSliderProps) {
    // Filter out out-of-stock products
    const availableProducts = products.filter((p) => (p.countInStock ?? 0) > 0);
    
    if (availableProducts.length === 0) {
        return null;
    }

    return (
        <div className="w-full">
            {/* Header - Only show if title is provided */}
            {title && (
                <div className="flex flex-col mb-6 md:mb-8">
                    <h2 className="font-serif text-2xl md:text-3xl text-foreground">{title}</h2>
                    {subTitle && (
                        <p className="text-muted-foreground mt-2 max-w-lg">{subTitle}</p>
                    )}
                </div>
            )}
            
            {/* Carousel */}
            <Carousel
                opts={{
                    align: 'start',
                    dragFree: true,
                }}
                className="w-full -mx-2"
            >
                <CarouselContent className="ml-0">
                    {availableProducts.map((product, index) => (
                        <CarouselItem
                            key={product.slug}
                            className="pl-4 basis-[75%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                        >
                            <ProductCard 
                                product={product} 
                                isDeal={product.tags?.includes('today-deal')} 
                                showBottom={showBottom}
                                className={index < 4 ? 'animate-fade-in-up' : ''}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                
                {/* Navigation Arrows */}
                <CarouselPrevious className="hidden md:flex -left-4 w-10 h-10 bg-card border-border shadow-md hover:bg-muted hover:scale-105 transition-all duration-200"/>
                <CarouselNext className="hidden md:flex -right-4 w-10 h-10 bg-card border-border shadow-md hover:bg-muted hover:scale-105 transition-all duration-200"/>
            </Carousel>
        </div>
    );
}