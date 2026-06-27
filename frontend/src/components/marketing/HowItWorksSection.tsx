import { Database, Brain, Handshake } from "lucide-react";

const STEPS = [
  {
    number: "1",
    icon: Database,
    title: "Connect Your Data",
    description: "Integrate your listings and CRM in minutes. No technical expertise required.",
  },
  {
    number: "2",
    icon: Brain,
    title: "AI Analysis",
    description: "Our platform processes your data and delivers actionable insights automatically.",
  },
  {
    number: "3",
    icon: Handshake,
    title: "Close More Deals",
    description: "Utilize intelligent recommendations to match clients and win more business.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-pink-accent text-sm font-semibold tracking-widest uppercase mb-3">
            Simple Process
          </p>
          <h2 className="font-serif text-4xl font-bold text-maroon-dark">
            How it Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {STEPS.map(({ number, icon: Icon, title, description }) => (
            <div key={number} className="flex flex-col items-center text-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-maroon-dark flex items-center justify-center shadow-md">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-pink-accent text-white text-xs font-bold flex items-center justify-center shadow">
                  {number}
                </div>
              </div>
              <h3 className="font-serif text-xl font-semibold text-maroon-dark">{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
