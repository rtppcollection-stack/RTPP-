import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCoinDetail, fetchChart } from "@/lib/coingecko";
import {
  Copy,
  ExternalLink,
  Zap,
  CheckCircle2,
  TrendingUp,
  Coins,
  ShieldCheck,
  Award,
  BarChart2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RTPPLogoMark } from "@/components/Logo";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { formatNumber } from "@/lib/fx";
import { SwapConfirmationModal } from "@/components/SwapConfirmationModal";

export function RTPPTokenHeroCard({ onSelectToken }: { onSelectToken?: (id: string) => void }) {
  const [days, setDays] = useState("7");
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  const contractAddress = "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8";

  const { data: coin } = useQuery({
    queryKey: ["coin-detail", "rtpp-token"],
    queryFn: () => fetchCoinDetail("rtpp-token"),
    staleTime: 30_000,
  });

  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["chart", "rtpp-token", days],
    queryFn: () => fetchChart("rtpp-token", "usd", days),
    staleTime: 60_000,
  });

  const points = (chartData?.prices ?? []).map(([ts, p]) => ({
    time: new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: days === "1" ? "numeric" : undefined,
    }),
    price: p,
  }));

  const priceUSD = coin?.market_data?.current_price?.usd ?? 0.25;
  const priceMMK = coin?.market_data?.current_price?.mmk ?? 875;
  const change24h = coin?.market_data?.price_change_percentage_24h ?? 8.45;

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    toast.success("RTPP Collection Token contract address copied!");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-surface/95 via-surface-2/90 to-surface/95 p-5 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.25)] space-y-4 font-mono text-xs">
      {/* Background Decorative Glow */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-2 p-1.5 rounded-2xl bg-primary/10 border border-primary/30 shadow-md">
            <RTPPLogoMark className="h-12 w-12" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-black text-foreground tracking-tight">
                RTPP Collection Token
              </h2>
              <Badge
                variant="outline"
                className="bg-amber-400/20 text-amber-400 border-amber-400/50 font-bold px-2 py-0.5 text-[10px]"
              >
                ★ OFFICIAL PRIMARY NATIVE TOKEN
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              The primary ecosystem utility &amp; fee governance token for our platform.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSwapModalOpen(true)}
            className="h-9 px-4 text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 gap-1.5 shadow-md transition-transform active:scale-95"
          >
            <Zap className="h-4 w-4 fill-black" />
            <span>Instant Swap RTPP</span>
          </Button>

          <a
            href={`https://app.uniswap.org/#/swap?chain=mainnet&outputCurrency=${contractAddress}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center h-9 px-3.5 text-xs font-extrabold bg-pink-600/90 text-white hover:bg-pink-500 rounded-xl gap-1.5 shadow-md transition-all border border-pink-400/40"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Official Uniswap V3 Swap</span>
          </a>

          {onSelectToken && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectToken("rtpp-token")}
              className="h-9 px-3 text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-semibold"
            >
              <BarChart2 className="h-3.5 w-3.5 mr-1" />
              <span>Deep Analysis</span>
            </Button>
          )}
        </div>
      </div>

      {/* Contract & Price Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Contract Address & Copy Bar */}
        <div className="md:col-span-7 space-y-2 p-3 rounded-xl bg-surface-2/80 border border-border/70">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Verified Smart Contract Address:
            </span>
            <span className="text-success font-bold text-[10px]">ERC-20 • Ethereum</span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-surface p-2 rounded-lg border border-border font-mono text-xs">
            <span className="font-bold text-primary truncate select-all">{contractAddress}</span>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold bg-surface-2 hover:bg-primary/20 text-foreground hover:text-primary px-2 py-1 rounded border border-border transition-colors"
                title="Copy Address"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
              <a
                href={`https://etherscan.io/token/${contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold bg-surface-2 hover:bg-primary/20 text-foreground hover:text-primary px-2 py-1 rounded border border-border transition-colors"
                title="View on Etherscan"
              >
                <ExternalLink className="h-3 w-3" /> Etherscan
              </a>
            </div>
          </div>

          {/* Key Utility Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
            <span className="text-muted-foreground">Ecosystem Perks:</span>
            <span className="rounded bg-primary/10 border border-primary/30 px-1.5 py-0.5 text-primary font-semibold">
              50% Swap Fee Discount
            </span>
            <span className="rounded bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 text-amber-400 font-semibold">
              Staking APY Boost
            </span>
            <span className="rounded bg-success/10 border border-success/30 px-1.5 py-0.5 text-success font-semibold">
              DAO Governance
            </span>
          </div>
        </div>

        {/* Live Price Statistics Block */}
        <div className="md:col-span-5 grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-surface-2/80 border border-border/70">
            <span className="text-[10px] text-muted-foreground block font-bold">
              RTPP LIVE PRICE
            </span>
            <div className="text-lg font-black text-foreground mt-0.5">
              ${priceUSD.toFixed(2)} USD
            </div>
            <div className="text-[11px] text-muted-foreground">
              ≈ {priceMMK.toLocaleString()} MMK
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-2/80 border border-border/70">
            <span className="text-[10px] text-muted-foreground block font-bold">
              24H PERFORMANCE
            </span>
            <div className="text-lg font-black text-success flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-4 w-4" /> +{change24h.toFixed(2)}%
            </div>
            <div className="text-[11px] text-muted-foreground">Market Cap: $25M</div>
          </div>
        </div>
      </div>

      {/* Live Chart Section */}
      <div className="relative z-10 space-y-2 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="font-bold text-foreground text-xs">
              RTPP Collection Token Live Price Chart
            </span>
          </div>

          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-lg border border-border">
            {[
              { label: "1D", val: "1" },
              { label: "7D", val: "7" },
              { label: "30D", val: "30" },
              { label: "1Y", val: "365" },
            ].map((d) => (
              <button
                key={d.val}
                type="button"
                onClick={() => setDays(d.val)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  days === d.val
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-44 w-full rounded-xl bg-surface/80 p-2 border border-border/60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points}>
              <defs>
                <linearGradient id="rtppGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.64 0.24 252)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.64 0.24 252)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="time" stroke="#888888" fontSize={10} tickLine={false} />
              <YAxis
                domain={["auto", "auto"]}
                stroke="#888888"
                fontSize={10}
                tickFormatter={(v) => `$${v.toFixed(2)}`}
                orientation="right"
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].value as number;
                    return (
                      <div className="rounded-lg border border-border bg-surface p-2 shadow-xl text-xs font-mono">
                        <div className="text-muted-foreground">{payload[0].payload.time}</div>
                        <div className="font-extrabold text-foreground">${p.toFixed(4)} USD</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="oklch(0.64 0.24 252)"
                strokeWidth={2.5}
                fill="url(#rtppGlow)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Swap Confirmation Modal Link */}
      <SwapConfirmationModal
        open={swapModalOpen}
        onOpenChange={setSwapModalOpen}
        initialAddress={contractAddress}
      />
    </div>
  );
}
