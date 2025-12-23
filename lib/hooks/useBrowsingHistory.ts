import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAX_HISTORY_ITEMS = 10;

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
        addItem: (product: { id: string; category: string }) => {
            // Immutable update: filter out existing, prepend new, cap length
            const filtered = products.filter((p) => p.id !== product.id);
            const updated = [product, ...filtered].slice(0, MAX_HISTORY_ITEMS);
            browsingHistoryStore.setState({ products: updated });
        },
        removeItem: (id: string) => {
            const updated = products.filter((p) => p.id !== id);
            if (updated.length !== products.length) {
                browsingHistoryStore.setState({ products: updated });
            }
        },
        clear: () => {
            browsingHistoryStore.setState({ products: [] });
        }
    };
}