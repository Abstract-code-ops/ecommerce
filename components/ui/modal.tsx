"use client";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Track nested modals to avoid restoring overflow prematurely
let modalCount = 0;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, title, className }: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Only capture previous overflow on first modal
      if (modalCount === 0) {
        previousOverflowRef.current = document.body.style.overflow;
      }
      modalCount++;
      document.body.style.overflow = "hidden";
    }

    return () => {
      if (isOpen) {
        modalCount--;
        // Only restore when all modals are closed
        if (modalCount === 0) {
          document.body.style.overflow = previousOverflowRef.current ?? "unset";
          previousOverflowRef.current = null;
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
