import { Building2, Brain, TrendingUp } from "lucide-react";

const MILESTONES = [
  {
    icon: Building2,
    label: "Inception",
    year: "2023",
    active: false,
  },
  {
    icon: Brain,
    label: "AI Integration",
    year: "2024",
    active: false,
  },
  {
    icon: TrendingUp,
    label: "Market Leader",
    year: "2025",
    active: true,
  },
];

export function StoryTimeline() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left — story copy */}
        <div>
          <h2 className="font-serif text-3xl font-bold text-maroon-dark mb-6">
            Our Story
          </h2>
          <div className="space-y-5 text-text-muted leading-relaxed">
            <p>
              Founded by a team of data scientists and real estate experts,
              PropFlow was born from a shared vision to bridge the gap between
              complex market data and practical business growth.
            </p>
            <p>
              We recognised that agents were drowning in disconnected tools,
              spreadsheets, and manual follow-ups. PropFlow brings everything
              together — listings, clients, AI, and communications — into a
              single intelligent workspace.
            </p>
            <p>
              PropFlow was born from combining real estate expertise and
              data science to deliver AI tools that help agencies outperform the
              market, advance promising leads, and grow with confidence.
            </p>
          </div>
        </div>

        {/* Right — vertical timeline */}
        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-maroon-light/20" />

          <div className="space-y-10">
            {MILESTONES.map(({ icon: Icon, label, year, active }) => (
              <div key={year} className="relative flex items-start gap-5">
                {/* Circle dot */}
                <div
                  className={
                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 -ml-8 " +
                    (active
                      ? "bg-pink-accent shadow-md"
                      : "bg-maroon-dark")
                  }
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Label */}
                <div className="pt-1">
                  <p className="font-serif text-lg font-semibold text-maroon-dark leading-tight">
                    {label}
                  </p>
                  <p className="text-sm text-text-muted mt-0.5">({year})</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
