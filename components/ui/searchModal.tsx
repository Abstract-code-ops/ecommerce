"use client";
import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-100 bg-foreground/80 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div className="container mx-auto px-4 pt-24">
          <div
            className="max-w-3xl mx-auto bg-card rounded-2xl shadow-strong p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Search Products
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-earthy-brown cursor-pointer rounded-full transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earthy-brown" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for paper bags, gift boxes, and more..."
                className="w-full pl-12 pr-4 py-4 border-2 border-border focus:border-[#426f5e] rounded-xl outline-none transition-colors text-foreground placeholder:text-earthy-brown"
              />
            </div>

            <div className="mt-6">
              <p className="text-sm text-earthy-brown mb-3">
                Popular Searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {["Brown Paper Bags", "Gift Boxes", "White Bags", "Eco-Friendly", "Bulk Orders"].map(
                  (term) => (
                    <button
                      key={term}
                      className="px-4 py-2 bg-[#426f5e] hover:bg-primary hover:text-primary-foreground rounded-full text-sm font-medium transition-colors cursor-pointer"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 240ms ease-out forwards;
        }
        .animate-scale-in {
          transform-origin: center;
          animation: scaleIn 320ms cubic-bezier(.2,.8,.2,1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: translateY(8px) scale(0.995); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in, .animate-scale-in {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default SearchModal;