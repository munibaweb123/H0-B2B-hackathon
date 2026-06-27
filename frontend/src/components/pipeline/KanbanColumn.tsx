"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { MoreVertical, Phone, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";
import { ClientResponse, formatPKR } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  stageId: string;
  stageName: string;
  clients: ClientResponse[];
  totalValue: number;
  onRename: () => void;
  onDelete: () => void;
}

function getDaysInStage(updatedAt: string): number {
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - updated.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function KanbanColumn({
  stageId,
  stageName,
  clients,
  totalValue,
  onRename,
  onDelete,
}: KanbanColumnProps) {
  return (
    <div className="w-80 flex-shrink-0 flex flex-col bg-cream/50 rounded-lg border border-maroon-light/20">
      {/* Column Header */}
      <div className="px-4 py-3 bg-maroon-dark text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{stageName}</h3>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
              {clients.length}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white hover:bg-white/10">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRename}>Rename Stage</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete Stage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-white/70 mt-1">{formatPKR(totalValue)}</p>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={stageId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-2 min-h-[200px] overflow-y-auto space-y-2 transition-colors ${
              snapshot.isDraggingOver ? "bg-maroon-light/10" : ""
            }`}
          >
            {clients.map((client, index) => (
              <Draggable key={client.id} draggableId={client.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style as React.CSSProperties}
                    className={`bg-white rounded-lg border border-maroon-light/10 p-3 cursor-grab active:cursor-grabbing transition-shadow ${
                      snapshot.isDragging ? "shadow-lg ring-2 ring-maroon-dark/20" : "hover:shadow-md"
                    }`}
                  >
                    <Link href={`/clients/${client.id}`} className="block">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-text-primary text-sm">
                          {client.full_name}
                        </h4>
                        <span className="text-xs text-text-muted bg-cream px-1.5 py-0.5 rounded">
                          {getDaysInStage(client.updated_at)}d
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-text-muted">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                        {(client.budget_min || client.budget_max) && (
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3 h-3" />
                            {client.budget_min && client.budget_max
                              ? `${formatPKR(client.budget_min)} - ${formatPKR(client.budget_max)}`
                              : client.budget_max
                              ? `Up to ${formatPKR(client.budget_max)}`
                              : `From ${formatPKR(client.budget_min!)}`}
                          </div>
                        )}
                        {client.preferred_city && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" />
                            {client.preferred_city}
                            {client.preferred_area && `, ${client.preferred_area}`}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
