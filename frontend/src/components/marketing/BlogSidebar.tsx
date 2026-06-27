import { NewsletterForm } from "./NewsletterForm";

const TOPICS = [
  "AI", "Automation", "CRM", "Data", "AI + Automation",
  "Smart", "Design", "Tech Study",
];

const RECENT = [
  "5 Ways AI Converts More Leads",
  "Quarterly Real Estate Market Outlook",
];

interface BlogSidebarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function BlogSidebar({ searchQuery, onSearchChange }: BlogSidebarProps) {
  return (
    <aside className="space-y-8">
      {/* Search */}
      <div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
            fill="none" stroke="currentColor" strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx={11} cy={11} r={8} />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search Insights"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-maroon-light/30 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-accent/50"
          />
        </div>
      </div>

      {/* Newsletter */}
      <NewsletterForm />

      {/* Popular Topics */}
      <div>
        <h3 className="font-serif text-lg text-maroon-dark font-semibold mb-3">
          Popular Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <span
              key={topic}
              className="bg-cream border border-maroon-light/20 text-maroon-dark text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-maroon-dark hover:text-white transition-colors"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <h3 className="font-serif text-lg text-maroon-dark font-semibold mb-3">
          Recent Posts
        </h3>
        <ul className="space-y-2">
          {RECENT.map((title) => (
            <li key={title}>
              <span className="text-sm text-pink-accent hover:underline cursor-pointer">
                {title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
