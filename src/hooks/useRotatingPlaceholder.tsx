import { useState, useEffect } from "react";

export const useRotatingPlaceholder = (placeholders: string[], interval: number = 3000) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (placeholders.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % placeholders.length);
    }, interval);

    return () => clearInterval(timer);
  }, [placeholders.length, interval]);

  return placeholders[currentIndex] || placeholders[0];
};
