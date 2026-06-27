export function BlogHero() {
  return (
    <div className="relative bg-maroon-dark text-white py-20 px-8 overflow-hidden">
      {/* subtle background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 50%, #7d4c84 0%, transparent 60%)",
        }}
      />
      <div className="relative max-w-3xl">
        <span className="inline-block bg-blush/20 text-blush text-xs font-semibold px-3 py-1 rounded-full mb-6 uppercase tracking-wide">
          Featured Article
        </span>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight max-w-2xl">
          AI-Driven Real Estate: The Future of Property Management
        </h1>
        <p className="text-white/80 mt-4 max-w-xl leading-relaxed">
          Explore how artificial intelligence is transforming agency workflows,
          from lead scoring to automated communications, and unlocking new
          levels of efficiency.
        </p>
        <button className="mt-8 border border-white text-white hover:bg-white hover:text-maroon-dark transition-colors rounded-full px-6 py-2 text-sm font-semibold">
          Read More
        </button>
      </div>
    </div>
  );
}
