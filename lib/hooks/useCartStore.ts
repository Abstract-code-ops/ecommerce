/**
 * Shopping Cart Store using Zustand
 * 
 * Features:
 * - Persistent cart state (localStorage)
 * - Add, remove, update quantity operations
 * - Stock validation
 * - Dynamic price calculations
 * - Toast notifications integration
 * 
 * @see CART_IMPLEMENTATION.md for complete documentation
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Cart, OrderItem } from "@/types";
import { calculateDateAndPrice } from "../actions/order.actions";
import { generateId } from "../utils";

/**
 * Initial cart state
 * Each cart gets a unique clientId on initialization
 */
const initialState: Cart = {
    clientId: generateId(),
    items: [],
    totalPrice: 0,
    taxPrice: 0,
    shippingPrice: 0,
    grandTotalPrice: 0,
    totalItems: 0,
    paymentMethod: undefined,
    deliveryDateIndex: undefined,
    expectedDeliveryDate: undefined
}

/**
 * Cart Store Interface
 */
interface CartState {
    /** Current cart state */
    cart: Cart
    
    /**
     * Add item to cart or update quantity if exists
     * @param item - The order item to add
     * @param quantity - Quantity to add
     * @returns string - The clientId of the added/updated item
     * @throws Error if stock is insufficient
     */
    addItem: (item: OrderItem, quantity: number) => string
    
    /**
     * Remove item from cart by clientId
     * @param clientId - Unique identifier of the cart item
     */
    removeItem: (clientId: string) => void
    
    /**
     * Update quantity of existing cart item
     * @param clientId - Unique identifier of the cart item
     * @param quantity - New quantity (must be > 0 and <= countInStock)
     * @throws Error if quantity invalid or stock insufficient
     */
    updateQuantity: (clientId: string, quantity: number) => void

    /**
     * Set the payment method for the order
     * @param paymentMethod - 'Card' | 'CashOnDelivery'
     */
    setPaymentMethod: (paymentMethod: string) => void
    
    /**
     * Clear all items from cart
     * Generates new cart clientId
     */
    clearCart: () => void
}

/**
 * Cart Store Implementation
 * Uses Zustand with persist middleware for localStorage persistence
 */
const useCartStore = create(
    persist<CartState>(
        (set, get) => ({
            cart: initialState,
            
            /**
             * Add Item to Cart
             * - Checks if item exists (by productId, size, color)
             * - Updates quantity if exists, adds new if not
             * - Validates stock availability
             * - Recalculates totalPrice dynamically (sync)
             */
            addItem: (item: OrderItem, quantity: number) => {
                const { items } = get().cart;
                
                // Block if item is out of stock
                if (item.countInStock <= 0) {
                    throw new Error('This item is out of stock');
                }
                
                const existingItem = items.find((i) => i.productIds[0] === item.productIds[0] && i.size === item.size && i.color === item.color);

                if (existingItem) {
                    if (existingItem.quantity + quantity > item.countInStock) {
                        throw new Error(`Only ${item.countInStock - existingItem.quantity} more available`);
                    }
                }
                else {
                    if (quantity > item.countInStock) {
                        throw new Error(`Only ${item.countInStock} available in stock`);
                    }
                }

                const updatedCartItems = existingItem
                ? items.map((x) => 
                    x.productIds[0] === item.productIds[0] && x.size === item.size && x.color === item.color
                    ? { ...existingItem, quantity: existingItem.quantity + quantity, totalPrice: item.price * (existingItem.quantity + quantity) }
                    : x
                ) : [...items, { ...item, quantity, totalPrice: item.price * quantity }];

                set({
                    cart: {
                        ...get().cart,
                        items: updatedCartItems,
                        ...calculateDateAndPrice({ items: updatedCartItems }),
                    },
                });

                return updatedCartItems.find(
                    (i) =>
                        i.productIds[0] === item.productIds[0] &&
                        i.size === item.size &&
                        i.color === item.color
                )?.clientId!},
            
            /**
             * Remove Item from Cart
             * Filters out item by clientId (sync)
             */
            removeItem: (clientId: string) => {
                const { items } = get().cart;
                const updatedCartItems = items.filter((item) => item.clientId !== clientId);
                
                set({
                    cart: {
                        ...get().cart,
                        items: updatedCartItems,
                        ...calculateDateAndPrice({ items: updatedCartItems }),
                    },
                });
            },
            
            /**
             * Update Item Quantity
             * - Validates quantity (> 0 and <= stock)
             * - Recalculates totalPrice (sync)
             * - Updates cart totals
             */
            updateQuantity: (clientId: string, quantity: number) => {
                const { items } = get().cart;
                const item = items.find((i) => i.clientId === clientId);
                
                if (!item) {
                    throw new Error('Item not found in cart');
                }
                
                if (quantity <= 0) {
                    throw new Error('Quantity must be greater than 0');
                }
                
                if (quantity > item.countInStock) {
                    throw new Error('Not enough stock available');
                }
                
                const updatedCartItems = items.map((i) =>
                    i.clientId === clientId
                        ? { ...i, quantity, totalPrice: i.price * quantity }
                        : i
                );
                
                set({
                    cart: {
                        ...get().cart,
                        items: updatedCartItems,
                        ...calculateDateAndPrice({ items: updatedCartItems }),
                    },
                });
            },
            
            /**
             * Set Payment Method
             */
            setPaymentMethod: (paymentMethod: string) => {
                set({
                    cart: { ...get().cart, paymentMethod },
                });
            },
            
            /**
             * Clear Cart
             * Resets to initial state with new clientId
             */
            clearCart: () => set({ cart: { ...initialState, clientId: generateId() } }),
            
            /**
             * Initialize Cart
             * Used for resetting cart state
             */
            init: () => set({ cart: { ...initialState, clientId: generateId() } }),
        }),
        {
            name: 'cart-store', // localStorage key
        }
    )    
)

export default useCartStore

/**
 * TODO: Future Enhancements
 * 
 * 1. Stock Validation on Load
 *    - Validate stock when cart loads from localStorage
 *    - Handle items that went out of stock
 * 
 * 2. Price Update Detection
 *    - Check if prices changed since item was added
 *    - Notify user before checkout
 * 
 * 3. Cart Expiration
 *    - Auto-clear cart after X days of inactivity
 *    - Add timestamp to cart items
 * 
 * 4. Multi-device Sync
 *    - Sync cart across devices (requires backend)
 *    - Conflict resolution strategy
 */