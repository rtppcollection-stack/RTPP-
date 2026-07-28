import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowDownUp,
  Search,
  ExternalLink,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Sparkles,
  Download,
  Plus,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Filter,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/fx";
import { toast } from "sonner";

export interface SwapTransaction {
  id: string;
  txHash: string;
  timestamp: number;
  fromChain: string;
  fromToken: string;
  fromAmount: number;
  toToken: string;
  toAmount: number;
  valueUSD: number;
  feeEarnedUSD: number;
  feeBps: number;
  status: "completed" | "pending" | "failed";
  explorerUrl: string;
}

const STATIC_BASE_TIME = 1770000000000;

const INITIAL_TRANSACTIONS: SwapTransaction[] = [
  {
    id: "tx-101",
    txHash: "0x8f2a9b4c1d3e5f67890a1b2c3d4e5f6a7b8c9d01",
    timestamp: STATIC_BASE_TIME - 1000 * 60 * 12, // 12 mins ago
    fromChain: "Base",
    fromToken: "ETH",
    fromAmount: 0.85,
    toToken: "USDC",
    toAmount: 2932.5,
    valueUSD: 2932.5,
    feeEarnedUSD: 8.79, // 30 bps
    feeBps: 30,
    status: "completed",
    explorerUrl: "https://basescan.org/tx/0x8f2a9b4c1d3e5f67890a1b2c3d4e5f6a7b8c9d01",
  },
  {
    id: "tx-102",
    txHash: "0x3e5f6a7b8c9d01234567890a1b2c3d4e5f67890b",
    timestamp: STATIC_BASE_TIME - 1000 * 60 * 45, // 45 mins ago
    fromChain: "Ethereum",
    fromToken: "USDT",
    fromAmount: 1500,
    toToken: "ETH",
    toAmount: 0.434,
    valueUSD: 1500,
    feeEarnedUSD: 4.5,
    feeBps: 30,
    status: "completed",
    explorerUrl: "https://etherscan.io/tx/0x3e5f6a7b8c9d01234567890a1b2c3d4e5f67890b",
  },
  {
    id: "tx-103",
    txHash: "5K8mP2qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN0p",
    timestamp: STATIC_BASE_TIME - 1000 * 60 * 120, // 2 hours ago
    fromChain: "Solana",
    fromToken: "SOL",
    fromAmount: 25.0,
    toToken: "USDC",
    toAmount: 4625.0,
    valueUSD: 4625.0,
    feeEarnedUSD: 13.87,
    feeBps: 30,
    status: "completed",
    explorerUrl: "https://solscan.io/tx/5K8mP2qR9sT1uV3wX5yZ7aB9cD1eF3gH5iJ7kL9mN0p",
  },
  {
    id: "tx-104",
    txHash: "0x1b2c3d4e5f6a7b8c9d01234567890a1b2c3d4e5f",
    timestamp: STATIC_BASE_TIME - 1000 * 60 * 240, // 4 hours ago
    fromChain: "BSC",
    fromToken: "BNB",
    fromAmount: 4.2,
    toToken: "CAKE",
    toAmount: 842.1,
    valueUSD: 2436.0,
    feeEarnedUSD: 7.3,
    feeBps: 30,
    status: "completed",
    explorerUrl: "https://bscscan.com/tx/0x1b2c3d4e5f6a7b8c9d01234567890a1b2c3d4e5f",
  },
  {
    id: "tx-105",
    txHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
    timestamp: STATIC_BASE_TIME - 1000 * 60 * 5, // 5 mins ago
    fromChain: "Polygon",
    fromToken: "POL",
    fromAmount: 1200,
    toToken: "AAVE",
    toAmount: 6.8,
    valueUSD: 660.0,
    feeEarnedUSD: 1.98,
    feeBps: 30,
    status: "pending",
    explorerUrl: "https://polygonscan.com/tx/0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
  },
  {
    id: "tx-106",
    txHash: "0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
    timestamp: STATIC_BASE_TIME - 1000 * 60 * 360, // 6 hours ago
    fromChain: "Arbitrum",
    fromToken: "ETH",
    fromAmount: 2.1,
    toToken: "ARB",
    toAmount: 6240,
    valueUSD: 7245.0,
    feeEarnedUSD: 21.73,
    feeBps: 30,
    status: "completed",
    explorerUrl: "https://arbiscan.io/tx/0x9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
  },
  {
    id: "tx-107",
    txHash: "0x4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
    timestamp: STATIC_BASE_TIME - 1000 * 60 * 720, // 12 hours ago
    fromChain: "Base",
    fromToken: "USDC",
    fromAmount: 500,
    toToken: "AERO",
    toAmount: 384.6,
    valueUSD: 500.0,
    feeEarnedUSD: 0,
    feeBps: 0,
    status: "failed",
    explorerUrl: "https://basescan.org/tx/0x4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
  },
];

const STORAGE_KEY = "dex_swap_transaction_history_v1";

export function TransactionHistory() {
  const [mounted, setMounted] = useState(false);
  const [txs, setTxs] = useState<SwapTransaction[]>(INITIAL_TRANSACTIONS);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          setTxs(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [chainFilter, setChainFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selectedTx, setSelectedTx] = useState<SwapTransaction | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    }
  }, [txs]);

  // Simulate adding a new swap
  const handleSimulateSwap = () => {
    const pairs = [
      {
        fromChain: "Base",
        fromToken: "ETH",
        toToken: "USDC",
        fromAmt: 0.5,
        toAmt: 1725,
        val: 1725,
      },
      {
        fromChain: "Solana",
        fromToken: "SOL",
        toToken: "USDT",
        fromAmt: 10,
        toAmt: 1850,
        val: 1850,
      },
      {
        fromChain: "Ethereum",
        fromToken: "WBTC",
        toToken: "ETH",
        fromAmt: 0.1,
        toAmt: 1.9,
        val: 6500,
      },
      {
        fromChain: "Arbitrum",
        fromToken: "ETH",
        toToken: "GMX",
        fromAmt: 0.3,
        toAmt: 35.2,
        val: 1035,
      },
    ];
    const item = pairs[Math.floor(Math.random() * pairs.length)];
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");

    const newTx: SwapTransaction = {
      id: `tx-${Date.now()}`,
      txHash: `0x${randomHex}`,
      timestamp: Date.now(),
      fromChain: item.fromChain,
      fromToken: item.fromToken,
      fromAmount: item.fromAmt,
      toToken: item.toToken,
      toAmount: item.toAmt,
      valueUSD: item.val,
      feeEarnedUSD: Number((item.val * 0.003).toFixed(2)),
      feeBps: 30,
      status: "completed",
      explorerUrl: `https://etherscan.io/tx/0x${randomHex}`,
    };

    setTxs((prev) => [newTx, ...prev]);
    toast.success(`New swap recorded: ${item.fromToken} → ${item.toToken}`);
  };

  const handleResetHistory = () => {
    setTxs(INITIAL_TRANSACTIONS);
    toast.info("Transaction history reset to default seed state.");
  };

  const handleExportCSV = () => {
    const headers =
      "ID,TxHash,Timestamp,Chain,FromToken,FromAmount,ToToken,ToAmount,ValueUSD,FeeEarnedUSD,Status\n";
    const rows = txs
      .map(
        (t) =>
          `"${t.id}","${t.txHash}","${new Date(t.timestamp).toISOString()}","${t.fromChain}","${t.fromToken}",${t.fromAmount},"${t.toToken}",${t.toAmount},${t.valueUSD},${t.feeEarnedUSD},"${t.status}"`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `swap_history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Transaction log exported as CSV!");
  };

  // Filter logic
  const filteredTxs = txs.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (chainFilter !== "all" && t.fromChain.toLowerCase() !== chainFilter.toLowerCase())
      return false;
    if (search) {
      const q = search.toLowerCase();
      const matchPair = `${t.fromToken}/${t.toToken}`.toLowerCase().includes(q);
      const matchHash = t.txHash.toLowerCase().includes(q);
      const matchChain = t.fromChain.toLowerCase().includes(q);
      if (!matchPair && !matchHash && !matchChain) return false;
    }
    return true;
  });

  // Analytics Metrics
  const totalCompleted = txs.filter((t) => t.status === "completed");
  const totalVolumeUSD = totalCompleted.reduce((acc, t) => acc + t.valueUSD, 0);
  const totalFeesEarnedUSD = totalCompleted.reduce((acc, t) => acc + t.feeEarnedUSD, 0);
  const successRate = txs.length > 0 ? (totalCompleted.length / txs.length) * 100 : 100;

  return (
    <div className="space-y-4">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="panel p-3.5 bg-surface/80 border-border/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Total Swaps Executed
            </div>
            <div className="text-lg font-extrabold font-mono text-foreground mt-0.5">
              {txs.length}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ArrowDownUp className="h-5 w-5" />
          </div>
        </div>

        <div className="panel p-3.5 bg-surface/80 border-border/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Total Swapped Volume
            </div>
            <div className="text-lg font-extrabold font-mono text-foreground mt-0.5">
              ${formatCurrency(totalVolumeUSD)}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="panel p-3.5 bg-surface/80 border-border/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Swap Fees Collected
            </div>
            <div className="text-lg font-extrabold font-mono text-success mt-0.5">
              ${formatCurrency(totalFeesEarnedUSD)}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-success/10 text-success flex items-center justify-center font-bold">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="panel p-3.5 bg-surface/80 border-border/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              On-Chain Success Rate
            </div>
            <div className="text-lg font-extrabold font-mono text-primary mt-0.5">
              {successRate.toFixed(1)}%
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Control Filter Toolbar */}
      <div className="panel p-3.5 space-y-3 bg-surface/90">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pair, chain, or tx hash..."
              className="pl-8 h-9 text-xs font-mono bg-surface border-border"
            />
          </div>

          {/* Chain & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={chainFilter} onValueChange={setChainFilter}>
              <SelectTrigger className="h-9 w-32 font-mono text-xs bg-surface border-border">
                <SelectValue placeholder="All Chains" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border font-mono text-xs">
                <SelectItem value="all">All Chains</SelectItem>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="bsc">BSC</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-32 font-mono text-xs bg-surface border-border">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border font-mono text-xs">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Action Buttons */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleSimulateSwap}
              className="h-9 gap-1 font-mono text-xs border-primary/40 text-primary hover:bg-primary/10"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">+ Test Swap</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="h-9 gap-1 font-mono text-xs border-border hover:bg-surface-2"
              title="Export CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetHistory}
              className="h-9 px-2 font-mono text-xs text-muted-foreground hover:text-foreground"
              title="Reset History"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sleek Data Table using shadcn components */}
      <div className="panel overflow-hidden border-border/80 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-2/60 font-mono text-[10px] uppercase border-b border-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 px-3 text-muted-foreground">Time / Chain</TableHead>
                <TableHead className="py-3 px-3 text-muted-foreground">Swap Pair</TableHead>
                <TableHead className="py-3 px-3 text-right text-muted-foreground">
                  Amount In
                </TableHead>
                <TableHead className="py-3 px-3 text-right text-muted-foreground">
                  Amount Out
                </TableHead>
                <TableHead className="py-3 px-3 text-right text-muted-foreground">
                  Value (USD)
                </TableHead>
                <TableHead className="py-3 px-3 text-right text-muted-foreground">
                  Fee Earned
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="py-3 px-3 text-center text-muted-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-xs divide-y divide-border/40">
              {filteredTxs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground font-mono"
                  >
                    No swap transactions matching your search filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTxs.map((tx) => {
                  const dateStr = mounted
                    ? new Date(tx.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Recently";

                  return (
                    <TableRow
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-surface-2/40 transition-colors cursor-pointer group"
                    >
                      {/* Time & Chain */}
                      <TableCell className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{dateStr}</span>
                          <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {tx.fromChain}
                          </span>
                        </div>
                      </TableCell>

                      {/* Swap Pair */}
                      <TableCell className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-bold text-foreground group-hover:text-primary transition-colors">
                          <span>{tx.fromToken}</span>
                          <span className="text-muted-foreground text-[10px]">→</span>
                          <span>{tx.toToken}</span>
                        </div>
                      </TableCell>

                      {/* Amount In */}
                      <TableCell className="py-3 px-3 text-right font-bold text-foreground">
                        {formatNumber(tx.fromAmount, 4)} {tx.fromToken}
                      </TableCell>

                      {/* Amount Out */}
                      <TableCell className="py-3 px-3 text-right font-bold text-success">
                        +{formatNumber(tx.toAmount, 2)} {tx.toToken}
                      </TableCell>

                      {/* Value USD */}
                      <TableCell className="py-3 px-3 text-right font-bold text-foreground">
                        ${formatCurrency(tx.valueUSD)}
                      </TableCell>

                      {/* Fee Earned */}
                      <TableCell className="py-3 px-3 text-right text-success font-extrabold">
                        {tx.feeEarnedUSD > 0 ? `+$${formatCurrency(tx.feeEarnedUSD)}` : "$0.00"}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="py-3 px-3 text-center">
                        {tx.status === "completed" && (
                          <Badge
                            variant="outline"
                            className="bg-success/15 text-success border-success/30 font-mono text-[10px] px-2 py-0.5"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        )}
                        {tx.status === "pending" && (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px] px-2 py-0.5"
                          >
                            <Clock className="h-3 w-3 mr-1 animate-spin" /> Pending
                          </Badge>
                        )}
                        {tx.status === "failed" && (
                          <Badge
                            variant="outline"
                            className="bg-danger/15 text-danger border-danger/30 font-mono text-[10px] px-2 py-0.5"
                          >
                            <XCircle className="h-3 w-3 mr-1" /> Failed
                          </Badge>
                        )}
                      </TableCell>

                      {/* Action */}
                      <TableCell
                        className="py-3 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={tx.explorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                          title="View on Explorer"
                        >
                          Explorer <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        {selectedTx && (
          <DialogContent className="bg-surface/95 border-border text-foreground max-w-md font-mono text-xs backdrop-blur-xl">
            <DialogHeader className="border-b border-border/60 pb-3">
              <DialogTitle className="flex items-center gap-2 text-primary font-mono text-base">
                <ArrowDownUp className="h-5 w-5" /> Swap Transaction Receipt
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-2/60 border border-border">
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold uppercase text-foreground">{selectedTx.status}</span>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-surface-2/40 border border-border/60">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain:</span>
                  <span className="font-bold text-foreground">{selectedTx.fromChain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Swapped Pair:</span>
                  <span className="font-bold text-primary">
                    {selectedTx.fromAmount} {selectedTx.fromToken} → {selectedTx.toAmount}{" "}
                    {selectedTx.toToken}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Notional Value:</span>
                  <span className="font-bold text-foreground">
                    ${formatCurrency(selectedTx.valueUSD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee Earned (0.3%):</span>
                  <span className="font-bold text-success">
                    ${formatCurrency(selectedTx.feeEarnedUSD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="text-foreground">
                    {new Date(selectedTx.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Hash Copy Box */}
              <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
                <span className="text-[10px] text-muted-foreground block">Transaction Hash</span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] truncate text-foreground font-bold">
                    {selectedTx.txHash}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTx.txHash);
                      toast.success("Transaction hash copied!");
                    }}
                    className="p-1 text-primary hover:bg-primary/10 rounded"
                    title="Copy Hash"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <a
                  href={selectedTx.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full gap-1.5 font-mono text-xs bg-primary text-primary-foreground">
                    View on Blockchain Explorer <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </a>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
