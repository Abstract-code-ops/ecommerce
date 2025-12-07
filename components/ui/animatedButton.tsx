'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const AnimatedButton = ({ children, className = '', onClick }: ButtonProps) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [spanStyles, setSpanStyles] = useState<{ top: string; left: string; width: string }>({
    top: '0px',
    left: '0px',
    width: '0%',
  });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    // Calculate position relative to the button
    const rect = btn.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    // Original Math logic to calculate scale
    // This determines how large the circle needs to be to cover the button based on entry point
    const scale = Math.round(
      ((Math.abs(relX - btn.offsetWidth / 2) / (btn.offsetWidth / 2) + 1) * 100)
    );

    setSpanStyles({
      top: `${relY}px`,
      left: `${relX}px`,
      width: `calc(${scale}% + 2rem)`, // Added slightly more buffer than 1rem for safety
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    setSpanStyles({
      top: `${relY}px`,
      left: `${relX}px`,
      width: '0%',
    });
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        `
        relative overflow-hidden rounded-md border border-white bg-transparent 
        px-3 py-1.5 font-medium text-sm transition-colors duration-300 ease-in-out
        hover:text-white cursor-pointer group
      `,
        className
      )}
    >
      <span className="relative z-10 group-hover:text-black font-inter">{children}</span>
      
      {/* The Ripple Span */}
      <span
        className="absolute block aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-[width] duration-300 ease-in-out"
        style={{
          top: spanStyles.top,
          left: spanStyles.left,
          width: spanStyles.width,
          // Ensure z-index places it behind text but above background
          zIndex: 0, 
        }}
      />
    </button>
  );
};

export default AnimatedButton;