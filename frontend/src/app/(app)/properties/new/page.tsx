"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/properties/PropertyForm";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link href="/properties" className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-maroon-dark">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>
        <h1 className="font-serif text-2xl font-bold text-maroon-dark">Add New Property</h1>
        <p className="text-sm text-text-muted">Enter the details for the new listing to add it to your portfolio.</p>
      </div>
      <PropertyForm />
    </div>
  );
}
