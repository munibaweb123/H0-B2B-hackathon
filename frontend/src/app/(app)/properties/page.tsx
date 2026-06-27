"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { apiGet } from "@/lib/api";
import { PropertyResponse } from "@/types";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [city, setCity] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [bedrooms, setBedrooms] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    apiGet<PropertyResponse[]>("/properties")
      .then(setProperties)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = properties.filter((p) => {
    if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (type !== "all" && p.property_type !== type) return false;
    if (status !== "all" && p.status !== status) return false;
    if (bedrooms !== "all") {
      if (bedrooms === "5+" ? (p.bedrooms ?? 0) < 5 : p.bedrooms !== Number(bedrooms)) return false;
    }
    if (minPrice && Number(p.price) < Number(minPrice)) return false;
    if (maxPrice && Number(p.price) > Number(maxPrice)) return false;
    return true;
  });

  const clearFilters = () => {
    setCity(""); setType("all"); setStatus("all"); setBedrooms("all");
    setMinPrice(""); setMaxPrice("");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-maroon-dark">Properties</h1>
          <p className="text-sm text-text-muted">Manage and track your high-value real estate listings.</p>
        </div>
        <Button asChild className="bg-maroon-dark text-white hover:bg-maroon-medium">
          <Link href="/properties/new"><Plus className="mr-1.5 h-4 w-4" /> Add Property</Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-maroon-light/20 bg-cream-card p-4">
        <Input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-36 border-maroon-light/40"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40 border-maroon-light/40"><SelectValue placeholder="Type (All)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Type (All)</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="plot">Plot</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40 border-maroon-light/40"><SelectValue placeholder="Status (All)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status (All)</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger className="w-36 border-maroon-light/40"><SelectValue placeholder="Bedrooms" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Bedrooms (All)</SelectItem>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5+">5+</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-32 border-maroon-light/40"
        />
        <Input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-32 border-maroon-light/40"
        />
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-text-muted hover:text-maroon-dark">
          Clear All
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-maroon-light/40 py-20 text-center">
          <Building2 className="mb-4 h-12 w-12 text-maroon-light/40" />
          <p className="font-serif text-lg font-semibold text-maroon-dark">
            {properties.length === 0 ? "No properties yet" : "No results for current filters"}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {properties.length === 0 ? "Add your first listing to get started." : "Try clearing filters."}
          </p>
          {properties.length === 0 && (
            <Button asChild className="mt-4 bg-maroon-dark text-white hover:bg-maroon-medium">
              <Link href="/properties/new"><Plus className="mr-1.5 h-4 w-4" /> Add Property</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
