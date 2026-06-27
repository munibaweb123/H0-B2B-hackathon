"use client";

import { Wrench } from "lucide-react";

interface Props {
  name: string;
}

export function ToolCallChip({ name }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-maroon-light/20 text-maroon-dark text-xs font-medium px-2.5 py-1 rounded-full border border-maroon-light/30">
      <Wrench className="w-3 h-3 flex-shrink-0" />
      {name.replace(/_/g, " ")}
    </span>
  );
}
