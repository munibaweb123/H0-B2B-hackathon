"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function WhatsAppPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ to: "", message: "" });
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.to.trim() || !form.message.trim()) return;
    setLoading(true);
    try {
      await apiPost("/whatsapp/send", { to: form.to, message: form.message });
      toast({ title: "Message sent via WhatsApp" });
      setForm({ to: "", message: "" });
    } catch (err) {
      toast({
        title: "Failed to send",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status card */}
      <div className="bg-white rounded-2xl border border-border p-8 flex flex-col items-center gap-5 shadow-sm text-center">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 fill-green-500 text-green-500" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse" />
          </span>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200 mb-3">
            WhatsApp Bot Active
          </span>
          <h2 className="font-serif text-2xl font-semibold text-text-primary">
            Connected &amp; Listening
          </h2>
          <p className="text-text-muted text-sm mt-2">
            Webhook:{" "}
            <span className="font-mono text-xs bg-cream px-2 py-0.5 rounded border border-border">
              {apiUrl}/whatsapp/webhook
            </span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 bg-gold/10 text-yellow-800 px-3 py-1.5 rounded-full border border-gold/20 text-xs font-medium">
            🎤 Voice notes transcribed
          </span>
          <span className="flex items-center gap-1.5 bg-gold/10 text-yellow-800 px-3 py-1.5 rounded-full border border-gold/20 text-xs font-medium">
            🌐 Urdu &amp; English supported
          </span>
        </div>
      </div>

      {/* Manual send form */}
      <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
        <h3 className="font-serif text-xl font-semibold text-text-primary mb-6 pb-4 border-b border-border">
          Send WhatsApp Message
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Recipient Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+923001234567"
              value={form.to}
              onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Message
            </label>
            <Textarea
              placeholder="Draft your message here..."
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              rows={4}
              required
            />
          </div>

          <p className="text-xs text-text-muted">
            Messages are sent via Meta Business API (sandbox mode)
          </p>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-maroon-dark hover:bg-maroon-medium gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? "Sending…" : "Send Message"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
