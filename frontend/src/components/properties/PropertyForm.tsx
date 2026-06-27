"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { PropertyResponse } from "@/types";

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

interface PropertyFormProps {
  id?: string;
  initial?: PropertyResponse;
}

export function PropertyForm({ id, initial }: PropertyFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    property_type: "house",
    status: "available",
    price: "",
    city: "",
    area: "",
    address: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    description: "",
    photos: "", // newline-separated URLs
  });

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? "",
        property_type: initial.property_type ?? "house",
        status: initial.status ?? "available",
        price: String(initial.price ?? ""),
        city: initial.city ?? "",
        area: initial.area ?? "",
        address: initial.address ?? "",
        bedrooms: initial.bedrooms != null ? String(initial.bedrooms) : "",
        bathrooms: initial.bathrooms != null ? String(initial.bathrooms) : "",
        area_sqft: initial.area_sqft != null ? String(initial.area_sqft) : "",
        description: initial.description ?? "",
        photos: (initial.photos ?? []).join("\n"),
      });
    }
  }, [initial]);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.price || isNaN(Number(form.price))) { setError("Valid price is required."); return; }
    if (!form.city.trim()) { setError("City is required."); return; }

    const body = {
      title: form.title.trim(),
      property_type: form.property_type,
      status: form.status,
      price: Number(form.price),
      city: form.city.trim(),
      area: form.area.trim() || undefined,
      address: form.address.trim() || undefined,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : undefined,
      description: form.description.trim() || undefined,
      photos: form.photos.split("\n").map((u) => u.trim()).filter(Boolean),
    };

    setSubmitting(true);
    try {
      if (id) {
        await apiPatch(`/properties/${id}`, body);
      } else {
        await apiPost("/properties", body);
      }
      router.push("/properties");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save property.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Basic Information</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="title">Property Title</label>
            <Input id="title" value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="3-Bed House DHA Phase 5" className="border-maroon-light/40" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Property Type</label>
              <Select value={form.property_type} onValueChange={set("property_type")}>
                <SelectTrigger className="border-maroon-light/40"><SelectValue /></SelectTrigger>
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
              <label className="text-sm font-medium text-text-primary">Status</label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger className="border-maroon-light/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="description">Description</label>
            <Textarea id="description" value={form.description} onChange={(e) => set("description")(e.target.value)} placeholder="Provide a detailed description of the property..." rows={3} className="border-maroon-light/40" />
          </div>
        </div>
      </div>

      {/* Pricing & Configuration */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Pricing &amp; Configuration</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="price">Price (PKR)</label>
            <Input id="price" type="number" min={0} value={form.price} onChange={(e) => set("price")(e.target.value)} placeholder="8500000" className="border-maroon-light/40" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="bedrooms">Bedrooms</label>
              <Input id="bedrooms" type="number" min={0} value={form.bedrooms} onChange={(e) => set("bedrooms")(e.target.value)} placeholder="3" className="border-maroon-light/40" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="bathrooms">Bathrooms</label>
              <Input id="bathrooms" type="number" min={0} value={form.bathrooms} onChange={(e) => set("bathrooms")(e.target.value)} placeholder="2" className="border-maroon-light/40" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="area_sqft">Area (sq. ft.)</label>
              <Input id="area_sqft" type="number" min={0} value={form.area_sqft} onChange={(e) => set("area_sqft")(e.target.value)} placeholder="2200" className="border-maroon-light/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Location Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <LocationInput id="city" label="City" value={form.city} onChange={set("city")} placeholder="Lahore" />
            <LocationInput id="area" label="Locality / Area" value={form.area} onChange={set("area")} placeholder="DHA Phase 5" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary" htmlFor="address">Detailed Address</label>
            <Input id="address" value={form.address} onChange={(e) => set("address")(e.target.value)} placeholder="Street number, House number, etc." className="border-maroon-light/40" />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Media</h2>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-primary" htmlFor="photos">Photo URLs (one per line)</label>
          <Textarea id="photos" value={form.photos} onChange={(e) => set("photos")(e.target.value)} placeholder={"https://example.com/image1.jpg\nhttps://example.com/image2.jpg"} rows={3} className="border-maroon-light/40 font-mono text-sm" />
          <p className="text-xs text-text-muted">Provide direct links to property images to attach them to this listing.</p>
        </div>
      </div>

      {error && <p className="text-sm text-pink-accent">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" className="border-maroon-light/40" onClick={() => router.push("/properties")}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-maroon-dark text-white hover:bg-maroon-medium">
          {submitting ? "Saving…" : id ? "Update Property" : "Save Property"}
        </Button>
      </div>
    </form>
  );
}
