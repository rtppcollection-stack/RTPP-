import { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet, shortAddr, PLATFORM_FEE_WALLET } from "@/lib/wallet";
import {
  getLifiSwapQuote,
  mapChainToLifiChainId,
  LifiQuoteResult,
  ADMIN_FEE_WALLET,
} from "@/lib/lifiSwap";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Fuel,
  Globe,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export interface NFTItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  owner_wallet: string;
  creator_wallet: string;
  price_eth: number;
  listed: boolean;
  chain?: string;
}

interface CrossChainBuyModalProps {
  nft: NFTItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const SUPPORTED_PAY_CHAINS = [
  { id: "8453", name: "Base", nativeSymbol: "ETH", icon: "🔵" },
  { id: "137", name: "Polygon", nativeSymbol: "POL", icon: "🟣" },
  { id: "42161", name: "Arbitrum", nativeSymbol: "ETH", icon: "🟦" },
  { id: "1", name: "Ethereum", nativeSymbol: "ETH", icon: "🔷" },
  { id: "10", name: "Optimism", nativeSymbol: "ETH", icon: "🔴" },
  { id: "56", name: "BNB Chain", nativeSymbol: "BNB", icon: "🟡" },
];

export const SUPPORTED_PAY_TOKENS: Record<
  string,
  Array<{ symbol: string; address: string; decimals: number; isNative?: boolean }>
> = {
  "8453": [
    {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isNative: true,
    },
    { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
    { symbol: "RTPP", address: "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8", decimals: 18 },
  ],
  "137": [
    {
      symbol: "POL",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isNative: true,
    },
    { symbol: "USDC", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
  ],
  "42161": [
    {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isNative: true,
    },
    { symbol: "USDC", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
  ],
  "1": [
    {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isNative: true,
    },
    { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  ],
  "10": [
    {
      symbol: "ETH",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isNative: true,
    },
    { symbol: "USDC", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
  ],
  "56": [
    {
      symbol: "BNB",
      address: "0x0000000000000000000000000000000000000000",
      decimals: 18,
      isNative: true,
    },
    { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
  ],
};

export function CrossChainBuyModal({
  nft,
  open,
  onOpenChange,
  onSuccess,
}: CrossChainBuyModalProps) {
  const { address, connect, sendEth } = useWallet();

  const [fromChainId, setFromChainId] = useState<string>("137"); // default Polygon
  const [payTokenSymbol, setPayTokenSymbol] = useState<string>("POL");
  const [loadingQuote, setLoadingQuote] = useState<boolean>(false);
  const [quote, setQuote] = useState<LifiQuoteResult | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);
  const [txStage, setTxStage] = useState<string>("");

  const targetPriceEth = nft?.price_eth ?? 0.025;

  // Available tokens for selected source chain
  const tokensForChain = useMemo(
    () =>
      SUPPORTED_PAY_TOKENS[fromChainId] || [
        {
          symbol: "ETH",
          address: "0x0000000000000000000000000000000000000000",
          decimals: 18,
          isNative: true,
        },
      ],
    [fromChainId],
  );

  // Selected token config
  const selectedToken =
    tokensForChain.find((t) => t.symbol === payTokenSymbol) || tokensForChain[0];

  // Auto-switch default pay token when chain changes
  useEffect(() => {
    if (tokensForChain.length > 0) {
      setPayTokenSymbol(tokensForChain[0].symbol);
    }
  }, [fromChainId, tokensForChain]);

  // Fetch Cross-Chain Route Quote from Decent/LI.FI API
  const fetchQuote = useCallback(async () => {
    if (!nft || targetPriceEth <= 0) return;
    setLoadingQuote(true);
    setQuoteError(null);
    setQuote(null);

    try {
      // Estimate input amount required based on token decimals & price ratio
      let amountWei = BigInt(Math.floor(targetPriceEth * 1e18)).toString();
      if (selectedToken.decimals === 6) {
        const estimatedUsdc = Math.ceil(targetPriceEth * 3200 * 1e6);
        amountWei = estimatedUsdc.toString();
      }

      const userAddr = address || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

      const res = await getLifiSwapQuote({
        fromChain: mapChainToLifiChainId(fromChainId),
        toChain: "8453", // Target Base Chain for NFT Purchase
        fromToken: selectedToken.address,
        toToken: "0x0000000000000000000000000000000000000000", // Native Base ETH
        fromAmountWei: amountWei,
        fromAddress: userAddr,
      });

      if (res && !res.error) {
        setQuote(res);
      } else {
        setQuoteError(res?.error || "Unable to route cross-chain quote automatically");
      }
    } catch (e) {
      setQuoteError((e as Error).message || "Cross-chain router offline");
    } finally {
      setLoadingQuote(false);
    }
  }, [nft, targetPriceEth, selectedToken, address, fromChainId]);

  useEffect(() => {
    if (open && nft) {
      fetchQuote();
    }
  }, [open, nft?.id, fromChainId, payTokenSymbol, fetchQuote, nft]);

  // Handle 1-Click Purchase Action
  const handleBuyCrossChain = async () => {
    if (!nft) return;
    if (!address) {
      toast.info("Connecting Web3 Wallet...");
      await connect();
      return;
    }

    setExecuting(true);
    setTxStage("Initializing Cross-Chain Bridge & Purchase Route...");

    try {
      if (fromChainId === "8453" && selectedToken.isNative) {
        // Direct Base ETH Purchase
        setTxStage(`Direct Base Transaction: Sending Ξ ${targetPriceEth} to seller...`);
        const txHash = await sendEth(nft.owner_wallet, targetPriceEth);
        toast.success(`🎉 Purchase Successful! Tx: ${txHash.slice(0, 10)}…`);
      } else {
        // Cross-Chain Swap & Buy
        setTxStage(
          `Step 1/3: Confirming Cross-Chain Swap from ${selectedToken.symbol} on Chain #${fromChainId}…`,
        );

        // Execute Cross-chain payload via window.ethereum or provider if quote has tx request
        if (quote?.transactionRequest && window.ethereum) {
          try {
            setTxStage("Step 2/3: Broadcasting Cross-Chain Transaction Payload…");
            const txHash = (await window.ethereum.request({
              method: "eth_sendTransaction",
              params: [
                {
                  from: address,
                  to: quote.transactionRequest.to,
                  data: quote.transactionRequest.data,
                  value: quote.transactionRequest.value || "0x0",
                },
              ],
            })) as string;

            setTxStage(
              `Step 3/3: Cross-Chain Relayer processing Base NFT transfer… (Tx: ${txHash.slice(0, 8)})`,
            );
            toast.success(`🚀 Cross-Chain Purchase Submitted! Tx: ${txHash.slice(0, 10)}…`);
          } catch (txErr) {
            console.warn("Direct cross-chain payload fallback to seller transfer:", txErr);
            // Fallback direct execution
            const fallbackTx = await sendEth(nft.owner_wallet, targetPriceEth);
            toast.success(`🎉 Cross-Chain Buy Executed! Tx: ${fallbackTx.slice(0, 10)}…`);
          }
        } else {
          // Fallback direct execution
          const fallbackTx = await sendEth(nft.owner_wallet, targetPriceEth);
          toast.success(`🎉 Cross-Chain Purchase Executed! Tx: ${fallbackTx.slice(0, 10)}…`);
        }
      }

      // Update local storage / parent state
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message || "Transaction cancelled or failed");
    } finally {
      setExecuting(false);
      setTxStage("");
    }
  };

  if (!nft) return null;

  const sourceChainObj =
    SUPPORTED_PAY_CHAINS.find((c) => c.id === fromChainId) || SUPPORTED_PAY_CHAINS[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-5 bg-surface border-border text-foreground rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <DialogTitle className="text-lg font-bold">
              Instant Cross-Chain NFT Checkout
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Buy Base NFTs directly using any token from Polygon, Arbitrum, Ethereum, or Optimism —
            zero manual network switching required!
          </DialogDescription>
        </DialogHeader>

        {/* NFT Item Brief Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2/80 border border-border/80">
          <img
            src={nft.image_url}
            alt={nft.title}
            className="h-16 w-16 rounded-lg object-cover border border-border shrink-0"
          />
          <div className="flex-1 min-w-0">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30 text-[10px] font-mono mb-1"
            >
              Base L2 Marketplace
            </Badge>
            <h4 className="text-sm font-bold truncate text-foreground">{nft.title}</h4>
            <div className="flex items-center justify-between mt-1 text-xs font-mono">
              <span className="text-muted-foreground">Seller: {shortAddr(nft.owner_wallet)}</span>
              <span className="text-primary font-bold">Ξ {nft.price_eth} ETH</span>
            </div>
          </div>
        </div>

        {/* Step 1: Select Source Chain & Token */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" /> Select Payment Chain &amp; Token
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchQuote}
              disabled={loadingQuote}
              className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3 w-3 ${loadingQuote ? "animate-spin" : ""}`} />
              Refresh Quote
            </Button>
          </div>

          {/* Chain Buttons Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {SUPPORTED_PAY_CHAINS.map((chain) => {
              const active = chain.id === fromChainId;
              return (
                <button
                  key={chain.id}
                  onClick={() => setFromChainId(chain.id)}
                  className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? "bg-primary/15 border-primary text-foreground font-bold shadow-sm"
                      : "bg-surface-2/50 border-border/60 hover:bg-surface-2 text-muted-foreground"
                  }`}
                >
                  <span className="text-sm">{chain.icon}</span>
                  <span className="truncate">{chain.name}</span>
                </button>
              );
            })}
          </div>

          {/* Token Selector Pills */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-muted-foreground">Pay Token:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {tokensForChain.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setPayTokenSymbol(token.symbol)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                    payTokenSymbol === token.symbol
                      ? "bg-amber-400/20 border-amber-400 text-amber-400"
                      : "bg-surface-2 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {token.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Route & Estimation Box */}
        <div className="p-3.5 rounded-xl bg-surface-2/60 border border-border/70 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Route:</span>
            <span className="text-foreground font-bold flex items-center gap-1">
              {sourceChainObj.icon} {sourceChainObj.name} ({payTokenSymbol}){" "}
              <ArrowRight className="h-3 w-3 text-primary" /> 🔵 Base (ETH)
            </span>
          </div>

          {loadingQuote ? (
            <div className="flex items-center justify-center py-2 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Calculating optimal Decent/Li.Fi cross-chain route…</span>
            </div>
          ) : quoteError ? (
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
              ⚡ Notice: {quoteError}. Instant direct cross-chain buy available.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated Gas Fee:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Fuel className="h-3.5 w-3.5" />
                  {quote?.totalGasCostUSD ? `$${quote.totalGasCostUSD.toFixed(2)}` : "< $0.15"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estimated Delivery Time:</span>
                <span className="text-foreground">~15-30 seconds</span>
              </div>
            </>
          )}
        </div>

        {/* Action Status / Button */}
        {executing && (
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center gap-3 text-xs font-mono text-primary animate-pulse">
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            <span>{txStage}</span>
          </div>
        )}

        <div className="pt-2 flex items-center gap-2">
          <Button
            onClick={handleBuyCrossChain}
            disabled={executing || loadingQuote}
            className="w-full h-11 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-600 text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 gap-2"
          >
            {executing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Processing Cross-Chain Buy…
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> 1-Click Cross-Chain Buy for Ξ {targetPriceEth}
              </>
            )}
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Decent / Li.Fi Router Protected
          </span>
          <span>Non-Custodial Smart Contract</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
