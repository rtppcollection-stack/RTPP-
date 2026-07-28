import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCoinDetail } from "@/lib/coingecko";
import { useI18n } from "@/lib/i18n";
import {
  DEFAULT_P2P_RATES,
  DEFAULT_EXCHANGE_RATES,
  formatCurrency,
  formatCompact,
  formatNumber,
} from "@/lib/fx";
import { TrendingDown, TrendingUp, ExternalLink, Loader2, ChevronDown } from "lucide-react";
import { PriceChart } from "./PriceChart";
import { PnLCalculator, PnLHistoryPanel, ScenariosTable } from "./PnLCalculator";

interface Props {
  coinId: string;
  onSelectToken?: (id: string) => void;
  hideCalc?: boolean;
}

export function TokenPanel({ coinId, hideCalc }: Props) {
  const { t, info, lang } = useI18n();

  const { data: coin, isLoading } = useQuery({
    queryKey: ["coin", coinId, lang],
    queryFn: () => fetchCoinDetail(coinId),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  if (isLoading || !coin) {
    return (
      <div className="panel flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const md = coin.market_data;
  const priceUSD = md.current_price.usd;
  const change24 = md.price_change_percentage_24h;
  const isUp = change24 >= 0;

  const p2pRate = DEFAULT_P2P_RATES[lang] ?? 1;
  const exRate = DEFAULT_EXCHANGE_RATES[lang] ?? 1;
  const priceLocalP2P = priceUSD * p2pRate;
  const priceLocalEx = priceUSD * exRate;

  // CoinGecko returns localized descriptions for these language codes; fall back to English otherwise.
  const cgLang = [
    "en",
    "zh",
    "ja",
    "ko",
    "es",
    "fr",
    "de",
    "it",
    "pl",
    "ru",
    "tr",
    "ar",
    "pt",
    "id",
    "vi",
    "nl",
    "hu",
    "th",
  ].includes(lang)
    ? lang
    : "en";
  const rawDesc = (coin.description[cgLang] || coin.description.en || "")
    .replace(/<[^>]+>/g, "")
    .trim();
  const cleanDesc = rawDesc.split(". ").slice(0, 2).join(". ");

  const homepage = coin.links.homepage.filter(Boolean)[0];

  return (
    <div className="space-y-4">
      {/* Compact token header */}
      <div className="panel px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={coin.image.large}
              alt=""
              className="h-10 w-10 rounded-full ring-1 ring-primary/20 shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-base font-bold truncate">{coin.name}</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                  {coin.symbol}
                </span>
                {coin.market_cap_rank && (
                  <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-mono text-primary">
                    #{coin.market_cap_rank}
                  </span>
                )}
                {homepage && (
                  <a
                    href={homepage}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              {cleanDesc && (
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{cleanDesc}</p>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="font-mono text-xl font-bold">
                ${formatNumber(priceUSD, priceUSD > 1 ? 4 : 8)}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold ${isUp ? "bg-up" : "bg-down"}`}
              >
                {isUp ? (
                  <TrendingUp className="h-2.5 w-2.5" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5" />
                )}
                {isUp ? "+" : ""}
                {formatNumber(change24, 2)}%
              </span>
            </div>
            <div className="text-[11px] font-mono mt-0.5">
              <span className="text-primary font-semibold">
                {formatCurrency(priceLocalP2P, info.currency, "en-US")}
              </span>
              <span className="text-muted-foreground"> · P2P</span>
              <span className="text-muted-foreground mx-1">|</span>
              <span>{formatCurrency(priceLocalEx, info.currency, "en-US")}</span>
              <span className="text-muted-foreground"> · Ex</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2 pt-3 border-t border-border/50">
          <MiniStat label={t("token.marketCap")} value={`$${formatCompact(md.market_cap.usd)}`} />
          <MiniStat label={t("token.volume")} value={`$${formatCompact(md.total_volume.usd)}`} />
          <MiniStat
            label={t("token.high24")}
            value={`$${formatNumber(md.high_24h.usd, md.high_24h.usd > 1 ? 2 : 6)}`}
          />
          <MiniStat
            label={t("token.low24")}
            value={`$${formatNumber(md.low_24h.usd, md.low_24h.usd > 1 ? 2 : 6)}`}
          />
          <MiniStat
            label={t("token.ath")}
            value={`$${formatNumber(md.ath.usd, md.ath.usd > 1 ? 2 : 6)}`}
          />
          <MiniStat
            label={t("token.supply")}
            value={`${formatCompact(md.circulating_supply)} ${coin.symbol.toUpperCase()}`}
          />
        </div>

        {rawDesc && <AboutSection text={rawDesc} />}
      </div>

      {hideCalc ? (
        <PriceChart coinId={coin.id} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PriceChart coinId={coin.id} />
            <div className="relative">
              <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/40 via-primary/10 to-transparent blur-sm opacity-60 pointer-events-none" />
              <div className="relative">
                <PnLCalculator
                  tokenId={coin.id}
                  tokenSymbol={coin.symbol}
                  livePriceUSD={priceUSD}
                  hideHistory
                  hideScenarios
                />
              </div>
            </div>
          </div>
          <ScenariosTable tokenSymbol={coin.symbol} livePriceUSD={priceUSD} />
          <PnLHistoryPanel />
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground truncate">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-xs font-semibold truncate">{value}</div>
    </div>
  );
}

function AboutSection({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 pt-3 border-t border-border/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition"
      >
        About
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <p
        className={`mt-1.5 text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap ${open ? "" : "line-clamp-2"}`}
      >
        {text}
      </p>
    </div>
  );
}
