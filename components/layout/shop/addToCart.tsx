'use client'
import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ShoppingCart, Check, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

const AddToCartButton = ({
  className,
  price,
  quantity = 1,
  text = "Add to Cart",
  successText = "Added!",
  cartColor = "text-white",
  itemColor = "bg-yellow-400",
  buttonColor = "bg-blue-600 hover:bg-blue-700",
  textColor = "text-white",
  ItemIcon: ItemIcon = Package,
  onClick,
}: {
  className?: string;
  price?: number;
  quantity?: number;
  text?: string;
  successText?: string;
  cartColor?: string;
  itemColor?: string;
  buttonColor?: string;
  textColor?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  ItemIcon?: React.ElementType;
}) => {
  const [status, setStatus] = useState('idle'); // 'idle', 'animating', 'success'
  const controls = useAnimation();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
    if (status !== 'idle') return;

    setStatus('animating');

    // 1. Reset positions just in case
    await controls.start("initial");

    // 2. Start Animation Sequence
    // We run these animations in parallel or sequence using the variants below
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait for animation duration

    setStatus('success');

    // 3. Reset to idle after a delay
    setTimeout(() => {
      setStatus('idle');
    }, 2000);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(`relative overflow-hidden rounded-full text-xs px-0 py-3 font-semibold transition-colors duration-300 ${buttonColor} ${textColor} min-w-30 shadow-lg cursor-pointer active:scale-95`, className)}
    >
      {/* 1. Button Text (Fades out when animating) */}
      <span
        className={`flex items-center justify-center transition-opacity duration-300 ${
          status === 'idle' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {text}
        {price && <span className="hidden sm:inline text-xs opacity-70 ml-2">
            — {formatCurrency(price * quantity)}
        </span>}
      </span>

      {/* 2. Success Text (Fades in at the end) */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          status === 'success' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Check className="mr-2 h-4 w-4" />
        {successText}
      </span>

      {/* 3. The Animation Layer */}
      {status === 'animating' && (
        <div className="absolute inset-0 z-10">
          
          {/* The Moving Cart Wrapper */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ 
              x: [ -80, 0, 0, 200 ], // Slide in, stop, stay, slide out
              opacity: [0, 1, 1, 0] 
            }} 
            transition={{ 
              duration: 2, 
              times: [0, 0.3, 0.7, 1], // Timing percentages for the keyframes
              ease: "easeInOut" 
            }}
            className="absolute left-1/2 top-1/2 -ml-3 -mt-3" // Center the cart visually
          >
            {/* The Cart Icon */}
            <ShoppingCart className={`h-5 w-5 ${cartColor}`} />
            
            {/* 4. The Falling Icon Wrapper */}
            <motion.div
              initial={{ y: -50, scale: 0, opacity: 0 }}
              animate={{ 
                y: [ -40, 5, 4, 4 ], // Tweaked y:5 to make it drop *into* the cart deeper
                scale: [0.5, 1, 1, 1],
                opacity: 1,
                rotate: [0, -15, 0, 0] // Added slight rotation for tumbling effect
              }}
              transition={{ 
                duration: 2, 
                times: [0, 0.35, 0.4, 1], 
                ease: [0, 0.6, 0.4, 1.2] 
              }}
              className="absolute -top-3 left-1" // Adjusted position to center icon in cart
            >
              {/* Render the passed icon or default Package */}
              <ItemIcon className={`h-4 w-4 ${itemColor} bg-transparent`} /> 
            </motion.div>
          </motion.div>
        </div>
      )}
    </button>
  );
};

export default AddToCartButton;