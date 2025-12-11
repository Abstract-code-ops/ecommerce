'use client'
import React from 'react'
import useCartStore from '@/lib/hooks/useCartStore'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ShoppingBasketIcon, Banknote, CreditCard } from 'lucide-react'
import { toast } from 'react-toastify'
import ShippingAddressForm from '@/components/shared/shipping-address-form'
import { saveShippingAddress } from '@/lib/actions/user.actions'
import { ShippingAddressSchema } from '@/lib/validator'
import { z } from 'zod'
import { Separator } from '@/components/ui/separator'

const CartPage = () => {
  const { cart, removeItem, updateQuantity, clearCart, setPaymentMethod } = useCartStore();

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
    <div className="w-full max-w-7xl mx-auto px-2 py-8">
      <div className="font-inter w-full flex justify-between items-center m-8">
        <div className='flex-1 flex items-center justify-center gap-2'>
          <ShoppingBasketIcon size={31}/>
          <h1 className="text-3xl font-semibold">
            My Cart
          </h1>
        </div>
        {cart.items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-sm self-end mr-10 text-red-600 hover:text-red-800 hover:underline cursor-pointer"
          >
            Clear Cart
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="border shadow-lg p-4">
            {cart.items.map((item, index) => (
              <React.Fragment key={item.clientId}>
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <div className="relative w-full max-w-[400px] sm:max-w-[250px] aspect-square shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 200px"
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>

                  {/* Product Details */}
                  <div className="font-inter flex-1 flex flex-col justify-around">
                    <div className="">
                      <div className="flex justify-between items-center">
                        <Link 
                          href={`/shop/products/${item.slug}`}
                          className="font-semibold text-md md:text-lg lg:text-2xl hover:text-secondary hover:underline"
                        >
                          {item.name} 
                        </Link>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.clientId, item.name)}
                          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="font-medium text-black/40 text-md mt-1">{formatCurrency(item.price)}</p>
                    </div>
                    
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
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleUpdateQuantity(item.clientId, item.quantity - 1, item.name)}
                            disabled={item.quantity <= 1}
                            className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.clientId, item.quantity + 1, item.name)}
                            disabled={item.quantity >= item.countInStock}
                            className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto pt-2 sm:pt-0">
                        <span className="font-medium text-primary flex items-center gap-2">
                          <p className='text-gray-500'>Total: </p> {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {index < cart.items.length - 1 && <Separator className="my-4 text-black" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Order Summary & Shipping Address */}
        <div className="md:col-span-1 space-y-6 bg-gray-50 p-6 font-inter h-fit shadow-xl">

            <ShippingAddressForm onSave={handleAddressSave} />

            <Separator />

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
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
              
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary">{formatCurrency(cart.totalPrice || 0)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Method Selection */}
          <div className="px-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentMethod('Card')}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  cart.paymentMethod === 'Card'
                    ? 'border-secondary bg-primary/2 ring-2 ring-secondary text-secondary ring-offset-1'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                }`}
              >
                {/* <CreditCard className={`mb-2 ${cart.paymentMethod === 'Card' ? 'text-primary' : 'text-gray-600'}`} size={28} />
                <span className={`text-sm font-medium ${cart.paymentMethod === 'Card' ? 'text-primary' : 'text-gray-700'}`}>Card</span> */}
                <h3>Cash Payment</h3>
                <h3>Coming Soon</h3>
              </button>

              <button
                onClick={() => setPaymentMethod('CashOnDelivery')}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  cart.paymentMethod === 'CashOnDelivery'
                    ? 'border-secondary bg-primary/2 ring-2 ring-secondary text-secondary ring-offset-1'
                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                }`}
              >
                <Banknote className={`mb-2 ${cart.paymentMethod === 'CashOnDelivery' ? 'text-secondary' : 'text-gray-600'}`} size={28} />
                <span className={`text-sm font-medium ${cart.paymentMethod === 'CashOnDelivery' ? 'text-secondary' : 'text-gray-700'}`}>Cash on Delivery</span>
              </button>
            </div>
          </div>

          <Separator />
            <button className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-gray-800 active:scale-95 transition-colors cursor-pointer">
              Proceed to Checkout
            </button>
            
            <Link 
              href="/shop" 
              className="block text-center text-sm text-gray-600 mt-4 hover:text-primary hover:underline"
            >
              Continue Shopping
            </Link>
        </div>
      </div>
    </div>
  )
}

export default CartPage