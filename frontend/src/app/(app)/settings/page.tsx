"use client";

import { useEffect, useState } from "react";
import { Plus, X, UserCircle } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { UserResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-gold/20 text-yellow-800 border-gold/30",
  manager: "bg-blue-100 text-blue-700 border-blue-200",
  agent: "bg-maroon-light/20 text-maroon-dark border-maroon-light/30",
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    apiGet<UserResponse>("/auth/me")
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      await apiPost("/auth/invite", { email: inviteEmail });
      toast({ title: `Invite sent to ${inviteEmail}` });
      setInviteEmail("");
      setShowInvite(false);
    } catch (err) {
      toast({
        title: "Failed to send invite",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-text-primary">
          Account Settings
        </h2>
        <p className="text-text-muted text-sm mt-1">
          Manage your profile and team members.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile card */}
        <section className="lg:col-span-4 bg-white rounded-2xl border border-border p-8 flex flex-col items-center text-center shadow-sm">
          {loading ? (
            <div className="space-y-3 w-full flex flex-col items-center">
              <Skeleton className="w-24 h-24 rounded-full" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-maroon-light/20 flex items-center justify-center mb-4 border-2 border-maroon-light/30">
                <UserCircle className="w-14 h-14 text-maroon-dark" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-text-primary">
                {user?.full_name ?? "—"}
              </h3>
              <p className="text-text-muted text-sm mt-1">{user?.email ?? "—"}</p>
              <div className="flex gap-2 mt-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${
                    ROLE_COLORS[user?.role ?? "agent"] ?? ""
                  }`}
                >
                  {user?.role ?? "—"}
                </span>
              </div>
            </>
          )}
        </section>

        {/* Team members */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <h3 className="font-serif text-xl font-semibold text-text-primary">
                Team Members
              </h3>
              <p className="text-text-muted text-sm mt-0.5">
                Manage access for your agency team.
              </p>
            </div>
            <Button
              onClick={() => setShowInvite(true)}
              className="bg-maroon-dark hover:bg-maroon-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Invite Agent
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {user && (
                <div className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-full bg-maroon-light/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-maroon-dark">
                      {user.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user.email}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize flex-shrink-0 ${
                      ROLE_COLORS[user.role] ?? ""
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              )}
              <div className="pt-4 text-center text-sm text-text-muted">
                Invite agents to see them appear here.
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-cream">
              <h3 className="font-serif text-lg font-semibold text-text-primary">
                Invite Agent
              </h3>
              <button
                onClick={() => setShowInvite(false)}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <p className="text-sm text-text-muted">
                Send an invitation email to a new team member. They&apos;ll receive
                a link to set up their account.
              </p>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="agent@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Role
                </label>
                <select
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-maroon-light/30"
                  defaultValue="agent"
                >
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInvite(false)}
                  className="border-maroon-light/30 text-maroon-dark"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={inviteLoading}
                  className="bg-maroon-dark hover:bg-maroon-medium gap-2"
                >
                  {inviteLoading ? "Sending…" : "Send Invite"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
