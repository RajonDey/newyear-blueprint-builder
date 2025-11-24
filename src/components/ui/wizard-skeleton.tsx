import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const WizardSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <Skeleton className="h-9 w-64 mx-auto mb-3" />
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>

      <Card className="p-8">
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-4 w-32" />

        <div className="mt-6">
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>

      <div className="flex justify-between mt-8">
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-12 w-32" />
      </div>
    </div>
  );
};
