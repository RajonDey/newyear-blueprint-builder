import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="p-6 bg-gradient-primary border-0 text-center shadow-elegant">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-white" />
        <span className="text-white font-semibold text-sm uppercase tracking-wide">
          Early Access Pricing Ends In
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 uppercase">Hours</div>
        </div>
        <div className="text-2xl sm:text-3xl text-white">:</div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 uppercase">Minutes</div>
        </div>
        <div className="text-2xl sm:text-3xl text-white">:</div>
        <div className="text-center">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] sm:text-xs text-white/80 uppercase">Seconds</div>
        </div>
      </div>

      <p className="text-white/90 text-sm">
        Lock in $12 pricing before it returns to regular $19
      </p>
    </Card>
  );
};
