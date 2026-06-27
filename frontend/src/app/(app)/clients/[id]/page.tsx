"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Sparkles, MessageSquare, ArrowRight, Send, Mail, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StageTracker } from "@/components/clients/StageTracker";
import { InteractionTimeline } from "@/components/clients/InteractionTimeline";
import { MatchedPropertiesTab } from "@/components/clients/MatchedPropertiesTab";
import { ClientForm } from "@/components/clients/ClientForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ClientResponse,
  InteractionResponse,
  AIMatchResponse,
  DraftFollowupResponse,
  MatchedProperty,
  formatPKR,
  STAGE_LABELS,
  STAGE_ORDER,
} from "@/types";

export default function ClientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const clientId = params.id as string;
  const isEditMode = searchParams.get("edit") === "true";

  const [client, setClient] = useState<ClientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Interactions state
  const [interactions, setInteractions] = useState<InteractionResponse[]>([]);
  const [interactionsLoaded, setInteractionsLoaded] = useState(false);

  // AI Match state
  const [matches, setMatches] = useState<MatchedProperty[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);

  // Draft Follow-up state
  const [draftModal, setDraftModal] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Stage update state
  const [updatingStage, setUpdatingStage] = useState(false);

  useEffect(() => {
    async function loadClient() {
      try {
        const data = await apiGet<ClientResponse>(`/clients/${clientId}`);
        setClient(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load client",
          variant: "destructive",
        });
        router.push("/clients");
      } finally {
        setLoading(false);
      }
    }
    loadClient();
  }, [clientId, router, toast]);

  // Load interactions when tab becomes active
  useEffect(() => {
    async function loadInteractions() {
      if (activeTab !== "interactions" || interactionsLoaded) return;

      try {
        const data = await apiGet<InteractionResponse[]>(`/clients/${clientId}/interactions`);
        setInteractions(data);
        setInteractionsLoaded(true);
      } catch {
        // Silent fail
      }
    }
    loadInteractions();
  }, [activeTab, clientId, interactionsLoaded]);

  const handleRunAIMatch = async () => {
    setMatchLoading(true);
    try {
      const result = await apiPost<AIMatchResponse>(`/ai/match/${clientId}`);
      setMatches(result.matches);
      setActiveTab("matched");
      toast({
        title: "AI Match Complete",
        description: `Found ${result.matches.length} matching properties`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to run AI match";
      toast({
        title: "AI Match Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setMatchLoading(false);
    }
  };

  const handleDraftFollowup = async () => {
    setDraftLoading(true);
    try {
      const result = await apiPost<DraftFollowupResponse>(`/ai/draft-followup/${clientId}`);
      setDraftMessage(result.message_text);
      setDraftModal(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to draft follow-up";
      toast({
        title: "Draft Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!client) return;
    setSendingWhatsApp(true);
    try {
      await apiPost("/whatsapp/send", {
        to: client.phone,
        message: draftMessage,
      });
      toast({
        title: "Message Sent",
        description: "WhatsApp message sent successfully",
      });
      setDraftModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send WhatsApp";
      toast({
        title: "Send Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await apiPost(`/email/followup/${clientId}`);
      toast({
        title: "Email Sent",
        description: "Follow-up email sent successfully",
      });
      setDraftModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send email";
      toast({
        title: "Send Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleMoveToNextStage = async () => {
    if (!client) return;

    const currentIndex = STAGE_ORDER.indexOf(client.stage);
    if (currentIndex >= STAGE_ORDER.length - 1) {
      toast({
        title: "Already at final stage",
        description: "This client has already reached the Closed stage",
      });
      return;
    }

    const nextStage = STAGE_ORDER[currentIndex + 1];

    setUpdatingStage(true);
    try {
      await apiPatch(`/clients/${clientId}/stage`, { stage: nextStage });
      setClient({ ...client, stage: nextStage });
      toast({
        title: "Stage Updated",
        description: `Client moved to ${STAGE_LABELS[nextStage]}`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update stage";
      toast({
        title: "Stage Update Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleInteractionAdded = (interaction: InteractionResponse) => {
    setInteractions([interaction, ...interactions]);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-text-muted">Client not found</p>
        </div>
      </AppLayout>
    );
  }

  if (isEditMode) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-bold text-maroon-dark">Edit Client</h1>
            <p className="text-text-muted text-sm mt-1">
              Update {client.full_name}&apos;s profile information.
            </p>
          </div>
          <ClientForm id={clientId} initial={client} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Link href="/clients" className="hover:text-maroon-dark transition-colors">
            Clients
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-maroon-dark font-medium">{client.full_name}</span>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b border-maroon-light/20 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="overview"
              className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-maroon-dark data-[state=active]:text-maroon-dark rounded-none bg-transparent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="matched"
              className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-maroon-dark data-[state=active]:text-maroon-dark rounded-none bg-transparent"
            >
              Matched Properties
            </TabsTrigger>
            <TabsTrigger
              value="interactions"
              className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-maroon-dark data-[state=active]:text-maroon-dark rounded-none bg-transparent"
            >
              Interactions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column - Profile */}
              <div className="lg:col-span-7 space-y-6">
                {/* Profile Card */}
                <div className="rounded-xl border border-maroon-light/20 bg-white p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-maroon-light/20 flex items-center justify-center text-maroon-dark font-serif text-xl font-bold">
                      {client.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-maroon-dark">
                        {client.full_name}
                      </h2>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-text-muted">
                        <span>{client.phone}</span>
                        {client.email && <span>{client.email}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-maroon-light/10">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Budget</p>
                      <p className="font-medium text-text-primary">
                        {client.budget_min && client.budget_max
                          ? `${formatPKR(client.budget_min)} – ${formatPKR(client.budget_max)}`
                          : client.budget_max
                          ? `Up to ${formatPKR(client.budget_max)}`
                          : client.budget_min
                          ? `From ${formatPKR(client.budget_min)}`
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Location</p>
                      <p className="font-medium text-text-primary">
                        {client.preferred_city || "Not specified"}
                        {client.preferred_area && ` (${client.preferred_area})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Property Type</p>
                      <p className="font-medium text-text-primary capitalize">
                        {client.property_type_needed || "Any"}
                        {client.bedrooms_needed && `, ${client.bedrooms_needed} Beds`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Stage</p>
                      <p className="font-medium text-text-primary">
                        {STAGE_LABELS[client.stage]}
                      </p>
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mt-4 pt-4 border-t border-maroon-light/10">
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Notes</p>
                      <p className="text-sm text-text-primary italic border-l-2 border-gold/50 pl-3 bg-cream/30 py-2">
                        {client.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stage Tracker */}
                <div className="rounded-xl border border-maroon-light/20 bg-white p-6">
                  <h3 className="font-medium text-text-primary mb-6">Lead Journey</h3>
                  <StageTracker currentStage={client.stage} />
                </div>
              </div>

              {/* Right Column - Actions */}
              <div className="lg:col-span-5 space-y-4">
                {/* Primary Action */}
                <Button
                  onClick={handleDraftFollowup}
                  disabled={draftLoading}
                  className="w-full bg-maroon-dark text-white hover:bg-maroon-medium h-12"
                >
                  {draftLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Drafting...</>
                  ) : (
                    <><MessageSquare className="w-4 h-4 mr-2" /> Draft Follow-up</>
                  )}
                </Button>

                {/* Action Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRunAIMatch}
                    disabled={matchLoading}
                    className="border-maroon-light/40 hover:bg-cream"
                  >
                    {matchLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Run AI Match</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMoveToNextStage}
                    disabled={updatingStage || client.stage === "closed"}
                    className="border-maroon-light/40 hover:bg-cream"
                  >
                    {updatingStage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><ArrowRight className="w-4 h-4 mr-2" /> Next Stage</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Matched Properties Tab */}
          <TabsContent value="matched" className="mt-6">
            <MatchedPropertiesTab matches={matches} loading={matchLoading} />
          </TabsContent>

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="mt-6">
            <InteractionTimeline
              clientId={clientId}
              interactions={interactions}
              onInteractionAdded={handleInteractionAdded}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Draft Follow-up Modal */}
      <Dialog open={draftModal} onOpenChange={setDraftModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>AI-Generated Follow-up</DialogTitle>
            <DialogDescription>
              Review and edit the message before sending.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              rows={8}
              className="border-maroon-light/40"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDraftModal(false)}
              className="border-maroon-light/40"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={sendingEmail || !draftMessage.trim()}
              variant="outline"
              className="border-maroon-light/40"
            >
              {sendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Mail className="w-4 h-4 mr-2" /> Send Email</>
              )}
            </Button>
            <Button
              onClick={handleSendWhatsApp}
              disabled={sendingWhatsApp || !draftMessage.trim()}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {sendingWhatsApp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send WhatsApp</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
