import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Loader2, Sparkles, ShieldAlert, ShieldCheck } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useWallet } from "@/lib/wallet";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const ADMIN_WALLET = "0x752f726410B3e276DAE704B6E4671C50ea199798";

export function AIChat() {
  const { address } = useWallet();
  const [open, setOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const isOwnerWallet = (address || "").toLowerCase() === ADMIN_WALLET.toLowerCase();
  const activeIsAdmin = isOwnerWallet || isAdminMode;

  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: activeIsAdmin
        ? "👨‍💻 **RTPP Admin AI Brain Active:**\n\nFull administrative mode enabled. Ask me anything about the system architecture, file structure, on-chain DEX fee collection, Netlify deployment setup, or database schemas."
        : "မင်္ဂလာပါ! 👋 I'm **RTPP Trading Assistant**.\n\nAsk me about crypto prices, P2P profit calculations, multi-chain DEX swaps, or NFT marketplace guides!",
    },
  ]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m.content),
          isAdmin: activeIsAdmin,
          walletAddress: address,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { reply?: string; error?: string };
        if (data.reply) {
          setMessages((m) => [...m, { role: "assistant", content: data.reply! }]);
          return;
        }
      }

      // Static export or fallback response
      const query = text.toLowerCase();
      let reply = "";

      if (
        !activeIsAdmin &&
        (query.includes("code") ||
          query.includes("source") ||
          query.includes("key") ||
          query.includes("secret") ||
          query.includes("admin"))
      ) {
        reply =
          "🔒 **Security Notice:**\n\nSystem source code, database architecture, and backend secrets are restricted to RTPP Administrators.";
      } else if (activeIsAdmin) {
        reply = `👨‍💻 **[RTPP Admin Architecture Reply]:**\n\n• **DEX On-Chain Fee Engine:** \`DEXWidget.tsx\` & \`wallet.tsx\` automatically route a 0.30% fee to \`${ADMIN_WALLET}\` before performing swaps.\n• **Netlify Deploy Setup:** \`/netlify.toml\` handles single page app routing with \`npm run build\` and wildcard \`/*\` redirects.\n• **NFT Marketplace:** \`NFTGallery.tsx\` handles Supabase persistence with non-custodial payouts.`;
      } else {
        reply = `🤖 **RTPP Assistant:**\n\nI received your question about *"${text}"*.\n\nCheck out our live charts, P2P profit/loss calculator, and DEX swap tools directly on the dashboard!`;
      }

      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: activeIsAdmin
            ? "⚡ **RTPP Master Admin Brain:** Complete codebase, DEX gas fee configurations, and Netlify deploy settings are optimized."
            : "⚡ **RTPP Assistant:** All DEX swap, P2P calculation, and market price tools are active!",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI chat"
          className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-[0_10px_40px_-10px_rgba(20,184,166,0.7)] hover:bg-primary/90 transition"
        >
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold hidden sm:inline">
            {activeIsAdmin ? "RTPP Admin AI" : "Ask RTPP AI"}
          </span>
          <Bot className="h-4 w-4 sm:hidden" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,400px)] h-[min(82vh,580px)] flex flex-col overflow-hidden rounded-xl border border-primary/30 bg-background/95 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/60 bg-surface/70 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full ${activeIsAdmin ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}
              >
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  RTPP AI Assistant
                  {activeIsAdmin ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.2 rounded border border-accent/20">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground bg-surface-2 px-1.5 py-0.2 rounded">
                      <ShieldAlert className="h-3 w-3" /> Secure
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {activeIsAdmin
                    ? "Full Project Architecture Access"
                    : "End User Restricted Assistant"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isOwnerWallet && (
                <button
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    isAdminMode
                      ? "bg-accent/20 text-accent border-accent/40 font-bold"
                      : "text-muted-foreground border-border hover:text-foreground"
                  }`}
                  title="Toggle Admin Explanation Mode"
                >
                  {isAdminMode ? "Admin Mode On" : "Admin Mode"}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground whitespace-pre-wrap font-medium">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[92%] text-xs sm:text-sm text-foreground prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-primary max-w-none">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking…
              </div>
            )}
          </div>

          <div className="border-t border-border/60 bg-surface/50 p-2 space-y-1">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={
                  activeIsAdmin
                    ? "Ask about codebase, files, fee engine, netlify setup..."
                    : "Ask crypto prices, P2P math, DEX swaps..."
                }
                disabled={busy}
                className="flex-1 resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={send}
                disabled={busy || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
