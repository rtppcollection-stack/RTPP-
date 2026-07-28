import { useState } from "react";

interface TokenItem {
  id: string;
  symbol: string;
}

interface NetworkGroup {
  key: string;
  label: string;
  emoji: string;
  tokens: TokenItem[];
}

const NETWORKS: NetworkGroup[] = [
  {
    key: "ethereum",
    label: "Ethereum",
    emoji: "⟠",
    tokens: [
      { id: "rtpp-token", symbol: "🔥 RTPP (0x90f0...)" },
      { id: "ethereum", symbol: "ETH" },
      { id: "tether", symbol: "USDT" },
      { id: "usd-coin", symbol: "USDC" },
      { id: "dai", symbol: "DAI" },
      { id: "chainlink", symbol: "LINK" },
      { id: "uniswap", symbol: "UNI" },
      { id: "shiba-inu", symbol: "SHIB" },
      { id: "pepe", symbol: "PEPE" },
    ],
  },
  {
    key: "base",
    label: "Base",
    emoji: "🔵",
    tokens: [
      { id: "ethereum", symbol: "ETH" },
      { id: "usd-coin", symbol: "USDC" },
      { id: "coinbase-wrapped-btc", symbol: "cbBTC" },
      { id: "aerodrome-finance", symbol: "AERO" },
      { id: "brett-based", symbol: "BRETT" },
      { id: "degen-base", symbol: "DEGEN" },
    ],
  },
  {
    key: "bsc",
    label: "BNB Chain",
    emoji: "🟡",
    tokens: [
      { id: "binancecoin", symbol: "BNB" },
      { id: "binance-usd", symbol: "BUSD" },
      { id: "pancakeswap-token", symbol: "CAKE" },
      { id: "tether", symbol: "USDT" },
      { id: "dogecoin", symbol: "DOGE" },
      { id: "floki", symbol: "FLOKI" },
    ],
  },
  {
    key: "polygon",
    label: "Polygon",
    emoji: "🟣",
    tokens: [
      { id: "matic-network", symbol: "POL" },
      { id: "usd-coin", symbol: "USDC" },
      { id: "tether", symbol: "USDT" },
      { id: "aave", symbol: "AAVE" },
      { id: "quickswap", symbol: "QUICK" },
    ],
  },
  {
    key: "arbitrum",
    label: "Arbitrum",
    emoji: "🔷",
    tokens: [
      { id: "arbitrum", symbol: "ARB" },
      { id: "ethereum", symbol: "ETH" },
      { id: "gmx", symbol: "GMX" },
      { id: "usd-coin", symbol: "USDC" },
      { id: "magic", symbol: "MAGIC" },
    ],
  },
  {
    key: "solana",
    label: "Solana",
    emoji: "🟢",
    tokens: [
      { id: "solana", symbol: "SOL" },
      { id: "bonk", symbol: "BONK" },
      { id: "dogwifcoin", symbol: "WIF" },
      { id: "jupiter-exchange-solana", symbol: "JUP" },
      { id: "raydium", symbol: "RAY" },
      { id: "pyth-network", symbol: "PYTH" },
    ],
  },
];

interface Props {
  onSelect: (id: string) => void;
  activeId?: string;
}

export function PopularTokens({ onSelect, activeId }: Props) {
  const [active, setActive] = useState<string>("ethereum");
  const group = NETWORKS.find((n) => n.key === active) ?? NETWORKS[0];

  return (
    <div className="mx-auto max-w-3xl mt-3 rounded-xl border border-border/60 bg-surface/50 p-2.5 space-y-2.5">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono px-1 shrink-0">
          Popular
        </span>
        {NETWORKS.map((n) => (
          <button
            key={n.key}
            onClick={() => setActive(n.key)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              active === n.key
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-surface-2/50 text-muted-foreground border-border/50 hover:text-foreground hover:border-border"
            }`}
          >
            <span className="mr-1">{n.emoji}</span>
            {n.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {group.tokens.map((tk) => {
          const isActive = activeId === tk.id;
          return (
            <button
              key={`${group.key}-${tk.id}`}
              onClick={() => onSelect(tk.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border transition-all ${
                isActive
                  ? "bg-primary/15 text-primary border-primary/50"
                  : "bg-background/40 text-foreground/80 border-border/50 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {tk.symbol}
            </button>
          );
        })}
      </div>
    </div>
  );
}
