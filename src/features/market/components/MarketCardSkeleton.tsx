import { Skeleton } from "../../../shared/ui/components/skeleton";

export function MarketCardSkeleton() {
    return (
        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Skeleton className="w-full h-full rounded-none" />
                <div className="absolute top-4 left-4 flex gap-2">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="absolute top-4 right-4 w-9 h-9 rounded-full" />
            </div>
            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-7 w-24" />
                    </div>
                    <Skeleton className="h-8 w-12 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
