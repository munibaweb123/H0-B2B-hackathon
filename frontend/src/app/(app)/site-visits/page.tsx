"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { WeekCalendar } from "@/components/slots/WeekCalendar";
import { AddSlotModal } from "@/components/slots/AddSlotModal";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SlotResponse, ClientResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}, ${end.getFullYear()}`;
}

function parseLocalDate(dtStr: string): Date {
  const [datePart, timePart] = dtStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function isInWeek(slotDt: string, weekStart: Date): boolean {
  const slot = parseLocalDate(slotDt);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return slot >= weekStart && slot < weekEnd;
}

interface BookingState {
  slotId: string;
  clientId: string;
  error: string;
  loading: boolean;
}

export default function SiteVisitsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [slots, setSlots] = useState<SlotResponse[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [booking, setBooking] = useState<BookingState | null>(null);

  async function loadSlots() {
    try {
      const data = await apiGet<SlotResponse[]>("/slots");
      setSlots(data);
    } catch {
      // Silent
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    async function init() {
      const [slotsData, clientsData] = await Promise.allSettled([
        apiGet<SlotResponse[]>("/slots"),
        apiGet<ClientResponse[]>("/clients"),
      ]);
      if (slotsData.status === "fulfilled") setSlots(slotsData.value);
      if (clientsData.status === "fulfilled") setClients(clientsData.value);
      setLoadingSlots(false);
    }
    init();
  }, []);

  const weekSlots = slots.filter((s) => isInWeek(s.slot_datetime, weekStart));

  function prevWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function nextWeek() {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  function openBooking(slotId: string) {
    setBooking({ slotId, clientId: "", error: "", loading: false });
  }

  async function confirmBooking() {
    if (!booking || !booking.clientId) {
      setBooking((b) => b ? { ...b, error: "Please select a client" } : b);
      return;
    }
    setBooking((b) => b ? { ...b, loading: true, error: "" } : b);
    try {
      await apiPost(`/slots/${booking.slotId}/book?client_id=${booking.clientId}`);
      toast({ title: "Slot booked successfully" });
      setBooking(null);
      loadSlots();
    } catch (e) {
      const msg =
        e instanceof ApiError && e.status === 409
          ? "Slot already booked — please choose another"
          : e instanceof Error
          ? e.message
          : "Booking failed";
      setBooking((b) => b ? { ...b, error: msg, loading: false } : b);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-text-primary">
            Site Visits
          </h2>
          <div className="flex items-center gap-3 mt-2 text-text-muted">
            <button
              onClick={prevWeek}
              className="p-1.5 rounded-full hover:bg-cream border border-border transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">{formatWeekRange(weekStart)}</span>
            <button
              onClick={nextWeek}
              className="p-1.5 rounded-full hover:bg-cream border border-border transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-maroon-dark hover:bg-maroon-medium gap-2 sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Slot
        </Button>
      </div>

      {/* Calendar */}
      {loadingSlots ? (
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : (
        <WeekCalendar
          slots={weekSlots}
          weekStart={weekStart}
          clients={clients}
          currentUserId={user?.id ?? ""}
          onBook={openBooking}
        />
      )}

      {/* Booking modal */}
      {booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm border border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-cream">
              <h3 className="font-serif text-base font-semibold text-text-primary">
                Book Slot
              </h3>
              <button
                onClick={() => setBooking(null)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Select Client
                </label>
                <select
                  value={booking.clientId}
                  onChange={(e) =>
                    setBooking((b) => b ? { ...b, clientId: e.target.value, error: "" } : b)
                  }
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-maroon-light/30 focus:border-maroon-light"
                >
                  <option value="">-- Choose a client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {booking.error && (
                <p className="text-sm text-pink-accent">{booking.error}</p>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setBooking(null)}
                  className="border-maroon-light/30 text-maroon-dark"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmBooking}
                  disabled={booking.loading}
                  className="bg-maroon-dark hover:bg-maroon-medium"
                >
                  {booking.loading ? "Booking…" : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add slot modal */}
      {showAddModal && (
        <AddSlotModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadSlots}
        />
      )}
    </div>
  );
}
