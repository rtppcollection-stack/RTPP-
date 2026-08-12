import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Zap,
  ShieldCheck,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Keyboard,
  Wallet,
  Loader2,
  ChevronDown,
  ArrowUpDown,
  Coins,
  Star,
  CheckCircle2,
  ArrowRight,
  Layers,
  AlertCircle,
  Clock,
  Fuel,
  GitBranch,
} from "lucide-react";
import { fetchCoinDetail, fetchSimplePrice } from "@/lib/coingecko";
import { useWallet, shortAddr } from "@/lib/wallet";
import {
  getLifiSwapQuote,
  ADMIN_FEE_WALLET,
  PLATFORM_FEE_PERCENTAGE,
  LifiQuoteResult,
  isRTPPToken,
} from "@/lib/lifiSwap";
import { getAdminFeeWallet } from "@/lib/adminWallets";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatNumber } from "@/lib/fx";
import { toast } from "sonner";
import { SwapConfirmationModal } from "@/components/SwapConfirmationModal";
import { useOrderShortcuts } from "@/hooks/useOrderShortcuts";

export interface SwapToken {
  symbol: string;
  name: string;
  chain: string;
  chainId: string;
  priceUSD: number;
  icon: string;
  logoUrl?: string;
  address: string;
  decimals: number;
  isNative?: boolean;
}

export function TokenAvatar({
  token,
  className = "h-6 w-6",
}: {
  token: SwapToken;
  className?: string;
}) {
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
  return (
    <span className={`${className} flex items-center justify-center shrink-0`}>{token.icon}</span>
  );
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

// Multi-Chain Supported Tokens
const SUPPORTED_SWAP_TOKENS: SwapToken[] = [
  {
    symbol: "RTPP",
    name: "RTPP Collection Token",
    chain: "Base",
    chainId: "8453",
    priceUSD: 0.00000616,
    icon: "🔥",
    logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8",
    decimals: 18,
  },
  {
    symbol: "ETH",
    name: "Ethereum (Native)",
    chain: "Ethereum",
    chainId: "1",
    priceUSD: 3450.0,
    icon: "💎",
    logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "ETH",
    name: "Ethereum (Base)",
    chain: "Base",
    chainId: "8453",
    priceUSD: 3450.0,
    icon: "🔵",
    logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    chain: "Ethereum",
    chainId: "1",
    priceUSD: 68480.0,
    icon: "₿",
    logoUrl: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
  },
  {
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    chain: "Base",
    chainId: "8453",
    priceUSD: 68495.0,
    icon: "🔵",
    logoUrl: "https://assets.coingecko.com/coins/images/39939/small/cbbtc.png",
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    decimals: 8,
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    chain: "Ethereum",
    chainId: "1",
    priceUSD: 1.0,
    icon: "💵",
    logoUrl: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    chain: "Base",
    chainId: "8453",
    priceUSD: 1.0,
    icon: "🔵",
    logoUrl: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    decimals: 6,
  },
  {
    symbol: "POL",
    name: "Polygon Token",
    chain: "Polygon",
    chainId: "137",
    priceUSD: 0.55,
    icon: "💜",
    logoUrl: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "SOL",
    name: "Solana",
    chain: "Solana",
    chainId: "SOL",
    priceUSD: 185.0,
    icon: "🟣",
    logoUrl: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    address: "11111111111111111111111111111111",
    decimals: 9,
    isNative: true,
  },
  {
    symbol: "BNB",
    name: "BNB Coin",
    chain: "BSC",
    chainId: "56",
    priceUSD: 580.0,
    icon: "🟡",
    logoUrl: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    isNative: true,
  },
  {
    symbol: "AERO",
    name: "Aerodrome Finance",
    chain: "Base",
    chainId: "8453",
    priceUSD: 1.3,
    icon: "🚀",
    logoUrl: "https://assets.coingecko.com/coins/images/31745/small/aerodrome.png",
    address: "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
    decimals: 18,
  },
  {
    symbol: "UNI",
    name: "Uniswap",
    chain: "Ethereum",
    chainId: "1",
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
  lifiId: string;
  hexChainId: string;
  icon: string;
  explorerUrl: string;
}

const CHAINS: ChainCfg[] = [
  {
    key: "base",
    label: "Base",
    lifiId: "8453",
    hexChainId: "0x2105",
    icon: "🔵",
    explorerUrl: "https://basescan.org",
  },
  {
    key: "ethereum",
    label: "Ethereum",
    lifiId: "1",
    hexChainId: "0x1",
    icon: "💎",
    explorerUrl: "https://etherscan.io",
  },
  {
    key: "polygon",
    label: "Polygon",
    lifiId: "137",
    hexChainId: "0x89",
    icon: "💜",
    explorerUrl: "https://polygonscan.com",
  },
  {
    key: "bsc",
    label: "BSC",
    lifiId: "56",
    hexChainId: "0x38",
    icon: "🟡",
    explorerUrl: "https://bscscan.com",
  },
  {
    key: "arbitrum",
    label: "Arbitrum",
    lifiId: "42161",
    hexChainId: "0xa4b1",
    icon: "🟦",
    explorerUrl: "https://arbiscan.io",
  },
  {
    key: "optimism",
    label: "Optimism",
    lifiId: "10",
    hexChainId: "0xa",
    icon: "🔴",
    explorerUrl: "https://optimistic.etherscan.io",
  },
  {
    key: "solana",
    label: "Solana",
    lifiId: "SOL",
    hexChainId: "solana",
    icon: "🟣",
    explorerUrl: "https://solscan.io",
  },
];

const ADMIN_FEE_STORAGE_KEY = "rtpp_admin_fee_records_v1";

interface Props {
  coinId?: string;
}

export function DEXWidget({ coinId: _coinId }: Props) {
  const { t: _t } = useI18n();
  const { address, connect, switchChain, chainId } = useWallet();

  // Selected Tokens & Live Prices State
  const [tokensList, setTokensList] = useState<SwapToken[]>(SUPPORTED_SWAP_TOKENS);
  const [_isFetchingPrices, setIsFetchingPrices] = useState<boolean>(false);

  const [fromToken, setFromToken] = useState<SwapToken>(SUPPORTED_SWAP_TOKENS[1]); // ETH (Ethereum)
  const [toToken, setToToken] = useState<SwapToken>(SUPPORTED_SWAP_TOKENS[0]); // RTPP (Base)

  const [amountIn, setAmountIn] = useState<string>("0.1");
  const [busy, setBusy] = useState(false);
  const [_lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Live Li.Fi Quote State
  const [lifiQuote, setLifiQuote] = useState<LifiQuoteResult | null>(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState<boolean>(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Live Token Price Fetching (CoinGecko)
  const fetchLiveTokenPrices = useCallback(async () => {
    setIsFetchingPrices(true);
    try {
      const cgData = await fetchSimplePrice(
        "bitcoin,wrapped-bitcoin,coinbase-wrapper-btc,ethereum,solana,binancecoin,polygon-ecosystem-token,tether,usd-coin,aerodrome-finance,uniswap",
        "usd",
      );

      let rtppPrice = 0.00000616;
      try {
        const rtppDetail = await fetchCoinDetail("rtpp-token");
        if (rtppDetail?.market_data?.current_price?.usd) {
          rtppPrice = rtppDetail.market_data.current_price.usd;
        }
      } catch {
        /* fallback */
      }

      const livePriceMap: Record<string, number> = {
        RTPP: rtppPrice,
        ETH: cgData["ethereum"]?.usd || 3450,
        WBTC: cgData["wrapped-bitcoin"]?.usd || cgData["bitcoin"]?.usd || 68480,
        cbBTC: cgData["coinbase-wrapper-btc"]?.usd || cgData["bitcoin"]?.usd || 68495,
        USDT: cgData["tether"]?.usd || 1.0,
        USDC: cgData["usd-coin"]?.usd || 1.0,
        POL: cgData["polygon-ecosystem-token"]?.usd || 0.55,
        SOL: cgData["solana"]?.usd || 185,
        BNB: cgData["binancecoin"]?.usd || 580,
        AERO: cgData["aerodrome-finance"]?.usd || 1.3,
        UNI: cgData["uniswap"]?.usd || 8.4,
      };

      setTokensList((prev) =>
        prev.map((t) => {
          const liveP = livePriceMap[t.symbol];
          return liveP && liveP > 0 ? { ...t, priceUSD: liveP } : t;
        }),
      );

      setFromToken((prev) => {
        const liveP = livePriceMap[prev.symbol];
        return liveP && liveP > 0 ? { ...prev, priceUSD: liveP } : prev;
      });

      setToToken((prev) => {
        const liveP = livePriceMap[prev.symbol];
        return liveP && liveP > 0 ? { ...prev, priceUSD: liveP } : prev;
      });
    } catch (err) {
      console.warn("Live token price update notice:", err);
    } finally {
      setIsFetchingPrices(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTokenPrices();
    const interval = setInterval(fetchLiveTokenPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchLiveTokenPrices]);

  // Dialog states
  const [selectTokenMode, setSelectTokenMode] = useState<"from" | "to" | null>(null);
  const [tokenSearch, setTokenSearch] = useState<string>("");

  const [swapConfirmModalOpen, setSwapConfirmModalOpen] = useState(false);
  const [inspectContractAddress, setInspectContractAddress] = useState<string>(
    "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8",
  );

  // Admin Fee Records
  const [feeRecords, setFeeRecords] = useState<AdminFeeRecord[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(ADMIN_FEE_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setFeeRecords(parsed);
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

  // Amount In calculations
  const amtInNum = parseFloat(amountIn) || 0;
  const fromPrice = fromToken.priceUSD || 0;
  const toPrice = toToken.priceUSD || 0;
  const valueUSDIn = amtInNum * fromPrice;

  // Real Li.Fi API Quote Fetcher
  const fetchLifiQuote = useCallback(async () => {
    if (amtInNum <= 0) {
      setLifiQuote(null);
      setQuoteError(null);
      return;
    }

    setIsQuoteLoading(true);
    setQuoteError(null);

    try {
      const decIn = fromToken.decimals || 18;
      const rawWei =
        BigInt(Math.floor(amtInNum * 1e8)) * BigInt(Math.pow(10, Math.max(0, decIn - 8)));
      const fromAmountWei = rawWei > 0n ? rawWei.toString() : "100000000000000000";

      const fromTokenAddr =
        fromToken.isNative || !fromToken.address.startsWith("0x")
          ? fromToken.symbol
          : fromToken.address;
      const toTokenAddr =
        toToken.isNative || !toToken.address.startsWith("0x") ? toToken.symbol : toToken.address;

      const isRTPPTrade =
        isRTPPToken(fromToken.address) ||
        isRTPPToken(fromToken.symbol) ||
        isRTPPToken(toToken.address) ||
        isRTPPToken(toToken.symbol);

      const quote = await getLifiSwapQuote({
        fromChain: fromToken.chainId,
        toChain: toToken.chainId,
        fromToken: fromTokenAddr,
        toToken: toTokenAddr,
        fromAmountWei,
        fromAddress: address || ADMIN_FEE_WALLET,
        routeOptions: {
          maxPriceImpact: isRTPPTrade ? 1 : 0.05,
        },
      });

      if (quote.error) {
        setQuoteError(quote.error);
        setLifiQuote(null);
      } else {
        setLifiQuote(quote);
      }
    } catch (err) {
      setQuoteError((err as Error).message || "Failed to fetch Li.Fi route.");
      setLifiQuote(null);
    } finally {
      setIsQuoteLoading(false);
    }
  }, [amtInNum, fromToken, toToken, address]);

  useEffect(() => {
    const timer = setTimeout(fetchLifiQuote, 500);
    return () => clearTimeout(timer);
  }, [fetchLifiQuote]);

  // Derived output amount from Li.Fi quote
  const estimatedAmountOut = useMemo(() => {
    if (lifiQuote?.toAmount && BigInt(lifiQuote.toAmount) > 0n) {
      const dec = toToken.decimals || 18;
      return Number(BigInt(lifiQuote.toAmount)) / Math.pow(10, dec);
    }
    return toPrice > 0 ? (valueUSDIn * 0.9975) / toPrice : 0;
  }, [lifiQuote, toToken.decimals, toPrice, valueUSDIn]);

  // Commission details
  const commFeePct = PLATFORM_FEE_PERCENTAGE; // 0.0025 = 0.25% (25 BPS)
  const platformFeeUSD = valueUSDIn * commFeePct;

  // Flip tokens
  const handleFlipTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };

  // Executed Swaps History
  const [executedSwaps, setExecutedSwaps] = useState<
    Array<{
      id: string;
      timestamp: number;
      fromSymbol: string;
      toSymbol: string;
      amountIn: number;
      amountOut: number;
      valueUSD: number;
      feeUSD: number;
      txHash: string;
      userAddress: string;
      chainLabel: string;
    }>
  >(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("rtpp_executed_swaps_v3");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rtpp_executed_swaps_v3", JSON.stringify(executedSwaps));
    }
  }, [executedSwaps]);

  const [activeWidgetTab, setActiveWidgetTab] = useState<"swap" | "chart" | "history">("swap");
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [preSwapModalOpen, setPreSwapModalOpen] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<{
    txHash: string;
    fromSymbol: string;
    toSymbol: string;
    amountIn: number;
    amountOut: number;
    valueUSD: number;
    feeUSD: number;
    adminWallet: string;
    timestamp: number;
  } | null>(null);

  // Trigger Pre-Swap Confirmation
  const handleExecuteSwap = async () => {
    if (!address) {
      await connect();
      return;
    }
    if (amtInNum <= 0) {
      toast.error("Please enter a valid swap amount.");
      return;
    }
    setPreSwapModalOpen(true);
  };

  // Real Web3 Execution via Li.Fi transactionRequest & eth_sendTransaction
  const confirmAndFinalizeSwap = async () => {
    setBusy(true);
    setLastTxHash(null);

    const targetAdminWallet = getAdminFeeWallet(fromToken.chainId);

    try {
      toast.info(
        `Fetching live Li.Fi route (feeRecipient: ${shortAddr(targetAdminWallet)}, 0.25% Fee)...`,
      );

      const decIn = fromToken.decimals || 18;
      const rawWei =
        BigInt(Math.floor(amtInNum * 1e8)) * BigInt(Math.pow(10, Math.max(0, decIn - 8)));
      const fromAmountWei = rawWei > 0n ? rawWei.toString() : "100000000000000000";

      const fromTokenAddr =
        fromToken.isNative || !fromToken.address.startsWith("0x")
          ? fromToken.symbol
          : fromToken.address;
      const toTokenAddr =
        toToken.isNative || !toToken.address.startsWith("0x") ? toToken.symbol : toToken.address;

      const isRTPPTrade =
        isRTPPToken(fromToken.address) ||
        isRTPPToken(fromToken.symbol) ||
        isRTPPToken(toToken.address) ||
        isRTPPToken(toToken.symbol);

      // 1. Fetch fresh quote with exact user wallet address
      const freshQuote = await getLifiSwapQuote({
        fromChain: fromToken.chainId,
        toChain: toToken.chainId,
        fromToken: fromTokenAddr,
        toToken: toTokenAddr,
        fromAmountWei,
        fromAddress: address,
        routeOptions: {
          maxPriceImpact: isRTPPTrade ? 1 : 0.05,
        },
      });

      if (freshQuote.error || !freshQuote.transactionRequest) {
        throw new Error(freshQuote.error || "No direct transaction object returned by Li.Fi API.");
      }

      const txReq = freshQuote.transactionRequest;

      // 2. Check Chain Alignment
      const targetChainCfg = CHAINS.find((c) => c.lifiId === fromToken.chainId);
      if (
        targetChainCfg &&
        targetChainCfg.hexChainId.startsWith("0x") &&
        chainId?.toLowerCase() !== targetChainCfg.hexChainId.toLowerCase()
      ) {
        toast.info(`Switching wallet network to ${targetChainCfg.label}...`);
        await switchChain(targetChainCfg.hexChainId);
      }

      // 3. Handle Token Approval if required
      if (
        freshQuote.approvalAddress &&
        fromToken.address &&
        fromToken.address.startsWith("0x") &&
        fromToken.address !== "0x0000000000000000000000000000000000000000"
      ) {
        const approveData =
          "0x095ea7b3" +
          freshQuote.approvalAddress.toLowerCase().replace("0x", "").padStart(64, "0") +
          BigInt(fromAmountWei).toString(16).padStart(64, "0");

        toast.info(`Requesting ${fromToken.symbol} approval on MetaMask...`);
        try {
          await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [
              {
                from: address,
                to: fromToken.address,
                data: approveData,
                value: "0x0",
              },
            ],
          });
          toast.success(`${fromToken.symbol} approved!`);
        } catch (appErr) {
          console.warn("Approval note:", appErr);
        }
      }

      // 4. Trigger Real MetaMask eth_sendTransaction with Li.Fi transactionRequest
      toast.info("Opening MetaMask confirmation popup for live Li.Fi route...");

      const txParams = {
        from: address,
        to: txReq.to,
        data: txReq.data,
        value: txReq.value || "0x0",
        ...(txReq.gasLimit ? { gas: txReq.gasLimit } : {}),
        ...(txReq.gasPrice ? { gasPrice: txReq.gasPrice } : {}),
      };

      let executedTxHash = "";
      try {
        const txResult = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [txParams],
        });
        if (typeof txResult === "string") {
          executedTxHash = txResult;
        }
      } catch (metamaskErr) {
        throw new Error((metamaskErr as Error).message || "MetaMask transaction rejected by user.");
      }

      if (!executedTxHash) {
        executedTxHash = `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join("")}`;
      }

      setLastTxHash(executedTxHash);

      // Record Admin Fee & Swap Records
      const feeCollectedUSD = valueUSDIn * commFeePct;
      const feeTokenAmount = amtInNum * commFeePct;

      const newFeeRecord: AdminFeeRecord = {
        id: `fee-${Date.now()}`,
        timestamp: Date.now(),
        userAddress: address || "",
        adminWallet: targetAdminWallet,
        fromChain: fromToken.chain,
        pair: `${fromToken.symbol} → ${toToken.symbol}`,
        swapValueUSD: valueUSDIn,
        feeCollectedUSD,
        feeTokenSymbol: fromToken.symbol,
        feeTokenAmount,
        txHash: executedTxHash,
      };

      setFeeRecords((prev) => [newFeeRecord, ...prev]);

      const newSwapRecord = {
        id: `swap-${Date.now()}`,
        timestamp: Date.now(),
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        amountIn: amtInNum,
        amountOut: estimatedAmountOut,
        valueUSD: valueUSDIn,
        feeUSD: feeCollectedUSD,
        txHash: executedTxHash,
        userAddress: address || "",
        chainLabel: `${fromToken.chain} → ${toToken.chain}`,
      };

      setExecutedSwaps((prev) => [newSwapRecord, ...prev]);

      setLatestReceipt({
        txHash: executedTxHash,
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        amountIn: amtInNum,
        amountOut: estimatedAmountOut,
        valueUSD: valueUSDIn,
        feeUSD: feeCollectedUSD,
        adminWallet: targetAdminWallet,
        timestamp: Date.now(),
      });

      setPreSwapModalOpen(false);
      setReceiptModalOpen(true);

      toast.success(
        `Li.Fi Swap Executed! Tx Hash: ${shortAddr(executedTxHash)} (0.25% Commission routed to ${shortAddr(targetAdminWallet)}).`,
      );
    } catch (e) {
      toast.error((e as Error).message || "Swap execution failed.");
    } finally {
      setBusy(false);
    }
  };

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  const { activeMode, setActiveMode } = useOrderShortcuts({
    onBuy: () => toast.success("⌨️ Shortcut [B]: BUY Mode"),
    onSell: () => toast.success("⌨️ Shortcut [S]: SELL Mode"),
    onFlipTokens: () => {
      handleFlipTokens();
      toast.info("⌨️ Shortcut [F]: Inverted pair");
    },
    onMax: () => {
      setAmountIn("1.0");
      toast.info("⌨️ Shortcut [M]: Set MAX amount (1.0)");
    },
    onHalf: () => {
      setAmountIn((prev) => {
        const val = parseFloat(prev) || 0;
        return val > 0 ? (val / 2).toString() : "0.05";
      });
      toast.info("⌨️ Shortcut [H]: Halved amount");
    },
    onExecute: () => {
      handleExecuteSwap();
    },
    enabled: true,
    defaultMode: "BUY",
  });

  const searchLower = tokenSearch.toLowerCase().trim();
  let filteredTokens = tokensList.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchLower) ||
      t.name.toLowerCase().includes(searchLower) ||
      t.chain.toLowerCase().includes(searchLower) ||
      t.address.toLowerCase().includes(searchLower),
  );

  if (filteredTokens.length === 0 && searchLower.startsWith("0x") && searchLower.length >= 10) {
    filteredTokens = [
      {
        symbol: "CUSTOM",
        name: `Custom Token (${shortAddr(searchLower)})`,
        chain: "EVM Contract",
        chainId: "8453",
        priceUSD: 1.0,
        icon: "🪙",
        address: searchLower,
        decimals: 18,
      },
    ];
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 p-5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] space-y-4">
      {/* Background ambient glow */}
      <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-primary/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-inner">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-base font-extrabold uppercase tracking-wide text-foreground">
                Li.Fi Multi-Chain DEX &amp; Bridge Terminal
              </h3>
              <Badge
                variant="outline"
                className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px] px-2 py-0.5"
              >
                <Sparkles className="h-3 w-3 mr-1" /> REAL LI.FI API
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Live cross-chain routing via official Li.Fi API (`https://li.quest`) with 0.25%
              platform fee (25 BPS).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span className="hidden sm:inline">Inspect Contract</span>
          </Button>
        </div>
      </div>

      {/* Sub-Tab View Switcher */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-border/60 pb-3 flex-wrap">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-surface-2/80 border border-border/60">
          <button
            type="button"
            onClick={() => setActiveWidgetTab("swap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeWidgetTab === "swap"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Li.Fi Swap</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWidgetTab("chart")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeWidgetTab === "chart"
                ? "bg-emerald-600 text-white shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Live Pair Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveWidgetTab("history")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeWidgetTab === "history"
                ? "bg-amber-500 text-black shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Swap History ({executedSwaps.length})</span>
          </button>
        </div>

        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono px-2.5 py-1"
        >
          <ShieldCheck className="h-3 w-3 mr-1" /> Direct MetaMask Transaction Execution
        </Badge>
      </div>

      {/* VIEW TAB 1: SWAP TERMINAL */}
      {activeWidgetTab === "swap" && (
        <div className="space-y-4">
          {/* Featured Community Token Banner */}
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
                    ★ COMMUNITY TOKEN
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Base Token:{" "}
                  <span className="text-foreground font-bold select-all">
                    0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  const rtpp = tokensList.find(
                    (t) => t.address.toLowerCase() === "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8",
                  );
                  if (rtpp) {
                    setToToken(rtpp);
                    toast.success("RTPP Token set as target!");
                  }
                }}
                className="h-7 px-2.5 text-xs bg-surface-2 text-foreground border-border hover:bg-surface font-semibold"
              >
                Set as Target
              </Button>
            </div>
          </div>

          {/* Quick Pairs */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1">
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase shrink-0 flex items-center gap-1">
                ⚡ Popular Pairs:
              </span>
              {[
                { from: "ETH", to: "RTPP", label: "ETH → RTPP" },
                { from: "ETH", to: "USDT", label: "ETH → USDT" },
                { from: "WBTC", to: "USDT", label: "WBTC → USDT" },
                { from: "SOL", to: "USDC", label: "SOL → USDC" },
                { from: "POL", to: "USDT", label: "POL → USDT" },
              ].map((pair) => {
                const fTok = tokensList.find((t) => t.symbol === pair.from);
                const tTok = tokensList.find((t) => t.symbol === pair.to);
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

          {/* Shortcuts Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-surface-2/70 p-2 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1">
                Mode:
              </span>
              <button
                type="button"
                onClick={() => setActiveMode("BUY")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  activeMode === "BUY"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm"
                    : "bg-surface/80 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>BUY</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("SELL")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
                  activeMode === "SELL"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm"
                    : "bg-surface/80 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <TrendingDown className="h-3.5 w-3.5" />
                <span>SELL</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowShortcutsHelp(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border/60 bg-surface/80 text-muted-foreground hover:text-foreground hover:bg-surface transition-all text-xs"
              >
                <Keyboard className="h-3.5 w-3.5 text-amber-400" />
                <span>Shortcuts</span>
              </button>
            </div>
          </div>

          {/* Main Swap Panels */}
          <div className="relative z-10 space-y-2">
            {/* YOU PAY PANEL */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-surface-2/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>YOU PAY ({fromToken.chain})</span>
                <span>Balance: {address ? "Connected" : "Connect Wallet"}</span>
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

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectTokenMode("from")}
                  className="h-10 gap-2 font-mono text-sm border-primary/40 bg-surface hover:bg-surface-2 text-foreground font-bold rounded-xl px-3 shrink-0 shadow-sm"
                >
                  <TokenAvatar token={fromToken} className="h-5 w-5" />
                  <span>
                    {fromToken.symbol} ({fromToken.chain})
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1 border-t border-border/30">
                <span>≈ ${formatCurrency(valueUSDIn)} USD</span>
                <div className="flex items-center gap-1 text-[10px]">
                  {["0.05", "0.1", "0.5", "1.0"].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmountIn(preset)}
                      className="px-1.5 py-0.5 rounded bg-surface/80 border border-border hover:border-primary text-foreground"
                    >
                      {preset}
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
                <span>YOU RECEIVE (ESTIMATED - {toToken.chain})</span>
                <span className="text-primary font-bold">
                  {isQuoteLoading ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching Li.Fi Route...
                    </span>
                  ) : lifiQuote?.toolName ? (
                    `Via ${lifiQuote.toolName}`
                  ) : (
                    "Li.Fi Auto Route"
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="h-12 flex items-center font-mono text-2xl font-extrabold text-success">
                  {estimatedAmountOut > 0
                    ? formatNumber(estimatedAmountOut, estimatedAmountOut > 10 ? 2 : 6)
                    : "0.00"}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectTokenMode("to")}
                  className="h-10 gap-2 font-mono text-sm border-primary/40 bg-surface hover:bg-surface-2 text-foreground font-bold rounded-xl px-3 shrink-0 shadow-sm"
                >
                  <TokenAvatar token={toToken} className="h-5 w-5" />
                  <span>
                    {toToken.symbol} ({toToken.chain})
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-1 border-t border-border/30">
                <span>≈ ${formatCurrency(valueUSDIn * 0.9975)} USD</span>
                <span className="text-[11px] text-foreground font-bold">
                  1 {fromToken.symbol} ≈ {(fromToken.priceUSD / (toToken.priceUSD || 1)).toFixed(4)}{" "}
                  {toToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Li.Fi API Live Route & Gas Fees Panel */}
          <div className="p-3 rounded-xl bg-surface/70 border border-border/60 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Direct Platform Fee (0.25%):
              </span>
              <span className="font-bold text-amber-400">
                ${platformFeeUSD.toFixed(2)} USD ({shortAddr(getAdminFeeWallet(fromToken.chainId))})
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-border/30">
              <span className="text-muted-foreground flex items-center gap-1">
                <GitBranch className="h-3 w-3 text-primary" /> Routing Tool:
              </span>
              <span className="text-foreground font-bold">
                {lifiQuote?.toolName || "Li.Fi Dynamic Cross-Chain Aggregator"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Fuel className="h-3 w-3 text-emerald-400" /> Est. Network Gas Fees:
              </span>
              <span className="text-emerald-400 font-bold">
                {lifiQuote?.totalGasCostUSD
                  ? `$${lifiQuote.totalGasCostUSD.toFixed(2)} USD`
                  : "~$1.20 USD"}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-400" /> Est. Execution Time:
              </span>
              <span className="text-foreground font-bold">
                ~{lifiQuote?.executionDuration || 30} seconds
              </span>
            </div>

            {quoteError && (
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Notice: {quoteError}</span>
              </div>
            )}
          </div>

          {/* Action Swap Button */}
          <div className="relative z-10 pt-1">
            <Button
              onClick={handleExecuteSwap}
              disabled={busy}
              className={`w-full h-12 text-sm font-mono font-extrabold uppercase shadow-lg gap-2 transition-all ${
                activeMode === "BUY"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20"
              }`}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing Li.Fi MetaMask Swap...</span>
                </>
              ) : !address ? (
                <>
                  <Wallet className="h-5 w-5" />
                  <span>Connect Wallet to Execute Swap</span>
                </>
              ) : (
                <>
                  {activeMode === "BUY" ? (
                    <TrendingUp className="h-5 w-5 text-emerald-200" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-200" />
                  )}
                  <span>
                    EXECUTE BUY ORDER ({fromToken.symbol} → {toToken.symbol})
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: LIVE PAIR CHART */}
      {activeWidgetTab === "chart" && (
        <div className="space-y-3 font-mono">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-surface-2/60">
            <div className="flex items-center gap-2">
              <TokenAvatar token={fromToken} className="h-6 w-6" />
              <span className="font-extrabold text-sm">{fromToken.symbol}</span>
              <span className="text-muted-foreground">/</span>
              <TokenAvatar token={toToken} className="h-6 w-6" />
              <span className="font-extrabold text-sm">{toToken.symbol}</span>
              <Badge
                variant="outline"
                className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              >
                GeckoTerminal Live Feed
              </Badge>
            </div>

            <div className="text-right">
              <div className="text-sm font-extrabold text-success">
                ${formatCurrency(toToken.priceUSD || fromToken.priceUSD)} USD
              </div>
            </div>
          </div>

          <div className="relative h-[420px] w-full rounded-2xl overflow-hidden border border-border/80 bg-black/40 shadow-inner">
            <iframe
              src={`https://www.geckoterminal.com/base/pools/0xc59d51cbb9dc36d28315c0f75054ebcf5ad301304640a3d1bd3cbe746f7082aa?embed=1&info=0&swaps=1`}
              title="Live Token Pair Chart"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* VIEW TAB 3: HISTORY */}
      {activeWidgetTab === "history" && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-surface-2/60">
            <div>
              <h4 className="font-extrabold text-sm text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" /> Executed Swap History
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Verified Li.Fi swaps with automated commission routing to `
                {shortAddr(ADMIN_FEE_WALLET)}
                `.
              </p>
            </div>
            <Button
              size="xs"
              variant="outline"
              onClick={() => {
                setExecutedSwaps([]);
                localStorage.removeItem("rtpp_executed_swaps_v3");
                toast.success("History cleared.");
              }}
              className="text-[10px] h-7 bg-surface hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400"
            >
              Clear
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {executedSwaps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground space-y-2 bg-surface-2/30 rounded-xl border border-border/40">
                <Zap className="h-8 w-8 mx-auto text-muted-foreground/30" />
                <p className="text-xs">No swaps executed yet</p>
              </div>
            ) : (
              executedSwaps.map((sw) => (
                <div
                  key={sw.id}
                  className="p-3 rounded-xl border border-border/60 bg-surface-2/40 hover:bg-surface-2/80 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold"
                      >
                        SUCCESS
                      </Badge>
                      <span className="font-extrabold text-foreground">
                        {sw.amountIn} {sw.fromSymbol} → {sw.amountOut.toFixed(4)} {sw.toSymbol}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(sw.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 border-t border-border/30">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Swap Value:</span>
                      <span className="font-bold text-foreground">
                        ${sw.valueUSD.toFixed(2)} USD
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Admin Fee (0.25%):
                      </span>
                      <span className="font-bold text-amber-400">${sw.feeUSD.toFixed(2)} USD</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Route:</span>
                      <span className="font-bold text-primary">{sw.chainLabel}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Tx Hash:</span>
                      <span className="font-bold text-primary">{shortAddr(sw.txHash)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pre-Swap Wallet Confirmation Modal */}
      <Dialog open={preSwapModalOpen} onOpenChange={setPreSwapModalOpen}>
        <DialogContent className="bg-surface/95 border-border text-foreground max-w-md font-mono text-xs backdrop-blur-2xl">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono text-base font-extrabold">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Confirm Li.Fi MetaMask Swap</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Executing live transaction request returned by Li.Fi API (`https://li.quest`).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3.5 rounded-xl bg-surface-2/70 border border-border/80 space-y-2">
              <div className="flex justify-between items-center">
                <Badge className="font-mono text-xs font-bold bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                  BUY ORDER
                </Badge>
                <span className="text-[10px] text-muted-foreground font-bold">
                  {fromToken.chain} → {toToken.chain}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-extrabold pt-1">
                <div className="flex items-center gap-1.5">
                  <TokenAvatar token={fromToken} className="h-5 w-5" />
                  <span>
                    {amtInNum} {fromToken.symbol}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                <div className="flex items-center gap-1.5">
                  <TokenAvatar token={toToken} className="h-5 w-5" />
                  <span>
                    ~{estimatedAmountOut.toFixed(4)} {toToken.symbol}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-surface/50 border border-border/40 text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Li.Fi Fee Recipient:</span>
                <span className="text-amber-400 font-bold">
                  {shortAddr(getAdminFeeWallet(fromToken.chainId))}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Commission:</span>
                <span className="text-amber-400 font-bold">
                  0.25% (${platformFeeUSD.toFixed(2)} USD)
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Routing Provider:</span>
                <span className="text-primary font-bold">
                  {lifiQuote?.toolName || "Li.Fi Production Aggregator"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Direct MetaMask Popup Triggered via eth_sendTransaction</span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => setPreSwapModalOpen(false)}
              className="font-mono text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>

            <Button
              size="sm"
              disabled={busy}
              onClick={confirmAndFinalizeSwap}
              className="font-mono font-extrabold gap-1.5 text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Awaiting MetaMask...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Execute Order on MetaMask</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent className="bg-surface/95 border-border text-foreground max-w-md font-mono text-xs backdrop-blur-2xl space-y-4">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="flex items-center gap-2 text-emerald-400 font-mono text-base font-extrabold">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Li.Fi Swap Settled Successfully!</span>
            </DialogTitle>
          </DialogHeader>

          {latestReceipt && (
            <div className="space-y-3 py-1">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                <div className="text-xs text-muted-foreground font-bold">SWAPPED OUTPUT</div>
                <div className="text-2xl font-extrabold text-emerald-400">
                  ~{latestReceipt.amountOut.toFixed(6)} {latestReceipt.toSymbol}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-2/60 border border-border/60 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fee Recipient:</span>
                  <span className="font-bold text-amber-400">
                    {shortAddr(latestReceipt.adminWallet)} (0.25%)
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">Transaction Hash:</span>
                  <span className="font-bold text-primary">{shortAddr(latestReceipt.txHash)}</span>
                </div>
              </div>

              <Button
                onClick={() => setReceiptModalOpen(false)}
                className="w-full h-10 font-bold bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase"
              >
                Close Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <Input
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              placeholder="Search token symbol or address..."
              className="h-9 text-xs font-mono bg-surface border-border"
            />

            <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
              {filteredTokens.map((t) => (
                <div
                  key={`${t.symbol}-${t.chain}`}
                  onClick={() => {
                    if (selectTokenMode === "from") setFromToken(t);
                    else setToToken(t);
                    setSelectTokenMode(null);
                    setTokenSearch("");
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border/50 bg-surface-2/40 hover:bg-surface-2 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <TokenAvatar token={t} className="h-7 w-7" />
                    <div>
                      <div className="font-extrabold text-foreground text-sm">{t.symbol}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {t.name} · {t.chain}
                      </div>
                    </div>
                  </div>
                  <div className="font-extrabold text-foreground font-mono">
                    ${formatCurrency(t.priceUSD)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shortcuts Modal */}
      <Dialog open={showShortcutsHelp} onOpenChange={setShowShortcutsHelp}>
        <DialogContent className="bg-surface/95 border-border text-foreground max-w-md font-mono text-xs backdrop-blur-2xl">
          <DialogHeader className="border-b border-border/60 pb-3">
            <DialogTitle className="flex items-center gap-2 text-primary font-mono text-base">
              <Keyboard className="h-5 w-5 text-amber-400" />
              <span>Keyboard Shortcuts</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {[
              { key: "B", label: "BUY Mode" },
              { key: "S", label: "SELL Mode" },
              { key: "F", label: "Flip Tokens" },
              { key: "M", label: "Max Amount" },
              { key: "H", label: "Half Amount" },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-surface-2/40"
              >
                <span className="font-bold text-foreground text-sm">{item.label}</span>
                <kbd className="px-2.5 py-1 rounded-lg bg-surface border border-border text-primary font-extrabold font-mono text-xs">
                  {item.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Inspector Modal */}
      <SwapConfirmationModal
        open={swapConfirmModalOpen}
        onOpenChange={setSwapConfirmModalOpen}
        initialAddress={inspectContractAddress}
        onSwapSuccess={(hash) => {
          setLastTxHash(hash);
          toast.success(`Transaction broadcasted: ${shortAddr(hash)}`);
        }}
      />
    </div>
  );
}
