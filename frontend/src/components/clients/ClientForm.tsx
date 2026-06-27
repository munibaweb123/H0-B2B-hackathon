"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { ClientResponse, PipelineStage, STAGE_LABELS } from "@/types";

interface PlaceSuggestion {
  description: string;
  place_id: string;
}

function LocationInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (text: string) => {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiGet<PlaceSuggestion[]>(`/places/autocomplete?input=${encodeURIComponent(text)}`);
        setSuggestions(res.slice(0, 5));
        setOpen(res.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  };

  return (
    <div className="relative space-y-1.5">
      <label className="text-sm font-medium text-text-primary" htmlFor={id}>{label}</label>
      <Input
        id={id}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        className="border-maroon-light/40"
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded-md border border-maroon-light/30 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-cream"
              onMouseDown={() => {
                onChange(s.description);
                setOpen(false);
                setSuggestions([]);
              }}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ClientFormProps {
  id?: string;
  initial?: ClientResponse;
}

export function ClientForm({ id, initial }: ClientFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    budget_min: "",
    budget_max: "",
    preferred_city: "",
    preferred_area: "",
    bedrooms_needed: "",
    property_type_needed: "",
    notes: "",
    stage: "new_lead",
  });

  useEffect(() => {
    async function loadStages() {
      try {
        const res = await apiGet<PipelineStage[]>("/pipeline/stages");
        if (res.length > 0) {
          setStages(res);
          if (!id && !initial) {
            setForm(f => ({ ...f, stage: res[0].name }));
          }
        }
      } catch {
        // Use default stages if endpoint fails
      }
    }
    loadStages();
  }, [id, initial]);

  useEffect(() => {
    if (initial) {
      setForm({
        full_name: initial.full_name ?? "",
        phone: initial.phone ?? "",
        email: initial.email ?? "",
        budget_min: initial.budget_min != null ? String(initial.budget_min) : "",
        budget_max: initial.budget_max != null ? String(initial.budget_max) : "",
        preferred_city: initial.preferred_city ?? "",
        preferred_area: initial.preferred_area ?? "",
        bedrooms_needed: initial.bedrooms_needed != null ? String(initial.bedrooms_needed) : "",
        property_type_needed: initial.property_type_needed ?? "",
        notes: initial.notes ?? "",
        stage: initial.stage ?? "new_lead",
      });
    }
  }, [initial]);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.full_name.trim()) { setError("Full name is required."); return; }
    if (!form.phone.trim()) { setError("Phone number is required."); return; }

    const body = {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      budget_min: form.budget_min ? Number(form.budget_min) : undefined,
      budget_max: form.budget_max ? Number(form.budget_max) : undefined,
      preferred_city: form.preferred_city.trim() || undefined,
      preferred_area: form.preferred_area.trim() || undefined,
      bedrooms_needed: form.bedrooms_needed ? Number(form.bedrooms_needed) : undefined,
      property_type_needed: form.property_type_needed || undefined,
      notes: form.notes.trim() || undefined,
      stage: form.stage,
    };

    setSubmitting(true);
    try {
      if (id) {
        await apiPatch(`/clients/${id}`, body);
        router.push(`/clients/${id}`);
      } else {
        const created = await apiPost<ClientResponse>("/clients", body);
        router.push(`/clients/${created.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save client.");
    } finally {
      setSubmitting(false);
    }
  };

  const stageOptions = stages.length > 0
    ? stages.map(s => ({ value: s.name, label: s.name }))
    : Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Contact Information</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="full_name">Full Name *</label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={(e) => set("full_name")(e.target.value)}
              placeholder="Ahmed Khan"
              className="border-maroon-light/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="phone">Phone *</label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone")(e.target.value)}
                placeholder="+92 300 1234567"
                className="border-maroon-light/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="ahmed@example.com"
                className="border-maroon-light/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget & Requirements */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Budget &amp; Requirements</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="budget_min">Budget Min (PKR)</label>
              <Input
                id="budget_min"
                type="number"
                min={0}
                value={form.budget_min}
                onChange={(e) => set("budget_min")(e.target.value)}
                placeholder="5000000"
                className="border-maroon-light/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="budget_max">Budget Max (PKR)</label>
              <Input
                id="budget_max"
                type="number"
                min={0}
                value={form.budget_max}
                onChange={(e) => set("budget_max")(e.target.value)}
                placeholder="15000000"
                className="border-maroon-light/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Preferred Property Type</label>
              <Select value={form.property_type_needed} onValueChange={set("property_type_needed")}>
                <SelectTrigger className="border-maroon-light/40">
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="plot">Plot</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="bedrooms_needed">Bedrooms Needed</label>
              <Input
                id="bedrooms_needed"
                type="number"
                min={1}
                max={10}
                value={form.bedrooms_needed}
                onChange={(e) => set("bedrooms_needed")(e.target.value)}
                placeholder="3"
                className="border-maroon-light/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Preferences */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Location Preferences</h2>
        <div className="grid grid-cols-2 gap-4">
          <LocationInput
            id="preferred_city"
            label="Preferred City"
            value={form.preferred_city}
            onChange={set("preferred_city")}
            placeholder="Lahore"
          />
          <LocationInput
            id="preferred_area"
            label="Preferred Area"
            value={form.preferred_area}
            onChange={set("preferred_area")}
            placeholder="DHA Phase 5"
          />
        </div>
      </div>

      {/* Stage & Notes */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Stage &amp; Notes</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Pipeline Stage</label>
            <Select value={form.stage} onValueChange={set("stage")}>
              <SelectTrigger className="border-maroon-light/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stageOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="notes">Notes</label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Any additional notes about the client..."
              rows={3}
              className="border-maroon-light/40"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-pink-accent">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="border-maroon-light/40"
          onClick={() => router.push("/clients")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="bg-maroon-dark text-white hover:bg-maroon-medium"
        >
          {submitting ? "Saving..." : id ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
