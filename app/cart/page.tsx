'use client'
import React from 'react'
import useCartStore from '@/lib/hooks/useCartStore'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus } from 'lucide-react'
import { toast } from 'react-toastify'
import ShippingAddressForm from '@/components/shared/shipping-address-form'
import { saveShippingAddress } from '@/lib/actions/user.actions'
import { ShippingAddressSchema } from '@/lib/validator'
import { z } from 'zod'
import { Separator } from '@/components/ui/separator'

const CartPage = () => {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();

  const handleAddressSave = async (address: z.infer<typeof ShippingAddressSchema>) => {
    const result = await saveShippingAddress(address);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveItem = (clientId: string, itemName: string) => {
    removeItem(clientId);
    toast.success(`${itemName} removed from cart`);
  };

  const handleUpdateQuantity = async (clientId: string, newQuantity: number, itemName: string) => {
    try {
      await updateQuantity(clientId, newQuantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update quantity');
    }
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 py-16 text-center font-inter">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add some items to get started!</p>
        <Link 
          href="/shop" 
          className="inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        {cart.items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-sm text-red-600 hover:text-red-800 hover:underline cursor-pointer"
          >
            Clear Cart
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-4">
            {cart.items.map((item, index) => (
              <React.Fragment key={item.clientId}>
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="relative w-full h-48 sm:w-24 sm:h-24 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link 
                      href={`/shop/products/${item.slug}`}
                      className="font-semibold hover:text-primary hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                    
                    {/* Size & Color */}
                    <div className="flex gap-4 mt-2 text-sm">
                      {item.size && (
                        <span className="text-gray-600">Size: <span className="font-medium">{item.size}</span></span>
                      )}
                      {item.color && (
                        <span className="text-gray-600">Color: <span className="font-medium">{item.color}</span></span>
                      )}
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
                      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                        <span className="font-bold text-lg">{formatCurrency(item.price)}</span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() => handleUpdateQuantity(item.clientId, item.quantity - 1, item.name)}
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.clientId, item.quantity + 1, item.name)}
                            disabled={item.quantity >= item.countInStock}
                            className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                        <span className="font-semibold text-primary">
                          {formatCurrency(item.totalPrice)}
                        </span>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.clientId, item.name)}
                          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {index < cart.items.length - 1 && <Separator className="my-4" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping Address */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(cart.items.reduce((acc, item) => acc + item.totalPrice, 0))}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping (15%)</span>
                <span className="font-semibold">{formatCurrency(cart.shippingPrice || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%)</span>
                <span className="font-semibold">{formatCurrency(cart.taxPrice || 0)}</span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{formatCurrency(cart.totalPrice || 0)}</span>
              </div>
            </div>

            <button className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-gray-800 transition-colors cursor-pointer">
              Proceed to Checkout
            </button>
            
            <Link 
              href="/shop" 
              className="block text-center text-sm text-gray-600 mt-4 hover:text-primary hover:underline"
            >
              Continue Shopping
            </Link>
          </div>

          <ShippingAddressForm onSave={handleAddressSave} />
        </div>
      </div>
    </div>
  )
}

export default CartPage