import { TeamCard } from "./TeamCard";

const TEAM = [
  { name: "Jane Doe",        title: "CEO & Co-Founder"            },
  { name: "John Smith",      title: "CTO"                         },
  { name: "Maria Rodriguez", title: "Head of Data Science"        },
  { name: "David Lee",       title: "Lead Real Estate Strategist" },
];

export function TeamGrid() {
  return (
    <section className="bg-cream py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-maroon-dark text-center mb-12">
          The Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member) => (
            <TeamCard key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
}
