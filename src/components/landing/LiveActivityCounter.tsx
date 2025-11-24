import { useState, useEffect } from "react";
import { Users } from "lucide-react";

export const LiveActivityCounter = () => {
  const [count, setCount] = useState(47);

  useEffect(() => {
    // Simulate live activity - increment randomly
    const interval = setInterval(() => {
      setCount((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newCount = prev + change;
        // Keep between 40-60
        return Math.max(40, Math.min(60, newCount));
      });
    }, 8000); // Update every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full animate-fade-in">
      <div className="relative">
        <Users className="w-4 h-4 text-success" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full animate-pulse"></span>
      </div>
      <span className="text-sm font-medium text-success">
        <strong>{count}</strong> people viewing now
      </span>
    </div>
  );
};

