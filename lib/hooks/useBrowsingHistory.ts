import { clear } from 'console';
import { p } from 'framer-motion/client';
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BrowsingHistoryState = {
    products: { id: string; category: string }[];
}

const initialState: BrowsingHistoryState = {
    products: [],
}

export const browsingHistoryStore = create<BrowsingHistoryState>()(
    persist(
        () => initialState,
        {
            name: 'browsingHistoryStore'
        }
    )
)

export default function useBrowsingHistory() {
    const { products } = browsingHistoryStore();

    return { 
        products,
        addItem: ( product: { id: string; category: string }) => {
            const index = products.findIndex((p) => p.id === product.id)
            if (index !== -1) {
                products.splice(index, 1)
            }
            products.unshift(product)

            if (products.length > 10) {
                products.pop()
            }

            browsingHistoryStore.setState({ products })
        },
        removeItem: (id: string) => {
            const index = products.findIndex((p) => p.id === id)
            if (index !== -1) {
                products.splice(index, 1)
                browsingHistoryStore.setState({ products })
            }
        },
        clear: () => {
            browsingHistoryStore.setState({ products: [] })
        }
    }
}