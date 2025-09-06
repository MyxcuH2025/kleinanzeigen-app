import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook für Suchhistorie
export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useLocalStorage<Array<{
    query: string;
    category: string;
    timestamp: number;
  }>>('searchHistory', []);

  const addToHistory = (query: string, category: string) => {
    const newEntry = {
      query,
      category,
      timestamp: Date.now()
    };

    setSearchHistory(prev => {
      // Entferne Duplikate und behalte nur die letzten 10 Einträge
      const filtered = prev.filter(entry => 
        entry.query !== query || entry.category !== category
      );
      return [newEntry, ...filtered].slice(0, 10);
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory
  };
}

// Hook für Undo/Redo Funktionalität
export function useUndoRedo<T>(initialValue: T) {
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const updateValue = (newValue: T) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newValue);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (canUndo) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (canRedo) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return {
    currentValue: history[currentIndex],
    updateValue,
    undo,
    redo,
    canUndo,
    canRedo
  };
} 