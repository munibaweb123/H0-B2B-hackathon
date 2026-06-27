"use client";

import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-maroon-dark">Add New Client</h1>
          <p className="text-text-muted text-sm mt-1">
            Create a new client profile to track their requirements and journey.
          </p>
        </div>

        <ClientForm />
      </div>
  );
}
