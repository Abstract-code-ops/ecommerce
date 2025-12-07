'use client'
import useBrowsingHistory from "@/lib/hooks/useBrowsingHistory"
import { useEffect, useState } from "react"
import ProductSlider from "../layout/shop/product-slider"
import { Separator } from "../ui/separator"
import { cn } from "@/lib/utils"
import { IProduct } from "@/lib/db/models/product.model"

export default function BrowsingHistoryList(
    {
        className,
    }: {
        className?: string
    }
) {
    const { products } = useBrowsingHistory()
    console.log('products', products)

    return (
        products.length > 0 && <div className="">
            <Separator className={cn('mb-4', className)} />
            <ProductList
                title="Related to items you've viewed"
                type='related'
             />
            <Separator className='mb-4' />
            <ProductList
                title="Browsing History"
                hideDetails
                type='history'
             />
        </div>
    )
}

function ProductList({ title, hideDetails, type }: { title: string, hideDetails?: boolean, type: 'related' | 'history' }) {
    const { products } = useBrowsingHistory()
    console.log('product-2', products)
    const [data, setData] = useState<IProduct[]>([])

    useEffect(() => {

        const fetchProducts = async () => {
            const res = await fetch(
                `/api/products/browsing-history?type=${type}&categories=${products
                    .map(p => p.category)
                    .join(',')}&ids=${products.map(p => p.id).join(',')}`
            )

            const data = await res.json()
            setData(data)
        }

        fetchProducts()
    }, [products, type])

    return (
        data.length > 0 && (
            <ProductSlider
                title={title}
                products={data}
                showBottom={!hideDetails}
            />
        )
    )
}