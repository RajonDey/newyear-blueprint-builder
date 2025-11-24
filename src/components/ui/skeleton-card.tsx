import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showContent?: boolean;
  showFooter?: boolean;
  lines?: number;
}

export const SkeletonCard = ({
  className,
  showHeader = true,
  showContent = true,
  showFooter = false,
  lines = 3,
}: SkeletonCardProps) => {
  return (
    <Card className={cn("p-6 space-y-4", className)}>
      {showHeader && (
        <div className="space-y-2">
          <div className="skeleton-text h-6 w-3/4" />
          <div className="skeleton-text h-4 w-1/2" />
        </div>
      )}
      
      {showContent && (
        <div className="space-y-3">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="skeleton-text"
              style={{ width: `${Math.random() * 20 + 70}%` }}
            />
          ))}
        </div>
      )}
      
      {showFooter && (
        <div className="flex gap-2 pt-2">
          <div className="skeleton h-10 w-24" />
          <div className="skeleton h-10 w-24" />
        </div>
      )}
    </Card>
  );
};

interface SkeletonListProps {
  count?: number;
  className?: string;
}

export const SkeletonList = ({ count = 3, className }: SkeletonListProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

interface SkeletonAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const SkeletonAvatar = ({ size = "md", className }: SkeletonAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("skeleton-circle", sizeClasses[size], className)} />
  );
};

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText = ({ lines = 1, className }: SkeletonTextProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-text"
          style={{ width: i === lines - 1 ? "80%" : "100%" }}
        />
      ))}
    </div>
  );
};
