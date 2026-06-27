import { ClientResponse, STAGE_LABELS } from "@/types";

const STAGES: ClientResponse["stage"][] = [
  "new_lead",
  "contacted",
  "site_visit",
  "negotiation",
  "closed",
];

const BAR_COLORS: Record<ClientResponse["stage"], string> = {
  new_lead: "bg-maroon-light",
  contacted: "bg-blue-400",
  site_visit: "bg-gold",
  negotiation: "bg-pink-accent",
  closed: "bg-green-500",
};

interface PipelineChartProps {
  clients: ClientResponse[];
}

export function PipelineChart({ clients }: PipelineChartProps) {
  const counts = STAGES.reduce(
    (acc, s) => ({ ...acc, [s]: clients.filter((c) => c.stage === s).length }),
    {} as Record<string, number>
  );
  const max = Math.max(...Object.values(counts), 1);

  return (
    <div className="rounded-xl border border-maroon-light/20 bg-cream-card p-6 shadow-sm">
      <h3 className="mb-4 font-serif text-lg font-semibold text-maroon-dark">
        Pipeline Distribution
      </h3>
      <div className="space-y-3">
        {STAGES.map((stage) => (
          <div key={stage} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-text-muted">{STAGE_LABELS[stage]}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-maroon-light/10 h-3">
              <div
                className={`h-3 rounded-full transition-all ${BAR_COLORS[stage]}`}
                style={{ width: `${(counts[stage] / max) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-semibold text-maroon-dark">
              {counts[stage]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
