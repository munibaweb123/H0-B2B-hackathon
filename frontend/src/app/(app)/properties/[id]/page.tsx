"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyForm } from "@/components/properties/PropertyForm";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { PropertyResponse } from "@/types";

interface DealCloserResult {
  property_id: string;
  clients_pitched: { client_id: string; name: string; message_preview: string }[];
}

export default function EditPropertyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [dealDialog, setDealDialog] = useState(false);
  const [dealRunning, setDealRunning] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiGet<PropertyResponse>(`/properties/${params.id}`)
      .then(setProperty)
      .catch(() => router.replace("/properties"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const triggerDealCloser = async () => {
    setDealRunning(true);
    try {
      const res = await apiPost<DealCloserResult>(`/deal-closer/${params.id}`);
      const count = res.clients_pitched.length;
      toast({
        title: "Deal Closer fired!",
        description: `Pitched ${count} matched client${count !== 1 ? "s" : ""} via WhatsApp.`,
      });
    } catch {
      toast({ title: "Deal Closer failed", description: "Could not send pitches. Try again.", variant: "destructive" });
    } finally {
      setDealRunning(false);
      setDealDialog(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/properties/${params.id}`);
      router.push("/properties");
    } catch {
      toast({ title: "Delete failed", description: "Could not delete property.", variant: "destructive" });
      setDeleting(false);
      setDeleteDialog(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <Link href="/properties" className="mb-2 inline-flex items-center gap-1 text-sm text-text-muted hover:text-maroon-dark">
          <ArrowLeft className="h-4 w-4" /> Back to Properties
        </Link>
        <h1 className="font-serif text-2xl font-bold text-maroon-dark">Edit Property</h1>
        <p className="text-sm text-text-muted">Update the details for this listing.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <PropertyForm id={params.id} initial={property ?? undefined} />
      )}

      {/* Deal Closer */}
      <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6">
        <h2 className="mb-1 font-serif text-lg font-semibold text-maroon-dark">Autonomous Deal Closer</h2>
        <p className="mb-4 text-sm text-text-muted">
          AI will find matching clients and send them a personalised WhatsApp pitch for this property.
        </p>
        <Button
          onClick={() => setDealDialog(true)}
          className="bg-pink-accent text-white hover:bg-pink-accent/90"
        >
          <Zap className="mr-2 h-4 w-4" />
          Trigger Deal Closer — Pitch Matched Clients
        </Button>
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h2 className="mb-1 font-serif text-lg font-semibold text-red-700">Danger Zone</h2>
        <p className="mb-4 text-sm text-red-600">Permanently delete this property listing.</p>
        <Button
          variant="outline"
          onClick={() => setDeleteDialog(true)}
          className="border-red-300 text-red-600 hover:bg-red-100"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Property
        </Button>
      </div>

      {/* Deal Closer confirmation dialog */}
      <Dialog open={dealDialog} onOpenChange={setDealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trigger Deal Closer?</DialogTitle>
            <DialogDescription>
              This will send personalised WhatsApp pitches to all matching clients for this property. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDealDialog(false)} disabled={dealRunning}>
              Cancel
            </Button>
            <Button onClick={triggerDealCloser} disabled={dealRunning} className="bg-pink-accent text-white hover:bg-pink-accent/90">
              {dealRunning ? "Pitching clients…" : "Yes, send pitches"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this property?</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. The listing will be removed from your portfolio.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 text-white hover:bg-red-700">
              {deleting ? "Deleting…" : "Delete Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
