import { useState, useCallback, useRef, useEffect } from 'react';

interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

interface SwipeGestureOptions {
  threshold?: number; // Mindestabstand für Swipe-Erkennung (in px)
  velocityThreshold?: number; // Mindestgeschwindigkeit für Swipe (in px/ms)
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  enabled?: boolean;
}

interface SwipeGestureState {
  isSwipeing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
}

export const useSwipeGestures = (options: SwipeGestureOptions) => {
  const {
    threshold = 50,
    velocityThreshold = 0.3,
    onSwipe,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    enabled = true
  } = options;

  const [state, setState] = useState<SwipeGestureState>({
    isSwipeing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0
  });

  const startTime = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;

    const touch = e.touches[0];
    const now = Date.now();

    setState({
      isSwipeing: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX: 0,
      deltaY: 0
    });

    startTime.current = now;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !state.isSwipeing) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - state.startX;
    const deltaY = touch.clientY - state.startY;

    setState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      deltaX,
      deltaY
    }));
  }, [enabled, state.isSwipeing, state.startX, state.startY]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!enabled || !state.isSwipeing) return;

    const endTime = Date.now();
    const duration = endTime - startTime.current;
    const velocity = Math.sqrt(state.deltaX ** 2 + state.deltaY ** 2) / duration;

    const absDeltaX = Math.abs(state.deltaX);
    const absDeltaY = Math.abs(state.deltaY);

    // Prüfe ob es ein gültiger Swipe ist
    if (velocity >= velocityThreshold && (absDeltaX >= threshold || absDeltaY >= threshold)) {
      let direction: SwipeDirection['direction'];

      if (absDeltaX > absDeltaY) {
        // Horizontaler Swipe
        direction = state.deltaX > 0 ? 'right' : 'left';
      } else {
        // Vertikaler Swipe
        direction = state.deltaY > 0 ? 'down' : 'up';
      }

      const swipeDirection: SwipeDirection = {
        direction,
        distance: Math.max(absDeltaX, absDeltaY),
        velocity
      };

      // Callback aufrufen
      onSwipe?.(swipeDirection);

      // Spezifische Callbacks
      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }
    }

    // State zurücksetzen
    setState({
      isSwipeing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      deltaX: 0,
      deltaY: 0
    });
  }, [enabled, state, velocityThreshold, threshold, onSwipe, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const attachListeners = useCallback((element: HTMLElement) => {
    if (!element) return;

    elementRef.current = element;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const detachListeners = useCallback(() => {
    if (!elementRef.current) return;

    elementRef.current.removeEventListener('touchstart', handleTouchStart);
    elementRef.current.removeEventListener('touchmove', handleTouchMove);
    elementRef.current.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      detachListeners();
    };
  }, [detachListeners]);

  return {
    ...state,
    attachListeners,
    detachListeners,
    // Hilfsfunktionen
    getSwipeProgress: () => {
      const absDeltaX = Math.abs(state.deltaX);
      const absDeltaY = Math.abs(state.deltaY);
      return Math.min(Math.max(absDeltaX, absDeltaY) / threshold, 1);
    },
    getSwipeDirection: () => {
      const absDeltaX = Math.abs(state.deltaX);
      const absDeltaY = Math.abs(state.deltaY);
      
      if (absDeltaX > absDeltaY) {
        return state.deltaX > 0 ? 'right' : 'left';
      } else {
        return state.deltaY > 0 ? 'down' : 'up';
      }
    }
  };
};
