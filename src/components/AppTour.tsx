import { useState, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Compass,
  Wallet,
  Flame,
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  Play,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TourStep {
  id: string;
  tab: string;
  title: string;
  category: string;
  description: string;
  bullets: string[];
  icon: React.ComponentType<{ className?: string }>;
  targetLabel: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    tab: "dashboard",
    category: "WELCOME OVERVIEW",
    title: "Welcome to the RTPP Crypto Terminal",
    description:
      "A high-performance, non-custodial Web3 trading and financial analytics platform. Let's take a quick 1-minute tour of the key tools available.",
    bullets: [
      "Real-time CoinGecko market prices & Recharts sparklines",
      "Multi-chain Web3 wallet portfolio tracking (Base, ETH, SOL, BSC)",
      "Non-custodial DEX swap aggregator & transaction logs",
      "Professional Position Size & Risk/Reward calculator",
    ],
    icon: Sparkles,
    targetLabel: "Header & Navigation Bar",
  },
  {
    id: "wallet",
    tab: "dashboard",
    category: "PORTFOLIO TRACKING",
    title: "Global Multi-Chain Wallet Portfolio",
    description:
      "Connect your Web3 wallet (MetaMask, Coinbase Wallet, WalletConnect) or view real-time native token holdings across multiple networks in a sleek glassmorphic card.",
    bullets: [
      "Live native prices for ETH, SOL, BNB, POL",
      "One-click address copying and network switching",
      "Asset allocation breakdown across Base, Mainnet, Solana, BSC & Polygon",
      "Privacy toggle to hide sensitive balances with one click",
    ],
    icon: Wallet,
    targetLabel: "Global Wallet Portfolio Card",
  },
  {
    id: "gas",
    tab: "dashboard",
    category: "NETWORK OPTIMIZATION",
    title: "Real-Time Network Gas Fee Tracker",
    description:
      "Never overpay for gas. Monitor live Gwei prices and estimated DEX swap costs across major blockchains to time your transactions during low-traffic windows.",
    bullets: [
      "Live Gwei updates refreshed every 15 seconds",
      "Speed options: Slow 🐢, Normal ⚡, Fast 🚀",
      "Estimated USD swap and transfer cost breakdowns",
      "Visual indicators highlighting optimal low-fee windows",
    ],
    icon: Flame,
    targetLabel: "Network Gas Tracker Bar",
  },
  {
    id: "dashboard",
    tab: "dashboard",
    category: "MARKET INTELLIGENCE",
    title: "Live Market Dashboard & News Stream",
    description:
      "Explore top cryptocurrencies by market cap, 24h volume, gainers/losers, or major coins. Hover over any coin card to view interactive Recharts price trend graphs.",
    bullets: [
      "Breaking crypto news ticker powered by live headlines",
      "Interactive 7-day Recharts sparkline charts on hover",
      "Toggle between Card Grid and Compact Table views",
      "Risk assessment badge & live TradingView technical indicators",
    ],
    icon: LayoutDashboard,
    targetLabel: "Market Dashboard & Coin List",
  },
  {
    id: "swap",
    tab: "swap",
    category: "DECENTRALIZED TRADING",
    title: "Non-Custodial DEX Swap & Transaction Log",
    description:
      "Swap tokens across EVM chains with automated routing, custom slippage tolerance, and simulated on-chain execution with CSV export capabilities.",
    bullets: [
      "Instant token swaps with live price impact calculation",
      "Custom slippage protection (0.1%, 0.5%, 1.0%)",
      "Simulated on-chain transaction history table",
      "Filter by chain, status, or search hash, plus CSV log exports",
    ],
    icon: ArrowLeftRight,
    targetLabel: "Swap & Bridge Terminal",
  },
  {
    id: "calc",
    tab: "calc",
    category: "RISK MANAGEMENT",
    title: "Position Sizer & Risk/Reward Calculator",
    description:
      "Manage your trade risk like a professional prop trader. Input entry price, stop loss, take profit, and balance to calculate optimal position sizing.",
    bullets: [
      "Exact recommended token unit sizing & notional value",
      "Risk-to-Reward ratio gauge (e.g. 1:2.5 setup evaluation)",
      "Leverage margin requirements slider (1x - 50x)",
      "P2P profit/loss & fee breakdown scenario tables",
    ],
    icon: Calculator,
    targetLabel: "Position Sizer & P2P Calculator",
  },
];

const TOUR_STORAGE_KEY = "rtpp_terminal_tour_seen_v2";

interface AppTourProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function AppTour({ currentTab, onTabChange }: AppTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Auto show on first load if never seen
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!seen) {
        // Subtle delay before auto-inviting
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const activeStep = TOUR_STEPS[currentStepIndex];

  // When step changes, switch active tab if needed
  useEffect(() => {
    if (isOpen && activeStep) {
      if (activeStep.tab !== currentTab) {
        onTabChange(activeStep.tab);
      }
    }
  }, [currentStepIndex, isOpen]);

  const handleStartTour = () => {
    setCurrentStepIndex(0);
    setIsOpen(true);
    onTabChange(TOUR_STEPS[0].tab);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onTabChange(TOUR_STEPS[nextIdx].tab);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onTabChange(TOUR_STEPS[prevIdx].tab);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    }
  };

  const StepIcon = activeStep.icon;

  return (
    <>
      {/* Persistent Quick Help Launch Button in Header / Toolbar */}
      <Button
        size="xs"
        variant="outline"
        onClick={handleStartTour}
        className="h-8 gap-1.5 font-mono text-xs border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary transition-all shadow-sm"
      >
        <Compass className="h-3.5 w-3.5 animate-spin-slow" />
        <span className="hidden sm:inline">Terminal Tour</span>
      </Button>

      {/* Tour Overlay Backdrop & Spotlight Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fadeIn">
          {/* Main Tour Card Container */}
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-primary/50 bg-surface/95 p-6 shadow-[0_0_50px_-10px_rgba(20,184,166,0.3)] backdrop-blur-2xl space-y-5 text-foreground overflow-hidden">
            {/* Top Glowing Ambient Background */}
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

            {/* Header: Progress Badge & Close Button */}
            <div className="relative z-10 flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/15 text-primary border-primary/30 font-mono text-[10px] px-2 py-0.5"
                >
                  {activeStep.category}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>
              </div>

              <button
                onClick={handleComplete}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                title="Exit Tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Step Content */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center shadow-inner">
                  <StepIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold font-mono text-foreground leading-snug">
                    {activeStep.title}
                  </h3>
                  <span className="text-[11px] font-mono text-primary flex items-center gap-1 mt-0.5">
                    📍 Focus: {activeStep.targetLabel}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeStep.description}
              </p>

              {/* Bullet Points */}
              <div className="rounded-xl bg-surface-2/60 border border-border/70 p-3.5 space-y-2">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                  Key Capabilities:
                </div>
                <ul className="space-y-1.5 font-mono text-xs">
                  {activeStep.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Progress Bar & Footer Navigation Controls */}
            <div className="relative z-10 pt-2 border-t border-border/60 space-y-3">
              {/* Step Dots Progress */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {TOUR_STEPS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentStepIndex(idx);
                        onTabChange(TOUR_STEPS[idx].tab);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentStepIndex
                          ? "w-6 bg-primary"
                          : "w-2 bg-surface-2 hover:bg-muted-foreground"
                      }`}
                      title={`Go to step ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleComplete}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Skip Tour
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="h-9 gap-1 font-mono text-xs border-border disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="h-9 gap-1.5 font-mono text-xs bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/90"
                >
                  {currentStepIndex === TOUR_STEPS.length - 1 ? (
                    <>
                      <span>Get Started</span> <Check className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Next Tip</span> <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
