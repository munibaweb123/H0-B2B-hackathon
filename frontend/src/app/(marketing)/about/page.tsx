import { MissionSection } from "@/components/marketing/MissionSection";
import { StoryTimeline } from "@/components/marketing/StoryTimeline";
import { TeamGrid } from "@/components/marketing/TeamGrid";

export const metadata = {
  title: "About PropFlow — Transforming Property Data into Actionable Insights",
};

export default function AboutPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-cream pt-20 pb-12 px-6 text-center border-b border-maroon-dark/5">
        <p className="text-pink-accent text-sm font-semibold tracking-widest uppercase mb-4">
          Who We Are
        </p>
        <h1 className="font-serif text-5xl font-bold text-maroon-dark mb-4">
          About PropFlow
        </h1>
        <p className="text-text-muted text-lg max-w-xl mx-auto">
          Transforming property data into actionable insights
        </p>
      </section>

      <MissionSection />
      <StoryTimeline />
      <TeamGrid />
    </>
  );
}
