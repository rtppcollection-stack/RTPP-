import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMarkets, type MarketCoin } from "@/lib/coingecko";
import { formatNumber, formatCompact } from "@/lib/fx";
import { MarketNewsTicker } from "@/components/MarketNewsTicker";
import {
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  BarChart2,
  LayoutGrid,
  List,
  Flame,
  Award,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface MarketDashboardProps {
  onSelectToken?: (tokenId: string) => void;
  activeTokenId?: string;
}

type FilterCategory = "all" | "gainers" | "losers" | "volume" | "majors";

// Simple fallback SVG sparkline for static rendering
function Sparkline({ data, up }: { data?: number[]; up: boolean }) {
  if (!data || data.length === 0)
    return <div className="h-8 w-24 bg-surface-2/40 rounded animate-pulse" />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 30;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = up ? "var(--success)" : "var(--danger)";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-24 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// Recharts Mini Sparkline with Hover Animation & Interactive Gradient Area
function AnimatedCardSparkline({
  sparklineData,
  isUp,
  isHovered,
  coinSymbol,
}: {
  sparklineData?: number[];
  isUp: boolean;
  isHovered: boolean;
  coinSymbol: string;
}) {
  if (!sparklineData || sparklineData.length === 0) {
    return <div className="h-9 w-28 bg-surface-2/40 rounded animate-pulse" />;
  }

  // Downsample to ~30 points for ultra-smooth Recharts rendering
  const step = Math.max(1, Math.floor(sparklineData.length / 30));
  const chartData = sparklineData
    .filter((_, i) => i % step === 0)
    .map((val, index) => ({
      index,
      price: val,
    }));

  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const strokeColor = isUp ? "#10b981" : "#ef4444";
  const gradientId = `sparkGradient-${coinSymbol.toLowerCase()}-${isUp ? "up" : "down"}`;

  return (
    <div className="relative h-9 w-28 sm:w-32 transition-all duration-300">
      {isHovered ? (
        <div className="h-full w-full animate-fadeIn">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <YAxis domain={[minPrice, maxPrice]} hide />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const priceVal = payload[0].value as number;
                    return (
                      <div className="rounded bg-surface/95 border border-border px-1.5 py-0.5 font-mono text-[9px] text-foreground shadow-lg backdrop-blur-md">
                        ${formatNumber(priceVal, priceVal > 10 ? 2 : 4)}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={true}
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-full w-full flex items-center justify-end">
          <Sparkline data={sparklineData} up={isUp} />
        </div>
      )}
    </div>
  );
}

// Individual Coin Card Component with Hover State
function CoinGridCard({
  coin,
  isSelected,
  onSelectToken,
}: {
  coin: MarketCoin;
  isSelected: boolean;
  onSelectToken?: (tokenId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isUp = (coin.price_change_percentage_24h ?? 0) >= 0;

  return (
    <div
      onClick={() => onSelectToken?.(coin.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "bg-primary/10 border-primary ring-1 ring-primary/50 shadow-[0_0_20px_-5px_var(--primary)]"
          : "bg-surface/70 border-border/80 hover:border-primary/60 hover:bg-surface-2/60 hover:shadow-lg"
      }`}
    >
      {/* Header: Icon, Name, Rank, Price */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={coin.image}
              alt={coin.name}
              className="h-8 w-8 rounded-full ring-1 ring-border group-hover:scale-110 transition-transform duration-200"
              loading="lazy"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                  {coin.name}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase bg-surface-2 px-1 py-0.2 rounded border border-border/50">
                  #{coin.market_cap_rank}
                </span>
              </div>
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {coin.symbol}
              </span>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-0.5 rounded px-2 py-0.5 font-mono text-xs font-extrabold transition-transform duration-200 group-hover:scale-105 ${
              isUp ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
            }`}
          >
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? "+" : ""}
            {coin.price_change_percentage_24h?.toFixed(2)}%
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-xs text-muted-foreground font-mono">Price</span>
          <span className="font-mono text-lg font-extrabold text-foreground tracking-tight">
            $
            {formatNumber(
              coin.current_price,
              coin.current_price > 10 ? 2 : coin.current_price > 0.1 ? 4 : 6,
            )}
          </span>
        </div>
      </div>

      {/* Sparkline & Volume Footer */}
      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-end justify-between gap-2">
        <div className="text-[10px] font-mono text-muted-foreground space-y-0.5">
          <div>
            Vol: <strong className="text-foreground">${formatCompact(coin.total_volume)}</strong>
          </div>
          <div>
            Cap: <strong className="text-foreground">${formatCompact(coin.market_cap)}</strong>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] font-mono text-muted-foreground mb-0.5 flex items-center gap-0.5">
            {isHovered ? (
              <span className="text-primary font-bold flex items-center gap-0.5 animate-pulse">
                <Sparkles className="h-2.5 w-2.5" /> Recharts Live
              </span>
            ) : (
              "7D Trend"
            )}
          </span>
          <AnimatedCardSparkline
            sparklineData={coin.sparkline_in_7d?.price}
            isUp={isUp}
            isHovered={isHovered}
            coinSymbol={coin.symbol}
          />
        </div>
      </div>
    </div>
  );
}

export function MarketDashboard({ onSelectToken, activeTokenId }: MarketDashboardProps) {
  const [category, setCategory] = useState<FilterCategory>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const {
    data: coins = [],
    isLoading,
    isRefetching,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["market-dashboard-coins"],
    queryFn: () => fetchMarkets("usd", 50, 1),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // Highlight majors (BTC, ETH, SOL)
  const majorIds = ["bitcoin", "ethereum", "solana", "binancecoin", "ripple", "cardano"];

  // Filter & Sort Logic
  const filteredCoins = coins
    .filter((coin) => {
      const matchesSearch =
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (category === "majors") return majorIds.includes(coin.id);
      return true;
    })
    .sort((a, b) => {
      if (category === "gainers")
        return b.price_change_percentage_24h - a.price_change_percentage_24h;
      if (category === "losers")
        return a.price_change_percentage_24h - b.price_change_percentage_24h;
      if (category === "volume") return b.total_volume - a.total_volume;
      return a.market_cap_rank - b.market_cap_rank;
    });

  // Calculate Market Overview Metrics
  const totalMarketCap = coins.reduce((acc, c) => acc + (c.market_cap || 0), 0);
  const total24hVolume = coins.reduce((acc, c) => acc + (c.total_volume || 0), 0);
  const topGainer =
    coins.length > 0
      ? [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)[0]
      : null;

  return (
    <div className="space-y-4">
      {/* Live Market News Headline Ticker */}
      <MarketNewsTicker />

      {/* Top Overview Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="panel p-3.5 flex items-center justify-between bg-surface/80 border-border/70">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Market Cap (Top 50)
            </div>
            <div className="text-base font-extrabold font-mono text-foreground mt-0.5">
              ${formatCompact(totalMarketCap)}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Award className="h-5 w-5" />
          </div>
        </div>

        <div className="panel p-3.5 flex items-center justify-between bg-surface/80 border-border/70">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              24h Trading Volume
            </div>
            <div className="text-base font-extrabold font-mono text-foreground mt-0.5">
              ${formatCompact(total24hVolume)}
            </div>
          </div>
          <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold">
            <BarChart2 className="h-5 w-5" />
          </div>
        </div>

        <div className="panel p-3.5 flex items-center justify-between bg-surface/80 border-border/70">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Top 24h Gainer
            </div>
            {topGainer ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-bold text-sm text-foreground">{topGainer.name}</span>
                <span className="text-xs font-mono font-extrabold text-success bg-success/15 px-1.5 py-0.2 rounded">
                  +{topGainer.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            ) : (
              <div className="text-xs font-mono text-muted-foreground">Loading...</div>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-success/10 text-success flex items-center justify-center font-bold">
            <Flame className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category Filters, Refresh, Grid/Table Switch */}
      <div className="panel p-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coin name or symbol (e.g. BTC, Solana)..."
              className="pl-8 h-9 text-xs font-mono bg-surface border-border"
            />
          </div>

          {/* Controls: Refetch & View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="h-9 gap-1.5 text-xs font-mono border-border hover:bg-surface-2"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-primary" : ""}`}
              />
              <span className="hidden sm:inline">Live Sync</span>
            </Button>

            <div className="flex rounded-lg bg-surface-2 p-0.5 border border-border">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Compact Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono border-t border-border/40 pt-2.5">
          <FilterPill active={category === "all"} onClick={() => setCategory("all")}>
            🔥 All Top 50
          </FilterPill>
          <FilterPill active={category === "majors"} onClick={() => setCategory("majors")}>
            ⚡ Majors (BTC, ETH, SOL)
          </FilterPill>
          <FilterPill active={category === "gainers"} onClick={() => setCategory("gainers")}>
            🚀 Top Gainers
          </FilterPill>
          <FilterPill active={category === "losers"} onClick={() => setCategory("losers")}>
            📉 Top Losers
          </FilterPill>
          <FilterPill active={category === "volume"} onClick={() => setCategory("volume")}>
            💎 High Volume
          </FilterPill>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="panel p-4 h-36 animate-pulse bg-surface-2/40 rounded-xl" />
          ))}
        </div>
      ) : filteredCoins.length === 0 ? (
        <div className="panel p-8 text-center text-sm font-mono text-muted-foreground space-y-2">
          <p>No cryptocurrencies matching "{search}".</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Clear Search Filter
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* Card Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredCoins.map((coin) => (
            <CoinGridCard
              key={coin.id}
              coin={coin}
              isSelected={activeTokenId === coin.id}
              onSelectToken={onSelectToken}
            />
          ))}
        </div>
      ) : (
        /* Compact Table Layout */
        <div className="panel overflow-hidden border-border/80">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-surface-2/60 text-muted-foreground border-b border-border uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">24h Change</th>
                  <th className="py-2.5 px-3 text-right">24h Volume</th>
                  <th className="py-2.5 px-3 text-right">Market Cap</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredCoins.map((coin) => {
                  const isUp = (coin.price_change_percentage_24h ?? 0) >= 0;
                  return (
                    <tr
                      key={coin.id}
                      onClick={() => onSelectToken?.(coin.id)}
                      className="hover:bg-surface-2/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-3 text-muted-foreground font-bold">
                        #{coin.market_cap_rank}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <img src={coin.image} alt="" className="h-5 w-5 rounded-full" />
                          <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                            {coin.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            ({coin.symbol})
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-foreground">
                        ${formatNumber(coin.current_price, coin.current_price > 10 ? 2 : 6)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${isUp ? "text-success" : "text-danger"}`}
                      >
                        {isUp ? "+" : ""}
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">
                        ${formatCompact(coin.total_volume)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">
                        ${formatCompact(coin.market_cap)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <Button
                          size="xs"
                          variant="ghost"
                          className="h-6 text-[10px] font-mono text-primary"
                        >
                          Analyze →
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dataUpdatedAt > 0 && (
        <div className="text-right text-[10px] font-mono text-muted-foreground opacity-70">
          Last live update: {new Date(dataUpdatedAt).toLocaleTimeString()} · Data via CoinGecko
          Public Feed
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
        active
          ? "bg-primary text-primary-foreground font-bold shadow-sm"
          : "bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface-2/80"
      }`}
    >
      {children}
    </button>
  );
}
