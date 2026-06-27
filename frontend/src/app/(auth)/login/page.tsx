"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [router, user]);

  const validate = () => {
    const next: Partial<LoginForm> = {};
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await apiPost<{ access_token: string }>("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });
      login(res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message || "Invalid credentials."
          : "Unable to sign in right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-cream px-8 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <p className="mb-8 font-serif text-2xl font-bold text-maroon-dark">PropFlow AI</p>

          <h1 className="mb-2 font-serif text-3xl font-bold text-maroon-dark">Welcome back</h1>
          <p className="mb-8 text-text-muted">
            Sign in to continue managing your agency workspace.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="agent@agency.com"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  if (errors.email) setErrors((f) => ({ ...f, email: undefined }));
                }}
                className={errors.email ? "border-pink-accent" : "border-maroon-light/40 focus-visible:ring-pink-accent"}
              />
              {errors.email && <p className="text-sm text-pink-accent">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
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
              className="w-full bg-pink-accent text-white hover:bg-pink-accent/90"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-text-muted">
            New to PropFlow?{" "}
            <Link href="/signup" className="font-medium text-maroon-medium hover:text-maroon-dark">
              Create an agency account
            </Link>
          </p>
          <p className="mt-2 text-sm text-text-muted">
            Invited by a teammate?{" "}
            <Link href="/invite/demo" className="font-medium text-maroon-medium hover:text-maroon-dark">
              Accept your invite
            </Link>
          </p>
        </div>
      </div>

      {/* Right — hero panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-maroon-dark px-16 py-12 text-white">
        <div className="max-w-sm text-center">
          <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-maroon-medium">
            <svg className="h-8 w-8 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h2 className="mb-4 font-serif text-3xl font-bold leading-snug">
            Close more deals with AI-powered insights
          </h2>
          <p className="mb-10 text-maroon-light/80 text-base leading-relaxed">
            PropFlow AI transforms complex property data into clear, actionable insights. Built for high-stakes real estate professionals.
          </p>

          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { value: "3×", label: "Faster client matching" },
              { value: "AI", label: "Multilingual support" },
              { value: "WhatsApp", label: "Primary interface" },
              { value: "Live", label: "Deal closer automation" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-maroon-medium bg-maroon-medium/30 p-4">
                <p className="font-serif text-xl font-bold text-cream">{stat.value}</p>
                <p className="mt-0.5 text-sm text-maroon-light/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
