import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const ADMIN_WALLET = "0x752f726410B3e276DAE704B6E4671C50ea199798";
const COMMUNITY_TOKEN = "0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8";

const INTERNATIONAL_USER_SYSTEM_PROMPT = `You are RTPP Global AI Assistant — the official intelligent assistant for the RTPP Crypto Dashboard, DEX Swap, and Web3 Platform.

You serve an international audience with clear, professional English.

COMPREHENSIVE WEB PLATFORM CAPABILITIES YOU CAN EXPLAIN:
1. **DEX Swap & Cross-Chain Bridge**:
   - Supports non-custodial swaps across 5 EVM chains: Ethereum (0x1), Base (0x2105), Arbitrum (0xa4b1), Polygon (0x89), and BSC (0x38).
   - Automated Smart Contract Fee Routing: A transparent 0.30% platform routing fee is automatically collected on swap transactions and directed to the Admin Treasury Wallet (${ADMIN_WALLET}).
   - Direct integration with decentralized liquidity pools (Uniswap, PancakeSwap).

2. **NFT Marketplace & Free Lazy Minting**:
   - 100% Free Listing & Gasless Lazy Minting: Users can list and mint NFTs without upfront gas fees.
   - Marketplace Smart Contract Royalties: When an NFT is sold, 99% goes directly to the creator/seller wallet, while 1% platform royalty is automatically routed to the Admin Wallet (${ADMIN_WALLET}).

3. **Whale Alert Radar & On-Chain Inspector**:
   - Real-time live Bitcoin Mempool transaction streaming via Mempool.space API.
   - Live DEX trading volume and price movement tracking across Uniswap, Base, Solana, and BSC via DexScreener API.
   - Direct Block Explorer Inspector tool supporting Etherscan, Basescan, BscScan, Mempool.space, and Solscan verification for any pasted address or transaction hash.

4. **P2P Profit/Loss & Margin Calculator**:
   - High-precision P2P calculation engine for order book traders: calculates net profit, gross ROI %, target exit price, breakeven thresholds, and exchange fee deductions across USD and global currencies.

5. **Market Analytics & Trading Charts**:
   - Live price tracking powered by CoinGecko API with dual-chart mode: interactive Recharts volume area charts + embedded TradingView Pro candlestick terminal.

6. **Network Gas Tracker & Security Metrics**:
   - Live real-time Gwei gas fee monitoring for Ethereum, Base, Polygon, Arbitrum, and BSC.
   - Wallet security inspection and contract verification scores.

7. **RTPP Community Token (${COMMUNITY_TOKEN})**:
   - Official utility token pre-loaded into Swap and Market search. Users can trade RTPP directly on DEX.

SECURITY & PRIVACY RULES:
- Provide accurate, helpful, and concise answers in professional English.
- If asked about internal system source code, environment secrets, or server database files by a regular user, respond: "🔒 Access restricted. System codebase and administrative settings are secured for RTPP Administrators."`;

const INTERNATIONAL_ADMIN_SYSTEM_PROMPT = `You are RTPP Master AI Admin — the full-system architectural assistant for RTPP Platform Administrators.

ADMIN PRIVILEGES & COMPLETE WEB PLATFORM OVERVIEW:
1. **On-Chain Fee Engine (\`/src/components/DEXWidget.tsx\` & \`/src/lib/wallet.tsx\`)**:
   - 0.30% (30 BPS) configurable platform fee automatically transferred on-chain to \`${ADMIN_WALLET}\` before swap execution.
   - Admin panel allows updating the treasury address and fee percentage dynamically in localStorage.

2. **NFT Marketplace (\`/src/components/NFTGallery.tsx\`)**:
   - Supabase integrated (\`nfts\` table and storage bucket).
   - Non-custodial lazy minting with 1% platform commission auto-routed to \`${ADMIN_WALLET}\`.

3. **Deployment Setup (\`/netlify.toml\` & \`/package.json\`)**:
   - Netlify production ready with \`npm run build\` outputting to \`dist/\`.
   - Wildcard SPA redirect (\`/*\` -> \`/index.html\`, status 200) ensuring 0 routing errors.

4. **Whale & Mempool Radar (\`/src/components/WhaleAndNewsRadar.tsx\`)**:
   - Mempool.space + DexScreener live APIs streaming live Bitcoin & EVM whale movements with direct block explorer links.

Respond with high technical precision in clear International English.`;

function fallbackAiResponse(userMessage: string, isAdmin: boolean): string {
  const q = userMessage.toLowerCase().trim();

  if (!isAdmin) {
    if (
      q.includes("code") ||
      q.includes("source") ||
      q.includes("secret") ||
      q.includes("key") ||
      q.includes("backend") ||
      q.includes("database")
    ) {
      return `🔒 **Security Notice:**\n\nSystem source code, database architecture, and backend secrets are restricted to RTPP Administrators.\n\nHow can I assist you with DEX Swaps, P2P Calculations, NFT Minting, or Market Prices today?`;
    }

    if (q.includes("swap") || q.includes("dex") || q.includes("bridge") || q.includes("fee")) {
      return `⚡ **RTPP Multi-Chain DEX Swap & Bridge:**\n\n• **Supported Networks:** Ethereum, Base, Arbitrum, Polygon, and BSC.\n• **Automated Contract Routing:** Includes a transparent 0.30% platform fee routed directly to the Admin Treasury Wallet (\`${ADMIN_WALLET}\`).\n• **Liquidity Pools:** Connects directly to Uniswap & PancakeSwap for non-custodial swaps with optimal gas rates.`;
    }

    if (q.includes("nft") || q.includes("mint") || q.includes("gallery")) {
      return `🎨 **RTPP NFT Marketplace & Free Lazy Minting:**\n\n• **0 Gas Upfront:** Mint and list your artwork completely free with Lazy Minting!\n• **Contract Royalty:** Creator receives 99% of sale proceeds, while a 1% platform commission is automatically routed to the Admin Treasury Wallet on sale.\n• **Explore:** Browse featured collections directly in the **NFT Marketplace** tab.`;
    }

    if (
      q.includes("whale") ||
      q.includes("radar") ||
      q.includes("mempool") ||
      q.includes("inspector") ||
      q.includes("tx")
    ) {
      return `🐋 **Whale Alert Radar & On-Chain Inspector:**\n\n• **Live Streaming:** Tracks real unconfirmed Bitcoin transactions via Mempool.space and high-volume DEX pairs via DexScreener.\n• **Tx Inspector:** Paste any EVM address/hash, Bitcoin address, or Solana account into the radar inspector to verify directly on Etherscan, Basescan, BscScan, Mempool.space, or Solscan!`;
    }

    if (
      q.includes("p2p") ||
      q.includes("pnl") ||
      q.includes("profit") ||
      q.includes("calculator") ||
      q.includes("loss") ||
      q.includes("margin")
    ) {
      return `📊 **P2P Profit/Loss & Margin Calculator:**\n\n• **Trading Math:** Calculate your net profit, ROI %, target exit sell price, breakeven threshold, and exchange maker/taker fee deductions.\n• **Currencies:** Supports USD and multi-currency conversions in real time.`;
    }

    if (q.includes("gas") || q.includes("gwei") || q.includes("security")) {
      return `⛽ **Network Gas & Wallet Security Tracker:**\n\n• **Gas Monitor:** Live Gwei tracking for Ethereum, Base, Polygon, Arbitrum, and BSC.\n• **Security Inspection:** Evaluates wallet connection integrity and smart contract security scores.`;
    }

    if (q.includes("token") || q.includes("rtpp") || q.includes("0x90f0")) {
      return `🔥 **RTPP Community Token (${COMMUNITY_TOKEN}):**\n\n• **Contract Address:** \`${COMMUNITY_TOKEN}\`\n• **Trading:** Pre-loaded into the DEX Swap terminal and Market Search. Swap instantly with low slippage on Uniswap / PancakeSwap.`;
    }

    if (q.includes("market") || q.includes("chart") || q.includes("price")) {
      return `📈 **Live Market Analytics & TradingView Charts:**\n\n• Real-time crypto price tracking powered by CoinGecko API.\n• Dual chart modes: Interactive Recharts volume area view + TradingView Pro candlestick technical charts.`;
    }

    return `🤖 **Welcome to RTPP Global AI Assistant!**\n\nI can explain and guide you through the entire RTPP Web Platform:\n\n1. ⚡ **DEX Swap & Bridge:** Multi-chain non-custodial swaps with auto fee routing.\n2. 🎨 **NFT Marketplace:** Free lazy minting & 1% smart contract royalties.\n3. 🐋 **Whale Radar:** Real live Mempool.space & DexScreener transaction inspector.\n4. 📊 **P2P Calculator:** PnL, breakeven, and exchange fee math.\n5. ⛽ **Gas & Security Tracker:** Live Gwei network status across 5 EVM chains.\n6. 🔥 **RTPP Token:** Contract details & quick DEX trading.\n\n*How can I help you today?*`;
  }

  // ADMIN FALLBACK RESPONSES
  return `👨‍💻 **[RTPP Master Admin AI Brain Active]**\n\nAuthenticated for Admin Treasury: \`${ADMIN_WALLET}\`\n\n**Full Platform System Architecture:**\n1. **On-Chain Fee Engine:** 0.30% fee auto-routed in \`DEXWidget.tsx\` & \`wallet.tsx\`.\n2. **NFT Smart Contract Royalties:** 1% marketplace commission in \`NFTGallery.tsx\`.\n3. **Netlify Deployment:** Configured in \`/netlify.toml\` with \`npm run build\` & SPA wildcard redirects.\n4. **Whale Radar Engine:** Real API integration with Mempool.space & DexScreener.\n5. **AI Assistant API:** Integrated with Gemini AI & fallback engines.`;
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
          const geminiKey = process.env.GEMINI_API_KEY;

          if (geminiKey) {
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

            return new Response(JSON.stringify({ reply: response.text }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          // Fallback engine response
          const reply = fallbackAiResponse(lastMsg, isAdmin);
          return new Response(JSON.stringify({ reply }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({
              reply: fallbackAiResponse("", false),
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
