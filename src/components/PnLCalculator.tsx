import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { DEFAULT_P2P_RATES, formatCurrency, formatNumber } from "@/lib/fx";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, History, Trash2, Sparkles } from "lucide-react";

interface Props {
  tokenId: string;
  tokenSymbol: string;
  livePriceUSD: number;
  hideHistory?: boolean;
  hideScenarios?: boolean;
}

interface HistoryEntry {
  id: string;
  ts: number;
  token: string;
  buyPrice: number;
  amountUSD: number;
  currentPrice: number;
  pnlUSD: number;
  pnlPct: number;
  lang: string;
  currency: string;
}

const HIST_KEY = "rtpp.history";
const CALC_STATE_KEY = "rtpp.calc";

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveHistory(h: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIST_KEY, JSON.stringify(h.slice(0, 20)));
}

interface CalcState {
  buyPrice: string;
  amount: string;
  priceAdjust: number;
}
function loadCalcState(): CalcState {
  if (typeof window === "undefined") return { buyPrice: "", amount: "", priceAdjust: 0 };
  try {
    return JSON.parse(localStorage.getItem(CALC_STATE_KEY) || "") as CalcState;
  } catch {
    return { buyPrice: "", amount: "", priceAdjust: 0 };
  }
}
function saveCalcState(s: CalcState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CALC_STATE_KEY, JSON.stringify(s));
}

export function PnLCalculator({
  tokenId: _tokenId,
  tokenSymbol,
  livePriceUSD,
  hideHistory,
  hideScenarios,
}: Props) {
  const { t, info, lang } = useI18n();

  const [buyPrice, setBuyPrice] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [p2pRate, setP2pRate] = useState<number>(DEFAULT_P2P_RATES[lang] ?? 1);
  const [priceAdjust, setPriceAdjust] = useState<number>(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    const s = loadCalcState();
    setBuyPrice(s.buyPrice);
    setAmount(s.amount);
    setPriceAdjust(s.priceAdjust);
  }, []);
  useEffect(() => setP2pRate(DEFAULT_P2P_RATES[lang] ?? 1), [lang]);
  useEffect(
    () => saveCalcState({ buyPrice, amount, priceAdjust }),
    [buyPrice, amount, priceAdjust],
  );

  const adjustedPrice = livePriceUSD * (1 + priceAdjust / 100);
  const buyN = parseFloat(buyPrice) || 0;
  const amtN = parseFloat(amount) || 0;
  const tokensReceived = buyN > 0 ? amtN / buyN : 0;
  const currentValueUSD = tokensReceived * adjustedPrice;
  const pnlUSD = currentValueUSD - amtN;
  const pnlPct = amtN > 0 ? (pnlUSD / amtN) * 100 : 0;

  const p2pValueLocal = currentValueUSD * p2pRate;
  const pnlLocal = pnlUSD * p2pRate;

  // Auto-save latest computation to history (debounced) whenever inputs are valid
  useEffect(() => {
    if (!buyN || !amtN) return;
    const to = setTimeout(() => {
      const entry: HistoryEntry = {
        id: `${tokenSymbol}-${buyN}-${amtN}`,
        ts: Date.now(),
        token: tokenSymbol.toUpperCase(),
        buyPrice: buyN,
        amountUSD: amtN,
        currentPrice: adjustedPrice,
        pnlUSD,
        pnlPct,
        lang,
        currency: info.currency,
      };
      setHistory((prev) => {
        const filtered = prev.filter((h) => h.id !== entry.id);
        const next = [entry, ...filtered].slice(0, 20);
        saveHistory(next);
        return next;
      });
    }, 1200);
    return () => clearTimeout(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyN, amtN, adjustedPrice, tokenSymbol, lang]);

  const reset = () => {
    setBuyPrice("");
    setAmount("");
    setPriceAdjust(0);
  };
  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const localeCurrency = info.currency;

  return (
    <div className="panel p-4 md:p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> {t("calc.title")}
        </h2>
        <span className="text-xs text-muted-foreground font-mono">
          {tokenSymbol.toUpperCase()} · ${formatNumber(livePriceUSD, livePriceUSD > 1 ? 4 : 8)}
        </span>
      </div>

      {/* Price adjust slider */}
      <div className="rounded-lg bg-surface-2/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label className="text-muted-foreground">{t("price.adjust")}</Label>
          <span className={`font-mono font-semibold ${priceAdjust >= 0 ? "text-up" : "text-down"}`}>
            {priceAdjust > 0 ? "+" : ""}
            {priceAdjust.toFixed(1)}% → ${formatNumber(adjustedPrice, adjustedPrice > 1 ? 4 : 8)}
          </span>
        </div>
        <Slider
          value={[priceAdjust]}
          onValueChange={(v) => setPriceAdjust(v[0])}
          min={-90}
          max={500}
          step={0.5}
        />
      </div>

      {/* P2P rate adjust */}
      <div className="rounded-lg bg-surface-2/50 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <Label className="text-muted-foreground">{t("price.p2p")} · 1 USD =</Label>
          <span className="font-mono font-semibold text-primary">
            {formatNumber(p2pRate, p2pRate > 100 ? 0 : 4)} {info.currency}
          </span>
        </div>
        <Input
          type="number"
          value={p2pRate}
          onChange={(e) => setP2pRate(parseFloat(e.target.value) || 0)}
          className="h-9 bg-surface border-border font-mono text-sm"
        />
      </div>

      {/* Inputs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs text-muted-foreground">{t("calc.buyPrice")}</Label>
          <Input
            type="number"
            step="any"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            placeholder="0.00"
            className="mt-1 bg-surface border-border font-mono"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t("calc.amountInvested")} (USD)</Label>
          <Input
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 bg-surface border-border font-mono"
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface-2/50 p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {t("calc.tokensReceived")}
          </div>
          <div className="mt-1 font-mono text-lg font-semibold">
            {formatNumber(tokensReceived, 6)}{" "}
            <span className="text-xs text-muted-foreground">{tokenSymbol.toUpperCase()}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-2/50 p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {t("calc.currentValue")}
          </div>
          <div className="mt-1 font-mono text-lg font-semibold">
            ${formatNumber(currentValueUSD, 2)}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground font-mono">
            ≈ {formatCurrency(p2pValueLocal, localeCurrency, "en-US")}
          </div>
        </div>
      </div>

      {/* P&L big display */}
      <div
        className={`rounded-lg p-4 border ${pnlUSD >= 0 ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5"}`}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {pnlUSD >= 0 ? t("calc.profit") : t("calc.loss")} · {t("calc.pnl")}
            </div>
            <div
              className={`mt-1 flex items-baseline gap-2 font-mono text-2xl font-bold ${pnlUSD >= 0 ? "text-up" : "text-down"}`}
            >
              {pnlUSD >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {pnlUSD >= 0 ? "+" : ""}${formatNumber(pnlUSD, 2)}
              <span className="text-base">
                ({pnlUSD >= 0 ? "+" : ""}
                {formatNumber(pnlPct, 2)}%)
              </span>
            </div>
            <div className={`mt-1 text-xs font-mono ${pnlLocal >= 0 ? "text-up" : "text-down"}`}>
              ≈ {formatCurrency(pnlLocal, localeCurrency, "en-US")} ({info.name})
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="ghost" onClick={reset}>
              {t("calc.reset")}
            </Button>
          </div>
        </div>
      </div>

      {!hideScenarios && <ScenariosTable tokenSymbol={tokenSymbol} livePriceUSD={livePriceUSD} />}

      {!hideHistory && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <History className="h-4 w-4" /> {t("history.title")}
            </h3>
            {history.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearHistory}
                className="h-7 gap-1 text-xs"
              >
                <Trash2 className="h-3 w-3" /> {t("history.clear")}
              </Button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              {t("history.empty")}
            </div>
          ) : (
            <ul className="space-y-1.5 max-h-56 overflow-y-auto">
              {history.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center justify-between rounded-md bg-surface-2/40 px-3 py-2 text-xs font-mono"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {h.token} · ${formatNumber(h.buyPrice, 4)} → $
                      {formatNumber(h.currentPrice, 4)}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {new Date(h.ts).toLocaleString()} · ${formatNumber(h.amountUSD, 2)}
                    </span>
                  </div>
                  <div className={`text-right ${h.pnlUSD >= 0 ? "text-up" : "text-down"}`}>
                    <div>
                      {h.pnlUSD >= 0 ? "+" : ""}${formatNumber(h.pnlUSD, 2)}
                    </div>
                    <div className="text-[10px]">
                      {h.pnlUSD >= 0 ? "+" : ""}
                      {formatNumber(h.pnlPct, 2)}%
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Standalone scenarios table — reads calculator state from localStorage so it stays in sync */
export function ScenariosTable({
  tokenSymbol,
  livePriceUSD,
}: {
  tokenSymbol: string;
  livePriceUSD: number;
}) {
  const { t, info, lang } = useI18n();
  const [state, setState] = useState<CalcState>({ buyPrice: "", amount: "", priceAdjust: 0 });
  const [p2pRate, setP2pRate] = useState<number>(DEFAULT_P2P_RATES[lang] ?? 1);

  useEffect(() => {
    setState(loadCalcState());
    const iv = setInterval(() => setState(loadCalcState()), 700);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => setP2pRate(DEFAULT_P2P_RATES[lang] ?? 1), [lang]);

  const adjustedPrice = livePriceUSD * (1 + (state.priceAdjust || 0) / 100);
  const buyN = parseFloat(state.buyPrice) || 0;
  const amtN = parseFloat(state.amount) || 0;
  const tokensReceived = buyN > 0 ? amtN / buyN : 0;

  const scenarios = [-50, -30, -20, -10, -5, 5, 10, 20, 50, 100];

  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold">{t("calc.scenarios")}</h3>
        <span className="text-[11px] text-muted-foreground">
          {amtN > 0 && buyN > 0
            ? t("calc.scenarioHint")
            : "Enter buy price & amount in the calculator to see live P&L per scenario"}
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[70px_1fr_1fr_1fr] items-center gap-2 bg-surface-2/70 px-3 py-2 text-[10px] font-mono uppercase tracking-wide text-muted-foreground">
          <div>%</div>
          <div>{tokenSymbol.toUpperCase()} · USD</div>
          <div className="text-right">P&amp;L (USD)</div>
          <div className="text-right">{info.currency}</div>
        </div>
        <ul className="divide-y divide-border/60">
          {scenarios.map((pct) => {
            const scPrice = adjustedPrice * (1 + pct / 100);
            const scValue = tokensReceived * scPrice;
            const scPnl = scValue - amtN;
            const scPnlLocal = scPnl * p2pRate;
            const isUp = pct >= 0;
            return (
              <li
                key={pct}
                className="grid grid-cols-[70px_1fr_1fr_1fr] items-center gap-2 px-3 py-2 text-xs font-mono hover:bg-surface-2/40 transition-colors"
              >
                <div className={`font-semibold ${isUp ? "text-up" : "text-down"}`}>
                  {isUp ? "+" : ""}
                  {pct}%
                </div>
                <div className="text-foreground/90">
                  ${formatNumber(scPrice, scPrice > 1 ? 4 : 8)}
                </div>
                <div className={`text-right font-semibold ${scPnl >= 0 ? "text-up" : "text-down"}`}>
                  {scPnl >= 0 ? "+" : ""}${formatNumber(scPnl, 2)}
                </div>
                <div className={`text-right ${scPnl >= 0 ? "text-up" : "text-down"} opacity-90`}>
                  {scPnl >= 0 ? "+" : ""}
                  {formatCurrency(scPnlLocal, info.currency, "en-US")}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export function PnLHistoryPanel() {
  const { t } = useI18n();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    setHistory(loadHistory());
    const onStorage = () => setHistory(loadHistory());
    const iv = setInterval(onStorage, 2000);
    return () => clearInterval(iv);
  }, []);
  const clear = () => {
    setHistory([]);
    saveHistory([]);
  };
  return (
    <div className="panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4" /> {t("history.title")}
        </h3>
        {history.length > 0 && (
          <Button size="sm" variant="ghost" onClick={clear} className="h-7 gap-1 text-xs">
            <Trash2 className="h-3 w-3" /> {t("history.clear")}
          </Button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          {t("history.empty")}
        </div>
      ) : (
        <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[520px] overflow-y-auto">
          {history.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between rounded-md bg-surface-2/40 px-3 py-2 text-xs font-mono"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-semibold truncate">
                  {h.token} · ${formatNumber(h.buyPrice, 4)} → ${formatNumber(h.currentPrice, 4)}
                </span>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(h.ts).toLocaleString()} · ${formatNumber(h.amountUSD, 2)}
                </span>
              </div>
              <div
                className={`text-right shrink-0 ml-2 ${h.pnlUSD >= 0 ? "text-up" : "text-down"}`}
              >
                <div>
                  {h.pnlUSD >= 0 ? "+" : ""}${formatNumber(h.pnlUSD, 2)}
                </div>
                <div className="text-[10px]">
                  {h.pnlUSD >= 0 ? "+" : ""}
                  {formatNumber(h.pnlPct, 2)}%
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
