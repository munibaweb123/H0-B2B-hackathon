import Link from "next/link";
import { Building2, BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyResponse, formatPKR } from "@/types";

const STATUS_STYLES: Record<PropertyResponse["status"], string> = {
  available: "bg-green-100 text-green-700 border-green-200",
  reserved: "bg-amber-100 text-amber-700 border-amber-200",
  sold: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<PropertyResponse["status"], string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

const TYPE_LABELS: Record<PropertyResponse["property_type"], string> = {
  apartment: "Apartment",
  villa: "Villa",
  house: "House",
  plot: "Plot",
  commercial: "Commercial",
};

interface PropertyCardProps {
  property: PropertyResponse;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const photo = property.photos?.[0];

  return (
    <div className="overflow-hidden rounded-xl border border-maroon-light/20 bg-cream-card shadow-sm transition-shadow hover:shadow-md">
      {/* Photo */}
      <div className="relative h-44 bg-maroon-light/10">
        {photo ? (
          <img src={photo} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-12 w-12 text-maroon-light/40" />
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[property.status]}`}>
          {STATUS_LABELS[property.status]}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-semibold leading-tight text-maroon-dark line-clamp-1">
            {property.title}
          </h3>
          <span className="shrink-0 font-semibold text-maroon-medium text-sm">
            {formatPKR(Number(property.price))}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-1 text-xs text-text-muted">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{property.area ? `${property.area}, ${property.city}` : property.city}</span>
        </div>

        <div className="mb-4 border-t border-maroon-light/10 pt-3 flex items-center gap-4 text-xs text-text-muted">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms} Beds
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms} Baths
            </span>
          )}
          {property.area_sqft != null && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" /> {property.area_sqft.toLocaleString()} sqft
            </span>
          )}
          {!property.bedrooms && !property.bathrooms && !property.area_sqft && (
            <Badge variant="outline" className="text-xs">{TYPE_LABELS[property.property_type]}</Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs capitalize">
            {TYPE_LABELS[property.property_type]}
          </Badge>
          <Button asChild size="sm" variant="outline" className="border-maroon-light/40 text-maroon-medium hover:bg-maroon-dark hover:text-white">
            <Link href={`/properties/${property.id}`}>Edit</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
