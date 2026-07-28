import type { CoinDetail } from "./coingecko";

export type RiskLevel = "veryLow" | "low" | "medium" | "high" | "veryHigh";

export interface RiskResult {
  score: number; // 0-100 (higher = safer)
  level: RiskLevel;
  factors: { label: string; value: number; weight: number }[];
}

export function computeRisk(coin: CoinDetail): RiskResult {
  const md = coin.market_data;
  const mcap = md.market_cap.usd || 0;
  const vol = md.total_volume.usd || 0;
  const vol24 = Math.abs(md.price_change_percentage_24h || 0);
  const vol30 = Math.abs(md.price_change_percentage_30d || 0);
  const rank = coin.market_cap_rank || 999;
  const genesis = coin.genesis_date ? new Date(coin.genesis_date).getTime() : Date.now();
  const ageYears = Math.max(0, (Date.now() - genesis) / (365 * 864e5));

  // Sub-scores 0-100 (higher = safer)
  const mcapScore =
    mcap > 100e9
      ? 100
      : mcap > 10e9
        ? 85
        : mcap > 1e9
          ? 65
          : mcap > 100e6
            ? 45
            : mcap > 10e6
              ? 25
              : 10;
  const volScore = vol > 5e9 ? 100 : vol > 1e9 ? 85 : vol > 100e6 ? 65 : vol > 10e6 ? 40 : 20;
  const rankScore = rank <= 10 ? 100 : rank <= 50 ? 80 : rank <= 100 ? 60 : rank <= 300 ? 40 : 20;
  const stability24 = Math.max(0, 100 - vol24 * 5);
  const stability30 = Math.max(0, 100 - vol30 * 1.5);
  const ageScore = Math.min(100, ageYears * 20);

  const factors = [
    { label: "marketCap", value: mcapScore, weight: 0.25 },
    { label: "volume", value: volScore, weight: 0.2 },
    { label: "rank", value: rankScore, weight: 0.15 },
    { label: "vol24", value: stability24, weight: 0.15 },
    { label: "vol30", value: stability30, weight: 0.1 },
    { label: "age", value: ageScore, weight: 0.15 },
  ];

  const score = Math.round(factors.reduce((s, f) => s + f.value * f.weight, 0));
  const level: RiskLevel =
    score >= 80
      ? "veryLow"
      : score >= 60
        ? "low"
        : score >= 40
          ? "medium"
          : score >= 20
            ? "high"
            : "veryHigh";

  return { score, level, factors };
}
