"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast({ title: "Subscribed!", description: "You're on the list." });
    setEmail("");
  }

  return (
    <div className="bg-cream rounded-xl p-5 border border-maroon-light/20">
      <h3 className="font-serif text-lg text-maroon-dark font-semibold mb-1">
        Subscribe to Our Newsletter
      </h3>
      <p className="text-text-muted text-sm mb-4">
        Weekly insights on AI and real estate, straight to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-maroon-light/30 bg-white focus-visible:ring-pink-accent"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-maroon-dark hover:bg-maroon-medium disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2 transition-colors"
        >
          {loading ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
