import { OrderItem } from "@/types";
import { round2Decimals } from "../utils";

/**
 * Calculate order pricing including tax and shipping
 * 
 * @TODO: PRICING STRATEGY DECISION NEEDED
 * ==========================================
 * 
 * CURRENT IMPLEMENTATION (Temporary):
 * - Shipping: 15% of item subtotal
 * - Tax: 5% of item subtotal
 * - Total = Items + Shipping + Tax
 * 
 * CONSIDERATIONS FOR FUTURE:
 * 
 * 1. SHIPPING STRATEGY OPTIONS:
 *    - Flat rate shipping (e.g., AED 25 per order)
 *    - Tiered shipping (free over AED X, otherwise AED Y)
 *    - Weight-based shipping
 *    - Location-based shipping (domestic vs international)
 *    - Express vs standard options
 * 
 * 2. TAX STRATEGY OPTIONS:
 *    - VAT rate based on customer location
 *    - Tax-exempt items (certain categories)
 *    - Business vs consumer tax rates
 *    - International orders (customs, duties)
 * 
 * 3. DISCOUNT CONSIDERATIONS:
 *    - Should discounts apply before or after tax?
 *    - Should shipping be calculated on discounted price?
 *    - Promo codes and coupon integration
 * 
 * 4. EDGE CASES TO HANDLE:
 *    - Minimum order value for free shipping
 *    - Maximum weight/size restrictions
 *    - Remote area surcharges
 *    - Handling fees for special items
 * 
 * NEXT STEPS:
 * - Decide on final pricing model
 * - Update this function accordingly
 * - Add validation for edge cases
 * - Consider creating separate tax/shipping service modules
 */
export const calculateDateAndPrice = async ({
    deliveryDateIndex,
    items,
}: {
    items: OrderItem[]
    deliveryDateIndex?: number
}) => {
    const itemPrice = round2Decimals(
        items.reduce((acc, item) => acc + item.totalPrice, 0)
    )

    // TODO: Replace with final shipping calculation strategy
    const shippingPrice = round2Decimals(itemPrice * 0.15);
    
    // TODO: Replace with final tax calculation strategy (consider VAT, location-based rates)
    const taxPrice = round2Decimals(itemPrice * 0.05);
    
    const totalPrice = round2Decimals(
        (shippingPrice ?? 0) + itemPrice + (taxPrice ?? 0)
    )

    return {
        itemPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    }
}