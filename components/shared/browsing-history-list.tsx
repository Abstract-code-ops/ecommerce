'use client'
import useBrowsingHistory from "@/lib/hooks/useBrowsingHistory"
import { useEffect, useState, useCallback, memo } from "react"
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

    // Don't render anything if no browsing history
    if (products.length === 0) return null;

    return (
        <div className="">
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

// Memoized ProductList to prevent unnecessary re-renders
const ProductList = memo(function ProductList({ title, hideDetails, type }: { title: string, hideDetails?: boolean, type: 'related' | 'history' }) {
    const { products } = useBrowsingHistory()
    const [data, setData] = useState<IProduct[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchProducts = useCallback(async () => {
        if (products.length === 0) return;
        
        setIsLoading(true)
        try {
            const res = await fetch(
                `/api/products/browsing-history?type=${type}&categories=${products
                    .map(p => p.category)
                    .join(',')}&ids=${products.map(p => p.id).join(',')}`,
                { 
                    // Add caching headers
                    next: { revalidate: 300 } // Cache for 5 minutes
                }
            )
            const data = await res.json()
            setData(data)
        } catch (error) {
            console.error('Failed to fetch browsing history:', error)
        } finally {
            setIsLoading(false)
        }
    }, [products, type])

    useEffect(() => {
        // Debounce the fetch to prevent rapid calls
        const timeoutId = setTimeout(fetchProducts, 100)
        return () => clearTimeout(timeoutId)
    }, [fetchProducts])

    if (isLoading || data.length === 0) return null;

    return (
        <ProductSlider
            title={title}
            products={data}
            showBottom={!hideDetails}
        />
    )
})