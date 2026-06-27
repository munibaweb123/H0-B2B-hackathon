"use client";

import { useEffect, useState, useCallback } from "react";
import { KanbanBoard } from "@/components/pipeline/KanbanBoard";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/api";
import { ClientResponse, PipelineStage, STAGE_LABELS } from "@/types";

// Default stages to use if backend returns empty
const DEFAULT_STAGES: PipelineStage[] = [
  { id: "default-1", tenant_id: "", name: "New Lead", order: 0, created_at: "" },
  { id: "default-2", tenant_id: "", name: "Contacted", order: 1, created_at: "" },
  { id: "default-3", tenant_id: "", name: "Site Visit", order: 2, created_at: "" },
  { id: "default-4", tenant_id: "", name: "Negotiation", order: 3, created_at: "" },
  { id: "default-5", tenant_id: "", name: "Closed", order: 4, created_at: "" },
];

// Map from stage_labels keys to display names
const STAGE_NAME_MAP: Record<string, string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  site_visit: "Site Visit",
  negotiation: "Negotiation",
  closed: "Closed",
};

export default function PipelinePage() {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [stagesData, clientsData] = await Promise.all([
        apiGet<PipelineStage[]>("/pipeline/stages").catch(() => []),
        apiGet<ClientResponse[]>("/clients"),
      ]);

      // Use default stages if none returned
      const effectiveStages = stagesData.length > 0 ? stagesData : DEFAULT_STAGES;
      setStages(effectiveStages);

      // Map client stages to the proper stage names
      // Backend stores stages as "new_lead", but we display "New Lead"
      const mappedClients = clientsData.map(client => ({
        ...client,
        stage: STAGE_NAME_MAP[client.stage] || STAGE_LABELS[client.stage as keyof typeof STAGE_LABELS] || client.stage,
      })) as ClientResponse[];

      setClients(mappedClients);
    } catch {
      // If both fail, still show empty board with defaults
      setStages(DEFAULT_STAGES);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStageChange = (clientId: string, newStage: string) => {
    setClients(prev =>
      prev.map(client =>
        client.id === clientId ? { ...client, stage: newStage as ClientResponse["stage"] } : client
      )
    );
  };

  const handleStagesUpdated = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-80 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <KanbanBoard
      stages={stages}
      clients={clients}
      onStageChange={handleStageChange}
      onStagesUpdated={handleStagesUpdated}
    />
  );
}
