"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StageManagerModalProps {
  open: boolean;
  mode: "add" | "rename" | "delete";
  stageId?: string;
  stageName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function StageManagerModal({
  open,
  mode,
  stageId,
  stageName,
  onClose,
  onSuccess,
}: StageManagerModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(stageName || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      if (mode === "add") {
        if (!name.trim()) {
          toast({
            title: "Error",
            description: "Stage name is required",
            variant: "destructive",
          });
          return;
        }
        await apiPost("/pipeline/stages", { name: name.trim() });
        toast({ title: "Stage added", description: `"${name}" stage created successfully` });
      } else if (mode === "rename" && stageId) {
        if (!name.trim()) {
          toast({
            title: "Error",
            description: "Stage name is required",
            variant: "destructive",
          });
          return;
        }
        await apiPatch(`/pipeline/stages/${stageId}`, { name: name.trim() });
        toast({ title: "Stage renamed", description: `Stage renamed to "${name}"` });
      } else if (mode === "delete" && stageId) {
        await apiDelete(`/pipeline/stages/${stageId}`);
        toast({ title: "Stage deleted", description: "Clients have been moved to Uncategorized" });
      }

      onSuccess();
      onClose();
      setName("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Operation failed";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      setName("");
    }
  };

  // Reset name when modal opens with rename mode
  useEffect(() => {
    if (open && mode === "rename" && stageName) {
      setName(stageName);
    } else if (open && mode === "add") {
      setName("");
    }
  }, [open, mode, stageName]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" && "Add New Stage"}
            {mode === "rename" && "Rename Stage"}
            {mode === "delete" && "Delete Stage"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add" && "Create a new pipeline stage for organizing your clients."}
            {mode === "rename" && `Rename the "${stageName}" stage.`}
            {mode === "delete" && (
              <span className="flex items-start gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Are you sure you want to delete &quot;{stageName}&quot;? Clients in this stage will be moved to Uncategorized.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {(mode === "add" || mode === "rename") && (
          <div className="py-4">
            <Input
              placeholder="Stage name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-maroon-light/40"
              autoFocus
            />
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border-maroon-light/40"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || (mode !== "delete" && !name.trim())}
            className={
              mode === "delete"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-maroon-dark text-white hover:bg-maroon-medium"
            }
          >
            {submitting
              ? "..."
              : mode === "add"
              ? "Add Stage"
              : mode === "rename"
              ? "Rename"
              : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
