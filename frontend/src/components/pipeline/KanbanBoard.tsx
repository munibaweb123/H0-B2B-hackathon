"use client";

import { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import { StageManagerModal } from "./StageManagerModal";
import { Button } from "@/components/ui/button";
import { apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ClientResponse, PipelineStage } from "@/types";

interface KanbanBoardProps {
  stages: PipelineStage[];
  clients: ClientResponse[];
  onStageChange: (clientId: string, newStage: string) => void;
  onStagesUpdated: () => void;
}

export function KanbanBoard({ stages, clients, onStageChange, onStagesUpdated }: KanbanBoardProps) {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<{
    open: boolean;
    mode: "add" | "rename" | "delete";
    stageId?: string;
    stageName?: string;
  }>({ open: false, mode: "add" });

  // Group clients by stage
  const clientsByStage: Record<string, ClientResponse[]> = {};
  stages.forEach(stage => {
    clientsByStage[stage.name] = [];
  });
  clients.forEach(client => {
    if (clientsByStage[client.stage]) {
      clientsByStage[client.stage].push(client);
    }
  });

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const clientId = draggableId;
    const newStage = destination.droppableId;
    const oldStage = source.droppableId;

    // Optimistic update is disabled per spec - wait for API success
    try {
      await apiPatch(`/clients/${clientId}/stage`, { stage: newStage });
      onStageChange(clientId, newStage);
      toast({
        title: "Stage updated",
        description: `Client moved to ${newStage}`,
      });
    } catch (err: unknown) {
      // Revert - the state hasn't changed yet since we didn't do optimistic update
      const message = err instanceof Error ? err.message : "Failed to update stage";
      toast({
        title: "Stage update failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  const calculateTotalValue = (stageClients: ClientResponse[]): number => {
    return stageClients.reduce((sum, client) => {
      return sum + (client.budget_max || client.budget_min || 0);
    }, 0);
  };

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-maroon-dark">Pipeline</h1>
          <p className="text-text-muted text-sm mt-1">
            Drag and drop clients to move them through your sales pipeline.
          </p>
        </div>
        <Button
          onClick={() => setModalState({ open: true, mode: "add" })}
          className="bg-maroon-dark text-white hover:bg-maroon-medium"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stage
        </Button>
      </div>

      {/* Kanban Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-250px)]">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stageId={stage.name}
              stageName={stage.name}
              clients={clientsByStage[stage.name] || []}
              totalValue={calculateTotalValue(clientsByStage[stage.name] || [])}
              onRename={() =>
                setModalState({
                  open: true,
                  mode: "rename",
                  stageId: stage.id,
                  stageName: stage.name,
                })
              }
              onDelete={() =>
                setModalState({
                  open: true,
                  mode: "delete",
                  stageId: stage.id,
                  stageName: stage.name,
                })
              }
            />
          ))}
        </div>
      </DragDropContext>

      {/* Stage Manager Modal */}
      <StageManagerModal
        open={modalState.open}
        mode={modalState.mode}
        stageId={modalState.stageId}
        stageName={modalState.stageName}
        onClose={() => setModalState({ open: false, mode: "add" })}
        onSuccess={onStagesUpdated}
      />
    </div>
  );
}
