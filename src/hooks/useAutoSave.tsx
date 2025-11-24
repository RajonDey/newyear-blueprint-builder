import { useEffect, useState, useRef } from "react";
import { safeLocalStorage } from "@/lib/storage";

export const useAutoSave = <T,>(data: T, key: string, delay: number = 2000) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsSaving(true);
    timeoutRef.current = setTimeout(() => {
      const saved = safeLocalStorage.setItem(key, data);
      if (saved) {
        setLastSaved(new Date());
      }
      setIsSaving(false);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, delay]);

  const loadSaved = (): T | null => {
    return safeLocalStorage.getItem<T | null>(key, null);
  };

  const clearSaved = () => {
    safeLocalStorage.removeItem(key);
    setLastSaved(null);
  };

  return { lastSaved, isSaving, loadSaved, clearSaved };
};
