import { useState, useCallback, useRef, useEffect } from 'react';

interface PullToRefreshOptions {
  threshold?: number; // Mindestabstand für Pull-to-Refresh (in px)
  resistance?: number; // Widerstand beim Ziehen (0-1)
  onRefresh: () => Promise<void> | void; // Callback für Refresh
  enabled?: boolean; // Ob Pull-to-Refresh aktiviert ist
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
}

export const usePullToRefresh = (options: PullToRefreshOptions) => {
  const {
    threshold = 80,
    resistance = 0.5,
    onRefresh,
    enabled = true
  } = options;

  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    canRefresh: false
  });

  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || state.isRefreshing) return;

    const touch = e.touches[0];
    startY.current = touch.clientY;
    currentY.current = touch.clientY;
  }, [enabled, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || state.isRefreshing) return;

    const touch = e.touches[0];
    currentY.current = touch.clientY;

    const pullDistance = Math.max(0, (currentY.current - startY.current) * resistance);
    const canRefresh = pullDistance >= threshold;

    setState(prev => ({
      ...prev,
      isPulling: pullDistance > 0,
      pullDistance,
      canRefresh
    }));

    // Verhindere Standard-Scroll-Verhalten wenn wir ziehen
    if (pullDistance > 0) {
      e.preventDefault();
    }
  }, [enabled, state.isRefreshing, threshold, resistance]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || state.isRefreshing) return;

    if (state.canRefresh) {
      setState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false
      }));

      try {
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      } finally {
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          pullDistance: 0,
          canRefresh: false
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canRefresh: false
      }));
    }
  }, [enabled, state.isRefreshing, state.canRefresh, onRefresh]);

  const attachListeners = useCallback((element: HTMLElement) => {
    if (!element) return;

    elementRef.current = element;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
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
    getPullProgress: () => Math.min(state.pullDistance / threshold, 1),
    getPullOpacity: () => Math.min(state.pullDistance / threshold, 0.8)
  };
};
