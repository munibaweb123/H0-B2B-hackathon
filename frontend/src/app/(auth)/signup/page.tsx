"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface SignupFormState {
  agencyName: string;
  fullName: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [form, setForm] = useState<SignupFormState>({
    agencyName: "",
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignupFormState>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  const validate = () => {
    const nextErrors: Partial<SignupFormState> = {};
    
    if (!form.agencyName.trim()) {
      nextErrors.agencyName = "Agency name is required.";
    }
    if (!form.fullName.trim()) {
      nextErrors.fullName = "Your name is required.";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
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
        "/auth/signup",
        {
          agency_name: form.agencyName.trim(),
          full_name: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        }
      );

      login(response.access_token);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message || "Unable to create your account right now.");
      } else {
        setSubmitError("Unable to create your account right now.");
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
            Create your agency workspace
          </CardTitle>
          <CardDescription className="text-base text-text-muted">
            Start with your agency details and become the first owner on the account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="agencyName">
              Agency name
            </label>
            <Input
              id="agencyName"
              name="agencyName"
              value={form.agencyName}
              onChange={(event) => {
                setForm((current) => ({ ...current, agencyName: event.target.value }));
                if (errors.agencyName) {
                  setErrors((current) => ({ ...current, agencyName: undefined }));
                }
              }}
              className={errors.agencyName ? "border-pink-accent" : ""}
              placeholder="Elite Realty"
            />
            {errors.agencyName ? <p className="text-sm text-pink-accent">{errors.agencyName}</p> : null}
          </div>

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
            <label className="text-sm font-medium text-text-primary" htmlFor="email">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => {
                setForm((current) => ({ ...current, email: event.target.value }));
                if (errors.email) {
                  setErrors((current) => ({ ...current, email: undefined }));
                }
              }}
              className={errors.email ? "border-pink-accent" : ""}
              placeholder="owner@agency.com"
            />
            {errors.email ? <p className="text-sm text-pink-accent">{errors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="password">
              Password
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
            {isSubmitting ? "Creating workspace..." : "Create account"}
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