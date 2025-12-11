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
    title: string;
    subTitle?: string
    products: IProduct[];
    showBottom: boolean
}

export default function ProductSlider({ title, subTitle, products, showBottom }: ProductSliderProps) {
    return (
        <div className=" w-full mb-8">
            <div className="flex flex-col w-full pl-8 mb-2">
                <h2 className="font-medium text-2xl md:text-3xl font-karla-bold mb-4">{title}</h2>
                {subTitle && <h3 className="font-medium text-black/60 text-md md:text-md font-spectral mb-6 max-w-md">{subTitle}</h3>}
            </div>
            <Carousel
                opts={{
                    align: 'start'
                }}
                className="w-full px-7"
            >
                <CarouselContent
                >
                    {products
                      // filter out out-of-stock products
                      .filter((p) => (p.countInStock ?? 0) > 0)
                      .map((product) => (
                        <CarouselItem
                          key={product.slug}
                          className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 mb-3"
                        >
                            <ProductCard product={product} isDeal={product.tags.includes('today-deal')} showBottom={showBottom} />
                        </CarouselItem>
                    ))
                }</CarouselContent>
                <CarouselPrevious className="left-0 cursor-pointer"/>
                <CarouselNext className="right-0 cursor-pointer"/>
            </Carousel>
        </div>
    );
}