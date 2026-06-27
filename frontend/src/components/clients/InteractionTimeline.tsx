"use client";

import { useState } from "react";
import { Phone, MessageCircle, Mail, FileText, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api";
import { InteractionResponse } from "@/types";

const TYPE_CONFIG = {
  call: { icon: Phone, label: "Call", color: "bg-blue-100 text-blue-700" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp", color: "bg-green-100 text-green-700" },
  email: { icon: Mail, label: "Email", color: "bg-purple-100 text-purple-700" },
  note: { icon: FileText, label: "Note", color: "bg-gray-100 text-gray-700" },
  visit: { icon: MapPin, label: "Site Visit", color: "bg-gold/30 text-yellow-800" },
};

interface InteractionTimelineProps {
  clientId: string;
  interactions: InteractionResponse[];
  onInteractionAdded: (interaction: InteractionResponse) => void;
}

export function InteractionTimeline({ clientId, interactions, onInteractionAdded }: InteractionTimelineProps) {
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const handleAddNote = async () => {
    if (!noteText.trim()) return;

    setSubmitting(true);
    try {
      const newInteraction = await apiPost<InteractionResponse>(`/clients/${clientId}/interactions`, {
        type: "note",
        notes: noteText.trim(),
      });
      onInteractionAdded(newInteraction);
      setNoteText("");
      setShowNoteForm(false);
    } catch {
      // Error handled silently
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Add Note Button / Form */}
      <div className="rounded-lg border border-maroon-light/20 bg-cream-card p-4">
        {showNoteForm ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Add a note about this client..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              className="border-maroon-light/40"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNoteForm(false);
                  setNoteText("");
                }}
                className="border-maroon-light/40"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={submitting || !noteText.trim()}
                className="bg-maroon-dark text-white hover:bg-maroon-medium"
              >
                {submitting ? "Adding..." : <><Send className="w-4 h-4 mr-1" /> Add Note</>}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowNoteForm(true)}
            className="w-full border-dashed border-maroon-light/40 hover:bg-cream"
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        )}
      </div>

      {/* Timeline */}
      {interactions.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>No interactions yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {interactions.map((interaction) => {
              const config = TYPE_CONFIG[interaction.type] || TYPE_CONFIG.note;
              const Icon = config.icon;

              return (
                <div key={interaction.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-lg border border-maroon-light/10 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-text-muted">
                        {formatDate(interaction.created_at)}
                      </span>
                    </div>
                    {interaction.notes && (
                      <p className="text-sm text-text-primary whitespace-pre-wrap">
                        {interaction.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
