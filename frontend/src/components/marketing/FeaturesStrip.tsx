import { Search, MessageSquare, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "AI-Powered Matching",
    description: "Faster client connections with intelligent recommendations",
  },
  {
    icon: MessageSquare,
    title: "Multilingual Support",
    description: "Communicate effectively with global clients in real-time",
  },
  {
    icon: TrendingUp,
    title: "Market Trends Analysis",
    description: "Stay ahead with predictive analytics and local data",
  },
];

export function FeaturesStrip() {
  return (
    <section id="features" className="bg-maroon-dark py-14 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-blush" />
            </div>
            <h3 className="font-semibold text-white text-base mt-1">{title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
