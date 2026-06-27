"use client";

import { CheckCircle, Clock } from "lucide-react";
import { SlotResponse, ClientResponse } from "@/types";

function parseLocalDate(dtStr: string): Date {
  const [datePart, timePart] = dtStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function formatTime(dtStr: string): string {
  const dt = parseLocalDate(dtStr);
  return dt.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

interface Props {
  slot: SlotResponse;
  clients: ClientResponse[];
  currentUserId: string;
  onBook: (slotId: string) => void;
}

export function SlotCard({ slot, clients, currentUserId, onBook }: Props) {
  const time = formatTime(slot.slot_datetime);
  const bookedClient = slot.booked_by_client_id
    ? clients.find((c) => c.id === slot.booked_by_client_id)
    : null;
  const isMySlot = slot.agent_id === currentUserId;

  if (slot.is_booked) {
    return (
      <div className="bg-maroon-dark/5 border border-maroon-dark/20 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-maroon-dark bg-maroon-dark/10 px-2 py-0.5 rounded-full">
            {time}
          </span>
          <CheckCircle className="w-4 h-4 text-maroon-dark" />
        </div>
        <p className="text-xs font-semibold text-text-primary">
          {isMySlot ? "You" : "Agent"}
        </p>
        <p className="text-xs text-text-muted mt-0.5 truncate">
          {bookedClient ? bookedClient.full_name : "Booked"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 border-dashed rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-1 mb-2">
        <Clock className="w-3 h-3 text-green-700" />
        <span className="text-xs text-green-700 font-medium">{time}</span>
      </div>
      <button
        onClick={() => onBook(slot.id)}
        className="w-full py-1.5 border border-maroon-dark text-maroon-dark text-xs font-medium rounded-md hover:bg-maroon-dark hover:text-white transition-colors"
      >
        Book
      </button>
    </div>
  );
}
