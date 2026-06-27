"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { apiPost, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ChatMessageType } from "@/types";
import { Send } from "lucide-react";

const QUICK_ACTIONS = [
  "Show top clients",
  "Find properties under 80 lakh",
  "Summarize sales pipeline",
  "Draft follow-up for my most recent client",
];

const WELCOME: ChatMessageType = {
  role: "assistant",
  content:
    "Hello! I'm PropFlow AI. I can help you search properties, find matching clients, draft follow-ups, and more. What can I help you with today?",
};

export default function AIChatPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function clearChat() {
    setMessages([WELCOME]);
    setInput("");
    textareaRef.current?.focus();
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessageType = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const history = next.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await apiPost<{ reply: string; tool_calls_made: string[] }>(
        "/ai/chat",
        { message: trimmed, history }
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.reply,
          tool_calls: res.tool_calls_made,
        },
      ]);
    } catch (e) {
      toast({
        title: "AI error",
        description: e instanceof Error ? e.message : "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)]">
      <ConversationSidebar onNewChat={clearChat} />

      <section className="flex-1 flex flex-col overflow-hidden bg-cream">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.role}
              content={msg.content}
              tool_calls={msg.tool_calls}
              userName={user?.full_name}
            />
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-maroon-light/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <span
                    className="w-2 h-2 bg-maroon-light rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-maroon-light rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-maroon-light rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick action chips */}
        <div className="px-4 sm:px-8 pt-2 flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => {
                setInput(action);
                textareaRef.current?.focus();
              }}
              className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-white border border-maroon-light/20 text-maroon-dark hover:bg-maroon-light/10 transition-colors flex-shrink-0"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="px-4 sm:px-8 pb-6 pt-2">
          <div className="flex gap-2 items-end border border-border rounded-xl bg-white shadow-sm focus-within:border-maroon-light focus-within:ring-1 focus-within:ring-maroon-light/30 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask PropFlow anything…"
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent border-none focus:ring-0 outline-none px-4 py-3 text-sm text-text-primary placeholder:text-text-muted overflow-y-auto"
              style={{ minHeight: "48px", maxHeight: "128px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="m-2 w-9 h-9 rounded-lg bg-maroon-dark text-white flex items-center justify-center hover:bg-maroon-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-text-muted mt-2 uppercase tracking-widest">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </section>

    </div>
  );
}
