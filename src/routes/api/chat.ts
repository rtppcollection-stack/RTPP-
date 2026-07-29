import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const ADMIN_WALLET = "0x752f726410B3e276DAE704B6E4671C50ea199798";
const COMMUNITY_TOKEN = "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8";
const BASE_POOL_ADDRESS = "0xc59d51cbb9dc36d28315c0f75054ebcf5ad301304640a3d1bd3cbe746f7082aa";

// Server-side Response Cache (Fast Memory Storage)
const SERVER_CHAT_CACHE = new Map<string, { reply: string; cachedAt: number }>();

const INTERNATIONAL_USER_SYSTEM_PROMPT = `You are RTPP Global AI Assistant — the official intelligent assistant for the RTPP Crypto Dashboard, DEX Swap, and Web3 Platform.

You support English and Burmese (မြန်မာဘာသာ).

COMPREHENSIVE WEB PLATFORM CAPABILITIES YOU CAN EXPLAIN:
1. **RTPP Community Token & Base Pool**:
   - Contract: ${COMMUNITY_TOKEN}
   - GeckoTerminal Base Pool: ${BASE_POOL_ADDRESS} (rtpp / ZORA pair on Base DEX)
   - Real-time live chart powered by GeckoTerminal and CoinGecko.

2. **DEX Swap & Cross-Chain Bridge**:
   - Non-custodial swaps across 5 EVM chains: Ethereum (0x1), Base (0x2105), Arbitrum (0xa4b1), Polygon (0x89), and BSC (0x38).
   - Automated 0.30% platform routing fee directed to Admin Treasury Wallet (${ADMIN_WALLET}).
   - Direct liquidity connection with Uniswap V3 & PancakeSwap.

3. **NFT Marketplace & Free Lazy Minting**:
   - 100% Free Listing & Gasless Lazy Minting (0 upfront gas fees).
   - 1% marketplace royalty to Admin Wallet (${ADMIN_WALLET}), 99% directly to seller/creator.

4. **Whale Alert Radar & On-Chain Inspector**:
   - Real-time Bitcoin Mempool.space transaction streaming.
   - Live DEX trading volume tracking via DexScreener & GeckoTerminal.
   - On-chain inspector verifying address/tx on Etherscan, Basescan, Mempool.space, Solscan.

5. **P2P Profit/Loss & Margin Calculator**:
   - PnL engine: calculates net profit, ROI %, exit target price, breakeven, exchange fee deductions in USD and MMK.

6. **Market Analytics & Live Gas Tracker**:
   - CoinGecko + GeckoTerminal live price tracking + TradingView Pro candlestick charts.
   - Live Gwei network status across 5 EVM chains.

SECURITY & PRIVACY RULES:
- Provide accurate, concise answers.
- If asked in Burmese, respond in friendly, helpful Burmese.
- If regular users ask for backend database secrets, politely state: "🔒 Access restricted. Codebase & system settings are reserved for RTPP Administrators."`;

const INTERNATIONAL_ADMIN_SYSTEM_PROMPT = `You are RTPP Master AI Admin — full-system architectural assistant for RTPP Platform Administrators.

ADMIN PRIVILEGES & COMPLETE WEB PLATFORM OVERVIEW:
1. **On-Chain Fee Engine (\`/src/components/DEXWidget.tsx\` & \`/src/lib/wallet.tsx\`)**:
   - 0.30% platform fee auto-routed to \`${ADMIN_WALLET}\`.
2. **NFT Marketplace (\`/src/components/NFTGallery.tsx\`)**:
   - Lazy minting with 1% platform commission auto-routed to \`${ADMIN_WALLET}\`.
3. **Deployment Setup (\`/netlify.toml\` & \`/package.json\`)**:
   - Netlify production configuration with wildcard \`/*\` redirects.

Respond with high technical precision.`;

/** Local Rule Engine for instant zero-latency responses */
function getLocalBrainResponse(userMessage: string, isAdmin: boolean): string | null {
  const q = userMessage.toLowerCase().trim();
  if (!q) return null;

  // Security check for non-admin
  if (!isAdmin) {
    if (
      q.includes("code") ||
      q.includes("source") ||
      q.includes("secret") ||
      q.includes("key") ||
      q.includes("backend") ||
      q.includes("database")
    ) {
      return `🔒 **Security Notice / လုံခြုံရေး သတိပေးချက်:**\n\nSystem source code, database architecture, and backend secrets are restricted to RTPP Administrators.\n\nစနစ်၏ သော့ချက်များနှင့် မူရင်း Code များကို အုပ်ချုပ်သူ Admin သာ ကြည့်ရှုခွင့်ရှိပါသည်။ အခြား DEX Swaps, P2P Calculator, NFT Minting သို့မဟုတ် ဈေးနှုန်းများကို မေးမြန်းနိုင်ပါသည်။`;
    }
  }

  // Admin query
  if (isAdmin) {
    if (
      q.includes("admin") ||
      q.includes("architecture") ||
      q.includes("system") ||
      q.includes("deploy")
    ) {
      return `👨‍💻 **[RTPP Master Admin Assistant]**\n\nAuthenticated Admin Wallet: \`${ADMIN_WALLET}\`\n\n• **On-Chain Fee Engine:** 0.30% platform fee routed in \`DEXWidget.tsx\` & \`wallet.tsx\`.\n• **NFT Royalties:** 1% marketplace fee auto-routed in \`NFTGallery.tsx\`.\n• **Netlify Deploy Setup:** Configured in \`/netlify.toml\` with wildcard \`/*\` redirects.`;
    }
  }

  // Burmese Queries / မြန်မာစာ မေးခွန်းများ
  if (
    q.includes("မင်္ဂလာပါ") ||
    q.includes("ဒီ web") ||
    q.includes("အကြောင်း") ||
    q.includes("ဘယ်လို") ||
    q.includes("လုပ်") ||
    q.includes("အခမဲ့") ||
    q.includes("သုံး")
  ) {
    return `💡 **RTPP Web Platform အကြောင်း (AI လမ်းညွှန်):**\n\nဤ Web App တွင် အောက်ပါ Feature များကို အသုံးပြုနိုင်ပါသည် -\n\n1. ⚡ **DEX Swap & Bridge:** Ethereum, Base, Arbitrum, Polygon, BSC ၅ လိုင်းစလုံးတွင် Token ချိန်းနိုင်ခြင်း။\n2. 🔥 **RTPP Token & Live Chart:** Base Network Pool (\`${BASE_POOL_ADDRESS}\`) ဖြင့် GeckoTerminal တိုက်ရိုက် Live ဇယားကြည့်နိုင်ခြင်း။\n3. 🎨 **Free NFT Lazy Minting:** Gas Fee လုံးဝ မကုန်ဘဲ NFT ရောင်းရန် တိုက်ရိုက် Lazy Mint လုပ်နိုင်ခြင်း။\n4. 📊 **P2P Profit/Loss Calculator:** P2P ကုန်သွယ်မှုတွင် မြတ်/ရှုံး ရာခိုင်နှုန်းနှင့် အကျိုးအမြတ် တွက်ချက်နိုင်ခြင်း။\n5. 🐋 **Whale Alert Radar:** Live Bitcoin Mempool နှင့် DEX ငွေလွှဲမှုများကို Block Explorer တွင် တိုက်ရိုက် စစ်ဆေးနိုင်ခြင်း။\n\n*လိုရာမေးခွန်းကို မြန်မာလို သို့မဟုတ် အင်္ဂလိပ်လို လွတ်လပ်စွာ မေးမြန်းနိုင်ပါသည်!*`;
  }

  // RTPP Token & Pool
  if (
    q.includes("rtpp") ||
    q.includes("token") ||
    q.includes("pool") ||
    q.includes("geckoterminal") ||
    q.includes("contract") ||
    q.includes("address") ||
    q.includes("0x90f0") ||
    q.includes("0xc59d")
  ) {
    return `🔥 **RTPP Community Token & Live Base Pool:**\n\n• **Token Contract:** \`${COMMUNITY_TOKEN}\`\n• **GeckoTerminal Base Pool:** \`${BASE_POOL_ADDRESS}\` (rtpp / ZORA Pair)\n• **Features:** Pre-loaded into the DEX Swap terminal & Market Search. Live trading pair charts integrated directly via GeckoTerminal & CoinGecko!`;
  }

  // DEX & Bridge
  if (
    q.includes("swap") ||
    q.includes("dex") ||
    q.includes("bridge") ||
    q.includes("fee") ||
    q.includes("chain")
  ) {
    return `⚡ **RTPP Multi-Chain DEX Swap & Bridge:**\n\n• **Supported Chains:** Ethereum (0x1), Base (0x2105), Arbitrum (0xa4b1), Polygon (0x89), BSC (0x38).\n• **Fee Structure:** Automated transparent 0.30% platform routing fee sent directly to Admin Treasury Wallet (\`${ADMIN_WALLET}\`).\n• **Liquidity:** Directly routes through Uniswap V3 & PancakeSwap for optimal gas rates.`;
  }

  // NFT Marketplace
  if (q.includes("nft") || q.includes("mint") || q.includes("gallery") || q.includes("artwork")) {
    return `🎨 **RTPP NFT Marketplace & Free Lazy Minting:**\n\n• **0 Gas Upfront:** Mint & list your digital artwork 100% free with gasless Lazy Minting!\n• **Royalties:** Creators earn 99% of sale proceeds; 1% platform commission is routed to Admin Treasury Wallet.`;
  }

  // Whale Radar & Inspector
  if (
    q.includes("whale") ||
    q.includes("mempool") ||
    q.includes("radar") ||
    q.includes("inspector") ||
    q.includes("transaction") ||
    q.includes("tx")
  ) {
    return `🐋 **Whale Alert Radar & On-Chain Inspector:**\n\n• **Live Streaming:** Real-time Bitcoin unconfirmed mempool transactions via Mempool.space + DexScreener DEX pairs.\n• **Tx Inspector:** Paste any EVM address/hash, Bitcoin address, or Solana account to verify on Etherscan, Basescan, BscScan, Mempool.space, or Solscan.`;
  }

  // P2P Calculator
  if (
    q.includes("p2p") ||
    q.includes("pnl") ||
    q.includes("profit") ||
    q.includes("loss") ||
    q.includes("calculator") ||
    q.includes("margin")
  ) {
    return `📊 **P2P Profit/Loss & Margin Calculator:**\n\n• **Order Book Math:** Calculates net profit, gross ROI %, target exit sell price, breakeven threshold, and exchange maker/taker fee deductions.\n• **Currency:** Real-time FX conversion in USD and local currencies (MMK).`;
  }

  // Price & Market
  if (q.includes("price") || q.includes("market") || q.includes("chart") || q.includes("view")) {
    return `📈 **Live Market Analytics & Charts:**\n\n• **Live Market Data:** Real-time price tracking powered by CoinGecko API & GeckoTerminal.\n• **Dual Chart Modes:** Recharts volume area summary + TradingView Pro candlestick technical terminal.`;
  }

  // Default Assistant Response
  return `🤖 **RTPP AI Assistant:**\n\nI can answer any questions about the RTPP Platform:\n\n1. ⚡ **DEX Swap & Bridge:** Multi-chain non-custodial swaps with 0.30% auto fee routing.\n2. 🔥 **RTPP Token & GeckoTerminal:** Live Base pool \`${BASE_POOL_ADDRESS}\`.\n3. 🎨 **NFT Marketplace:** Free lazy minting with 0 upfront gas fees.\n4. 📊 **P2P Calculator:** PnL, target exit, breakeven & exchange fee math.\n5. 🐋 **Whale Radar:** Mempool.space & DexScreener live transaction inspector.\n6. ⛽ **Gas Tracker:** Live Gwei monitoring across 5 EVM chains.\n\n*How can I help you today?*`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            messages?: ChatMessage[];
            isAdmin?: boolean;
            walletAddress?: string;
          };
          const messages = Array.isArray(body.messages) ? body.messages : [];
          if (messages.length === 0) {
            return new Response(JSON.stringify({ error: "No messages" }), { status: 400 });
          }

          const wallet = (body.walletAddress || "").toLowerCase();
          const isAdmin = body.isAdmin || wallet === ADMIN_WALLET.toLowerCase();
          const systemPrompt = isAdmin
            ? INTERNATIONAL_ADMIN_SYSTEM_PROMPT
            : INTERNATIONAL_USER_SYSTEM_PROMPT;

          const lastMsg = messages[messages.length - 1]?.content || "";
          const cacheKey = `${isAdmin ? "admin" : "user"}:${lastMsg.trim().toLowerCase()}`;

          // 1. Check Server Memory Cache
          const cached = SERVER_CHAT_CACHE.get(cacheKey);
          if (cached && Date.now() - cached.cachedAt < 1000 * 60 * 60 * 24) {
            return new Response(JSON.stringify({ reply: cached.reply, fromCache: true }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          // 2. Try Gemini AI if API Key is available
          const geminiKey = process.env.GEMINI_API_KEY;
          if (geminiKey) {
            try {
              const ai = new GoogleGenAI({ apiKey: geminiKey });
              const userMsgs = messages.filter((m) => m.role !== "system").slice(-20);
              const contents = userMsgs.map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              }));

              const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents,
                config: { systemInstruction: systemPrompt },
              });

              if (response.text) {
                SERVER_CHAT_CACHE.set(cacheKey, { reply: response.text, cachedAt: Date.now() });
                return new Response(
                  JSON.stringify({ reply: response.text, fromAi: true, fromCache: false }),
                  {
                    headers: { "Content-Type": "application/json" },
                  },
                );
              }
            } catch {
              /* Fall back to Local Brain if Gemini errors out */
            }
          }

          // 3. High-Performance Local Brain Engine Fallback
          const localReply = getLocalBrainResponse(lastMsg, isAdmin);
          if (localReply) {
            SERVER_CHAT_CACHE.set(cacheKey, { reply: localReply, cachedAt: Date.now() });
          }

          return new Response(
            JSON.stringify({
              reply: localReply || getLocalBrainResponse("", isAdmin),
              fromLocalBrain: true,
              fromCache: false,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch {
          const fallback = getLocalBrainResponse("", false)!;
          return new Response(
            JSON.stringify({
              reply: fallback,
              fromLocalBrain: true,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
