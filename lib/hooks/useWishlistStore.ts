/**
 * Wishlist Store using Zustand
 * 
 * Features:
 * - Persistent wishlist state (localStorage)
 * - Add, remove, toggle operations
 * - Check if item is in wishlist
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
  addedAt: string;
}

interface WishlistState {
  /** Current wishlist items */
  items: WishlistItem[];
  
  /**
   * Add item to wishlist
   * @param item - The product to add
   */
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  
  /**
   * Remove item from wishlist by ID
   * @param id - Product ID to remove
   */
  removeItem: (id: string) => void;
  
  /**
   * Toggle item in wishlist (add if not exists, remove if exists)
   * @param item - The product to toggle
   * @returns boolean - true if added, false if removed
   */
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => boolean;
  
  /**
   * Check if item is in wishlist
   * @param id - Product ID to check
   * @returns boolean
   */
  isInWishlist: (id: string) => boolean;
  
  /**
   * Clear all items from wishlist
   */
  clearWishlist: () => void;
  
  /**
   * Get total number of items in wishlist
   */
  getCount: () => number;
}

const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        
        // Check if already in wishlist
        if (items.some(i => i._id === item._id)) {
          return;
        }
        
        const newItem: WishlistItem = {
          ...item,
          addedAt: new Date().toISOString(),
        };
        
        set({ items: [...items, newItem] });
      },
      
      removeItem: (id) => {
        const { items } = get();
        set({ items: items.filter(item => item._id !== id) });
      },
      
      toggleItem: (item) => {
        const { items, addItem, removeItem } = get();
        const exists = items.some(i => i._id === item._id);
        
        if (exists) {
          removeItem(item._id);
          return false;
        } else {
          addItem(item);
          return true;
        }
      },
      
      isInWishlist: (id) => {
        const { items } = get();
        return items.some(item => item._id === id);
      },
      
      clearWishlist: () => {
        set({ items: [] });
      },
      
      getCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "wishlist-storage",
    }
  )
);

export default useWishlistStore;
