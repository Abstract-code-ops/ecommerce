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
import { generateId, round2Decimals } from "../utils";

/**
 * Calculate cart pricing (synchronous version for client-side use)
 * Must match the server-side calculateDateAndPrice logic
 */
const calculateCartTotals = (items: OrderItem[], currentShippingPrice: number = 0) => {
    const itemPrice = round2Decimals(
        items.reduce((acc, item) => acc + item.totalPrice, 0)
    );
    
    // Use provided shipping price (dynamically calculated based on address)
    const shippingPrice = currentShippingPrice;
    
    // No tax
    const taxPrice = 0;
    
    const totalPrice = round2Decimals(
        shippingPrice + itemPrice
    );
    
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    return {
        totalPrice,
        taxPrice,
        shippingPrice,
        totalItems,
    };
};

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
    expectedDeliveryDate: undefined,
    shippingAddress: undefined,
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
     * Set the shipping address for the order
     * This will automatically trigger shipping cost calculation
     * @param address - Shipping address with coordinates
     */
    setShippingAddress: (address: any) => Promise<void>
    
    /**
     * Update shipping cost based on address and cart total
     * @param shippingCost - Calculated shipping cost
     */
    updateShippingCost: (shippingCost: number) => void
    
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
                        ...calculateCartTotals(updatedCartItems, get().cart.shippingPrice),
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
                        ...calculateCartTotals(updatedCartItems, get().cart.shippingPrice),
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
                        ...calculateCartTotals(updatedCartItems, get().cart.shippingPrice),
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
             * Set Shipping Address
             * Automatically calculates shipping cost based on address
             */
            setShippingAddress: async (address: any) => {
                set({
                    cart: { 
                        ...get().cart, 
                        shippingAddress: address 
                    },
                });
                
                // Calculate shipping if address has coordinates
                if (address.lat && address.lng) {
                    try {
                        const { calculateShippingCost } = await import('../actions/shipping.actions');
                        // Use items total (without shipping) for calculation
                        const itemsTotal = round2Decimals(
                            get().cart.items.reduce((acc, item) => acc + item.totalPrice, 0)
                        );
                        const result = await calculateShippingCost({
                            destination: { lat: address.lat, lng: address.lng },
                            cartTotal: itemsTotal,
                            emirate: address.emirate,
                        });
                        
                        if (result.success && result.data) {
                            get().updateShippingCost(result.data.cost);
                        }
                    } catch (error) {
                        console.error('Error calculating shipping:', error);
                        // Fallback to default shipping
                        get().updateShippingCost(10);
                    }
                } else {
                    // No coordinates, use default shipping
                    get().updateShippingCost(10);
                }
            },
            
            /**
             * Update Shipping Cost
             * Recalculates grand total
             */
            updateShippingCost: (shippingCost: number) => {
                const { cart } = get();
                const itemPrice = round2Decimals(
                    cart.items.reduce((acc, item) => acc + item.totalPrice, 0)
                );
                const taxPrice = 0;
                const totalPrice = round2Decimals(shippingCost + itemPrice + taxPrice);
                
                set({
                    cart: {
                        ...cart,
                        shippingPrice: shippingCost,
                        totalPrice: totalPrice,
                        taxPrice,
                    },
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