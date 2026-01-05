import { Card, CardContent } from "../../../shared/ui/components/card";
import { Skeleton } from "../../../shared/ui/components/skeleton";

export function JobCardSkeleton() {
    return (
        <Card className="border border-border bg-card shadow-md">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="w-14 h-14 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-9 rounded-lg" />
                </div>

                <div className="bg-muted/30 rounded-lg p-3 mb-4 border border-border/50">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-7 w-24 rounded-md" />
                        <Skeleton className="h-7 w-24 rounded-md" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-lg" />
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-2 w-2 rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
