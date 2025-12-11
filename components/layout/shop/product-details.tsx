'use client'
import React, { useState } from 'react';
import { Star, Minus, Plus, CreditCard, Banknote } from 'lucide-react';
import { p } from 'framer-motion/client';
import { IProduct } from '@/lib/db/models/product.model';
import { formatCurrency } from '@/lib/utils';
import AddToCartButton from './addToCart';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type ProductDetailsProps = {
    product: IProduct;
};

const ProductDetailsInfo = (props: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const { product } = props

  const count = product.countInStock ?? 0;
  const isOutOfStock = count <= 0;
  const isLowStock = count > 0 && count < 3;

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };
  const handleIncrement = () => {
    setQuantity(q => q + 1);
  };

  return (
    <div className="flex flex-col gap-6 font-spectral px-6">
      
      {/* Title & Price */}
      <div className=''>
        <div className="flex items-center gap-2 mb-2 text-sm text-secondary font-medium uppercase tracking-wider">
          Gift Boxes
        </div>
        <h1 className="text-3xl md:text-4xl font-inter cursor-pointer mb-3">
          {product.name}
        </h1>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl font-semibold">
            {formatCurrency(product.price)}
          </span>
          
          <div className="flex items-center gap-1 text-md border-l border-gray-300 pl-4">
            <div className="flex text-[#FFC67D]">
               {[...Array(5)].map((_, i) => (
                 <Star key={i} size={14} fill={i < Math.floor(product.avgRating || 0) ? "currentColor" : "none"} />
               ))}
            </div>
            <span className="opacity-70">({product.numReviews})</span>
          </div>
        </div>

        {/* Low stock / Out of stock alerts */}
        {isLowStock && (
          <div className="text-sm text-red-600 font-medium mb-2">
            Only {count} left in stock — order soon.
          </div>
        )}
        {isOutOfStock && (
          <div className="text-sm text-red-700 font-semibold mb-2">
            Out of stock
          </div>
        )}
      </div>

      <hr className="border-black opacity-50" />

      {/* Cart Actions */}
      <div className="flex flex-col gap-4">
        
        <div className="max-[375]:flex-1 flex items-stretch gap-4">
          {/* Quantity Counter */}
          <div className="flex items-center border border-black rounded-md w-32 justify-between px-2">
            <button 
              onClick={handleDecrement}
              aria-label="Decrease quantity"
              disabled={isOutOfStock}
              className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Minus size={16} />
            </button>
            <input 
              type="number" 
              min="1" 
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={isOutOfStock}
              className="w-8 text-center bg-transparent font-medium focus:outline-none appearance-none m-0"
            />
            <button 
              onClick={handleIncrement}
              aria-label="Increase quantity"
              disabled={isOutOfStock}
              className={`p-2 hover:bg-gray-100 rounded-full transition-colors ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add to Cart Button or Disabled Out of Stock Button */}
          {isOutOfStock ? (
            <button 
              className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md flex justify-center items-center gap-2 opacity-75 cursor-not-allowed"
              disabled
            >
              Out of stock
            </button>
          ) : (
            <AddToCartButton
              className='hidden min-[375]:block flex-1 text-sm py-3 px-6 rounded-md transition-all '
              price={product.price}
              quantity={quantity}
              text="Add to Cart"
              successText="Added!"
              cartColor="text-white"
              itemColor="bg-brown-400"
              buttonColor="bg-primary hover:bg-gray-800"
              textColor="text-white"
              product={{
                _id: product._id.toString(),
                name: product.name,
                slug: product.slug,
                category: product.category,
                images: product.images,
                price: product.price,
                countInStock: product.countInStock || 0
              }}
            />
          )}
        </div>
        
        {/* Payment Methods */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
           {/* <span className="flex items-center gap-1 border px-2 py-1 rounded">
             <CreditCard size={12}/> Visa
           </span>
           <span className="flex items-center gap-1 border px-2 py-1 rounded">
             <CreditCard size={12}/> Mastercard
           </span>
           <span className="flex items-center gap-1 border px-2 py-1 rounded">
             Tabby
           </span> */}
           <span className="flex items-center gap-1 border px-2 py-1 rounded hover:border-secondary hover:scale-105 hover:text-secondary transition-all cursor-pointer">
             <Banknote size={12}/> COD
           </span>
        </div>
      </div>

      {/* --- NEW SECTION: Product Accordion --- */}
      <div className="w-full">
        <Accordion type="single" collapsible className="w-full">
          
          {/* Description Item */}
          <AccordionItem value="description">
            <AccordionTrigger className="text-base font-medium font-inter cursor-pointer">
              Description
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 leading-relaxed">
              {product.description || "No description available for this product."}
            </AccordionContent>
          </AccordionItem>

          {/* Dimensions Item */}
          <AccordionItem value="dimensions">
            <AccordionTrigger className="text-base font-medium font-inter cursor-pointer">
              Dimensions
            </AccordionTrigger>
            <AccordionContent className="text-gray-600">
              <ul className="list-disc pl-4 space-y-1">
                {Object.entries(product.dimensions || {}).map(([key, value]: [string, number | string]) => (
                 <li key={key} className="capitalize">
                   {key}: {value}
                 </li>
               ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Delivery Policy Item */}
          <AccordionItem value="delivery">
            <AccordionTrigger className="text-base font-medium font-inter cursor-pointer">
              Delivery Policy
            </AccordionTrigger>
            <AccordionContent className="text-gray-600">
              <p>
                Standard delivery within 3-5 business days. Express delivery available at checkout.
                Returns are accepted within 30 days of purchase for unused items in original packaging.
              </p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>

      {/* Mobile Sticky Bar Duplicate (Hidden on Desktop via CSS) */}
      <div className="sticky-bottom-mobile py-2">
          <div className="flex flex-col gap-3 justify-center">
            <div className="flex-col flex justify-center items-center">
              <span className="text-xs text-gray-500">Total</span>
              <span className="font-bold">{formatCurrency(product.price * quantity)}</span>
            </div>
            {isOutOfStock ? (
              <button 
                className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 rounded-md opacity-75 cursor-not-allowed"
                disabled
              >
                Out of stock
              </button>
            ) : (
              <AddToCartButton
                className="flex-1 text-sm py-3 rounded-md"
                price={product.price}
                quantity={quantity}
                text="Add to Cart"
                successText="Added!"
                cartColor="text-white"
                itemColor="bg-brown-400"
                buttonColor="bg-primary hover:bg-gray-800"
                textColor="text-white"
                showPrice={false}
                product={{
                  _id: product._id.toString(),
                  name: product.name,
                  slug: product.slug,
                  category: product.category,
                  images: product.images,
                  price: product.price,
                  countInStock: product.countInStock || 0
                }}
              />
            )}
          </div>
        </div>



    </div>
  );
};

export default ProductDetailsInfo;