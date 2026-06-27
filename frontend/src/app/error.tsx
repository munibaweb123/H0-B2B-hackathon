"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="font-serif text-2xl font-bold text-maroon-dark">
          Something went wrong
        </h2>
        <p className="text-text-muted text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-pink-accent text-white rounded-md text-sm font-medium hover:bg-pink-accent/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
