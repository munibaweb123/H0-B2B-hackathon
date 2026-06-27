import { Brain } from "lucide-react";

export function MissionSection() {
  return (
    <section className="bg-cream py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 rounded-full bg-pink-accent/10 flex items-center justify-center mx-auto mb-8">
          <Brain className="w-9 h-9 text-pink-accent" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-maroon-dark mb-6">
          Our Mission
        </h2>
        <p className="text-text-muted text-lg leading-relaxed">
          To empower real estate professionals with the most advanced AI tools,
          making data-driven decisions simpler and more effective, giving you the
          competitive edge.
        </p>
      </div>
    </section>
  );
}
