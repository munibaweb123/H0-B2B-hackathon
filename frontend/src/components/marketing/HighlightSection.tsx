import Link from "next/link";
import { Sparkles } from "lucide-react";

export function HighlightSection() {
  return (
    <section className="bg-cream py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row rounded-2xl overflow-hidden shadow-lg border border-maroon-light/10">
          {/* Left — accent */}
          <div className="sm:w-2/5 bg-pink-accent p-10 flex flex-col justify-center gap-4">
            <Sparkles className="w-8 h-8 text-white/80" />
            <h2 className="font-serif text-3xl font-bold text-white leading-snug">
              AI sanity in powered data
            </h2>
          </div>

          {/* Right — white */}
          <div className="sm:w-3/5 bg-white p-10 flex flex-col justify-center gap-5">
            <p className="text-text-muted text-base leading-relaxed">
              PropFlow AI transforms complex property data into clear, actionable
              insights for real estate professionals. Make smarter decisions faster.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-pink-accent hover:bg-pink-accent/90 text-white text-sm font-semibold px-6 py-3 rounded-lg w-fit transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
