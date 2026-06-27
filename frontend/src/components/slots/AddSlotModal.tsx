"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const HOURS = Array.from({ length: 13 }, (_, i) => {
  const h = 8 + i;
  const label =
    h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;
  const value = `${String(h).padStart(2, "0")}:00`;
  return { label, value };
});

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function AddSlotModal({ onClose, onCreated }: Props) {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    try {
      const slot_datetime = `${date}T${time}:00`;
      await apiPost("/slots", { slot_datetime });
      toast({ title: "Slot created" });
      onCreated();
      onClose();
    } catch (err) {
      toast({
        title: "Failed to create slot",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-cream">
          <h3 className="font-serif text-lg font-semibold text-text-primary">
            Add New Slot
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Time
            </label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-maroon-light/30 focus:border-maroon-light"
            >
              {HOURS.map((h) => (
                <option key={h.value} value={h.value}>
                  {h.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-maroon-light/30 text-maroon-dark hover:bg-maroon-light/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !date}
              className="bg-maroon-dark hover:bg-maroon-medium"
            >
              {loading ? "Creating…" : "Create Slot"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
