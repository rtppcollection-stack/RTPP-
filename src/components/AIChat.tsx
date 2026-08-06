import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Loader2, Sparkles, Trash2, Cpu } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useWallet } from "@/lib/wallet";
import { useI18n } from "@/lib/i18n";

interface Msg {
  role: "user" | "assistant";
  content: string;
  isCached?: boolean;
}

const ADMIN_WALLET = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
const CLIENT_CACHE_KEY = "rtpp_chat_local_cache_v2";

const QUICK_PROMPTS_EN = [
  { label: "💡 About Platform", prompt: "Tell me about this platform and its features" },
  { label: "🛍️ Printful Merch", prompt: "How to order physical merch with RTPP or crypto?" },
  { label: "🔥 Token Contract", prompt: "Tell me about RTPP Token and Base Pool address" },
  { label: "⚡ DEX Swap Fees", prompt: "How do DEX Swaps and fee routing work?" },
  { label: "🔒 Security Advice", prompt: "How to safely connect my wallet and stay secure?" },
  { label: "📊 P2P Calculator", prompt: "How does the P2P profit calculator work?" },
];

const QUICK_PROMPTS_MY = [
  { label: "💡 ဒီ Web အကြောင်း", prompt: "ဒီ web အကြောင်းရှင်းပြပေးပါ" },
  {
    label: "🛍️ Merch မှာယူမှု",
    prompt: "အင်္ကျီနှင့် ပစ္စည်းများ Crypto ဖြင့် မည်သို့မှာယူရမည်နည်း?",
  },
  { label: "🔥 RTPP Token", prompt: "RTPP Token address နှင့် Base Pool အကြောင်းပြောပြပါ" },
  { label: "⚡ DEX Swap Fees", prompt: "DEX Swap ဖြင့် token မည်သို့လဲလှယ်ရမည်နည်း?" },
  {
    label: "🔒 လုံခြုံရေး အကြံပြုချက်",
    prompt: "Wallet ချိတ်ဆက်ရာတွင် မည်သို့လုံခြုံအောင်နေရမည်နည်း?",
  },
  { label: "📊 P2P Calculator", prompt: "P2P အရှုံး/အမြတ် တွက်ချက်နည်း ရှင်းပြပါ" },
];

export function AIChat() {
  const { address } = useWallet();
  const { lang } = useI18n();
  const isBurmese = lang === "my";
  const quickPrompts = isBurmese ? QUICK_PROMPTS_MY : QUICK_PROMPTS_EN;

  const [open, setOpen] = useState(false);
  const [isAdminMode] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const isOwnerWallet = (address || "").toLowerCase() === ADMIN_WALLET.toLowerCase();
  const activeIsAdmin = isOwnerWallet || isAdminMode;

  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      role: "assistant",
      content: activeIsAdmin
        ? "👨‍💻 **RTPP Master Admin AI Support:**\n\nFull administrative mode active. Ask about fee routing, Printful webhook status, smart contracts, or system configuration."
        : isBurmese
          ? "Hello! 👋 ကျွန်တော်ကတော့ **RTPP 24/7 ဖောက်သည်ဝန်ဆောင်မှု AI** ဖြစ်ပါတယ်။\n\nRTPP Web Platform ဝန်ဆောင်မှုများနှင့် ပတ်သက်၍ လွတ်လပ်စွာ မေးမြန်းနိုင်ပါတယ်:\n• 🛍️ **Printful NFT Merch Store** (Crypto ဖြင့် အင်္ကျီ၊ ခွက်များ မှာယူခြင်း)\n• ⚡ **DEX Swap & Bridge** (EVM ၅ လိုင်းစလုံးတွင် 0.30% Fee routing)\n• 🔥 **RTPP Token & Base Pool** (`0x90f0712...` Base Network)\n• 🎨 **Free NFT Marketplace** (100% Free Lazy Minting)\n• 📊 **P2P Profit/Loss Calculator** (USD/MMK တွက်ချက်မှု)\n• 🔒 **Wallet Security & Safety** (လုံခြုံစိတ်ချရသော စနစ်)\n\n*🔒 မှတ်ချက်: RTPP Support သည် သင့် Private Key သို့မဟုတ် Seed Phrase ကို မည်သည့်အခါမျှ တောင်းဆိုမည်မဟုတ်ပါ!*"
          : "Hello! 👋 I am **RTPP 24/7 Customer Support AI**.\n\nI am here to help you navigate and answer any questions about our Web3 platform:\n• 🛍️ **Printful Merch Store** (Order physical apparel with RTPP, ETH, USDT)\n• ⚡ **DEX Swap & Bridge** (Multi-chain swaps with transparent 0.30% fee routing)\n• 🔥 **RTPP Token & Base Pool** (Base contract `0x90f0712eddc...`)\n• 🎨 **NFT Marketplace** (100% Free gasless Lazy Minting)\n• 📊 **P2P Calculator** (PnL, target exit & fee math in USD & MMK)\n• 🔒 **Wallet Safety & Non-Custodial Security**\n\n*🔒 Note: RTPP Support will NEVER ask for your private key or seed phrase!*",
    },
  ]);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          role: "assistant",
          content: activeIsAdmin
            ? "👨‍💻 **RTPP Master Admin AI Support:**\n\nFull administrative mode active. Ask about fee routing, Printful webhook status, smart contracts, or system configuration."
            : isBurmese
              ? "Hello! 👋 ကျွန်တော်ကတော့ **RTPP 24/7 ဖောက်သည်ဝန်ဆောင်မှု AI** ဖြစ်ပါတယ်။\n\nRTPP Web Platform ဝန်ဆောင်မှုများနှင့် ပတ်သက်၍ လွတ်လပ်စွာ မေးမြန်းနိုင်ပါတယ်:\n• 🛍️ **Printful NFT Merch Store** (Crypto ဖြင့် အင်္ကျီ၊ ခွက်များ မှာယူခြင်း)\n• ⚡ **DEX Swap & Bridge** (EVM ၅ လိုင်းစလုံးတွင် 0.30% Fee routing)\n• 🔥 **RTPP Token & Base Pool** (`0x90f0712...` Base Network)\n• 🎨 **Free NFT Marketplace** (100% Free Lazy Minting)\n• 📊 **P2P Profit/Loss Calculator** (USD/MMK တွက်ချက်မှု)\n• 🔒 **Wallet Security & Safety** (လုံခြုံစိတ်ချရသော စနစ်)\n\n*🔒 မှတ်ချက်: RTPP Support သည် သင့် Private Key သို့မဟုတ် Seed Phrase ကို မည်သည့်အခါမျှ တောင်းဆိုမည်မဟုတ်ပါ!*"
              : "Hello! 👋 I am **RTPP 24/7 Customer Support AI**.\n\nI am here to help you navigate and answer any questions about our Web3 platform:\n• 🛍️ **Printful Merch Store** (Order physical apparel with RTPP, ETH, USDT)\n• ⚡ **DEX Swap & Bridge** (Multi-chain swaps with transparent 0.30% fee routing)\n• 🔥 **RTPP Token & Base Pool** (Base contract `0x90f0712eddc...`)\n• 🎨 **NFT Marketplace** (100% Free gasless Lazy Minting)\n• 📊 **P2P Calculator** (PnL, target exit & fee math in USD & MMK)\n• 🔒 **Wallet Safety & Non-Custodial Security**\n\n*🔒 Note: RTPP Support will NEVER ask for your private key or seed phrase!*",
        },
      ]);
    }
  }, [isBurmese, activeIsAdmin]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  // Read / Write Client Cache
  const getClientCache = (): Record<string, string> => {
    try {
      const raw = localStorage.getItem(CLIENT_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const saveClientCache = (q: string, reply: string) => {
    try {
      const cache = getClientCache();
      cache[q.toLowerCase().trim()] = reply;
      localStorage.setItem(CLIENT_CACHE_KEY, JSON.stringify(cache));
    } catch {
      /* fallback */
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(CLIENT_CACHE_KEY);
      setMessages([
        {
          role: "assistant",
          content: "🧹 **Local Chat Cache Cleared!** You can now ask fresh questions.",
        },
      ]);
    } catch {
      /* fallback */
    }
  };

  const sendQuery = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || busy) return;

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    const normQ = text.toLowerCase().trim();
    const cacheStore = getClientCache();

    // 1. Instant Client Cache Hit
    if (cacheStore[normQ]) {
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: cacheStore[normQ], isCached: true },
        ]);
        setBusy(false);
      }, 100);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m.content),
          isAdmin: activeIsAdmin,
          walletAddress: address,
          lang,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as { reply?: string; fromCache?: boolean };
        if (data.reply) {
          saveClientCache(normQ, data.reply);
          setMessages((m) => [
            ...m,
            { role: "assistant", content: data.reply!, isCached: !!data.fromCache },
          ]);
          return;
        }
      }

      // 2. Client-side Local Brain Fallback Response
      let reply = "";
      if (
        !activeIsAdmin &&
        (normQ.includes("code") ||
          normQ.includes("source") ||
          normQ.includes("key") ||
          normQ.includes("secret") ||
          normQ.includes("backend") ||
          normQ.includes("database"))
      ) {
        reply =
          isBurmese || /[\u1000-\u109F]/.test(normQ)
            ? "🔒 **လုံခြုံရေး သတိပေးချက်:**\n\nစနစ်၏ သော့ချက်များနှင့် မူရင်း Code များကို အုပ်ချုပ်သူ Admin သာ ကြည့်ရှုခွင့်ရှိပါသည်။ အခြား DEX Swaps, P2P Calculator, NFT Minting သို့မဟုတ် ဈေးနှုန်းများကို မေးမြန်းနိုင်ပါသည်။"
            : "🔒 **Security Notice:**\n\nSystem source code, database architecture, and backend secrets are restricted to RTPP Administrators. Please feel free to ask about DEX Swaps, P2P Calculator, NFT Minting, or live token charts.";
      } else if (
        normQ.includes("about") ||
        normQ.includes("platform") ||
        normQ.includes("features") ||
        normQ.includes("free") ||
        normQ.includes("မင်္ဂလာပါ") ||
        normQ.includes("ဒီ web") ||
        normQ.includes("အကြောင်း") ||
        normQ.includes("အခမဲ့")
      ) {
        reply =
          isBurmese || /[\u1000-\u109F]/.test(normQ)
            ? `💡 **RTPP Web Platform အကြောင်း (၁၀၀% အခမဲ့ AI လမ်းညွှန်):**\n\nဤ Web App တွင် အောက်ပါ Feature များကို အခမဲ့ အသုံးပြုနိုင်ပါသည် -\n\n1. ⚡ **DEX Swap & Bridge:** EVM ၅ လိုင်းစလုံးတွင် Token ချိန်းနိုင်ခြင်း။\n2. 🔥 **RTPP Token & Live Chart:** Base Pool \`0xc59d51cbb...\` ဖြင့် GeckoTerminal တိုက်ရိုက် Live ဇယားကြည့်နိုင်ခြင်း။\n3. 🎨 **Free NFT Lazy Minting:** Gas Fee လုံးဝ မကုန်ဘဲ NFT ရောင်းရန် တိုက်ရိုက် Lazy Mint လုပ်နိုင်ခြင်း။\n4. 📊 **P2P Profit/Loss Calculator:** P2P ကုန်သွယ်မှုတွင် မြတ်/ရှုံး ရာခိုင်နှုန်းနှင့် အကျိုးအမြတ် တွက်ချက်နိုင်ခြင်း။\n5. 🐋 **Whale Alert Radar:** Live Mempool နှင့် DEX ငွေလွှဲမှုများကို Block Explorer တွင် တိုက်ရိုက် စစ်ဆေးနိုင်ခြင်း။`
            : `💡 **About RTPP Web Platform:**\n\nThis platform provides 100% free Web3 & crypto tools:\n\n1. ⚡ **DEX Swap & Bridge:** Swap tokens across 5 EVM chains with 0.30% fee routing.\n2. 🔥 **RTPP Token & Live Chart:** Real-time GeckoTerminal candlestick charts for Base pool \`0xc59d...\`.\n3. 🎨 **Free NFT Lazy Minting:** Gasless 0-upfront NFT minting and marketplace listing.\n4. 📊 **P2P Profit/Loss Calculator:** Calculate ROI, breakeven, exit targets, and exchange fees.\n5. 🐋 **Whale Alert Radar:** Track live Bitcoin mempool and DEX transactions.`;
      } else if (
        normQ.includes("rtpp") ||
        normQ.includes("token") ||
        normQ.includes("pool") ||
        normQ.includes("geckoterminal")
      ) {
        reply = `🔥 **RTPP Token & Base Pool:**\n\n• **Token Contract:** \`0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8\`\n• **GeckoTerminal Base Pool:** \`0xc59d51cbb9dc36d28315c0f75054ebcf5ad301304640a3d1bd3cbe746f7082aa\` (rtpp / ZORA pair)\n• **Charts:** Real-time embedded GeckoTerminal candlestick charts!`;
      } else if (
        normQ.includes("swap") ||
        normQ.includes("dex") ||
        normQ.includes("bridge") ||
        normQ.includes("fee")
      ) {
        reply = `⚡ **RTPP Multi-Chain DEX Swap & Bridge:**\n\n• **Chains:** Ethereum, Base, Arbitrum, Polygon, BSC.\n• **Fee:** Automated transparent 0.30% platform fee routed to Admin Treasury Wallet (\`${ADMIN_WALLET}\`).`;
      } else if (normQ.includes("nft") || normQ.includes("mint") || normQ.includes("gallery")) {
        reply = `🎨 **NFT Marketplace & Free Lazy Minting:**\n\n• **0 Gas Upfront:** Mint & list your digital artwork 100% free with gasless Lazy Minting!\n• **Royalties:** Creators earn 99% of sale proceeds; 1% platform fee is routed to Admin Treasury.`;
      } else if (normQ.includes("whale") || normQ.includes("mempool") || normQ.includes("radar")) {
        reply = `🐋 **Whale Radar & Inspector:**\n\n• Real-time Bitcoin Mempool.space and DexScreener live transaction streaming.\n• Direct multi-chain block explorer verification for any address or tx hash.`;
      } else if (normQ.includes("p2p") || normQ.includes("pnl") || normQ.includes("profit")) {
        reply = `📊 **P2P Profit/Loss Calculator:**\n\n• Calculates net profit, ROI %, target exit sell price, breakeven threshold, and exchange fee deductions in USD and local currencies (MMK).`;
      } else {
        reply = `🤖 **RTPP AI Assistant:**\n\nI can assist you with:\n1. ⚡ **DEX Swaps & Cross-Chain Bridges**\n2. 🔥 **RTPP Token & GeckoTerminal Charts**\n3. 🎨 **Free NFT Lazy Minting & Marketplace**\n4. 🐋 **Whale Radar & Block Explorer Inspector**\n5. 📊 **P2P Profit & Loss Calculator**\n6. ⛽ **Network Gas Tracker (5 EVM Chains)**`;
      }

      saveClientCache(normQ, reply);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "⚡ **RTPP Assistant:** All DEX swap, P2P calculation, GeckoTerminal live charts, and free NFT minting tools are active!",
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
            {activeIsAdmin ? "RTPP Admin AI" : isBurmese ? "RTPP Support AI" : "RTPP Support AI"}
          </span>
          <Bot className="h-4 w-4 sm:hidden" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,420px)] h-[min(84vh,620px)] flex flex-col overflow-hidden rounded-xl border border-primary/30 bg-background/95 backdrop-blur-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-surface/80 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full ${
                  activeIsAdmin ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                }`}
              >
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  {isBurmese ? "RTPP 24/7 Support AI" : "RTPP 24/7 Support AI"}
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    <Sparkles className="h-2.5 w-2.5 text-amber-400" /> Online
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {activeIsAdmin
                    ? "Master Admin Support Active"
                    : isBurmese
                      ? "24/7 ဖောက်သည်ဝန်ဆောင်မှု"
                      : "Official Web3 Customer Support"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearCache}
                title="Clear local chat cache"
                className="text-muted-foreground hover:text-destructive p-1 rounded transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-surface-2/60 border-b border-border/40 scrollbar-none">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => sendQuery(qp.prompt)}
                disabled={busy}
                className="shrink-0 px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-surface border border-border/70 hover:bg-primary/10 hover:border-primary/40 text-foreground transition"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages */}
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
                  <div className="max-w-[95%] text-xs sm:text-sm text-foreground prose prose-sm prose-invert prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:text-primary max-w-none relative group">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Thinking…
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="border-t border-border/60 bg-surface/50 p-2 space-y-1">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendQuery(input);
                  }
                }}
                rows={1}
                placeholder={
                  activeIsAdmin
                    ? "Ask about codebase, fee engine, netlify setup..."
                    : isBurmese
                      ? "ဒီ web အကြောင်း သို့မဟုတ် မေးချင်ရာမေးပါ..."
                      : "Ask anything about RTPP DEX, NFT, Calculator..."
                }
                disabled={busy}
                className="flex-1 resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendQuery(input)}
                disabled={busy || !input.trim()}
                className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="text-[9px] text-muted-foreground text-center font-mono">
              ⚡ Powered by RTPP Web Platform AI
            </div>
          </div>
        </div>
      )}
    </>
  );
}
