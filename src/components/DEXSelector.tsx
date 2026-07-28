import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Layers,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

export interface DEXOption {
  id: string;
  name: string;
  chain: string;
  logo: string;
  color: string;
  volume24h: string;
  avgFee: string;
  status: "Optimal" | "Active" | "High Traffic";
  description: string;
  officialUrl: string;
}

export const SUPPORTED_DEXES: DEXOption[] = [
  {
    id: "uniswap",
    name: "Uniswap V3",
    chain: "Ethereum / Arbitrum / Polygon",
    logo: "🦄",
    color: "from-pink-500/20 to-purple-600/20 border-pink-500/40",
    volume24h: "$1.45B",
    avgFee: "0.05% - 0.30%",
    status: "Optimal",
    description: "Official Uniswap V3 concentrated liquidity smart contract router.",
    officialUrl: "https://app.uniswap.org/#/swap?chain=mainnet",
  },
  {
    id: "pancakeswap",
    name: "PancakeSwap V3",
    chain: "BNB Chain / Ethereum",
    logo: "🥞",
    color: "from-amber-500/20 to-yellow-600/20 border-amber-500/40",
    volume24h: "$620M",
    avgFee: "0.01% - 0.25%",
    status: "Active",
    description: "Official PancakeSwap V3 router interface on BNB Chain.",
    officialUrl: "https://pancakeswap.finance/swap",
  },
  {
    id: "raydium",
    name: "Raydium Protocol",
    chain: "Solana Network",
    logo: "⚡",
    color: "from-cyan-500/20 to-blue-600/20 border-cyan-500/40",
    volume24h: "$890M",
    avgFee: "0.25%",
    status: "Optimal",
    description: "Official Raydium Protocol AMM router on Solana.",
    officialUrl: "https://raydium.io/swap/",
  },
  {
    id: "sushiswap",
    name: "SushiSwap V3",
    chain: "Multi-Chain (15+ Chains)",
    logo: "🍣",
    color: "from-indigo-500/20 to-pink-600/20 border-indigo-500/40",
    volume24h: "$210M",
    avgFee: "0.30%",
    status: "Active",
    description: "Official SushiSwap multi-chain liquidity router.",
    officialUrl: "https://www.sushi.com/swap",
  },
  {
    id: "traderjoe",
    name: "Trader Joe XYZ",
    chain: "Avalanche / Arbitrum",
    logo: "🔺",
    color: "from-red-500/20 to-orange-600/20 border-red-500/40",
    volume24h: "$180M",
    avgFee: "0.15% - 0.20%",
    status: "Active",
    description: "Official Trader Joe Liquidity Book architecture on Avalanche.",
    officialUrl: "https://traderjoexyz.com/avalanche/trade",
  },
  {
    id: "orca",
    name: "Orca DEX",
    chain: "Solana Network",
    logo: "🐋",
    color: "from-teal-500/20 to-emerald-600/20 border-teal-500/40",
    volume24h: "$340M",
    avgFee: "0.07%",
    status: "Optimal",
    description: "Official Orca concentrated liquidity protocol on Solana.",
    officialUrl: "https://www.orca.so/",
  },
];

interface DEXSelectorProps {
  selectedDexId?: string;
  onSelectDex?: (dex: DEXOption) => void;
  className?: string;
}

export function DEXSelector({
  selectedDexId = "uniswap",
  onSelectDex,
  className = "",
}: DEXSelectorProps) {
  const [currentDexId, setCurrentDexId] = useState<string>(selectedDexId);

  const activeDex = SUPPORTED_DEXES.find((d) => d.id === currentDexId) || SUPPORTED_DEXES[0];

  const handleSelect = (dex: DEXOption) => {
    setCurrentDexId(dex.id);
    if (onSelectDex) {
      onSelectDex(dex);
    }
    toast.success(`Active DEX Router switched to ${dex.name}`);
  };

  return (
    <div className={`space-y-3 font-mono text-xs ${className}`}>
      {/* Header with Dropdown Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-surface-2/80 border border-border">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="font-extrabold text-foreground text-xs uppercase tracking-wider">
            Select Active DEX Exchange:
          </span>
        </div>

        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 bg-surface border-border hover:bg-surface-2 font-mono text-xs font-bold gap-2 text-foreground"
            >
              <span className="text-base">{activeDex.logo}</span>
              <span>{activeDex.name}</span>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 py-0 bg-primary/10 border-primary/30 text-primary font-bold"
              >
                {activeDex.chain.split("/")[0]}
              </Badge>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-72 bg-surface/95 border-border backdrop-blur-xl p-1.5 space-y-1 z-50 font-mono text-xs"
          >
            <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase border-b border-border/50 mb-1">
              Supported Liquidity Protocols
            </div>
            {SUPPORTED_DEXES.map((dex) => (
              <DropdownMenuItem
                key={dex.id}
                onClick={() => handleSelect(dex)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  currentDexId === dex.id
                    ? "bg-primary/15 text-primary font-bold"
                    : "hover:bg-surface-2 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{dex.logo}</span>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{dex.name}</span>
                      {currentDexId === dex.id && <Check className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <span className="text-[10px] text-muted-foreground block">{dex.chain}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-foreground block">
                    {dex.volume24h}
                  </span>
                  <span className="text-[9px] text-success font-semibold">{dex.status}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selectable Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {SUPPORTED_DEXES.map((dex) => {
          const isSelected = currentDexId === dex.id;
          return (
            <button
              key={dex.id}
              type="button"
              onClick={() => handleSelect(dex)}
              className={`relative text-left p-3 rounded-xl border transition-all duration-200 group flex flex-col justify-between ${
                isSelected
                  ? `bg-gradient-to-br ${dex.color} border-2 shadow-md ring-1 ring-primary/40`
                  : "bg-surface/80 border-border hover:border-border/80 hover:bg-surface-2/70"
              }`}
            >
              {/* Top Row: Logo, Name & Selected Badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center text-xl shadow-sm border ${
                      isSelected ? "bg-surface border-primary/50" : "bg-surface-2 border-border"
                    }`}
                  >
                    {dex.logo}
                  </div>
                  <div>
                    <div className="font-extrabold text-foreground text-xs flex items-center gap-1">
                      <span>{dex.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {dex.chain}
                    </span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[9px] font-bold px-1.5 py-0.5 ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface-2 text-muted-foreground border-border"
                  }`}
                >
                  {isSelected ? "ACTIVE ROUTER" : dex.status}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
                {dex.description}
              </p>

              {/* Bottom Metrics Bar */}
              <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-1 text-[10px] font-mono">
                <div>
                  <span className="text-muted-foreground block text-[9px]">24H VOLUME</span>
                  <span className="font-bold text-foreground">{dex.volume24h}</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground block text-[9px]">FEE TIER</span>
                  <span className="font-bold text-amber-400">{dex.avgFee}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
