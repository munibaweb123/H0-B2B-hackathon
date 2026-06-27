"use client";

import { Check } from "lucide-react";
import { ClientResponse, STAGE_LABELS, STAGE_ORDER } from "@/types";

interface StageTrackerProps {
  currentStage: ClientResponse["stage"];
}

export function StageTracker({ currentStage }: StageTrackerProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center">
        {/* Background connecting line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-10" />

        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-maroon-dark transition-all duration-300 -z-10"
          style={{ width: `${(currentIndex / (STAGE_ORDER.length - 1)) * 100}%` }}
        />

        {STAGE_ORDER.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isFuture = index > currentIndex;

          return (
            <div key={stage} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isCompleted ? "bg-maroon-dark text-white" : ""}
                  ${isCurrent ? "bg-white border-2 border-maroon-dark ring-4 ring-maroon-dark/10" : ""}
                  ${isFuture ? "bg-gray-100 border-2 border-gray-200 text-gray-400" : ""}
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-maroon-dark" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`
                  text-xs font-medium whitespace-nowrap
                  ${isCompleted ? "text-maroon-dark" : ""}
                  ${isCurrent ? "text-maroon-dark font-bold" : ""}
                  ${isFuture ? "text-gray-400" : ""}
                `}
              >
                {STAGE_LABELS[stage]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
