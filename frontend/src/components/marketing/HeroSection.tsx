import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="flex flex-col lg:flex-row" style={{ minHeight: "560px" }}>
      {/* Left — text side */}
      <div className="flex-1 bg-cream flex flex-col justify-center px-8 py-16 lg:px-16 xl:px-24">
        <p className="text-pink-accent text-sm font-semibold tracking-widest uppercase mb-4">
          AI-Powered Real Estate CRM
        </p>
        <h1 className="font-serif text-5xl lg:text-6xl font-bold text-maroon-dark leading-[1.1] max-w-lg">
          Close more deals with AI-powered insights
        </h1>
        <p className="mt-6 text-text-muted text-lg leading-relaxed max-w-md">
          PropFlow AI transforms complex property data into clear, actionable
          insights for real estate professionals.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/signup"
            className="inline-block bg-pink-accent hover:bg-pink-accent/90 text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-md"
          >
            Get Started Free
          </Link>
          <Link
            href="#how-it-works"
            className="inline-block text-maroon-dark font-semibold text-sm hover:text-maroon-medium transition-colors"
          >
            See how it works →
          </Link>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex items-center gap-6 text-xs text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Free 14-day trial
          </span>
        </div>
      </div>

      {/* Right — building image */}
      <div className="flex-1 relative min-h-[360px] lg:min-h-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&q=80"
          alt="Modern real estate building"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {/* Dark overlay for depth */}
        <div className="absolute inset-0 bg-maroon-dark/20" />
      </div>
    </section>
  );
}
