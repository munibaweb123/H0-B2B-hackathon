"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import { ClientResponse, formatPKR, STAGE_LABELS, STAGE_COLORS, STAGE_ORDER } from "@/types";

type StageFilter = "all" | ClientResponse["stage"];

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StageFilter>("all");

  useEffect(() => {
    async function loadClients() {
      try {
        const data = await apiGet<ClientResponse[]>("/clients");
        setClients(data);
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    }
    loadClients();
  }, []);

  const filteredClients = activeFilter === "all"
    ? clients
    : clients.filter(c => c.stage === activeFilter);

  const formatLastContact = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif text-2xl font-bold text-maroon-dark">Clients Pipeline</h1>
            <p className="text-text-muted text-sm mt-1">
              Manage your real estate leads and active negotiations.
            </p>
          </div>
          <Link href="/clients/new">
            <Button className="bg-maroon-dark text-white hover:bg-maroon-medium">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </Link>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex gap-1 border-b border-maroon-light/20">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === "all"
                ? "border-b-2 border-pink-accent text-pink-accent"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            All
          </button>
          {STAGE_ORDER.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveFilter(stage)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === stage
                  ? "border-b-2 border-pink-accent text-pink-accent"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {STAGE_LABELS[stage]}
            </button>
          ))}
        </div>

        {/* Clients Table */}
        <div className="rounded-xl border border-maroon-light/20 bg-white overflow-hidden">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-maroon-light/40" />
              <h3 className="font-medium text-text-primary mb-1">
                {activeFilter === "all" ? "No clients yet" : `No clients in ${STAGE_LABELS[activeFilter as ClientResponse["stage"]]}`}
              </h3>
              <p className="text-sm text-text-muted mb-4">
                {activeFilter === "all"
                  ? "Add your first lead to get started."
                  : "Clients will appear here as they move through the pipeline."}
              </p>
              {activeFilter === "all" && (
                <Link href="/clients/new">
                  <Button className="bg-maroon-dark text-white hover:bg-maroon-medium">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-maroon-light/10 bg-cream/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-maroon-light/5 hover:bg-cream/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-maroon-light/20 flex items-center justify-center text-maroon-dark font-medium text-sm">
                          {client.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-text-primary">{client.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">
                      {client.phone}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">
                      {client.preferred_city || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-text-primary">
                      {client.budget_max
                        ? formatPKR(client.budget_max)
                        : client.budget_min
                        ? `From ${formatPKR(client.budget_min)}`
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STAGE_COLORS[client.stage]}`}>
                        {STAGE_LABELS[client.stage]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-text-muted">
                      {formatLastContact(client.updated_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/clients/${client.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4 text-text-muted" />
                          </Button>
                        </Link>
                        <Link href={`/clients/${client.id}?edit=true`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4 text-text-muted" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination info */}
        {filteredClients.length > 0 && (
          <div className="flex justify-between items-center text-sm text-text-muted">
            <span>Showing 1 to {filteredClients.length} of {filteredClients.length} entries</span>
          </div>
        )}
      </div>
  );
}
