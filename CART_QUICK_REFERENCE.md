# Cart System - Quick Reference Guide

## 🚀 Quick Start

### Using the Cart in Your Components

```tsx
import useCartStore from '@/lib/hooks/useCartStore';
import { toast } from 'react-toastify';

function MyComponent() {
  const { cart, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  
  // Access cart data
  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.totalPrice;
  
  // ... use cart operations
}
```

---

## 📦 Cart Operations

### Add Item to Cart
```tsx
const { addItem } = useCartStore();

const handleAddToCart = async () => {
  try {
    const orderItem: OrderItem = {
      clientId: generateId(),
      productIds: [product._id],
      name: product.name,
      slug: product.slug,
      category: product.category,
      quantity: 1,
      countInStock: product.countInStock,
      image: product.images[0],
      price: product.price,
      totalPrice: product.price * 1,
      size: 'M',
      color: 'Blue',
    };
    
    await addItem(orderItem, 1);
    toast.success('Item added to cart!');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Remove Item
```tsx
const { removeItem } = useCartStore();

const handleRemove = (clientId: string) => {
  removeItem(clientId);
  toast.success('Item removed');
};
```

### Update Quantity
```tsx
const { updateQuantity } = useCartStore();

const handleUpdateQty = async (clientId: string, newQty: number) => {
  try {
    await updateQuantity(clientId, newQty);
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Clear Cart
```tsx
const { clearCart } = useCartStore();

const handleClear = () => {
  if (confirm('Clear cart?')) {
    clearCart();
    toast.success('Cart cleared');
  }
};
```

---

## 🎨 Using AddToCart Component

### Basic Usage
```tsx
import AddToCartButton from '@/components/layout/shop/addToCart';

<AddToCartButton
  price={product.price}
  quantity={1}
  product={{
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    category: product.category,
    images: product.images,
    price: product.price,
    countInStock: product.countInStock
  }}
/>
```

### With Customization
```tsx
<AddToCartButton
  className="custom-class"
  price={product.price}
  quantity={quantity}
  text="Buy Now"
  successText="In Cart!"
  cartColor="text-white"
  itemColor="bg-yellow-400"
  buttonColor="bg-blue-600 hover:bg-blue-700"
  textColor="text-white"
  product={productData}
  size="L"
  color="Red"
  onClick={(e) => console.log('Clicked')}
/>
```

---

## 📊 Accessing Cart Data

```tsx
const { cart } = useCartStore();

// Get item count
const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);

// Get subtotal
const subtotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

// Get shipping
const shipping = cart.shippingPrice;

// Get tax
const tax = cart.taxPrice;

// Get total
const total = cart.totalPrice;

// Check if cart is empty
const isEmpty = cart.items.length === 0;

// Find specific item
const item = cart.items.find(i => i.clientId === 'someId');
```

---

## 🎯 Common Patterns

### Cart Badge
```tsx
const { cart } = useCartStore();
const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);

{count > 0 && (
  <span className="badge">
    {count > 99 ? '99+' : count}
  </span>
)}
```

### Empty Cart Check
```tsx
const { cart } = useCartStore();

{cart.items.length === 0 ? (
  <EmptyCartMessage />
) : (
  <CartItems items={cart.items} />
)}
```

### Quantity Controls
```tsx
const { updateQuantity } = useCartStore();

<button onClick={() => updateQuantity(item.clientId, item.quantity - 1)}>
  <Minus />
</button>
<span>{item.quantity}</span>
<button onClick={() => updateQuantity(item.clientId, item.quantity + 1)}>
  <Plus />
</button>
```

---

## ⚠️ Error Handling

All async operations should be wrapped in try-catch:

```tsx
try {
  await addItem(orderItem, quantity);
  toast.success('Success!');
} catch (error) {
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error('Something went wrong');
  }
}
```

**Common Errors:**
- `"Not enough stock available"` - Stock validation failed
- `"Item not found in cart"` - clientId doesn't exist
- `"Quantity must be greater than 0"` - Invalid quantity

---

## 🔧 Utilities

### Generate Client ID
```tsx
import { generateId } from '@/lib/utils';

const id = generateId(); // Returns 24-digit string
```

### Format Currency
```tsx
import { formatCurrency } from '@/lib/utils';

formatCurrency(99.99); // Returns "AED 99.99"
```

---

## 📝 TypeScript Types

```typescript
import { Cart, OrderItem } from '@/types';

// OrderItem properties
interface OrderItem {
  clientId: string;
  productIds: string[];
  name: string;
  slug: string;
  category: string;
  quantity: number;
  countInStock: number;
  image: string;
  price: number;
  totalPrice: number;
  size?: string;
  color?: string;
}

// Cart properties
interface Cart {
  clientId: string;
  items: OrderItem[];
  totalPrice: number;
  taxPrice: number;
  shippingPrice: number;
  grandTotalPrice: number;
  totalItems: number;
  paymentMethod?: 'paypal' | 'stripe' | 'cod';
  deliveryDateIndex?: number;
  expectedDeliveryDate?: Date;
}
```

---

## 🎨 Styling Notes

### Responsive Button Classes
```tsx
// Mobile first, then responsive
className="text-xs sm:text-[10px] md:text-xs py-1.5 px-3 sm:py-1 sm:px-2"
```

### Badge Positioning
```tsx
<div className="relative">
  <CartIcon />
  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
    {count}
  </span>
</div>
```

---

## 🐛 Debugging Tips

1. **Cart not persisting?**
   - Check localStorage: `localStorage.getItem('cart-store')`
   - Clear storage: `localStorage.clear()`

2. **Toast not showing?**
   - Ensure `<ToastContainer />` is in root layout
   - Import CSS: `import 'react-toastify/dist/ReactToastify.css'`

3. **Prices not updating?**
   - Check if `calculateDateAndPrice` is called
   - Verify `totalPrice` recalculation in operations

4. **Stock validation failing?**
   - Verify `countInStock` is passed correctly
   - Check quantity against stock before operations

---

## 📚 Resources

- **Full Documentation:** `CART_IMPLEMENTATION.md`
- **Store Implementation:** `lib/hooks/useCartStore.ts`
- **Price Calculations:** `lib/actions/order.action.ts`
- **Type Definitions:** `types/index.ts`, `lib/validator.ts`

---

**Questions?** Check the full documentation or review inline code comments.
