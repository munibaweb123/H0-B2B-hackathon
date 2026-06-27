import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="bg-maroon-dark py-24 px-6 text-center relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-blush -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-pink-accent translate-y-1/2" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
          Ready to transform your agency?
        </h2>
        <p className="text-white/70 text-lg mb-10">
          Join hundreds of Pakistani real estate agencies already using PropFlow AI.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-white hover:bg-cream text-maroon-dark font-bold px-10 py-4 rounded-full transition-colors shadow-lg text-base"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
