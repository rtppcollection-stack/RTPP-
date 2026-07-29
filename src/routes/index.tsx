import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { I18nProvider, useI18n } from "@/lib/i18n";
import { WalletProvider } from "@/lib/wallet";
import { ThemeProvider, ThemeToggle, useTheme } from "@/lib/theme";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { TokenSearch } from "@/components/TokenSearch";
import { PopularTokens } from "@/components/PopularTokens";
import { TokenPanel } from "@/components/TokenPanel";
import { MarketDashboard } from "@/components/MarketDashboard";
import { GlobalWalletBalance } from "@/components/GlobalWalletBalance";
import { NetworkGasTracker } from "@/components/NetworkGasTracker";
import { WalletButton } from "@/components/WalletButton";
import { NFTGallery } from "@/components/NFTGallery";
import { DEXWidget } from "@/components/DEXWidget";
import { TransactionHistory } from "@/components/TransactionHistory";
import { WhaleAndNewsRadar } from "@/components/WhaleAndNewsRadar";
import { RiskBadge } from "@/components/RiskGauge";
import { RTPPTokenHeroCard } from "@/components/RTPPTokenHeroCard";
import { AIChat } from "@/components/AIChat";
import { SocialLinks } from "@/components/SocialLinks";
import { AppTour } from "@/components/AppTour";
import { PnLCalculator, PnLHistoryPanel, ScenariosTable } from "@/components/PnLCalculator";
import { PositionSizeCalculator } from "@/components/PositionSizeCalculator";
import { fetchCoinDetail } from "@/lib/coingecko";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  Images,
  Radar,
  ShieldCheck,
  Loader2,
  Wallet,
} from "lucide-react";
import { Toaster } from "sonner";

function AppToaster() {
  const { theme } = useTheme();
  return <Toaster position="top-right" theme={theme} richColors />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RTPP · Crypto Dashboard, Swap & P2P Calculator" },
      {
        name: "description",
        content:
          "Free multi-chain crypto dashboard: live prices, DEX swap & bridge, real-time P2P profit/loss calculator, and NFT marketplace.",
      },
      { property: "og:title", content: "RTPP · Crypto Dashboard, Swap & P2P Calculator" },
      {
        property: "og:description",
        content:
          "Free multi-chain crypto dashboard: live prices, DEX swap & bridge, real-time P2P profit/loss calculator, and NFT marketplace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <ThemeProvider>
      <I18nProvider>
        <WalletProvider>
          <Home />
          <AIChat />
          <AppToaster />
        </WalletProvider>
      </I18nProvider>
    </ThemeProvider>
  ),
});

function Home() {
  const { t } = useI18n();
  const [coinId, setCoinId] = useState<string>("bitcoin");
  const [tab, setTab] = useState<string>("dashboard");

  return (
    <div className="min-h-screen text-foreground bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5">
          <Logo />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-mono font-semibold text-success">
              <span className="live-dot" /> {t("live.badge")}
            </div>
            <div className="hidden sm:flex">
              <SocialLinks compact />
            </div>
            <ThemeToggle />
            <div className="hidden md:block">
              <AppTour currentTab={tab} onTabChange={setTab} />
            </div>
            <WalletButton />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 space-y-5">
        <Tabs value={tab} onValueChange={setTab} className="space-y-5">
          <div className="sticky top-[52px] z-30 -mx-4 px-4 py-2 bg-background/70 backdrop-blur-xl border-b border-border/40">
            <TabsList className="mx-auto grid w-full max-w-6xl grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 bg-surface/70 p-1 h-auto rounded-xl border border-border/60">
              <TabTrig
                value="dashboard"
                icon={<LayoutDashboard className="h-4 w-4" />}
                label={t("nav.dashboard")}
              />
              <TabTrig
                value="portfolio"
                icon={<Wallet className="h-4 w-4 text-cyan-400" />}
                label={t("nav.portfolio") || "Portfolio & Gas"}
              />
              <TabTrig
                value="swap"
                icon={<ArrowLeftRight className="h-4 w-4" />}
                label={t("nav.swap")}
              />
              <TabTrig
                value="whale"
                icon={<Radar className="h-4 w-4 text-amber-400" />}
                label={t("nav.radar")}
              />
              <TabTrig value="calc" icon={<Calculator className="h-4 w-4" />} label={t("nav.calculator")} />
              <TabTrig value="nft" icon={<Images className="h-4 w-4" />} label={t("nav.mint")} />
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4 mt-0">
            {/* Official Primary Native RTPP Collection Token Spotlight Card & Live Chart (FIRST ON DASHBOARD) */}
            <RTPPTokenHeroCard onSelectToken={setCoinId} />

            {/* Instant DEX Swap Terminal */}
            <DEXWidget coinId={coinId} />

            <SectionHeader
              title="Market Dashboard"
              subtitle="Real-time live prices, 24h market trends, volumes, and charts powered by CoinGecko."
            />
            <MarketDashboard onSelectToken={setCoinId} activeTokenId={coinId} />

            <div className="pt-4 border-t border-border/50 space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-foreground">Detailed Asset Deep Dive</h2>
                <p className="text-xs text-muted-foreground">
                  Select any token above or search below to view live TradingView chart &amp;
                  metrics.
                </p>
              </div>
              <div className="mx-auto max-w-3xl">
                <div className="rounded-xl border-2 border-primary/40 bg-surface/70 p-1.5 shadow-[0_0_0_4px_rgba(20,184,166,0.08),0_10px_40px_-10px_rgba(20,184,166,0.35)] focus-within:border-primary/70 transition-all">
                  <TokenSearch onSelect={setCoinId} />
                </div>
                <div className="mt-2 flex justify-center">
                  <RiskBadge coinId={coinId} />
                </div>
              </div>
              <PopularTokens onSelect={setCoinId} activeId={coinId} />
              <TokenPanel coinId={coinId} hideCalc />
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4 mt-0">
            <SectionHeader
              title="Global Wallet Portfolio & Network Gas Tracker"
              subtitle="Real-time multi-chain wallet balances, asset allocations, and live gas prices across ETH, SOL, BSC & Polygon."
            />
            <GlobalWalletBalance />
            <NetworkGasTracker />
          </TabsContent>

          <TabsContent value="swap" className="space-y-4 mt-0">
            <SectionHeader
              title="Swap & Bridge"
              subtitle="Multi-chain keyless swap across Ethereum, Base, Arbitrum, Polygon & BSC. Pick a token to trade."
            />
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border border-border/60 bg-surface/70 p-1.5">
                <TokenSearch onSelect={setCoinId} />
              </div>
            </div>
            <PopularTokens onSelect={setCoinId} activeId={coinId} />
            <DEXWidget coinId={coinId} />

            <div className="pt-6 border-t border-border/60 space-y-3">
              <SectionHeader
                title="Recent On-Chain Swaps & Transaction Log"
                subtitle="Live history of simulated & executed swaps, fee earnings, status tracking, and CSV exports."
              />
              <TransactionHistory />
            </div>
          </TabsContent>

          <TabsContent value="whale" className="space-y-4 mt-0">
            <WhaleAndNewsRadar />
          </TabsContent>

          <TabsContent value="calc" className="space-y-4 mt-0">
            <SectionHeader
              title="P2P Profit / Loss Calculator"
              subtitle="Real-time PnL with local P2P conversion. Updates automatically as you type."
            />
            <div className="mx-auto max-w-3xl">
              <div className="rounded-xl border border-border/60 bg-surface/70 p-1.5">
                <TokenSearch onSelect={setCoinId} />
              </div>
            </div>
            <PopularTokens onSelect={setCoinId} activeId={coinId} />
            <CalculatorTab coinId={coinId} />
          </TabsContent>

          <TabsContent value="nft" className="space-y-4 mt-0">
            <SectionHeader
              title="NFT Marketplace"
              subtitle="List, buy and sell NFTs on Base / Zora with ultra-low gas."
            />
            <NFTGallery />
          </TabsContent>
        </Tabs>

        <footer className="border-t border-border/50 pt-4 pb-6 text-center text-xs text-muted-foreground space-y-2">
          <div className="flex justify-center">
            <SocialLinks />
          </div>
          <div>{t("footer.disclaimer")}</div>
          <div className="text-[10px] opacity-70">
            RTPP is a free multi-language crypto tool. Not financial advice. Trade at your own risk.
          </div>
        </footer>
      </main>
    </div>
  );
}

function TabTrig({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center justify-center gap-2 rounded-lg py-2 text-xs sm:text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(" ")[0]}</span>
    </TabsTrigger>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center space-y-1">
      <h1 className="text-lg md:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-[11px] md:text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function CalculatorTab({ coinId }: { coinId: string }) {
  const { lang } = useI18n();
  const [calcMode, setCalcMode] = useState<"position" | "p2p">("position");

  const { data: coin, isLoading } = useQuery({
    queryKey: ["coin", coinId, lang],
    queryFn: () => fetchCoinDetail(coinId),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  if (isLoading || !coin) {
    return (
      <div className="panel flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const priceUSD = coin.market_data.current_price.usd;

  return (
    <div className="space-y-4">
      {/* Coin Bar + Sub Mode Switch */}
      <div className="panel px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={coin.image.large}
            alt=""
            className="h-9 w-9 rounded-full ring-1 ring-primary/20"
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-bold truncate">{coin.name}</span>
              <span className="text-[10px] font-mono uppercase text-muted-foreground">
                {coin.symbol}
              </span>
            </div>
            <div className="font-mono text-sm font-bold text-primary">
              ${priceUSD.toLocaleString(undefined, { maximumFractionDigits: priceUSD > 1 ? 4 : 8 })}
            </div>
          </div>
        </div>

        {/* Mode Switch Pills */}
        <div className="flex rounded-xl bg-surface-2 p-1 border border-border">
          <button
            onClick={() => setCalcMode("position")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              calcMode === "position"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🎯 Position Size &amp; Risk/Reward
          </button>
          <button
            onClick={() => setCalcMode("p2p")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              calcMode === "p2p"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📊 P2P PnL &amp; Exit Math
          </button>
        </div>
      </div>

      {calcMode === "position" ? (
        <PositionSizeCalculator tokenSymbol={coin.symbol.toUpperCase()} livePriceUSD={priceUSD} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PnLCalculator
              tokenId={coin.id}
              tokenSymbol={coin.symbol}
              livePriceUSD={priceUSD}
              hideHistory
              hideScenarios
            />
            <ScenariosTable tokenSymbol={coin.symbol} livePriceUSD={priceUSD} />
          </div>
          <PnLHistoryPanel />
        </>
      )}
    </div>
  );
}
