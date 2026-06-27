"use client";

import { SlotCard } from "./SlotCard";
import { SlotResponse, ClientResponse } from "@/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseLocalDate(dtStr: string): Date {
  const [datePart, timePart] = dtStr.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface Props {
  slots: SlotResponse[];
  weekStart: Date;
  clients: ClientResponse[];
  currentUserId: string;
  onBook: (slotId: string) => void;
}

export function WeekCalendar({
  slots,
  weekStart,
  clients,
  currentUserId,
  onBook,
}: Props) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const slotsForDay = (day: Date): SlotResponse[] =>
    slots
      .filter((s) => isSameDay(parseLocalDate(s.slot_datetime), day))
      .sort(
        (a, b) =>
          parseLocalDate(a.slot_datetime).getTime() -
          parseLocalDate(b.slot_datetime).getTime()
      );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-7 gap-3">
      {days.map((day, i) => {
        const daySlots = slotsForDay(day);
        const isToday = isSameDay(day, today);
        return (
          <div key={i} className="flex flex-col gap-2 min-w-0">
            {/* Day header */}
            <div
              className={`text-center py-3 border-b ${
                isToday
                  ? "border-maroon-dark/30"
                  : "border-border"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-widest ${
                  isToday ? "text-maroon-dark" : "text-text-muted"
                }`}
              >
                {DAY_LABELS[i]}
              </p>
              <p
                className={`text-lg font-semibold mt-0.5 ${
                  isToday
                    ? "text-maroon-dark bg-maroon-dark/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto"
                    : "text-text-primary"
                }`}
              >
                {day.getDate()}
              </p>
            </div>

            {/* Slots */}
            <div className="space-y-2 pt-1">
              {daySlots.length === 0 ? (
                <div className="h-12 rounded-lg border border-dashed border-border bg-cream/50" />
              ) : (
                daySlots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    clients={clients}
                    currentUserId={currentUserId}
                    onBook={onBook}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
