import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  accent?: boolean;
  loading?: boolean;
}

export function StatCard({ title, value, Icon, accent, loading }: StatCardProps) {
  return (
    <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-muted">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-9 w-24" />
          ) : (
            <p className={`mt-1 font-serif text-3xl font-bold ${accent ? "text-green-600" : "text-maroon-dark"}`}>
              {value}
            </p>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${accent ? "bg-green-100" : "bg-maroon-dark/10"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-green-600" : "text-maroon-dark"}`} />
        </div>
      </div>
    </div>
  );
}
