import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

const ADMIN_WALLET = "0x752f726410B3e276DAE704B6E4671C50ea199798";

const END_USER_SYSTEM_PROMPT = `You are RTPP AI Assistant — a friendly, secure trading helper for end users of the RTPP Crypto & DEX Platform.

Capabilities for End Users:
- Crypto Market & Prices: Live token prices, market cap, top gainers/losers.
- Community Token (0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8): Featured RTPP Token listed in Swap & Market Search with contract address 0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8.
- P2P Trading Math: Profit/Loss calculation, Breakeven point, ROI %, Exchange fee deductions.
- DEX Swaps: Guidance on swapping tokens across Base, Arbitrum, Polygon, BSC, and Ethereum.
- NFT Marketplace: Guidance on listing, floor prices, and buying NFTs.
- Multi-Language: Supports English and Burmese (မြန်မာစာ).

SECURITY & PRIVACY RESTRICTIONS FOR END USERS:
- NEVER reveal backend file paths, source code internals, server environment secrets, or administrator settings.
- NEVER disclose private keys, system architecture files, or database schema definitions.
- If asked about internal system code or admin keys, politely state: "🔒 Access restricted. System code & admin configurations are secured for RTPP Administrators."`;

const ADMIN_SYSTEM_PROMPT = `You are RTPP Master AI Admin — the full-system architectural assistant for RTPP Platform Administrators.

ADMIN PRIVILEGES GRANTED:
You have complete knowledge of the entire RTPP project codebase, deployment configuration, and on-chain fee mechanisms.

FULL PROJECT ARCHITECTURE & FILE SUMMARY:
1. **Frontend & Router Framework**:
   - Built with React 18, Vite, Tailwind CSS (OKLCH color system), and @tanstack/react-router.
   - Entry point: \`/src/main.tsx\` and \`/src/App.tsx\`.
   - Styling: \`/src/styles.css\` featuring RTPP Electric Blue palette matched with the RTPP logo.

2. **DEX Swap & On-Chain Fee Engine (\`/src/components/DEXWidget.tsx\` & \`/src/lib/wallet.tsx\`)**:
   - Supports 5 EVM Networks: Ethereum (0x1), Base (0x2105), Arbitrum (0xa4b1), Polygon (0x89), and BSC (0x38).
   - On-Chain Gas/Integrator Fee: Prior to routing swap to Uniswap/PancakeSwap, \`sendEth()\` sends a configurable platform fee (default 30 BPS = 0.30%) directly to the Owner Fee Wallet (\`${ADMIN_WALLET}\`).
   - Fee Wallet Config: Admin can update fee recipient address and fee BPS dynamically via localStorage & UI dialog.

3. **NFT Marketplace (\`/src/components/NFTGallery.tsx\`)**:
   - Integrated with Supabase database (\`nfts\` table and \`nfts\` storage bucket).
   - Non-custodial trading with seller payout and marketplace fee collection.
   - Built-in curated fallback collection for instant marketplace vibrancy.

4. **Market Analytics & Charts (\`/src/components/PriceChart.tsx\` & \`/src/lib/coingecko.ts\`)**:
   - Dual-mode chart: Interactive Recharts Area chart + Embedded TradingView Pro candlestick chart.
   - Public CoinGecko API integration with automatic rate-limit throttling and caching.

5. **P2P & Profit/Loss Engine (\`/src/components/P2PCalculator.tsx\`)**:
   - P2P profit, loss, target exit, breakeven, and exchange fee math supporting USD & MMK currencies.

6. **Deployment & Hosting Setup (\`/netlify.toml\` & \`/package.json\`)**:
   - Netlify deployment ready (\`command = "npm run build"\`, \`publish = "dist"\`).
   - SPA Wildcard Redirect: \`[[redirects]] from = "/*" to = "/index.html" status = 200\`.
   - Free from third-party key locks.

Use clear formatting, technical precision, and Burmese/English as requested.`;

function fallbackAiResponse(userMessage: string, isAdmin: boolean): string {
  const query = userMessage.toLowerCase();

  if (!isAdmin) {
    // Check if end user is probing for admin secrets
    if (
      query.includes("code") ||
      query.includes("source") ||
      query.includes("secret") ||
      query.includes("key") ||
      query.includes("admin") ||
      query.includes("backend") ||
      query.includes("database")
    ) {
      return `🔒 **Security Notice:**\n\nSystem source code, database architecture, and administrative credentials are reserved for RTPP Administrators.\n\nHow can I help you with crypto prices, P2P calculations, or DEX swaps today?`;
    }

    if (
      query.includes("0x90f0") ||
      query.includes("rtpp") ||
      query.includes("0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8")
    ) {
      return `🔥 **RTPP Community Token (0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8):**\n\n• **Contract Address:** \`0x90f0712eddc36f4e42c0f8a6a6739ce5b113d9b8\`\n• **DEX Trading:** Fully integrated into our **Swap & Bridge** terminal!\n• **How to Trade:** Navigate to the **Swap & Bridge** tab, select **RTPP Token (0x90f0...d9b8)**, and click **Load into Swap** or paste the contract address to swap instantly with low 0.3% fees on Uniswap / DEX.`;
    }

    if (
      query.includes("fee") ||
      query.includes("gas") ||
      query.includes("swap") ||
      query.includes("ဂက်စ်")
    ) {
      return `⚡ **RTPP DEX Swaps:**\n\n• You can swap tokens on Base, Arbitrum, Polygon, BSC, and Ethereum.\n• Swaps route through decentralized DEXes (Uniswap & PancakeSwap) with transparent on-chain gas fee optimization.`;
    }

    if (
      query.includes("pnl") ||
      query.includes("profit") ||
      query.includes("loss") ||
      query.includes("တွက်") ||
      query.includes("အမြတ်")
    ) {
      return `📊 **P2P Profit & Loss Calculator:**\n\nCalculate your exact net profit, target sell price, and breakeven point in the **P2P Calculator** tab!`;
    }

    return `🤖 **RTPP Assistant Active!**\n\nHello! Ask me anything about:\n• Crypto market prices & charts\n• P2P Profit/Loss calculations\n• Multi-chain DEX Swaps\n• NFT Marketplace items\n\n*(In Myanmar / Burmese or English)*`;
  }

  // ADMIN FALLBACK DETAILED EXPLANATION
  if (query.includes("fee") || query.includes("gas") || query.includes("wallet")) {
    return `🛠️ **[ADMIN ARCHITECTURE] On-Chain Fee Engine Details:**\n\n• **Recipient Wallet:** \`${ADMIN_WALLET}\` (Configurable via UI / localStorage \`rtpp_fee_wallet_address\`)\n• **Default Fee:** 30 BPS (0.30% per swap)\n• **Execution Flow:** In \`DEXWidget.tsx\`, before launching the DEX tab, \`sendEth()\` is called to transfer native gas fee directly to your address on-chain.\n• **Supported Chains:** Base, Ethereum, Polygon, Arbitrum, BSC.`;
  }

  if (query.includes("deploy") || query.includes("netlify") || query.includes("build")) {
    return `🌐 **[ADMIN ARCHITECTURE] Netlify Build & Deployment:**\n\n• **Configuration File:** \`/netlify.toml\`\n• **Build Command:** \`npm run build\` (runs Vite build to generate \`dist/\`)\n• **SPA Routing:** Configured with wildcard redirect (\`/*\` -> \`/index.html\`, status 200) to prevent 404 on page refresh.`;
  }

  return `👨‍💻 **[RTPP MASTER ADMIN AI BRAIN]**\n\nAdmin privileges authenticated for address \`${ADMIN_WALLET}\`!\n\n**Full System Overview:**\n1. **DEX Fee System:** Automatic on-chain 0.30% fee collection in \`DEXWidget.tsx\` & \`wallet.tsx\`.\n2. **NFT Marketplace:** Supabase integrated (\`NFTGallery.tsx\`) with fallback featured NFTs.\n3. **Market Analytics:** TradingView + Recharts dual-mode in \`PriceChart.tsx\` using CoinGecko REST endpoints.\n4. **Deployment:** Netlify SPA setup in \`/netlify.toml\`.\n5. **Security:** End users are strictly restricted from seeing internal code logic or secrets.`;
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
          const systemPrompt = isAdmin ? ADMIN_SYSTEM_PROMPT : END_USER_SYSTEM_PROMPT;

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

          // Fallback response with admin vs end-user role check
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
