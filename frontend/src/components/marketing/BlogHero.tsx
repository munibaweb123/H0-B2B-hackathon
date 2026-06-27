import Image from "next/image";

export function BlogHero() {
  return (
    <div className="relative bg-maroon-dark text-white py-20 px-8 overflow-hidden">
      {/* Background photo */}
      <Image
        src="https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?w=1400&q=70"
        alt="City skyline"
        fill
        className="object-cover opacity-20"
        sizes="100vw"
        priority
      />
      {/* gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-maroon-dark/90 to-maroon-dark/60" />
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
