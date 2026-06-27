"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-maroon-dark/8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-2xl font-bold text-maroon-dark">
          PropFlow
        </Link>

        {/* Desktop center links */}
        <div className="hidden lg:flex items-center gap-10">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-text-muted hover:text-maroon-dark transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-maroon-dark hover:text-maroon-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-pink-accent hover:bg-pink-accent/90 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg text-maroon-dark hover:bg-maroon-dark/5"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-maroon-dark/10 bg-cream px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-text-muted hover:text-maroon-dark py-1"
            >
              {l.label}
            </Link>
          ))}
          <hr className="border-maroon-dark/10" />
          <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-maroon-dark">
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="bg-pink-accent text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center"
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}
