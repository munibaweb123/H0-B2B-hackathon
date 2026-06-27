import Link from "next/link";
import { Globe, Share2, Link2 } from "lucide-react";

const SOCIAL = [
  { label: "Facebook", icon: Globe, href: "#" },
  { label: "Instagram", icon: Share2, href: "#" },
  { label: "Twitter", icon: Link2, href: "#" },
];

export function MarketingFooter() {
  return (
    <footer className="bg-maroon-dark border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <span className="font-serif text-xl font-bold text-white">PropFlow</span>

        <div className="flex items-center gap-8 text-sm text-white/60">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>

        <div className="flex items-center gap-2">
          {SOCIAL.map(({ label, icon: Icon, href }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <Icon className="w-4 h-4 text-white" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
