import React, { useState, useRef, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

/**
 * PullToRefresh component that mimics Gmail Android app behavior.
 * @param {Object} props
 * @param {Function} props.onRefresh - Callback function to trigger on refresh.
 * @param {boolean} props.isRefreshing - External loading state.
 * @param {React.ReactNode} props.children - Content to wrap.
 */
export const PullToRefresh = ({ onRefresh, isRefreshing: externalRefreshing, children }) => {
  const [pulling, setPulling] = useState(false);
  const [pullHeight, setPullHeight] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const isAtTop = useRef(true);

  // Sync with external refreshing state if provided
  useEffect(() => {
    if (externalRefreshing !== undefined) {
      setIsRefreshing(externalRefreshing);
      if (!externalRefreshing) {
        setPullHeight(0);
        setPulling(false);
      }
    }
  }, [externalRefreshing]);

  const handleTouchStart = (e) => {
    // Check if scroll is at top
    isAtTop.current = window.scrollY === 0;
    if (isAtTop.current) {
      startY.current = e.touches[0].pageY;
      currentY.current = startY.current;
    }
  };

  const handleTouchMove = (e) => {
    if (!isAtTop.current || isRefreshing) return;

    currentY.current = e.touches[0].pageY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Prevent browser default pull-to-refresh on mobile
      if (diff > 10) {
        setPulling(true);
        // Apply resistance
        const newHeight = Math.min(diff * 0.4, 120);
        setPullHeight(newHeight);
        
        // If we've pulled enough, prevent default to avoid scrolling
        if (e.cancelable) e.preventDefault();
      }
    } else {
      setPulling(false);
      setPullHeight(0);
    }
  };

  const handleTouchEnd = () => {
    if (!pulling || isRefreshing) return;

    if (pullHeight > 60) {
      triggerRefresh();
    } else {
      setPullHeight(0);
      setPulling(false);
    }
  };

  const triggerRefresh = () => {
    setIsRefreshing(true);
    // Keep it visible for a moment even if refetch is instant
    const refreshPromise = onRefresh ? onRefresh() : Promise.resolve();
    
    Promise.resolve(refreshPromise).finally(() => {
      // Small delay for smooth transition
      setTimeout(() => {
        setIsRefreshing(false);
        setPullHeight(0);
        setPulling(false);
      }, 500);
    });
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-full"
    >
      {/* Pull Indicator */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[100] transition-all pointer-events-none"
        style={{
          top: isRefreshing ? "80px" : `${pullHeight}px`,
          opacity: pulling || isRefreshing ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${Math.min(pullHeight / 60, 1)})`,
        }}
      >
        <div className="bg-white rounded-full p-2 shadow-lg border border-gray-100 flex items-center justify-center">
          <RefreshCw 
            className={`w-6 h-6 text-orange-600 ${isRefreshing ? "animate-spin" : ""}`} 
            style={{ 
              transform: !isRefreshing ? `rotate(${pullHeight * 3}deg)` : undefined 
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: pulling && !isRefreshing ? `translateY(${pullHeight / 3}px)` : "none" 
        }}
      >
        {children}
      </div>
    </div>
  );
};
