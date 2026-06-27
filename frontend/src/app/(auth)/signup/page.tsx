"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface SignupForm {
  agencyName: string;
  fullName: string;
  email: string;
  password: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [form, setForm] = useState<SignupForm>({
    agencyName: "",
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<SignupForm>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [router, user]);

  const validate = () => {
    const next: Partial<SignupForm> = {};
    if (!form.agencyName.trim()) next.agencyName = "Agency name is required.";
    if (!form.fullName.trim()) next.fullName = "Your name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";
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
      const res = await apiPost<{ access_token: string }>("/auth/signup", {
        agency_name: form.agencyName.trim(),
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      login(res.access_token);
      router.push("/dashboard");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message || "Unable to create your account."
          : "Unable to create your account right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (
    id: keyof SignupForm,
    label: string,
    placeholder: string,
    type = "text",
    autoComplete?: string
  ) => (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-primary" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={form[id]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [id]: e.target.value }));
          if (errors[id]) setErrors((f) => ({ ...f, [id]: undefined }));
        }}
        className={errors[id] ? "border-pink-accent" : "border-maroon-light/40 focus-visible:ring-pink-accent"}
      />
      {errors[id] && <p className="text-sm text-pink-accent">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-cream px-8 py-12 lg:px-16">
        <div className="w-full max-w-md">
          <p className="mb-8 font-serif text-2xl font-bold text-maroon-dark">PropFlow AI</p>

          <h1 className="mb-2 font-serif text-3xl font-bold text-maroon-dark">
            Create your agency workspace
          </h1>
          <p className="mb-8 text-text-muted">
            Start with your agency details and become the first owner on the account.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {field("agencyName", "Agency name", "Elite Realty")}
            {field("fullName", "Your full name", "Ahmed Khan")}
            {field("email", "Email address", "owner@agency.com", "email", "email")}
            {field("password", "Password", "Create a password", "password", "new-password")}

            {submitError && (
              <p className="text-sm text-pink-accent">{submitError}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-accent text-white hover:bg-pink-accent/90"
            >
              {isSubmitting ? "Creating workspace…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-maroon-medium hover:text-maroon-dark">
              Sign in instead
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
            Elevate your portfolio management
          </h2>
          <p className="mb-10 text-maroon-light/80 text-base leading-relaxed">
            PropFlow AI transforms complex property data into clear, actionable insights. Built for high-stakes real estate professionals who demand precision and speed.
          </p>

          <div className="rounded-2xl border border-maroon-medium bg-maroon-medium/30 p-6 text-left">
            <p className="mb-3 text-base font-medium text-cream leading-relaxed">
              "PropFlow helped us close 40% more deals in the first month. The AI matching is extraordinary."
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon-medium text-sm font-bold text-cream">
                TM
              </div>
              <div>
                <p className="text-sm font-semibold text-cream">Tariq Mahmood</p>
                <p className="text-xs text-maroon-light/70">CEO, Horizon Developments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
