"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface InviteFormState {
  fullName: string;
  password: string;
}

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const { login, user } = useAuth();
  const [form, setForm] = useState<InviteFormState>({ fullName: "", password: "" });
  const [errors, setErrors] = useState<Partial<InviteFormState>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  const validate = () => {
    const nextErrors: Partial<InviteFormState> = {};
    if (!form.fullName.trim()) {
      nextErrors.fullName = "Your name is required.";
    }
    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiPost<{ access_token: string; token_type: string }>(
        "/auth/accept-invite",
        {
          token: params.token,
          full_name: form.fullName.trim(),
          password: form.password,
        }
      );

      login(response.access_token);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message || "Unable to accept the invite right now.");
      } else {
        setSubmitError("Unable to accept the invite right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-maroon-light/20 bg-cream-card shadow-lg">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full border border-maroon-light/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-maroon-medium">
          PropFlow AI
        </div>
        <div className="space-y-2">
          <CardTitle className="font-serif text-3xl text-maroon-dark">
            Accept your invite
          </CardTitle>
          <CardDescription className="text-base text-text-muted">
            Set up your account details and join the agency workspace.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="fullName">
              Your full name
            </label>
            <Input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={(event) => {
                setForm((current) => ({ ...current, fullName: event.target.value }));
                if (errors.fullName) {
                  setErrors((current) => ({ ...current, fullName: undefined }));
                }
              }}
              className={errors.fullName ? "border-pink-accent" : ""}
              placeholder="Ahmed Khan"
            />
            {errors.fullName ? <p className="text-sm text-pink-accent">{errors.fullName}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="password">
              Create a password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(event) => {
                setForm((current) => ({ ...current, password: event.target.value }));
                if (errors.password) {
                  setErrors((current) => ({ ...current, password: undefined }));
                }
              }}
              className={errors.password ? "border-pink-accent" : ""}
              placeholder="Create a password"
            />
            {errors.password ? <p className="text-sm text-pink-accent">{errors.password}</p> : null}
          </div>

          {submitError ? (
            <div className="rounded-md border border-pink-accent/30 bg-pink-accent/10 px-3 py-2 text-sm text-pink-accent">
              {submitError}
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full bg-maroon-medium text-white hover:bg-maroon-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Accepting invite..." : "Accept invite"}
          </Button>
        </form>

        <div className="mt-6 text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-maroon-medium hover:text-maroon-dark">
            Sign in instead
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
