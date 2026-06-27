"use client";

import Link from "next/link";
import { Sparkles, ExternalLink } from "lucide-react";
import { MatchedProperty, formatPKR } from "@/types";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { PropertyResponse } from "@/types";

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

interface MatchedPropertiesTabProps {
  matches: MatchedProperty[];
  loading?: boolean;
}

interface PropertyDetails {
  [id: string]: PropertyResponse;
}

export function MatchedPropertiesTab({ matches, loading }: MatchedPropertiesTabProps) {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails>({});

  useEffect(() => {
    async function fetchPropertyDetails() {
      const details: PropertyDetails = {};
      for (const match of matches) {
        try {
          const property = await apiGet<PropertyResponse>(`/properties/${match.property_id}`);
          details[match.property_id] = property;
        } catch {
          // Skip failed fetches
        }
      }
      setPropertyDetails(details);
    }

    if (matches.length > 0) {
      fetchPropertyDetails();
    }
  }, [matches]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon-dark mb-4" />
        <p className="text-text-muted">Finding matching properties...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 mx-auto mb-3 text-maroon-light/40" />
        <h3 className="font-medium text-text-primary mb-1">No Matches Yet</h3>
        <p className="text-sm text-text-muted">
          Click &quot;Run AI Match&quot; in the Overview tab to find matching properties for this client.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Found {matches.length} matching {matches.length === 1 ? "property" : "properties"} based on client requirements.
      </p>

      <div className="space-y-3">
        {matches.map((match) => {
          const property = propertyDetails[match.property_id];

          return (
            <div
              key={match.property_id}
              className="rounded-lg border border-maroon-light/20 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-text-primary">
                      {property?.title || `Property ${match.property_id.slice(0, 8)}...`}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(match.score)}`}>
                      {match.score}% Match
                    </span>
                  </div>

                  {property && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted mb-2">
                      <span>{formatPKR(property.price)}</span>
                      <span>{property.city}</span>
                      {property.bedrooms && <span>{property.bedrooms} bed</span>}
                      {property.area_sqft && <span>{property.area_sqft.toLocaleString()} sq.ft</span>}
                    </div>
                  )}

                  <p className="text-sm text-text-primary bg-cream/50 p-2 rounded border-l-2 border-maroon-light/40">
                    {match.reason}
                  </p>
                </div>

                <Link
                  href={`/properties/${match.property_id}`}
                  className="flex-shrink-0 inline-flex items-center gap-1 text-sm text-maroon-dark hover:underline"
                >
                  View <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
