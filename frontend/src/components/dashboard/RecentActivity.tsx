import Link from "next/link";
import { ClientResponse, STAGE_LABELS, STAGE_COLORS } from "@/types";

interface RecentActivityProps {
  clients: ClientResponse[];
}

export function RecentActivity({ clients }: RecentActivityProps) {
  const recent = [...clients]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8);

  return (
    <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6 shadow-sm">
      <h3 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">Recent Activity</h3>
      {recent.length === 0 ? (
        <p className="text-sm text-text-muted">No clients yet.</p>
      ) : (
        <ul className="divide-y divide-maroon-light/10">
          {recent.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon-dark/10 text-xs font-bold text-maroon-dark">
                  {c.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <Link
                    href={`/clients/${c.id}`}
                    className="text-sm font-medium text-maroon-dark hover:underline"
                  >
                    {c.full_name}
                  </Link>
                  <p className="text-xs text-text-muted">
                    {new Date(c.updated_at).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[c.stage]}`}>
                {STAGE_LABELS[c.stage]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
