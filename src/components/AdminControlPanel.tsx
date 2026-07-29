import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  Unlock,
  DollarSign,
  TrendingUp,
  Building2,
  Settings,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
  Percent,
  Sliders,
  Database,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useWallet, shortAddr } from "@/lib/wallet";
import { formatCurrency, formatNumber } from "@/lib/fx";
import { toast } from "sonner";

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

const ADMIN_FEE_STORAGE_KEY = "rtpp_admin_fee_records_v1";
const ADMIN_ACCESS_KEY_STORAGE = "rtpp_admin_passcode_custom_v2";
const STATIC_BASE_TIME = 1770000000000;

const DEFAULT_FEE_RECORDS: AdminFeeRecord[] = [];

export function AdminControlPanel() {
  const { address, feeWallet, setFeeWallet, feeBps, setFeeBps } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Authentication State
  const [passcode, setPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [savedPasscode, setSavedPasscode] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  // Settings inputs
  const [editWallet, setEditWallet] = useState(feeWallet);
  const [editBps, setEditBps] = useState(String(feeBps));

  // Fee Records from LocalStorage
  const [feeRecords, setFeeRecords] = useState<AdminFeeRecord[]>(DEFAULT_FEE_RECORDS);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedPass = localStorage.getItem(ADMIN_ACCESS_KEY_STORAGE);
      if (savedPass) {
        setSavedPasscode(savedPass);
      }
      const saved = localStorage.getItem(ADMIN_FEE_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const realRecords = parsed.filter((r: AdminFeeRecord) => !r.id?.startsWith("fee-10"));
            setFeeRecords(realRecords);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Re-sync wallet inputs if changed externally
  useEffect(() => {
    setEditWallet(feeWallet);
    setEditBps(String(feeBps));
  }, [feeWallet, feeBps]);

  // Check if wallet address matches admin address
  const isAdminWalletConnected = Boolean(
    address && feeWallet && address.toLowerCase() === feeWallet.toLowerCase(),
  );

  // Auto-unlock when connected wallet matches designated Admin Wallet
  useEffect(() => {
    if (isAdminWalletConnected && !isUnlocked) {
      setIsUnlocked(true);
      toast.success(`Admin Wallet Verified (${shortAddr(address)})! Unlocked Admin Panel.`);
    }
  }, [isAdminWalletConnected, address, isUnlocked]);

  // Set initial passcode
  const handleSetPasscode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newPasscode || newPasscode.trim().length < 4) {
      toast.error("Passcode must be at least 4 characters long.");
      return;
    }
    if (newPasscode !== confirmPasscode) {
      toast.error("Passcodes do not match.");
      return;
    }
    localStorage.setItem(ADMIN_ACCESS_KEY_STORAGE, newPasscode.trim());
    setSavedPasscode(newPasscode.trim());
    setIsUnlocked(true);
    toast.success("New Admin Security Passcode saved! Admin Panel Unlocked.");
  };

  // Unlock check
  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAdminWalletConnected) {
      setIsUnlocked(true);
      toast.success("Admin Treasury Wallet Verified! Unlocked Admin Control Panel.");
      return;
    }
    if (savedPasscode && passcode === savedPasscode) {
      setIsUnlocked(true);
      toast.success("Gated Admin Control Panel Unlocked!");
    } else {
      toast.error("Invalid Admin Passcode. Access Denied.");
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasscode("");
    toast.info("Admin Control Panel Session Locked.");
  };

  const handleSaveSettings = () => {
    const trimmed = editWallet.trim();
    if (!trimmed) {
      toast.error("Admin Wallet Address cannot be empty.");
      return;
    }
    const bpsVal = parseInt(editBps, 10);
    if (isNaN(bpsVal) || bpsVal < 0 || bpsVal > 1000) {
      toast.error("Fee BPS must be between 0 and 1000 (0% - 10%).");
      return;
    }

    setFeeWallet(trimmed);
    setFeeBps(bpsVal);
    toast.success("Platform Fee Treasury Settings Updated!");
  };

  const handleExportCSV = () => {
    const headers =
      "ID,Timestamp,UserAddress,AdminWallet,Chain,Pair,SwapValueUSD,FeeCollectedUSD,FeeTokenSymbol,FeeTokenAmount,TxHash\n";
    const rows = feeRecords
      .map(
        (r) =>
          `"${r.id}","${new Date(r.timestamp).toISOString()}","${r.userAddress}","${r.adminWallet}","${r.fromChain}","${r.pair}",${r.swapValueUSD},${r.feeCollectedUSD},"${r.feeTokenSymbol}",${r.feeTokenAmount},"${r.txHash}"`,
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin_platform_fees_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Admin Platform Fee Log exported as CSV!");
  };

  // Calculations
  const totalFeeCollectedUSD = feeRecords.reduce((acc, r) => acc + r.feeCollectedUSD, 0);
  const totalVolumeProcessedUSD = feeRecords.reduce((acc, r) => acc + r.swapValueUSD, 0);

  // If Locked: Display Restricted Security Screen
  if (!isUnlocked) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-destructive/40 bg-gradient-to-br from-surface/95 via-surface-2/80 to-surface/95 p-6 backdrop-blur-2xl shadow-2xl font-mono text-foreground max-w-xl mx-auto space-y-5">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-destructive/15 blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-destructive/15 border border-destructive/40 text-destructive flex items-center justify-center mx-auto shadow-inner">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-extrabold uppercase tracking-wide text-foreground">
            Private Admin Control Gate
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Protected private route. Only the authorized Platform Treasury Admin Wallet Address is
            granted access.
          </p>
        </div>

        {/* Primary Wallet Verification Status Card */}
        <div className="p-4 rounded-xl bg-surface/90 border border-border/80 space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-border/60 pb-2">
            <span className="text-muted-foreground">Designated Admin Wallet:</span>
            <span className="font-bold text-amber-400 font-mono text-[11px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {shortAddr(feeWallet)}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Connected Wallet Status:</span>
              {isAdminWalletConnected ? (
                <span className="text-success font-bold flex items-center gap-1 text-[11px] bg-success/15 px-2 py-0.5 rounded border border-success/30">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Admin Wallet (
                  {shortAddr(address)})
                </span>
              ) : address ? (
                <span className="text-destructive font-bold text-[11px] bg-destructive/10 px-2 py-0.5 rounded border border-destructive/30">
                  ⛔ Connected ({shortAddr(address)}) — Not Admin Wallet
                </span>
              ) : (
                <span className="text-muted-foreground font-bold text-[11px] bg-surface-2 px-2 py-0.5 rounded border border-border">
                  ⚪ No Wallet Connected
                </span>
              )}
            </div>

            {isAdminWalletConnected ? (
              <Button
                onClick={() => setIsUnlocked(true)}
                className="w-full bg-success text-success-foreground hover:bg-success/90 font-bold text-xs gap-2 h-10 uppercase shadow-md mt-2"
              >
                <Unlock className="h-4 w-4" /> Enter Admin Panel (Wallet Verified)
              </Button>
            ) : (
              <div className="pt-1">
                <p className="text-[11px] text-muted-foreground mb-2 text-center">
                  Connect the Web3 wallet holding the admin address (
                  <strong className="text-foreground">{shortAddr(feeWallet)}</strong>) to
                  automatically gain access:
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Passcode Authentication */}
        {!savedPasscode ? (
          <form
            onSubmit={handleSetPasscode}
            className="p-4 rounded-xl bg-surface/80 border border-primary/40 space-y-3"
          >
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-xs text-primary font-semibold">
              🔒 <strong>First-Time Admin Setup:</strong> Please set a secure Admin Access Passcode
              for your platform control panel.
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-foreground">
                  New Admin Security Passcode:
                </label>
                <Input
                  type="password"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  placeholder="Enter new admin passcode..."
                  className="font-mono text-xs bg-surface-2 border-border mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">Confirm Admin Passcode:</label>
                <Input
                  type="password"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Confirm admin passcode..."
                  className="font-mono text-xs bg-surface-2 border-border mt-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold text-xs gap-2 h-10 uppercase"
            >
              <Key className="h-4 w-4" /> Save Passcode &amp; Unlock
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleUnlock}
            className="p-4 rounded-xl bg-surface/80 border border-border/80 space-y-3"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Admin Passcode Verification:</span>
                <span className="text-[10px] text-muted-foreground">Protected Route</span>
              </label>
              <div className="relative">
                <Input
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter custom admin passcode..."
                  className="font-mono text-xs bg-surface-2 border-border pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-bold text-xs gap-2 h-10 uppercase"
            >
              <Key className="h-4 w-4" /> Unlock Admin Panel
            </Button>
          </form>
        )}
      </div>
    );
  }

  // Unlocked Admin Panel Content
  return (
    <div className="space-y-5 font-mono">
      {/* Top Banner & Session Status */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-surface/95 via-surface-2/80 to-surface/95 p-5 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold shadow-inner">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold uppercase text-foreground">
                Platform Fee &amp; Treasury Admin Panel
              </h2>
              <Badge
                variant="outline"
                className="bg-success/15 text-success border-success/30 text-[10px]"
              >
                <ShieldCheck className="h-3 w-3 mr-1" /> UNLOCKED
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Monitor real-time platform fee earnings collected into Admin Treasury across all
              multi-chain DEX swaps.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="h-8 text-xs font-mono gap-1.5 border-border"
          >
            <Download className="h-3.5 w-3.5" /> Export Fee CSV
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleLock}
            className="h-8 text-xs font-mono gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" /> Lock Panel
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="panel p-4 bg-surface/80 border-border/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">
              Total Admin Fees Collected
            </div>
            <div className="text-xl font-extrabold text-success mt-1">
              ${formatCurrency(totalFeeCollectedUSD)} USD
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-success/15 text-success flex items-center justify-center font-bold">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="panel p-4 bg-surface/80 border-border/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">
              Total Swap Volume Routed
            </div>
            <div className="text-xl font-extrabold text-primary mt-1">
              ${formatCurrency(totalVolumeProcessedUSD)} USD
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="panel p-4 bg-surface/80 border-border/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">
              Current Platform Fee Rate
            </div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              {(feeBps / 100).toFixed(2)}% ({feeBps} BPS)
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
            <Percent className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Admin Treasury Settings Form */}
      <div className="p-4 rounded-xl bg-surface-2/60 border border-amber-500/30 space-y-3">
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Settings className="h-4 w-4" /> Admin Fee Treasury Recipient Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Admin Recipient Wallet Address:
            </label>
            <Input
              value={editWallet}
              onChange={(e) => setEditWallet(e.target.value)}
              placeholder="0x..."
              className="font-mono text-xs bg-surface border-border"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">
              Platform Fee Rate in Basis Points (30 BPS = 0.30%):
            </label>
            <Input
              type="number"
              value={editBps}
              onChange={(e) => setEditBps(e.target.value)}
              placeholder="30"
              className="font-mono text-xs bg-surface border-border"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveSettings}
          className="bg-amber-500 text-black font-extrabold text-xs gap-1.5 hover:bg-amber-400"
        >
          <Check className="h-4 w-4" /> Save Treasury Configuration
        </Button>
      </div>

      {/* Fee Deposit Transactions Log */}
      <div className="panel overflow-hidden border-border/80 shadow-md">
        <div className="p-3 bg-surface-2/80 border-b border-border flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-2 text-foreground">
            <Database className="h-4 w-4 text-primary" /> Live Admin Fee Deposit Ledger (
            {feeRecords.length} Tx)
          </span>
          <span className="text-muted-foreground text-[10px]">
            Real-time fee splits generated from swap execution
          </span>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface-2/60 text-[10px] uppercase">
              <TableRow>
                <TableHead className="py-2.5 px-3">Time / Chain</TableHead>
                <TableHead className="py-2.5 px-3">Trader Address</TableHead>
                <TableHead className="py-2.5 px-3">Swap Pair</TableHead>
                <TableHead className="py-2.5 px-3 text-right">Notional Volume</TableHead>
                <TableHead className="py-2.5 px-3 text-right">Fee Earned (Admin)</TableHead>
                <TableHead className="py-2.5 px-3 text-center">Tx Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs font-mono divide-y divide-border/40">
              {feeRecords.map((r) => (
                <TableRow key={r.id} className="hover:bg-surface-2/40">
                  <TableCell className="py-2.5 px-3">
                    <div>
                      {mounted
                        ? new Date(r.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Recently"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{r.fromChain}</div>
                  </TableCell>
                  <TableCell className="py-2.5 px-3 font-bold text-foreground">
                    {shortAddr(r.userAddress)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 font-bold text-primary">{r.pair}</TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-bold text-foreground">
                    ${formatCurrency(r.swapValueUSD)}
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-right font-extrabold text-success">
                    +${r.feeCollectedUSD.toFixed(2)} ({r.feeTokenAmount.toFixed(4)}{" "}
                    {r.feeTokenSymbol})
                  </TableCell>
                  <TableCell className="py-2.5 px-3 text-center">
                    <span
                      className="text-[10px] text-muted-foreground underline cursor-pointer"
                      title={r.txHash}
                    >
                      {shortAddr(r.txHash)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
