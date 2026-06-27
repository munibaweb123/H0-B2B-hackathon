"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface InviteForm {
  fullName: string;
  password: string;
}

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const { login, user } = useAuth();
  const [form, setForm] = useState<InviteForm>({ fullName: "", password: "" });
  const [errors, setErrors] = useState<Partial<InviteForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [router, user]);

  const validate = () => {
    const next: Partial<InviteForm> = {};
    if (!form.fullName.trim()) next.fullName = "Your name is required.";
    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await apiPost<{ access_token: string }>("/auth/accept-invite", {
        token: params.token,
        full_name: form.fullName.trim(),
        password: form.password,
      });
      login(res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message || "Unable to accept the invite."
          : "Unable to accept the invite right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-maroon-light/20 bg-white p-10 shadow-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-maroon-dark">
            <svg className="h-8 w-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl font-bold text-maroon-dark">Join the Agency</h1>
          <p className="mt-2 text-text-muted">
            Set up your account details and join your agency workspace on PropFlow AI.
          </p>
        </div>

        <div className="mb-6 border-t border-maroon-light/20" />

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label className="text-sm font-medium uppercase tracking-wide text-text-muted" htmlFor="fullName">
              Full Name
            </label>
            <Input
              id="fullName"
              placeholder="Ahmed Khan"
              value={form.fullName}
              onChange={(e) => {
                setForm((f) => ({ ...f, fullName: e.target.value }));
                if (errors.fullName) setErrors((f) => ({ ...f, fullName: undefined }));
              }}
              className={errors.fullName ? "border-pink-accent" : "border-maroon-light/40 focus-visible:ring-pink-accent"}
            />
            {errors.fullName && <p className="text-sm text-pink-accent">{errors.fullName}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium uppercase tracking-wide text-text-muted" htmlFor="password">
              Create Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => {
                setForm((f) => ({ ...f, password: e.target.value }));
                if (errors.password) setErrors((f) => ({ ...f, password: undefined }));
              }}
              className={errors.password ? "border-pink-accent" : "border-maroon-light/40 focus-visible:ring-pink-accent"}
            />
            {errors.password && <p className="text-sm text-pink-accent">{errors.password}</p>}
          </div>

          {submitError && (
            <p className="text-sm text-pink-accent">{submitError}</p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-maroon-dark text-white hover:bg-maroon-medium"
          >
            {isSubmitting ? "Joining…" : "Accept & Join Team"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-maroon-medium hover:text-maroon-dark">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
