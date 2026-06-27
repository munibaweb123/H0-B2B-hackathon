"use client";

import { useEffect, useState } from "react";
import { Building2, Users, TrendingUp, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/StatCard";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { apiGet } from "@/lib/api";
import { ClientResponse, DashboardStats, formatPKR } from "@/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<DashboardStats>("/dashboard"),
      apiGet<ClientResponse[]>("/clients"),
    ])
      .then(([s, c]) => {
        setStats(s);
        setClients(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-maroon-dark">Dashboard</h1>
        <p className="text-sm text-text-muted">Your agency at a glance.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Total Listings" value={stats?.total_properties ?? 0} Icon={Building2} />
            <StatCard title="Active Clients" value={stats?.active_clients ?? 0} Icon={Users} />
            <StatCard
              title="Pipeline Value"
              value={stats ? formatPKR(stats.pipeline_value) : "—"}
              Icon={TrendingUp}
            />
            <StatCard title="Deals Closed" value={stats?.deals_closed ?? 0} Icon={CheckCircle} accent />
          </>
        )}
      </div>

      {/* Pipeline + Recent Activity */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PipelineChart clients={clients} />
          <RecentActivity clients={clients} />
        </div>
      )}
    </div>
  );
}
