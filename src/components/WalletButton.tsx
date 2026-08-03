import { useState } from "react";
import {
  Wallet,
  LogOut,
  Copy,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  Globe,
  Loader2,
  Check,
  Zap,
} from "lucide-react";
import { useWallet, shortAddr } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ChainInfo {
  hex: string;
  name: string;
  native: string;
  explorer: string;
  color: string;
}

const SUPPORTED_CHAINS: Record<string, ChainInfo> = {
  "0x2105": {
    hex: "0x2105",
    name: "Base",
    native: "ETH",
    explorer: "https://basescan.org",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  "0x1": {
    hex: "0x1",
    name: "Ethereum",
    native: "ETH",
    explorer: "https://etherscan.io",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  "0x89": {
    hex: "0x89",
    name: "Polygon",
    native: "POL",
    explorer: "https://polygonscan.com",
    color: "bg-purple-600/20 text-purple-300 border-purple-600/30",
  },
  "0xa4b1": {
    hex: "0xa4b1",
    name: "Arbitrum",
    native: "ETH",
    explorer: "https://arbiscan.io",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  "0x38": {
    hex: "0x38",
    name: "BSC",
    native: "BNB",
    explorer: "https://bscscan.com",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
};

export function WalletButton() {
  const { t } = useI18n();
  const {
    address,
    chainId,
    connect,
    disconnect,
    connecting,
    hasProvider,
    mounted,
    switchChain,
    feeBps,
    feeWallet,
  } = useWallet();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleConfirmDisconnect = () => {
    disconnect();
    setConfirmDisconnectOpen(false);
    toast.success("🔒 Web3 wallet session terminated safely!");
  };

  const handleConnectWallet = async (
    walletType: "metamask" | "trust" | "coinbase" | "injected",
  ) => {
    setSelectedWallet(walletType);
    try {
      if (typeof window !== "undefined" && !window.ethereum) {
        if (walletType === "metamask") {
          window.open("https://metamask.io/download/", "_blank", "noopener");
        } else if (walletType === "trust") {
          window.open("https://trustwallet.com/download", "_blank", "noopener");
        } else if (walletType === "coinbase") {
          window.open("https://www.coinbase.com/wallet", "_blank", "noopener");
        }
        toast.info(`Redirecting to download ${walletType.toUpperCase()} wallet provider…`);
        return;
      }

      await connect();
      setModalOpen(false);
      toast.success(`Connected via ${walletType.toUpperCase()} successfully!`);
    } catch (e) {
      toast.error((e as Error).message || "Failed to connect wallet");
    } finally {
      setSelectedWallet(null);
    }
  };

  const activeChain = chainId ? SUPPORTED_CHAINS[chainId.toLowerCase()] : null;

  // Render modal when disconnected
  if (!address) {
    return (
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            disabled={connecting}
            className="gap-1.5 px-2.5 sm:px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-semibold shadow-[0_0_15px_-3px_rgba(20,184,166,0.5)] transition-all"
          >
            <Wallet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {!mounted
                ? t("wallet.connect")
                : connecting
                  ? t("wallet.connecting")
                  : t("wallet.connect")}
            </span>
            <span className="sm:hidden">
              {connecting ? t("wallet.connecting") : t("wallet.connect")}
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-surface/95 border-border text-foreground max-w-sm sm:max-w-md backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-mono text-base text-primary">
              <Zap className="h-5 w-5" /> Connect Web3 Wallet
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect your Ethereum or EVM wallet to execute DEX swaps with on-chain fee integration
              across Base, Arbitrum, Polygon, BSC, and Ethereum.
            </p>

            {/* Wallet Choices List */}
            <div className="space-y-2">
              <button
                onClick={() => handleConnectWallet("metamask")}
                disabled={connecting}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2/40 hover:bg-surface-2 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-lg">
                    🦊
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                      MetaMask
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {hasProvider ? "Injected Browser Extension" : "Click to Install extension"}
                    </div>
                  </div>
                </div>
                {selectedWallet === "metamask" && connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="text-xs font-mono text-primary group-hover:translate-x-0.5 transition-transform">
                    Connect →
                  </span>
                )}
              </button>

              <button
                onClick={() => handleConnectWallet("trust")}
                disabled={connecting}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2/40 hover:bg-surface-2 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">
                    🛡️
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                      Trust Wallet
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Mobile & Extension Web3 Provider
                    </div>
                  </div>
                </div>
                {selectedWallet === "trust" && connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="text-xs font-mono text-primary group-hover:translate-x-0.5 transition-transform">
                    Connect →
                  </span>
                )}
              </button>

              <button
                onClick={() => handleConnectWallet("coinbase")}
                disabled={connecting}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface-2/40 hover:bg-surface-2 hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-lg">
                    🔵
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold font-mono text-foreground group-hover:text-primary transition-colors">
                      Coinbase Wallet / Web3
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      Multi-chain EVM wallet
                    </div>
                  </div>
                </div>
                {selectedWallet === "coinbase" && connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="text-xs font-mono text-primary group-hover:translate-x-0.5 transition-transform">
                    Connect →
                  </span>
                )}
              </button>
            </div>

            {/* Groundwork DEX Fee Banner */}
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-2.5 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-primary font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> DEX Swap Fee Integration Active
                </span>
                <span className="text-[10px] bg-primary/20 px-1.5 py-0.2 rounded">
                  {(feeBps / 100).toFixed(2)}%
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Automatic on-chain fee routing enabled to recipient{" "}
                <span className="text-foreground font-bold">{shortAddr(feeWallet)}</span>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Connected Wallet Controls Bar
  return (
    <div className="flex items-center gap-1.5">
      {/* Network Selector Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 px-2 border-primary/30 bg-surface-2/60 font-mono text-xs text-foreground hover:bg-surface-2"
          >
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>{activeChain?.name || `Chain ${parseInt(chainId || "0x1", 16)}`}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-surface border-border font-mono text-xs w-48"
        >
          <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">
            Switch EVM Network
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/60" />
          {Object.entries(SUPPORTED_CHAINS).map(([hex, c]) => (
            <DropdownMenuItem
              key={hex}
              onClick={async () => {
                try {
                  await switchChain(hex);
                  toast.success(`Switched to ${c.name}`);
                } catch {
                  toast.error(`Could not switch to ${c.name}`);
                }
              }}
              className="flex items-center justify-between cursor-pointer py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${hex === chainId?.toLowerCase() ? "bg-success" : "bg-muted-foreground/40"}`}
                />
                <span>{c.name}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{c.native}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Account Info Button */}
      <div className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-1">
        <button
          onClick={() => {
            navigator.clipboard.writeText(address);
            toast.success("Address copied to clipboard!");
          }}
          className="flex items-center gap-1 font-mono text-xs text-foreground hover:text-primary transition-colors"
          title={address}
        >
          <Wallet className="h-3.5 w-3.5 text-primary" />
          <span>{shortAddr(address)}</span>
          <Copy className="h-3 w-3 opacity-60 hover:opacity-100" />
        </button>

        {activeChain && (
          <a
            href={`${activeChain.explorer}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary p-0.5"
            title="View on Explorer"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        <button
          onClick={() => setConfirmDisconnectOpen(true)}
          className="text-muted-foreground hover:text-danger p-0.5 ml-0.5"
          title="Secure Disconnect Wallet"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Confirmation Modal for Secure Wallet Disconnect */}
      <AlertDialog open={confirmDisconnectOpen} onOpenChange={setConfirmDisconnectOpen}>
        <AlertDialogContent className="bg-surface border-border text-foreground max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base font-mono text-red-400">
              <ShieldAlert className="h-5 w-5 text-red-400" /> Confirm Secure Wallet Disconnect
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-xs text-muted-foreground space-y-3 pt-2">
                <p className="leading-relaxed">
                  Are you sure you want to terminate your active Web3 wallet session?
                </p>
                {address && (
                  <div className="p-3 rounded-lg bg-surface-2/80 border border-border font-mono text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connected Account:</span>
                      <span className="text-foreground font-bold">{shortAddr(address)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Network:</span>
                      <span className="text-primary font-bold">
                        {activeChain?.name || `Chain ${parseInt(chainId || "0x1", 16)}`}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Disconnecting revokes dApp session signatures and ensures your Web3 wallet is
                  safely disconnected.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="text-xs font-mono">Keep Connected</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDisconnect}
              className="bg-red-500 text-white hover:bg-red-600 font-mono text-xs font-bold gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" /> Disconnect &amp; Terminate Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
