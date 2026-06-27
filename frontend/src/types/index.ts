export interface PropertyResponse {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  property_type: "apartment" | "villa" | "house" | "plot" | "commercial";
  status: "available" | "reserved" | "sold";
  price: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  area?: string;
  address?: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientResponse {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_city?: string;
  preferred_area?: string;
  bedrooms_needed?: number;
  property_type_needed?: string;
  notes?: string;
  stage: "new_lead" | "contacted" | "site_visit" | "negotiation" | "closed";
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_properties: number;
  active_clients: number;
  pipeline_value: number;
  deals_closed: number;
}

export function formatPKR(amount: number): string {
  if (amount >= 10_000_000) {
    return `Rs ${(amount / 10_000_000).toFixed(1).replace(/\.0$/, "")} Cr`;
  }
  if (amount >= 100_000) {
    return `Rs ${(amount / 100_000).toFixed(1).replace(/\.0$/, "")} Lac`;
  }
  return `Rs ${amount.toLocaleString("en-PK")}`;
}

export const STAGE_LABELS: Record<ClientResponse["stage"], string> = {
  new_lead: "New Lead",
  contacted: "Contacted",
  site_visit: "Site Visit",
  negotiation: "Negotiation",
  closed: "Closed",
};

export const STAGE_COLORS: Record<ClientResponse["stage"], string> = {
  new_lead: "bg-maroon-light/20 text-maroon-dark",
  contacted: "bg-blue-100 text-blue-700",
  site_visit: "bg-gold/20 text-yellow-800",
  negotiation: "bg-pink-accent/20 text-pink-accent",
  closed: "bg-green-100 text-green-700",
};
