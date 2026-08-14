import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, Suspense, memo } from "react";
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
import { WalletButton } from "@/components/WalletButton";
import { RiskBadge } from "@/components/RiskGauge";
import { RTPPTokenHeroCard } from "@/components/RTPPTokenHeroCard";
import { SocialLinks } from "@/components/SocialLinks";
import { useUserRole } from "@/hooks/useUserRole";
import { fetchCoinDetail } from "@/lib/coingecko";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Calculator,
  Images,
  Shirt,
  Radar,
  ShieldCheck,
  Loader2,
  Wallet,
  FileEdit,
  Activity,
} from "lucide-react";
import { toast, Toaster } from "sonner";

import { GlobalWalletBalance } from "@/components/GlobalWalletBalance";
import { NFTGallery } from "@/components/NFTGallery";
import { NFTMerchStore } from "@/components/NFTMerchStore";
import { DEXWidget } from "@/components/DEXWidget";
import { TransactionHistory } from "@/components/TransactionHistory";
import { WhaleAndNewsRadar } from "@/components/WhaleAndNewsRadar";
import { AIChat } from "@/components/AIChat";
import { AppTour } from "@/components/AppTour";
import { PositionSizeCalculator } from "@/components/PositionSizeCalculator";
import { PnLCalculator, ScenariosTable, PnLHistoryPanel } from "@/components/PnLCalculator";
import { EditorPanel } from "@/components/EditorPanel";
import { MonitorLogsPanel } from "@/components/MonitorLogsPanel";

function AppToaster() {
  const { theme } = useTheme();
  return <Toaster position="top-right" theme={theme} richColors />;
}

function TabSkeleton() {
  return (
    <div className="panel p-8 flex flex-col items-center justify-center gap-3 min-h-[280px] text-muted-foreground animate-pulse">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="text-xs font-mono">Loading module...</span>
    </div>
  );
}

function IndexRouteComponent() {
  return (
    <>
      <Home />
      <Suspense fallback={null}>
        <AIChat />
      </Suspense>
      <AppToaster />
    </>
  );
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
  component: IndexRouteComponent,
});

function Home() {
  const { t } = useI18n();
  const [coinId, setCoinId] = useState<string>("bitcoin");
  const [tab, setTab] = useState<string>("dashboard");
  const { role, isAdmin, isEditor, isMonitor } = useUserRole();

  // Selected Merch Artwork State for Printful Configurator
  const [selectedMerchImage, setSelectedMerchImage] = useState<string>("");
  const [selectedMerchTitle, setSelectedMerchTitle] = useState<string>("");

  const handleSelectNFTForMerch = useCallback((imageUrl: string, title?: string) => {
    setSelectedMerchImage(imageUrl);
    if (title) setSelectedMerchTitle(title);
    toast.success(`Selected "${title || "NFT Artwork"}" for Phygital Studio!`);
    setTab("merch");
  }, []);

  const handleTrade = useCallback((id: string) => {
    setCoinId(id);
  }, []);

  return (
    <div
      className="min-h-screen text-foreground bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]"
      suppressHydrationWarning
    >
      <header
        className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-2xl transition-all shadow-sm"
        suppressHydrationWarning
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
              <span className="live-dot" /> {t("live.badge")}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Role Badge Indicator */}
            {role && role !== "user" && (
              <div
                className={`hidden md:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border uppercase ${
                  role === "admin"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : role === "editor"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                }`}
              >
                Role: {role}
              </div>
            )}

            <div className="hidden lg:flex items-center">
              <SocialLinks compact />
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <ThemeToggle />
              <div className="hidden md:block">
                <Suspense fallback={null}>
                  <AppTour currentTab={tab} onTabChange={setTab} />
                </Suspense>
              </div>
              <WalletButton />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-5 space-y-4">
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <div className="sticky top-[52px] z-30 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-background/80 backdrop-blur-xl border-b border-border/40">
            <TabsList className="flex w-full items-center gap-1.5 overflow-x-auto no-scrollbar bg-surface/80 p-1.5 rounded-2xl border border-border/60 shadow-sm font-mono text-xs">
              <TabTrig
                value="dashboard"
                icon={<LayoutDashboard className="h-4 w-4" />}
                label={t("nav.dashboard")}
              />
              <TabTrig
                value="swap"
                icon={<ArrowLeftRight className="h-4 w-4 text-emerald-400" />}
                label={t("nav.swap")}
              />
              <TabTrig
                value="portfolio"
                icon={<Wallet className="h-4 w-4 text-cyan-400" />}
                label={t("nav.portfolio")}
              />
              <TabTrig
                value="whale"
                icon={<Radar className="h-4 w-4 text-amber-400" />}
                label={t("nav.radar")}
              />
              <TabTrig
                value="calc"
                icon={<Calculator className="h-4 w-4 text-purple-400" />}
                label={t("nav.calculator")}
              />
              <TabTrig
                value="nft"
                icon={<Images className="h-4 w-4 text-rose-400" />}
                label={t("nav.mint")}
              />
              <TabTrig
                value="merch"
                icon={<Shirt className="h-4 w-4 text-cyan-400" />}
                label={t("nav.merch")}
              />

              {/* Editor Role Navigation Feature */}
              {(isEditor || isAdmin) && (
                <TabTrig
                  value="editor"
                  icon={<FileEdit className="h-4 w-4 text-emerald-400" />}
                  label={t("nav.editor")}
                />
              )}

              {/* Monitor Role Navigation Feature */}
              {(isMonitor || isAdmin) && (
                <TabTrig
                  value="monitor"
                  icon={<Activity className="h-4 w-4 text-cyan-400" />}
                  label={t("nav.monitor")}
                />
              )}
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4 mt-0">
            {/* Primary Spotlight: Official RTPP Token */}
            <RTPPTokenHeroCard onSelectToken={setCoinId} />

            {/* Core Exchange Market Overview */}
            <SectionHeader
              title="Market Overview & Live Prices"
              subtitle="Real-time multi-chain market trends, top gainers, and trading volume."
            />
            <MarketDashboard
              onSelectToken={setCoinId}
              onTrade={handleTrade}
              activeTokenId={coinId}
            />

            {/* Asset Deep Dive Section */}
            <div className="pt-4 border-t border-border/50 space-y-4">
              <div className="text-center space-y-1">
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Token Analysis & Live Charts
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select any asset to view real-time candle charts and risk metrics.
                </p>
              </div>
              <div className="mx-auto max-w-2xl">
                <div className="rounded-xl border border-border/60 bg-surface/70 p-1 shadow-sm">
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

          <TabsContent value="swap" className="space-y-4 mt-0">
            <SectionHeader
              title="Instant In-App DEX Swap"
              subtitle="Trade tokens directly on-chain with automated routing and ultra-low platform fees."
            />
            {/* Focused Swap Terminal */}
            <Suspense fallback={<TabSkeleton />}>
              <DEXWidget coinId={coinId} />
            </Suspense>

            <div className="pt-6 border-t border-border/60 space-y-3">
              <SectionHeader
                title="Recent On-Chain Swaps & Transaction Log"
                subtitle="Live history of executed swaps, fee earnings, status tracking, and receipts."
              />
              <Suspense fallback={<TabSkeleton />}>
                <TransactionHistory />
              </Suspense>
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4 mt-0">
            <SectionHeader
              title="Multi-Chain Crypto Portfolio & Base Asset Vault"
              subtitle="Real-time on-chain token balance tracking, USD valuations, and asset breakdown for Base Chain and major Web3 networks."
            />
            <Suspense fallback={<TabSkeleton />}>
              <GlobalWalletBalance />
            </Suspense>
          </TabsContent>

          <TabsContent value="whale" className="space-y-4 mt-0">
            <Suspense fallback={<TabSkeleton />}>
              <WhaleAndNewsRadar />
            </Suspense>
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

          <TabsContent value="nft" className="space-y-6 mt-0">
            <SectionHeader
              title="NFT Digital Gallery & Collection Marketplace"
              subtitle="Explore on-chain collectible NFTs available for trading, minting, and physical merch creation. Click 'Create Custom Streetwear' on any NFT to load it in the Phygital Studio."
            />
            <Suspense fallback={<TabSkeleton />}>
              <NFTGallery onSelectForMerch={handleSelectNFTForMerch} />
            </Suspense>
          </TabsContent>

          <TabsContent value="merch" className="space-y-6 mt-0">
            <SectionHeader
              title="Phygital Web3 Studio & Printful Merch Configurator"
              subtitle="Preview and customize selected NFT artwork onto high quality apparel, mugs & canvases with automated Printful order fulfillment."
            />
            <Suspense fallback={<TabSkeleton />}>
              <NFTMerchStore
                selectedImageUrl={selectedMerchImage}
                selectedNftTitle={selectedMerchTitle}
              />
            </Suspense>
          </TabsContent>

          {(isEditor || isAdmin) && (
            <TabsContent value="editor" className="space-y-4 mt-0">
              <SectionHeader
                title="Editor & Content Creation Studio"
                subtitle="Exclusive portal for Editors to create, update, and manage news feeds, market alerts, and announcements."
              />
              <Suspense fallback={<TabSkeleton />}>
                <EditorPanel />
              </Suspense>
            </TabsContent>
          )}

          {(isMonitor || isAdmin) && (
            <TabsContent value="monitor" className="space-y-4 mt-0">
              <SectionHeader
                title="System Activity & Audit Telemetry"
                subtitle="Exclusive portal for Monitors to review live system logs, RPC API response latency, and authorization events."
              />
              <Suspense fallback={<TabSkeleton />}>
                <MonitorLogsPanel />
              </Suspense>
            </TabsContent>
          )}
        </Tabs>

        <footer
          className="border-t border-border/50 pt-4 pb-6 text-center text-xs text-muted-foreground space-y-2"
          suppressHydrationWarning
        >
          <div className="flex justify-center items-center gap-3 flex-wrap">
            <SocialLinks />

            {/* Show Admin Portal link ONLY if user is Admin */}
            {isAdmin && (
              <a
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-mono font-bold text-amber-400 hover:bg-amber-500/20 transition shadow-sm"
                title="Private Treasury Admin Portal"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-amber-400" /> Admin Portal
              </a>
            )}

            {/* Show Content Studio shortcut for Editor */}
            {!isAdmin && isEditor && (
              <button
                onClick={() => setTab("editor")}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 hover:bg-emerald-500/20 transition shadow-sm"
              >
                <FileEdit className="h-3.5 w-3.5 text-emerald-400" /> Content Studio
              </button>
            )}

            {/* Show System Logs shortcut for Monitor */}
            {!isAdmin && isMonitor && (
              <button
                onClick={() => setTab("monitor")}
                className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-mono font-bold text-cyan-400 hover:bg-cyan-500/20 transition shadow-sm"
              >
                <Activity className="h-3.5 w-3.5 text-cyan-400" /> Read-Only Logs
              </button>
            )}
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

const TabTrig = memo(function TabTrig({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-mono font-bold whitespace-nowrap shrink-0 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow transition-all"
    >
      {icon}
      <span suppressHydrationWarning>{label}</span>
    </TabsTrigger>
  );
});

const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center space-y-1">
      <h1 className="text-lg md:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-[11px] md:text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
});

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
              $
              {(priceUSD || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: (priceUSD || 0) > 1 ? 4 : 8,
              })}
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
        <Suspense fallback={<TabSkeleton />}>
          <PositionSizeCalculator tokenSymbol={coin.symbol.toUpperCase()} livePriceUSD={priceUSD} />
        </Suspense>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Suspense fallback={<TabSkeleton />}>
              <PnLCalculator
                tokenId={coin.id}
                tokenSymbol={coin.symbol}
                livePriceUSD={priceUSD}
                hideHistory
                hideScenarios
              />
            </Suspense>
            <Suspense fallback={<TabSkeleton />}>
              <ScenariosTable tokenSymbol={coin.symbol} livePriceUSD={priceUSD} />
            </Suspense>
          </div>
          <Suspense fallback={<TabSkeleton />}>
            <PnLHistoryPanel />
          </Suspense>
        </>
      )}
    </div>
  );
}
