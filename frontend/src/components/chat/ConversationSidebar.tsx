"use client";

import { Plus } from "lucide-react";

interface Props {
  onNewChat: () => void;
}

export function ConversationSidebar({ onNewChat }: Props) {
  return (
    <aside className="w-60 border-r border-border bg-cream/80 flex flex-col flex-shrink-0 hidden lg:flex">
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-maroon-dark text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-maroon-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-widest px-2 mb-2">Today</p>
          <div className="rounded-lg bg-maroon-dark/5 border border-maroon-dark/10 px-3 py-2.5">
            <p className="text-xs font-medium text-text-primary truncate">Active conversation</p>
            <p className="text-xs text-text-muted mt-0.5 truncate">Current session</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
