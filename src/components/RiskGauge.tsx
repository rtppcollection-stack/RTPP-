import { useI18n } from "@/lib/i18n";
import { computeRisk, type RiskLevel } from "@/lib/risk";
import { fetchCoinDetail, type CoinDetail } from "@/lib/coingecko";
import { useQuery } from "@tanstack/react-query";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

const COLORS: Record<RiskLevel, string> = {
  veryLow: "var(--success)",
  low: "var(--success)",
  medium: "var(--warning)",
  high: "var(--danger)",
  veryHigh: "var(--danger)",
};

/** Full gauge (kept for reference / detail views) */
export function RiskGauge({ coin }: { coin: CoinDetail }) {
  const { t } = useI18n();
  const r = computeRisk(coin);
  const color = COLORS[r.level];
  const Icon = r.score >= 60 ? ShieldCheck : r.score >= 40 ? Shield : ShieldAlert;
  const labelKey = `risk.${r.level}` as const;

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color }} /> {t("risk.title")}
        </h3>
        <span className="font-mono text-2xl font-bold" style={{ color }}>
          {r.score}%
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${r.score}%`, background: color, boxShadow: `0 0 12px ${color}` }}
        />
      </div>
      <div
        className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
        style={{ background: `color-mix(in oklab, ${color} 20%, transparent)`, color }}
      >
        {t(labelKey)}
      </div>
    </div>
  );
}

/** Compact inline risk badge — sits next to search box */
export function RiskBadge({ coinId }: { coinId: string }) {
  const { t } = useI18n();
  const { data: coin } = useQuery({
    queryKey: ["coin-risk", coinId],
    queryFn: () => fetchCoinDetail(coinId),
    staleTime: 60_000,
  });

  if (!coin) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/40 px-3 py-2 text-[11px] text-muted-foreground">
        <Shield className="h-3.5 w-3.5" /> {t("risk.title")}: —
      </div>
    );
  }

  const r = computeRisk(coin);
  const color = COLORS[r.level];
  const Icon = r.score >= 60 ? ShieldCheck : r.score >= 40 ? Shield : ShieldAlert;
  const labelKey = `risk.${r.level}` as const;

  return (
    <div
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
      style={{
        borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
        background: `color-mix(in oklab, ${color} 10%, transparent)`,
      }}
      title={`${coin.name} risk score`}
    >
      <Icon className="h-3.5 w-3.5" style={{ color }} />
      <span className="text-muted-foreground">{t("risk.title")}</span>
      <span className="font-mono font-bold" style={{ color }}>
        {r.score}%
      </span>
      <span className="hidden sm:inline font-medium" style={{ color }}>
        · {t(labelKey)}
      </span>
      <div className="relative hidden sm:block h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full" style={{ width: `${r.score}%`, background: color }} />
      </div>
    </div>
  );
}
