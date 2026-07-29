import React, { useState } from "react";
import {
  Activity,
  ShieldCheck,
  RefreshCw,
  Terminal,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "SECURITY" | "RPC";
  source: string;
  message: string;
  status: "NORMAL" | "AUDITED" | "FLAGGED";
}

const INITIAL_LOGS: LogEntry[] = [
  {
    id: "log-1",
    timestamp: new Date().toISOString(),
    level: "INFO",
    source: "Supabase Auth",
    message: "User session verified. Role authorization passed for Monitor access.",
    status: "NORMAL",
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 120000).toISOString(),
    level: "RPC",
    source: "DEX Aggregator Proxy",
    message: "Base chain swap route liquidity quote returned in 42ms. Slippage set to 0.5%.",
    status: "NORMAL",
  },
  {
    id: "log-3",
    timestamp: new Date(Date.now() - 360000).toISOString(),
    level: "SECURITY",
    source: "TanStack Route Guard",
    message: "Blocked unauthenticated attempt to access /admin portal. User redirected to root.",
    status: "AUDITED",
  },
  {
    id: "log-4",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: "WARN",
    source: "CoinGecko API Gateway",
    message: "Rate-limit threshold reached for public endpoint; fallback cache utilized.",
    status: "NORMAL",
  },
  {
    id: "log-5",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    level: "INFO",
    source: "NFT Mint Contract",
    message: "EIP-712 Gasless signature verified for minting transaction on Zora chain.",
    status: "AUDITED",
  },
];

export function MonitorLogsPanel() {
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [filter, setFilter] = useState<string>("ALL");

  const handleRefresh = () => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: "INFO",
      source: "Health Ping",
      message: `Telemetry poll complete. System load: 12%, Latency: 18ms.`,
      status: "NORMAL",
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const filtered = filter === "ALL" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cyan-500/30 bg-surface/80 p-6 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                System Monitor &amp; Audit Logs
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  Monitor Mode (Read-Only)
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Live telemetry, RPC latency logs, authorization audit trails, and security alerts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-1.5 text-xs font-mono"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
            </Button>
          </div>
        </div>

        {/* System Health Summary Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              System Uptime
            </div>
            <div className="text-base font-black text-success flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4" /> 99.98%
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              RPC Latency
            </div>
            <div className="text-base font-black text-foreground font-mono">24 ms</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Role Mode
            </div>
            <div className="text-base font-black text-cyan-400 font-mono">READ-ONLY</div>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Blocked Violations
            </div>
            <div className="text-base font-black text-amber-400 font-mono">0 Pending</div>
          </div>
        </div>

        {/* Log Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="font-semibold text-muted-foreground">Filter Level:</span>
          {["ALL", "INFO", "RPC", "SECURITY", "WARN"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-2.5 py-1 rounded-md font-mono text-xs font-bold transition ${
                filter === lvl
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "bg-surface/90 text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Log Terminal Display */}
        <div className="rounded-xl border border-border/80 bg-black/95 p-4 font-mono text-xs space-y-2.5 overflow-x-auto max-h-[420px] overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span>LIVE AUDIT TELEMETRY STREAM</span>
            </div>
            <span>STRICTLY READ-ONLY LOGS</span>
          </div>

          {filtered.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 text-zinc-300 leading-relaxed border-b border-zinc-900/60 pb-2"
            >
              <span className="text-zinc-500 shrink-0 text-[10px]">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                  log.level === "SECURITY"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : log.level === "WARN"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : log.level === "RPC"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                }`}
              >
                [{log.level}]
              </span>
              <span className="text-cyan-300 font-bold shrink-0">[{log.source}]</span>
              <span className="flex-1 text-zinc-200">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
