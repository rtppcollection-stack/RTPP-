import { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Calculator,
  Percent,
  DollarSign,
  Zap,
  Target,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatNumber, formatCurrency } from "@/lib/fx";

interface PositionSizeCalculatorProps {
  tokenSymbol?: string;
  livePriceUSD?: number;
}

export function PositionSizeCalculator({
  tokenSymbol = "BTC",
  livePriceUSD = 65000,
}: PositionSizeCalculatorProps) {
  // Inputs
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [accountBalance, setAccountBalance] = useState<string>("5000");
  const [riskPercent, setRiskPercent] = useState<number>(1); // 1%
  const [entryPrice, setEntryPrice] = useState<string>(livePriceUSD.toString());
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);

  // Update entry price if live price changes and user hasn't manually typed custom value
  useEffect(() => {
    if (livePriceUSD && (!entryPrice || entryPrice === "0")) {
      setEntryPrice(livePriceUSD.toString());
    }
  }, [livePriceUSD]);

  // Set default stop loss and take profit based on entry price
  useEffect(() => {
    const entry = parseFloat(entryPrice) || livePriceUSD || 1000;
    if (!stopLoss) {
      const defaultSl = direction === "long" ? entry * 0.95 : entry * 1.05;
      setStopLoss(formatNumber(defaultSl, entry > 10 ? 2 : 4));
    }
    if (!takeProfit) {
      const defaultTp = direction === "long" ? entry * 1.1 : entry * 0.9;
      setTakeProfit(formatNumber(defaultTp, entry > 10 ? 2 : 4));
    }
  }, [direction, entryPrice]);

  // Derived Numbers
  const balance = Math.max(0, parseFloat(accountBalance) || 0);
  const entry = Math.max(0, parseFloat(entryPrice) || 0);
  const sl = Math.max(0, parseFloat(stopLoss) || 0);
  const tp = Math.max(0, parseFloat(takeProfit) || 0);

  // Validation
  const isInvalidSl = entry > 0 && sl > 0 && (direction === "long" ? sl >= entry : sl <= entry);

  const isInvalidTp = entry > 0 && tp > 0 && (direction === "long" ? tp <= entry : tp >= entry);

  // Risk Math
  const maxRiskAmount = balance * (riskPercent / 100);
  const priceRiskPerUnit = Math.abs(entry - sl);
  const priceRiskPercent = entry > 0 ? (priceRiskPerUnit / entry) * 100 : 0;

  // Position Size (Tokens / Units) = Max Risk ($) / Price Risk per Token ($)
  const positionSizeUnits = priceRiskPerUnit > 0 ? maxRiskAmount / priceRiskPerUnit : 0;

  // Position Value ($)
  const positionValueUSD = positionSizeUnits * entry;

  // Margin required with leverage
  const marginRequiredUSD = leverage > 0 ? positionValueUSD / leverage : positionValueUSD;

  // Profit Math
  const priceRewardPerUnit = Math.abs(tp - entry);
  const potentialProfitUSD = positionSizeUnits * priceRewardPerUnit;
  const potentialLossUSD = maxRiskAmount;

  // Risk Reward Ratio (R:R)
  const riskRewardRatio =
    priceRiskPerUnit > 0 && priceRewardPerUnit > 0 ? priceRewardPerUnit / priceRiskPerUnit : 0;

  // Quick Preset Handlers
  const handleSetSlPercent = (pct: number) => {
    if (!entry) return;
    const newSl = direction === "long" ? entry * (1 - pct / 100) : entry * (1 + pct / 100);
    setStopLoss(formatNumber(newSl, entry > 10 ? 2 : 4));
  };

  const handleSetTargetRr = (rrMultiplier: number) => {
    if (!entry || priceRiskPerUnit <= 0) return;
    const rewardDistance = priceRiskPerUnit * rrMultiplier;
    const newTp = direction === "long" ? entry + rewardDistance : entry - rewardDistance;
    setTakeProfit(formatNumber(newTp, entry > 10 ? 2 : 4));
  };

  const handleReset = () => {
    const cur = livePriceUSD || 65000;
    setEntryPrice(cur.toString());
    setStopLoss((cur * 0.95).toFixed(2));
    setTakeProfit((cur * 1.1).toFixed(2));
    setRiskPercent(1);
    setLeverage(1);
  };

  return (
    <div className="panel p-4 sm:p-5 space-y-5 bg-surface/90 border-border/80 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold font-mono text-foreground flex items-center gap-2">
              Position Size &amp; Risk/Reward Calculator
              <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
                PRO RISK TOOL
              </span>
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Calculate optimal trade sizing, capital at risk, and target R:R before entering
              trades.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="h-8 gap-1.5 font-mono text-xs border-border hover:bg-surface-2"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Inputs Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Trade Direction Toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs font-mono uppercase text-muted-foreground">
              Trade Position Type
            </Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-2/60 rounded-xl border border-border">
              <button
                onClick={() => setDirection("long")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                  direction === "long"
                    ? "bg-success text-success-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp className="h-4 w-4" /> LONG (BUY)
              </button>
              <button
                onClick={() => setDirection("short")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                  direction === "short"
                    ? "bg-danger text-danger-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingDown className="h-4 w-4" /> SHORT (SELL)
              </button>
            </div>
          </div>

          {/* Account Balance & Risk % Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-primary" /> Total Account Balance ($)
              </Label>
              <Input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                placeholder="e.g. 5000"
                className="font-mono text-sm bg-surface border-border"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Percent className="h-3.5 w-3.5 text-primary" /> Risk Per Trade
                </Label>
                <span className="font-mono text-xs font-bold text-primary">
                  {riskPercent}% (${maxRiskAmount.toFixed(2)})
                </span>
              </div>
              <Slider
                value={[riskPercent]}
                onValueChange={(vals) => setRiskPercent(vals[0])}
                min={0.25}
                max={10}
                step={0.25}
                className="py-2"
              />
              <div className="flex items-center justify-between gap-1 pt-0.5">
                {[0.5, 1, 2, 3, 5].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRiskPercent(pct)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                      riskPercent === pct
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-surface-2 text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Entry, Stop Loss & Take Profit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Entry Price */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                Entry Price ($)
              </Label>
              <Input
                type="number"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="Entry Price"
                className="font-mono text-sm bg-surface border-border font-bold"
              />
              <span className="text-[10px] font-mono text-muted-foreground block">
                Live {tokenSymbol}: ${formatNumber(livePriceUSD, livePriceUSD > 10 ? 2 : 4)}
              </span>
            </div>

            {/* Stop Loss Price */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-danger flex items-center gap-1 font-bold">
                Stop Loss ($)
              </Label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Stop Loss Price"
                className={`font-mono text-sm bg-surface font-bold ${
                  isInvalidSl ? "border-danger text-danger focus:ring-danger" : "border-border"
                }`}
              />
              {/* SL Presets */}
              <div className="flex items-center gap-1 pt-0.5">
                {[2, 5, 8, 10].map((slPct) => (
                  <button
                    key={slPct}
                    onClick={() => handleSetSlPercent(slPct)}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground border border-border hover:text-danger hover:border-danger/40 transition-colors"
                  >
                    -{slPct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Take Profit Price */}
            <div className="space-y-1.5">
              <Label className="text-xs font-mono text-success flex items-center gap-1 font-bold">
                Take Profit ($)
              </Label>
              <Input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Take Profit Price"
                className={`font-mono text-sm bg-surface font-bold ${
                  isInvalidTp ? "border-amber-500 text-amber-500" : "border-border"
                }`}
              />
              {/* R:R Presets */}
              <div className="flex items-center gap-1 pt-0.5">
                {[1, 2, 3].map((rrMult) => (
                  <button
                    key={rrMult}
                    onClick={() => handleSetTargetRr(rrMult)}
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-2 text-muted-foreground border border-border hover:text-success hover:border-success/40 transition-colors"
                  >
                    {rrMult}:1 R:R
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Leverage Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Leverage (x)
              </Label>
              <span className="font-mono text-xs font-bold text-amber-400">{leverage}x</span>
            </div>
            <Slider
              value={[leverage]}
              onValueChange={(vals) => setLeverage(vals[0])}
              min={1}
              max={50}
              step={1}
            />
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
              <span>Spot (1x)</span>
              <span>5x</span>
              <span>10x</span>
              <span>20x</span>
              <span>50x</span>
            </div>
          </div>
        </div>

        {/* Right Output Results Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 rounded-xl border border-border bg-surface-2/40 p-4">
          {/* Risk Evaluation Header Badge */}
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
              Risk Evaluation Analysis
            </div>

            {isInvalidSl ? (
              <div className="rounded-lg bg-danger/15 border border-danger/40 p-3 text-xs font-mono text-danger flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Invalid Stop Loss:</strong> For {direction.toUpperCase()} trades, Stop
                  Loss must be {direction === "long" ? "below" : "above"} entry price ($
                  {formatNumber(entry, 2)}).
                </div>
              </div>
            ) : riskRewardRatio >= 2.0 ? (
              <div className="rounded-lg bg-success/15 border border-success/40 p-3 text-xs font-mono text-success flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <div>
                  <strong className="text-sm block">
                    Excellent Risk / Reward Setup (1:{riskRewardRatio.toFixed(2)})
                  </strong>
                  High statistical edge for professional risk management.
                </div>
              </div>
            ) : riskRewardRatio >= 1.0 ? (
              <div className="rounded-lg bg-amber-500/15 border border-amber-500/40 p-3 text-xs font-mono text-amber-400 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <strong className="text-sm block">
                    Moderate Risk / Reward (1:{riskRewardRatio.toFixed(2)})
                  </strong>
                  Acceptable 1:1 setup, but consider tightening stop loss for better edge.
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-danger/15 border border-danger/40 p-3 text-xs font-mono text-danger flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <div>
                  <strong className="text-sm block">
                    Unfavorable Risk / Reward (1:{riskRewardRatio.toFixed(2)})
                  </strong>
                  Risk exceeds potential reward. Adjust target or entry point.
                </div>
              </div>
            )}
          </div>

          {/* Primary Calculated Metrics */}
          <div className="space-y-2.5 my-2">
            {/* Recommended Position Size */}
            <div className="rounded-lg bg-surface p-3 border border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                  Recommended Position Size
                </span>
                <span className="text-base sm:text-lg font-mono font-extrabold text-primary">
                  {formatNumber(positionSizeUnits, positionSizeUnits > 100 ? 2 : 4)} {tokenSymbol}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-muted-foreground block">
                  Total Notional Value
                </span>
                <span className="text-sm font-bold text-foreground">
                  ${formatCurrency(positionValueUSD)}
                </span>
              </div>
            </div>

            {/* Required Margin with Leverage */}
            {leverage > 1 && (
              <div className="rounded-lg bg-surface p-2.5 border border-amber-500/30 flex items-center justify-between font-mono text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Margin Needed ({leverage}x):
                </span>
                <span className="font-extrabold text-foreground">
                  ${formatCurrency(marginRequiredUSD)}
                </span>
              </div>
            )}

            {/* Potential Loss vs Profit Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-lg bg-danger/10 border border-danger/30 p-2.5 space-y-1">
                <span className="text-[10px] text-danger uppercase font-bold block">
                  Max Risk (Loss)
                </span>
                <span className="text-sm font-extrabold text-danger block">
                  -${formatCurrency(potentialLossUSD)}
                </span>
                <span className="text-[9px] text-muted-foreground block">
                  -{priceRiskPercent.toFixed(2)}% price Move
                </span>
              </div>

              <div className="rounded-lg bg-success/10 border border-success/30 p-2.5 space-y-1">
                <span className="text-[10px] text-success uppercase font-bold block">
                  Target Reward (Profit)
                </span>
                <span className="text-sm font-extrabold text-success block">
                  +${formatCurrency(potentialProfitUSD)}
                </span>
                <span className="text-[9px] text-muted-foreground block">
                  +{(priceRiskPercent * riskRewardRatio).toFixed(2)}% price Move
                </span>
              </div>
            </div>
          </div>

          {/* R:R Gauge Visual Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>Risk: $1.00</span>
              <span className="font-bold text-foreground">
                Risk-Reward Ratio: 1:{riskRewardRatio.toFixed(2)}
              </span>
              <span>Reward: ${riskRewardRatio.toFixed(2)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface overflow-hidden flex border border-border">
              <div className="h-full bg-danger" style={{ width: "33%" }} />
              <div
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${Math.min(67, 33 * riskRewardRatio)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
