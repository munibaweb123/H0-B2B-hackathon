"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FormFields {
  name: string;
  email: string;
  agencyName: string;
  message: string;
}

const EMPTY: FormFields = { name: "", email: "", agencyName: "", message: "" };

export function ContactForm() {
  const [fields, setFields] = useState<FormFields>(EMPTY);
  const [errors, setErrors] = useState<Partial<FormFields>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  function set(key: keyof FormFields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate(): boolean {
    const errs: Partial<FormFields> = {};
    if (!fields.name.trim()) errs.name = "Full name is required.";
    if (!fields.email.trim()) errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      errs.email = "Enter a valid email address.";
    if (!fields.message.trim()) errs.message = "Message is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // No /contact endpoint — show success after brief delay
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    toast({
      title: "Message sent!",
      description: "We'll be in touch shortly.",
    });
    setFields(EMPTY);
    setErrors({});
  }

  const inputClass =
    "border-maroon-light/30 focus-visible:ring-pink-accent bg-white";

  return (
    <div className="flex-1 bg-cream px-8 py-16 lg:px-16">
      <h1 className="font-serif text-4xl font-bold text-maroon-dark mb-2">
        Contact Us
      </h1>
      <p className="text-text-muted mb-10">
        Get in touch with our team to elevate your agency with AI.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Name + Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Full Name *"
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
            />
            {errors.name && (
              <p className="text-pink-accent text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email Address *"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
            />
            {errors.email && (
              <p className="text-pink-accent text-sm mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Agency Name */}
        <div>
          <Input
            placeholder="Agency Name (optional)"
            value={fields.agencyName}
            onChange={(e) => set("agencyName", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Message */}
        <div>
          <Textarea
            placeholder="Your message *"
            rows={5}
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            className={`${inputClass} resize-none`}
          />
          {errors.message && (
            <p className="text-pink-accent text-sm mt-1">{errors.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-accent hover:bg-pink-accent/90 disabled:opacity-60 text-white font-semibold rounded-lg py-3 flex items-center justify-center gap-2 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
