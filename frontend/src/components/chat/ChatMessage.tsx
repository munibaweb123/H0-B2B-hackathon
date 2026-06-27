"use client";

import { Bot } from "lucide-react";
import { ToolCallChip } from "./ToolCallChip";

interface Props {
  role: "user" | "assistant";
  content: string;
  tool_calls?: string[];
  userName?: string;
}

export function ChatMessage({ role, content, tool_calls, userName }: Props) {
  if (role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="flex flex-col items-end gap-1 max-w-[75%]">
          <span className="text-xs text-text-muted">{userName ?? "You"}</span>
          <div className="bg-maroon-dark text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-maroon-light/20 flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="w-4 h-4 text-maroon-dark" />
      </div>
      <div className="flex flex-col gap-2 max-w-[75%]">
        <span className="text-xs text-text-muted">PropFlow AI</span>
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-text-primary">{content}</p>
        </div>
        {tool_calls && tool_calls.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {tool_calls.map((tc, i) => (
              <ToolCallChip key={i} name={tc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
