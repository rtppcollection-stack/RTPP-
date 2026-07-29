import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fetchChart, fetchCoinDetail } from "@/lib/coingecko";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/fx";
import { TrendingUp, TrendingDown, BarChart2, Activity, Maximize2 } from "lucide-react";

const RANGES = [
  { key: "chart.1d" as const, days: "1" },
  { key: "chart.7d" as const, days: "7" },
  { key: "chart.30d" as const, days: "30" },
  { key: "chart.90d" as const, days: "90" },
  { key: "chart.1y" as const, days: "365" },
];

export function PriceChart({ coinId }: { coinId: string }) {
  const { t } = useI18n();
  const [days, setDays] = useState("7");
  const [mode, setMode] = useState<"area" | "tradingview" | "geckoterminal">(
    coinId === "rtpp-token" ? "geckoterminal" : "area",
  );

  const { data: coin } = useQuery({
    queryKey: ["coin-detail", coinId],
    queryFn: () => fetchCoinDetail(coinId),
    staleTime: 30_000,
  });

  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart", coinId, days],
    queryFn: () => fetchChart(coinId, "usd", days),
    staleTime: 60_000,
  });

  const points = (chartData?.prices ?? []).map(([ts, p]) => ({ t: ts, p }));
  const first = points[0]?.p ?? 0;
  const last = points[points.length - 1]?.p ?? 0;
  const changePct =
    first > 0
      ? ((last - first) / first) * 100
      : (coin?.market_data?.price_change_percentage_24h ?? 0);
  const up = changePct >= 0;
  const stroke = up ? "var(--success)" : "var(--danger)";

  const symbol = coin?.symbol?.toUpperCase() || "BTC";
  const tvSymbol =
    symbol === "ETH"
      ? "BINANCE:ETHUSDT"
      : symbol === "BTC"
        ? "BINANCE:BTCUSDT"
        : symbol === "SOL"
          ? "BINANCE:SOLUSDT"
          : symbol === "BNB"
            ? "BINANCE:BNBUSDT"
            : `BINANCE:${symbol}USDT`;

  return (
    <div className="panel p-4 space-y-3">
      {/* Chart Top Bar with Live Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-3">
          {coin?.image?.large && (
            <img
              src={coin.image.large}
              alt=""
              className="h-8 w-8 rounded-full ring-1 ring-primary/20"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-base">{coin?.name || coinId}</h3>
              <span className="font-mono text-xs text-muted-foreground uppercase">{symbol}</span>
              <span
                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-xs font-bold ${up ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}
              >
                {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {changePct > 0 ? "+" : ""}
                {changePct.toFixed(2)}%
              </span>
            </div>
            {coin?.market_data?.current_price?.usd && (
              <div className="font-mono text-xl font-extrabold text-foreground tracking-tight mt-0.5">
                $
                {formatNumber(
                  coin.market_data.current_price.usd,
                  coin.market_data.current_price.usd > 10 ? 2 : 6,
                )}
              </div>
            )}
          </div>
        </div>

        {/* View mode & Interval toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-md bg-surface-2 p-0.5 border border-border">
            <button
              onClick={() => setMode("geckoterminal")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                mode === "geckoterminal"
                  ? "bg-emerald-600 text-white font-extrabold shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🦎 GeckoTerminal
            </button>
            <button
              onClick={() => setMode("area")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                mode === "area"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-3 w-3" /> Live Area
            </button>
            <button
              onClick={() => setMode("tradingview")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                mode === "tradingview"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart2 className="h-3 w-3" /> TradingView Pro
            </button>
          </div>

          {mode === "area" && (
            <div className="flex gap-1 rounded-md bg-surface-2 p-1 border border-border">
              {RANGES.map((r) => (
                <button
                  key={r.days}
                  onClick={() => setDays(r.days)}
                  className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                    days === r.days
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(r.key)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      {mode === "geckoterminal" ? (
        <div className="h-96 w-full rounded-lg overflow-hidden border border-emerald-500/40 bg-black shadow-lg relative">
          <iframe
            title="GeckoTerminal Live Pool Chart"
            src={
              coinId === "rtpp-token" ||
              coinId.toLowerCase() === "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8"
                ? "https://www.geckoterminal.com/base/pools/0xc59d51cbb9dc36d28315c0f75054ebcf5ad301304640a3d1bd3cbe746f7082aa?embed=1&info=0&swaps=1"
                : `https://www.geckoterminal.com/eth/pools/${coinId}?embed=1&info=0&swaps=1`
            }
            className="h-full w-full border-0"
            allow="clipboard-write"
            allowFullScreen
          />
        </div>
      ) : mode === "area" ? (
        <div className="h-72 w-full relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/50 backdrop-blur-xs z-10 text-xs font-mono text-muted-foreground">
              Loading chart data...
            </div>
          )}
          <ResponsiveContainer>
            <AreaChart data={points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.6}
              />
              <XAxis
                dataKey="t"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                }
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={35}
              />
              <YAxis
                domain={["auto", "auto"]}
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${formatNumber(v, v > 100 ? 0 : 2)}`}
                width={65}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
                labelFormatter={(v) => new Date(v as number).toLocaleString()}
                formatter={(v: number) => [`$${formatNumber(v, v > 100 ? 2 : 6)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="p"
                stroke={stroke}
                strokeWidth={2.5}
                fill="url(#grad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 w-full rounded-lg overflow-hidden border border-border bg-black">
          <iframe
            title="TradingView Live Chart"
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${encodeURIComponent(tvSymbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`}
            className="h-full w-full border-0"
          />
        </div>
      )}

      {/* Extra Token Quick Stats */}
      {coin?.market_data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono border-t border-border/40 text-muted-foreground">
          <div>
            <span>24h High: </span>
            <strong className="text-foreground">
              ${formatNumber(coin.market_data.high_24h.usd ?? 0, 2)}
            </strong>
          </div>
          <div>
            <span>24h Low: </span>
            <strong className="text-foreground">
              ${formatNumber(coin.market_data.low_24h.usd ?? 0, 2)}
            </strong>
          </div>
          <div>
            <span>24h Volume: </span>
            <strong className="text-foreground">
              ${formatNumber(coin.market_data.total_volume.usd ?? 0, 0)}
            </strong>
          </div>
          <div>
            <span>Market Cap: </span>
            <strong className="text-foreground">
              ${formatNumber(coin.market_data.market_cap.usd ?? 0, 0)}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
