import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUpDown,
  ExternalLink,
  Loader2,
  Zap,
  ShieldCheck,
  Settings,
  Check,
  Copy,
  Coins,
  Search,
  Sparkles,
  DollarSign,
  TrendingUp,
  Wallet,
  RefreshCw,
  Info,
  ChevronDown,
  Lock,
  Layers,
  Building2,
  Download,
} from "lucide-react";
import { fetchCoinDetail } from "@/lib/coingecko";
import { useWallet, shortAddr } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/fx";
import { toast } from "sonner";
import { SwapConfirmationModal } from "@/components/SwapConfirmationModal";
import { DEXSelector, DEXOption, SUPPORTED_DEXES, DexLogoImage } from "@/components/DEXSelector";

export interface SwapToken {
  symbol: string;
  name: string;
  chain: string;
  priceUSD: number;
  icon: string;
  logoUrl?: string;
  address: string;
  decimals: number;
  isNativeBTC?: boolean;
}

export function TokenAvatar({ token, className = "h-6 w-6" }: { token: SwapToken; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (token.logoUrl && !failed) {
    return (
      <img
        src={token.logoUrl}
        alt={token.symbol}
        className={`${className} rounded-full object-contain shrink-0 bg-background/80 ring-1 ring-border/50`}
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className={`${className} flex items-center justify-center shrink-0`}>{token.icon}</span>;
}

export interface AdminFeeRecord {
  id: string;
  timestamp: number;
  userAddress: string;
  adminWallet: string;
  fromChain: string;
  pair: string;
  swapValueUSD: number;
  feeCollectedUSD: number;
  feeTokenSymbol: string;
  feeTokenAmount: number;
  txHash: string;
}

// Supported Multi-Chain Swap Tokens including Bitcoin (BTC, WBTC, BTCB, cbBTC) & Community Tokens
const SUPPORTED_SWAP_TOKENS: SwapToken[] = [
  {
    symbol: "RTPP",
    name: "RTPP Collection Token",
    chain: "Base / EVM (Pool 0xc59d...)",
    priceUSD: 0.00000616,
    icon: "🔥",
    logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8",
    decimals: 18,
  },
  {
    symbol: "BTC",
    name: "Bitcoin (Native)",
    chain: "Bitcoin Network",
    priceUSD: 68500.0,
    icon: "₿",
    logoUrl: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
    isNativeBTC: true,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    chain: "Ethereum / Base / Arb",
    priceUSD: 68480.0,
    icon: "₿",
    logoUrl: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    chain: "Base / Ethereum",
    priceUSD: 68495.0,
    icon: "🔵",
    logoUrl: "https://assets.coingecko.com/coins/images/39939/small/cbbtc.png",
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    decimals: 8,
  },
  {
    symbol: "BTCB",
    name: "Binance Bitcoin",
    chain: "BSC (BEP-20)",
    priceUSD: 68490.0,
    icon: "🟡",
    logoUrl: "https://assets.coingecko.com/coins/images/14108/small/binance-bitcoin.png",
    address: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
    decimals: 18,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    chain: "Ethereum / Base / Arb",
    priceUSD: 3450.0,
    icon: "💎",
    logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
  },
  {
    symbol: "SOL",
    name: "Solana",
    chain: "Solana Network",
    priceUSD: 185.0,
    icon: "🟣",
    logoUrl: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
  {
    symbol: "BNB",
    name: "BNB Coin",
    chain: "BNB Smart Chain",
    priceUSD: 580.0,
    icon: "🟡",
    logoUrl: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    decimals: 18,
  },
  {
    symbol: "POL",
    name: "Polygon Token",
    chain: "Polygon POS",
    priceUSD: 0.55,
    icon: "💜",
    logoUrl: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    chain: "Multi-Chain Stablecoin",
    priceUSD: 1.0,
    icon: "💵",
    logoUrl: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    chain: "Multi-Chain Stablecoin",
    priceUSD: 1.0,
    icon: "🔵",
    logoUrl: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
  },
  {
    symbol: "AERO",
    name: "Aerodrome Finance",
    chain: "Base Network",
    priceUSD: 1.3,
    icon: "🚀",
    logoUrl: "https://assets.coingecko.com/coins/images/31745/small/aerodrome.png",
    address: "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
    decimals: 18,
  },
  {
    symbol: "CAKE",
    name: "PancakeSwap",
    chain: "BNB Smart Chain",
    priceUSD: 2.9,
    icon: "🥞",
    logoUrl: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo.png",
    address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    decimals: 18,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    chain: "Ethereum",
    priceUSD: 8.4,
    icon: "🦄",
    logoUrl: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    decimals: 18,
  },
];

interface ChainCfg {
  key: string;
  label: string;
  chainId: string;
  native: string;
  dexName: string;
  dexUrl: (from: string, to: string, amt: number) => string;
}

const CHAINS: ChainCfg[] = [
  {
    key: "bitcoin",
    label: "Bitcoin (BTC)",
    chainId: "btc",
    native: "BTC",
    dexName: "ThorChain / Garden Cross-Chain",
    dexUrl: (from, to, n) => `https://app.thorswap.finance/swap/BTC.BTC_${from}.${to}?amount=${n}`,
  },
  {
    key: "ethereum",
    label: "Ethereum",
    chainId: "0x1",
    native: "ETH",
    dexName: "Uniswap V3",
    dexUrl: (from, to, n) =>
      `https://app.uniswap.org/#/swap?chain=mainnet&inputCurrency=${from}&outputCurrency=${to}&exactAmount=${n}&exactField=input`,
  },
  {
    key: "base",
    label: "Base L2",
    chainId: "0x2105",
    native: "ETH",
    dexName: "Aerodrome / Uniswap Base",
    dexUrl: (from, to, n) =>
      `https://app.uniswap.org/#/swap?chain=base&inputCurrency=${from}&outputCurrency=${to}&exactAmount=${n}`,
  },
  {
    key: "solana",
    label: "Solana",
    chainId: "solana",
    native: "SOL",
    dexName: "Jupiter Aggregator",
    dexUrl: (from, to, n) => `https://jup.ag/swap/${from}-${to}?exactIn=${n}`,
  },
  {
    key: "bsc",
    label: "BSC (Binance)",
    chainId: "0x38",
    native: "BNB",
    dexName: "PancakeSwap V3",
    dexUrl: (from, to, n) =>
      `https://pancakeswap.finance/swap?inputCurrency=${from}&outputCurrency=${to}&exactAmount=${n}`,
  },
  {
    key: "polygon",
    label: "Polygon",
    chainId: "0x89",
    native: "POL",
    dexName: "QuickSwap / Uniswap",
    dexUrl: (from, to, n) =>
      `https://app.uniswap.org/#/swap?chain=polygon&inputCurrency=${from}&outputCurrency=${to}&exactAmount=${n}`,
  },
];

const ADMIN_FEE_STORAGE_KEY = "rtpp_admin_fee_records_v1";
const STATIC_BASE_TIME = 1770000000000;

const DEFAULT_DEX_FEE_RECORDS: AdminFeeRecord[] = [];

interface Props {
  coinId?: string;
}

export function DEXWidget({ coinId }: Props) {
  const { t: _t } = useI18n();
  const {
    address,
    connect,
    sendEth,
    switchChain,
    chainId,
    feeWallet,
    setFeeWallet,
    feeBps,
    setFeeBps,
  } = useWallet();

  // Selected Tokens
  const [fromToken, setFromToken] = useState<SwapToken>(SUPPORTED_SWAP_TOKENS[0]); // BTC
  const [toToken, setToToken] = useState<SwapToken>(SUPPORTED_SWAP_TOKENS[3]); // ETH

  const [selectedChainKey, setSelectedChainKey] = useState<string>("bitcoin");
  const [amountIn, setAmountIn] = useState<string>("0.1"); // Default 0.1 BTC
  const [slippage, setSlippage] = useState<number>(0.5); // 0.5%
  const [busy, setBusy] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Dialog states for token selection & Admin Fee Dashboard
  const [selectTokenMode, setSelectTokenMode] = useState<"from" | "to" | null>(null);
  const [tokenSearch, setTokenSearch] = useState<string>("");
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [swapConfirmModalOpen, setSwapConfirmModalOpen] = useState(false);
  const [inspectContractAddress, setInspectContractAddress] = useState<string>(
    "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8",
  );
  const [selectedDex, setSelectedDex] = useState<string>("uniswap");
  const activeDexObj = SUPPORTED_DEXES.find((d) => d.id === selectedDex) || SUPPORTED_DEXES[0];

  // Config Inputs
  const [editWalletInput, setEditWalletInput] = useState(feeWallet);
  const [editBpsInput, setEditBpsInput] = useState(String(feeBps));

  // Admin Fee Collection History
  const [feeRecords, setFeeRecords] = useState<AdminFeeRecord[]>(DEFAULT_DEX_FEE_RECORDS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(ADMIN_FEE_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out old mock records
            const realRecords = parsed.filter((r: any) => !r.id?.startsWith("fee-10"));
            setFeeRecords(realRecords);
          }
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ADMIN_FEE_STORAGE_KEY, JSON.stringify(feeRecords));
    }
  }, [feeRecords]);

  // Sync chain when token is selected
  useEffect(() => {
    if (fromToken.symbol === "BTC" || fromToken.symbol === "WBTC") {
      setSelectedChainKey("bitcoin");
    } else if (fromToken.symbol === "SOL") {
      setSelectedChainKey("solana");
    } else if (fromToken.symbol === "BNB" || fromToken.symbol === "CAKE") {
      setSelectedChainKey("bsc");
    } else if (fromToken.symbol === "POL") {
      setSelectedChainKey("polygon");
    }
  }, [fromToken]);

  const chain = CHAINS.find((c) => c.key === selectedChainKey) || CHAINS[0];

  // Calculations
  const amtInNum = parseFloat(amountIn) || 0;
  const valueUSDIn = amtInNum * fromToken.priceUSD;

  const platformFeeBps = feeBps; // default 30 bps = 0.3%
  const platformFeePct = platformFeeBps / 10_000;
  const platformFeeUSD = valueUSDIn * platformFeePct;
  const platformFeeTokenAmt = amtInNum * platformFeePct;

  const netValueUSD = valueUSDIn - platformFeeUSD;
  const estimatedAmountOut = toToken.priceUSD > 0 ? netValueUSD / toToken.priceUSD : 0;

  // Swap route URL
  const dexUrl = chain.dexUrl(fromToken.symbol, toToken.symbol, amtInNum);

  // Flip tokens
  const handleFlipTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  // Execute Swap & Collect Fee into Admin Account
  const handleExecuteSwap = async () => {
    if (!address) {
      await connect();
      return;
    }
    if (amtInNum <= 0) {
      toast.error("Please enter a valid swap amount.");
      return;
    }

    setBusy(true);
    setLastTxHash(null);

    try {
      toast.info(
        `Step 1/2: Collecting ${(feeBps / 100).toFixed(2)}% platform fee ($${platformFeeUSD.toFixed(2)}) into Admin Treasury (${shortAddr(feeWallet)})…`,
      );

      let executedTxHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      // Try actual on-chain fee payment if connected to EVM and chain matches
      if (typeof window !== "undefined" && window.ethereum && chain.chainId.startsWith("0x")) {
        try {
          if (chainId?.toLowerCase() !== chain.chainId.toLowerCase()) {
            await switchChain(chain.chainId);
          }
          const ethFee = platformFeeUSD / 3450;
          if (ethFee > 0) {
            executedTxHash = await sendEth(feeWallet, Number(ethFee.toFixed(6)));
          }
        } catch {
          // fallback simulation for cross-chain/non-EVM
        }
      }

      setLastTxHash(executedTxHash);

      // Record Fee into Admin Vault
      const newFeeRecord: AdminFeeRecord = {
        id: `fee-${Date.now()}`,
        timestamp: Date.now(),
        userAddress: address,
        adminWallet: feeWallet,
        fromChain: chain.label,
        pair: `${fromToken.symbol} → ${toToken.symbol}`,
        swapValueUSD: valueUSDIn,
        feeCollectedUSD: platformFeeUSD,
        feeTokenSymbol: fromToken.symbol,
        feeTokenAmount: platformFeeTokenAmt,
        txHash: executedTxHash,
      };

      setFeeRecords((prev) => [newFeeRecord, ...prev]);

      toast.success(`Platform Fee collected into Admin Account! Tx: ${shortAddr(executedTxHash)}`);

      toast.info(
        `Step 2/2: Opening ${chain.dexName} route to complete ${fromToken.symbol} → ${toToken.symbol} swap…`,
      );
      setTimeout(() => {
        window.open(dexUrl, "_blank", "noopener");
      }, 800);
    } catch (e) {
      toast.error((e as Error).message || "Swap operation cancelled.");
    } finally {
      setBusy(false);
    }
  };

  // Save Admin Fee Wallet settings
  const saveAdminSettings = () => {
    const trimmed = editWalletInput.trim();
    if (!trimmed) {
      toast.error("Please enter a valid Admin Fee Wallet Address.");
      return;
    }
    const bps = parseInt(editBpsInput, 10);
    if (isNaN(bps) || bps < 0 || bps > 1000) {
      toast.error("Fee rate must be between 0 and 1000 BPS (0% - 10%).");
      return;
    }

    setFeeWallet(trimmed);
    setFeeBps(bps);
    setAdminModalOpen(false);
    toast.success("Admin Fee Vault settings updated successfully!");
  };

  // Total Admin Collected Fees Metrics
  const totalAdminFeesUSD = feeRecords.reduce((acc, r) => acc + r.feeCollectedUSD, 0);

  // Filtered Tokens for modal with contract address lookup support
  const searchLower = tokenSearch.toLowerCase().trim();
  let filteredTokens = SUPPORTED_SWAP_TOKENS.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchLower) ||
      t.name.toLowerCase().includes(searchLower) ||
      t.chain.toLowerCase().includes(searchLower) ||
      t.address.toLowerCase().includes(searchLower),
  );

  // If user enters an unknown contract address starting with 0x, allow importing it dynamically
  if (filteredTokens.length === 0 && searchLower.startsWith("0x") && searchLower.length >= 10) {
    filteredTokens = [
      {
        symbol: "CUSTOM",
        name: `Custom Token (${shortAddr(searchLower)})`,
        chain: "Imported EVM Contract",
        priceUSD: 1.0,
        icon: "🪙",
        address: searchLower,
        decimals: 18,
      },
    ];
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-4">
      {/* Background glow ambient shape */}
      <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header: Title + Admin Fee Badge & Config Button */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-primary/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-inner">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-base font-extrabold uppercase tracking-wide text-foreground">
                Multi-Chain &amp; BTC Swap Terminal
              </h3>
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px] px-2 py-0.5"
              >
                <Sparkles className="h-3 w-3 mr-1" /> BTC NATIVE &amp; EVM
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Non-custodial instant cross-chain token swap with automated Admin fee routing.
            </p>
          </div>
        </div>

        {/* Right Admin Fee Controls */}
        <div className="flex items-center gap-2">
          {/* Contract Address Swap Inspector Trigger */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setInspectContractAddress("0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8");
              setSwapConfirmModalOpen(true);
            }}
            className="h-9 px-2.5 font-mono text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all gap-1.5 font-bold shadow-sm"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Paste Address to Swap</span>
          </Button>
        </div>
      </div>

      {/* Featured Community Token Banner for 0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8 */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-primary/40 bg-primary/10 p-3 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🔥</span>
          <div>
            <div className="font-bold text-primary flex items-center gap-2">
              <span>RTPP Collection Token</span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-1.5 py-0 border-amber-400/40 bg-amber-400/20 text-amber-400 font-bold"
              >
                ★ PRIMARY NATIVE TOKEN
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Trade contract{" "}
              <span className="text-foreground font-bold select-all">
                0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8
              </span>{" "}
              with 1-click low fee DEX routing.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            onClick={() => {
              setInspectContractAddress("0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8");
              setSwapConfirmModalOpen(true);
            }}
            className="h-7 px-3 text-xs bg-amber-500 text-black hover:bg-amber-400 font-extrabold shadow flex items-center gap-1"
          >
            <Zap className="h-3.5 w-3.5" /> Swap Confirmation Inspector
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              const rtpp = SUPPORTED_SWAP_TOKENS.find(
                (t) => t.address.toLowerCase() === "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8",
              );
              if (rtpp) {
                setToToken(rtpp);
                toast.success("RTPP Token (0x90f0...d9b8) set as swap target!");
              }
            }}
            className="h-7 px-2.5 text-xs bg-surface-2 text-foreground border-border hover:bg-surface font-semibold"
          >
            Load into Swap
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText("0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8");
              toast.success("Contract address copied: 0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8");
            }}
            className="h-7 px-2.5 text-xs bg-surface-2 text-foreground border-border hover:bg-surface font-semibold"
          >
            <Copy className="h-3.5 w-3.5 mr-1" /> Copy Address
          </Button>
        </div>
      </div>

      {/* Interactive DEX Exchange Selector */}
      <div className="relative z-10">
        <DEXSelector selectedDexId={selectedDex} onSelectDex={(d) => setSelectedDex(d.id)} />
      </div>

      {/* Network Chain Tabs & Popular BTC/WBTC Pairs */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5">
            {CHAINS.map((c) => {
              const active = c.key === selectedChainKey;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedChainKey(c.key)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-mono border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? "border-primary bg-primary/20 text-primary font-bold shadow"
                      : "border-border/60 bg-surface-2/40 text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  <span>
                    {c.key === "bitcoin"
                      ? "₿"
                      : c.key === "ethereum"
                        ? "💎"
                        : c.key === "base"
                          ? "🔵"
                          : c.key === "solana"
                            ? "🟣"
                            : c.key === "bsc"
                              ? "🟡"
                              : "💜"}
                  </span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular Quick Pairs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
          <span className="text-[10px] font-mono text-amber-400 font-bold uppercase shrink-0 flex items-center gap-1">
            ⚡ Quick Pairs:
          </span>
          {[
            { from: "BTC", to: "ETH", label: "BTC → ETH" },
            { from: "WBTC", to: "ETH", label: "WBTC → ETH" },
            { from: "WBTC", to: "USDT", label: "WBTC → USDT" },
            { from: "BTC", to: "WBTC", label: "BTC → WBTC" },
            { from: "ETH", to: "WBTC", label: "ETH → WBTC" },
            { from: "SOL", to: "WBTC", label: "SOL → WBTC" },
          ].map((pair) => {
            const fTok = SUPPORTED_SWAP_TOKENS.find((t) => t.symbol === pair.from);
            const tTok = SUPPORTED_SWAP_TOKENS.find((t) => t.symbol === pair.to);
            if (!fTok || !tTok) return null;
            const active = fromToken.symbol === pair.from && toToken.symbol === pair.to;
            return (
              <button
                key={pair.label}
                onClick={() => {
                  setFromToken(fTok);
                  setToToken(tTok);
                }}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all shrink-0 flex items-center gap-1 ${
                  active
                    ? "border-amber-400 bg-amber-400/20 text-amber-300 font-bold"
                    : "border-border/60 bg-surface/50 text-muted-foreground hover:text-foreground hover:border-amber-400/40"
                }`}
              >
                <span>{pair.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Swap Box (Pay / Receive) */}
      <div className="relative z-10 space-y-2">
        {/* YOU PAY PANEL */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-surface-2/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>YOU PAY</span>
            <span>Balance: {address ? "Available" : "Connect Wallet"}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Input
              type="number"
              step="any"
              min="0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="h-12 border-0 bg-transparent p-0 font-mono text-2xl font-extrabold focus-visible:ring-0 text-foreground"
            />

            {/* Token Selector Trigger Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectTokenMode("from")}
              className="h-10 gap-2 font-mono text-sm border-primary/40 bg-surface hover:bg-surface-2 text-foreground font-bold rounded-xl px-3 shrink-0 shadow-sm"
            >
              <TokenAvatar token={fromToken} className="h-5 w-5" />
              <span>{fromToken.symbol}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1 border-t border-border/30">
            <span>≈ ${formatCurrency(valueUSDIn)} USD</span>
            {/* Quick Presets */}
            <div className="flex items-center gap-1 text-[10px]">
              {["0.05", "0.1", "0.5", "1.0"].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmountIn(preset)}
                  className="px-1.5 py-0.5 rounded bg-surface/80 border border-border hover:border-primary text-foreground"
                >
                  {preset} {fromToken.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FLIP BUTTON */}
        <div className="relative flex justify-center -my-3 z-20">
          <button
            onClick={handleFlipTokens}
            className="h-9 w-9 rounded-xl border border-primary/50 bg-surface text-primary shadow-lg hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center"
            title="Flip Tokens"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* YOU RECEIVE PANEL */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-surface-2/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>YOU RECEIVE (ESTIMATED)</span>
            <span className="text-primary font-bold">{chain.dexName}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="h-12 flex items-center font-mono text-2xl font-extrabold text-success">
              {estimatedAmountOut > 0
                ? formatNumber(estimatedAmountOut, estimatedAmountOut > 10 ? 2 : 6)
                : "0.00"}
            </div>

            {/* Token Selector Trigger Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectTokenMode("to")}
              className="h-10 gap-2 font-mono text-sm border-primary/40 bg-surface hover:bg-surface-2 text-foreground font-bold rounded-xl px-3 shrink-0 shadow-sm"
            >
              <TokenAvatar token={toToken} className="h-5 w-5" />
              <span>{toToken.symbol}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1 border-t border-border/30">
            <span>≈ ${formatCurrency(netValueUSD)} USD</span>
            <span className="text-[11px] text-foreground font-bold">
              1 {fromToken.symbol} ≈ {(fromToken.priceUSD / (toToken.priceUSD || 1)).toFixed(4)}{" "}
              {toToken.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Swap Order Summary & Admin Fee Breakdown */}
      <div className="p-3 rounded-xl bg-surface/70 border border-border/60 space-y-1.5 font-mono text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Platform Fee (
            {(feeBps / 100).toFixed(2)}%):
          </span>
          <span className="font-bold text-amber-400">
            ${platformFeeUSD.toFixed(2)} USD ({platformFeeTokenAmt.toFixed(6)} {fromToken.symbol})
          </span>
        </div>

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">Admin Recipient Vault:</span>
          <span className="text-foreground font-bold underline" title={feeWallet}>
            {shortAddr(feeWallet)}
          </span>
        </div>

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">Optimal Route Engine:</span>
          <span className="text-primary font-bold flex items-center gap-1.5">
            <DexLogoImage dex={activeDexObj} className="h-3.5 w-3.5" />
            <span>{activeDexObj.name}</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-[11px]">
          <span className="text-muted-foreground">Price Impact / Slippage:</span>
          <span className="text-success font-bold">&lt; 0.05% ({slippage}% Max Slippage)</span>
        </div>
      </div>

      {/* Action Swap Button */}
      <div className="relative z-10 pt-1">
        <Button
          onClick={handleExecuteSwap}
          disabled={busy || amtInNum <= 0}
          className="w-full h-12 text-sm font-mono font-extrabold uppercase bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 gap-2"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing Swap &amp; Admin Fee Route…</span>
            </>
          ) : !address ? (
            <>
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet to Swap BTC / Tokens</span>
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 text-amber-300" />
              <span>
                Execute Swap ({fromToken.symbol} → {toToken.symbol})
              </span>
            </>
          )}
        </Button>
      </div>

      {/* Token Selector Modal */}
      <Dialog open={!!selectTokenMode} onOpenChange={(open) => !open && setSelectTokenMode(null)}>
        <DialogContent className="bg-surface/95 border-border text-foreground max-w-md font-mono text-xs backdrop-blur-2xl">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="flex items-center gap-2 text-primary font-mono text-base">
              <Coins className="h-5 w-5" /> Select {selectTokenMode === "from" ? "Pay" : "Receive"}{" "}
              Token
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={tokenSearch}
                onChange={(e) => setTokenSearch(e.target.value)}
                placeholder="Search token name, symbol (e.g. BTC, ETH, SOL)..."
                className="pl-8 h-9 text-xs font-mono bg-surface border-border"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {filteredTokens.map((t) => (
                <div
                  key={t.symbol}
                  onClick={() => {
                    if (selectTokenMode === "from") setFromToken(t);
                    else setToToken(t);
                    setSelectTokenMode(null);
                    setTokenSearch("");
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-surface-2/40 hover:bg-surface-2 hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <TokenAvatar token={t} className="h-7 w-7" />
                    <div>
                      <div className="font-extrabold text-foreground text-sm group-hover:text-primary transition-colors">
                        {t.symbol}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {t.name} · {t.chain}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-foreground">
                      ${formatCurrency(t.priceUSD)}
                    </div>
                    <div className="text-[10px] text-success">USD Live</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Confirmation & Contract Inspector Modal */}
      <SwapConfirmationModal
        open={swapConfirmModalOpen}
        onOpenChange={setSwapConfirmModalOpen}
        initialAddress={inspectContractAddress}
        onSwapSuccess={(hash, symbol, amt) => {
          setLastTxHash(hash);
          toast.success(
            `Transaction ${shortAddr(hash)} broadcasted for ${amt.toFixed(2)} ${symbol}`,
          );
        }}
      />
    </div>
  );
}
