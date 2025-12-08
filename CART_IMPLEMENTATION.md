# 🛒 Cart Implementation Documentation

## Overview
This document details the complete cart system implementation, including features, architecture, and future considerations.

---

## ✅ Implemented Features

### 1. **Cart Store (Zustand + Persistence)**
- **Location:** `lib/hooks/useCartStore.ts`
- **Features:**
  - Persistent cart state using `zustand/middleware/persist`
  - Stored in browser localStorage
  - Survives page refreshes

### 2. **Cart Operations**

#### **Add Item to Cart**
```typescript
addItem(item: OrderItem, quantity: number): Promise<string>
```
- Validates stock availability
- Prevents duplicate items (matches by productId, size, color)
- Updates quantity if item exists
- Dynamically calculates `totalPrice` as `price × quantity`
- Returns the `clientId` of the added/updated item
- Shows success/error toast notification

#### **Remove Item from Cart**
```typescript
removeItem(clientId: string): void
```
- Removes item by unique `clientId`
- Shows success toast notification

#### **Update Item Quantity**
```typescript
updateQuantity(clientId: string, quantity: number): Promise<void>
```
- Validates quantity (must be > 0)
- Validates stock availability
- Recalculates `totalPrice` dynamically
- Updates cart totals (tax, shipping, total)
- Shows error toast if validation fails

#### **Clear Cart**
```typescript
clearCart(): void
```
- Removes all items from cart
- Generates new `clientId` for cart
- Confirmation dialog before clearing

### 3. **Cart UI Components**

#### **AddToCart Button** (`components/layout/shop/addToCart.tsx`)
- Animated button with cart icon and item dropping animation
- Integrates with cart store
- Shows toast notifications on success/error
- Accepts product data, size, color
- Customizable styling and text

#### **Cart Page** (`app/cart/page.tsx`)
- Displays all cart items with:
  - Product image, name, category
  - Size and color (if applicable)
  - Price per unit
  - Quantity controls (+/-)
  - Total price per item
  - Remove button
- Order summary with:
  - Subtotal
  - Shipping (15%)
  - Tax (5%)
  - Grand Total
- Clear cart button
- Empty cart state with CTA

#### **Cart Badge** (`components/shared/header/menu.tsx`)
- Red badge on cart icon
- Shows total item count (sum of all quantities)
- Updates in real-time
- Shows "99+" for counts > 99

### 4. **Toast Notifications**
- Success messages for:
  - Item added to cart
  - Item removed from cart
  - Cart cleared
- Error messages for:
  - Stock unavailable
  - Invalid quantity
  - Failed operations

---

## 🏗️ Architecture

### **Data Flow**
```
User Action → Component → useCartStore → Zustand State → localStorage
                ↓                           ↓
          Toast Notification         UI Re-render
```

### **Cart State Structure**
```typescript
{
  clientId: string,              // Unique cart identifier
  items: OrderItem[],            // Array of cart items
  totalPrice: number,            // Grand total (items + tax + shipping)
  taxPrice: number,              // 5% of subtotal
  shippingPrice: number,         // 15% of subtotal
  grandTotalPrice: number,       // Reserved for future use
  totalItems: number,            // Total number of items
  paymentMethod: string?,        // To be implemented
  deliveryDateIndex: number?,    // To be implemented
  expectedDeliveryDate: Date?    // To be implemented
}
```

### **OrderItem Structure**
```typescript
{
  clientId: string,              // Unique item identifier
  productIds: string[],          // Array of product IDs
  name: string,                  // Product name
  slug: string,                  // URL slug
  category: string,              // Product category
  quantity: number,              // Item quantity
  countInStock: number,          // Available stock
  image: string,                 // Product image URL
  price: number,                 // Unit price
  totalPrice: number,            // price × quantity (calculated dynamically)
  size?: string,                 // Optional size
  color?: string                 // Optional color
}
```

---

## 🎨 Responsive Design

### **ProductCard Button**
- **Mobile (<640px):** Vertical layout, full text "Add to cart"
- **Small screens (640px-768px):** Horizontal layout, abbreviated "Add"
- **Medium+ (>768px):** Full text with proper spacing

### **Cart Page**
- **Mobile:** Stacked layout
- **Desktop:** Grid layout with sidebar summary

---

## 🔄 Key Improvements Implemented

### **1. Dynamic Price Calculation** ✅
- `totalPrice` now calculated as `price × quantity`
- Updates automatically when quantity changes
- Prevents stale pricing issues

### **2. Unique Cart Identification** ✅
- Each cart gets unique `clientId` on initialization
- Generated using `generateId()` utility
- Regenerated on cart clear

### **3. Complete Cart Operations** ✅
- Add, remove, update, and clear operations
- All operations include validation
- Proper error handling with user feedback

### **4. Stock Validation** ✅
- Checks availability on add
- Checks availability on quantity update
- Prevents overselling

---

## ⚠️ TODO: Decisions Needed

### **Tax & Shipping Strategy** 🚧
**Current Implementation (Temporary):**
- Shipping: 15% of subtotal
- Tax: 5% of subtotal

**Decision Required:**
See detailed documentation in `lib/actions/order.action.ts` for:
- Shipping strategy options (flat rate, tiered, weight-based, etc.)
- Tax strategy options (VAT, location-based, exemptions)
- Discount considerations
- Edge cases to handle

**Action Items:**
1. Determine final pricing model
2. Update `calculateDateAndPrice()` function
3. Consider separate tax/shipping service modules
4. Add validation for edge cases

---

## 🔮 Future Enhancements (On Hold)

### **Stock Validation on Load**
- Validate stock when cart is loaded from localStorage
- Handle cases where stock decreased while user was away
- Show warnings for unavailable items

### **Price Update Detection**
- Check if product prices changed since added to cart
- Notify user of price changes before checkout
- Option to refresh prices

### **Advanced Features**
- Wishlist integration
- Save cart for later
- Cart sharing/email cart
- Recently removed items recovery
- Bulk actions (select multiple items)
- Cart expiration (auto-clear after X days)

---

## 📝 Type Safety Notes

### **Known Type Issues (Handled)**
- `addItem` return type: Returns `clientId` but could be `undefined`
  - Currently using `!` assertion
  - Consider using strict null checks in future

### **MongoDB ObjectId Conversion**
- Product `_id` is MongoDB `ObjectId`, converted to string via `.toString()`
- Handled in `product-details.tsx` when passing to `AddToCart`

---

## 🧪 Testing Checklist

- [x] Add item to empty cart
- [x] Add duplicate item (same product, size, color)
- [x] Add item with different size/color
- [x] Increase/decrease quantity
- [x] Remove item from cart
- [x] Clear entire cart
- [x] Cart persistence across page refresh
- [x] Stock validation (out of stock)
- [x] Cart counter updates
- [x] Toast notifications
- [x] Responsive layout on mobile
- [x] Empty cart state

---

## 🔗 Related Files

### **Core Files**
- `lib/hooks/useCartStore.ts` - Cart state management
- `lib/actions/order.action.ts` - Price calculations
- `lib/validator.ts` - Cart/OrderItem schemas
- `types/index.ts` - TypeScript types

### **UI Components**
- `components/layout/shop/addToCart.tsx` - Add to cart button
- `components/layout/shop/shop-card.tsx` - Product card
- `components/shared/header/menu.tsx` - Cart badge
- `app/cart/page.tsx` - Cart page

### **Configuration**
- `app/layout.tsx` - Toast container setup

---

## 📚 Dependencies

```json
{
  "zustand": "^5.0.9",           // State management
  "react-toastify": "^11.0.5",   // Toast notifications
  "framer-motion": "^12.23.24",  // Animations
  "zod": "^4.1.13"               // Validation
}
```

---

## 🎯 Best Practices Followed

1. **Immutable State Updates** - Never mutate state directly
2. **Type Safety** - Full TypeScript coverage with Zod validation
3. **Error Handling** - Try-catch blocks with user-friendly messages
4. **User Feedback** - Toast notifications for all actions
5. **Validation** - Stock and quantity checks
6. **Persistence** - LocalStorage for cart state
7. **Responsive Design** - Mobile-first approach
8. **Accessibility** - ARIA labels on buttons
9. **Performance** - Efficient re-renders with Zustand

---

## 🐛 Known Limitations

1. **localStorage Size** - Large carts may hit browser limits (~5-10MB)
2. **No Cart Expiration** - Cart persists indefinitely
3. **No Multi-Device Sync** - Cart is per-device (requires backend for sync)
4. **No Price History** - Can't track price changes over time
5. **Basic Tax/Shipping** - Placeholder calculations need business logic

---

## 📞 Questions or Issues?

For cart-related questions or issues:
1. Check this documentation first
2. Review `useCartStore.ts` for store logic
3. Check `order.action.ts` for pricing logic
4. Review TODOs in code comments

---

**Last Updated:** December 8, 2025
**Version:** 1.0.0
**Status:** ✅ Core Features Complete | 🚧 Pricing Strategy Pending
