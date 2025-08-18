"use client";

import { cn } from "../../utils/cn";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { TbX } from "react-icons/tb";

interface Props {
  children: React.ReactNode;
  title: string; // required for accessibility
  open: boolean;
  close: () => void;
  className?: string;
}

export default function Sheet({
  children,
  open,
  close,
  className,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStartRef = useRef(0);

  // Handle entrance and exit animations
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsClosing(false);
      setDragOffset(0);
    } else {
      setIsClosing(true);
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close sheet when escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        close();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, close]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    dragStartRef.current = e.clientX;

  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault(); // Prevent text selection
    const currentX = e.clientX;
    const offset = currentX - dragStartRef.current;
    
    // Only allow dragging to the right (positive offset)
    if (offset > 0) {
      setDragOffset(offset);
    }
  }, [isDragging]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      
      // If dragged more than 100px to the right, close the sheet
      if (dragOffset > 100) {
        // Animate the slide-out before closing
        setDragOffset(400); // Slide it completely off-screen
        setTimeout(() => {
          close();
        }, 200); // Close after animation completes
      } else {
        // Snap back to original position
        setDragOffset(0);
      }
    }
  }, [isDragging, dragOffset, close]);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove, { passive: false });
      document.addEventListener('mouseup', handleDragEnd);
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!open && !isVisible) return null;

  // Calculate the transform based on state
  const getTransform = () => {
    if (isClosing) {
      // When closing, animate from current position to off-screen
      return 'translateX(100%)'; // This will animate from 0 to 100%
    }
    if (isVisible) {
      return `translateX(${dragOffset}px)`; // Current position (including drag)
    }
    return 'translateX(100%)'; // Off-screen initially
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-500 bg-black/40 backdrop-blur-xs transition-all duration-300 ease-out",
          isVisible && !isClosing ? "opacity-100" : "opacity-0"
        )}
        onClick={close}
      />
      
      {/* Sheet */}
      <div
        className={cn(
          "fixed right-0 top-4 z-501 h-[calc(100vh-32px)] w-[calc(100vw-32px)] overflow-hidden outline-hidden md:w-[450px] lg:w-[500px] xl:w-[550px]",
          "bg-white shadow-2xl rounded-l-3xl transition-all duration-300 ease-out",
          className,
        )}
        style={{
          transform: getTransform(),
        }}
      >
        <div className="relative h-full flex">
          {/* Grabbable Handle on Left Edge */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pl-2"
            onMouseDown={handleDragStart}
          >
            <div className="h-16 w-2 bg-gray-300 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center hover:bg-gray-400 transition-colors select-none">
              <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
          >
            <TbX />
          </button>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
