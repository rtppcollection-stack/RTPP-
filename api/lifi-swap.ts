import type { VercelRequest, VercelResponse } from "@vercel/node";

const ADMIN_FEE_WALLET = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";

function mapChainToLifiChainId(chain: string): string {
  const c = String(chain || "")
    .toLowerCase()
    .trim();
  if (c === "bitcoin" || c === "btc") return "btc";
  if (c === "ethereum" || c === "eth" || c === "0x1" || c === "1") return "1";
  if (c === "polygon" || c === "pol" || c === "0x89" || c === "137") return "137";
  if (c === "base" || c === "0x2105" || c === "8453") return "8453";
  if (c === "bsc" || c === "binance" || c === "0x38" || c === "56") return "56";
  if (c === "solana" || c === "sol") return "SOL";
  if (c === "arbitrum" || c === "0xa4b1" || c === "42161") return "42161";
  if (c === "optimism" || c === "0xa" || c === "10") return "10";
  if (c === "avalanche" || c === "0xa86a" || c === "43114") return "43114";
  return chain || "1";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-lifi-api-key");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const body =
      req.method === "POST"
        ? typeof req.body === "string"
          ? JSON.parse(req.body)
          : req.body || {}
        : req.query || {};

    const fromChain = mapChainToLifiChainId(body.fromChain || "1");
    const toChain = mapChainToLifiChainId(body.toChain || "1");
    const fromToken = body.fromToken || "0x0000000000000000000000000000000000000000";
    const toToken = body.toToken || "0xdac17f958d2ee523a2206206994597c13d831ec7";
    const fromAmount = body.fromAmount || body.fromAmountWei || "100000000000000000";
    const fromAddress = body.fromAddress || body.takerAddress || ADMIN_FEE_WALLET;

    const apiKey =
      process.env.LIFI_API_KEY ||
      process.env.VITE_LIFI_API_KEY ||
      process.env.NEXT_PUBLIC_LIFI_API_KEY ||
      "";

    const queryParams = new URLSearchParams({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      fromAddress: fromAddress.startsWith("0x") ? fromAddress : ADMIN_FEE_WALLET,
      fee: "0.0025",
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: "0.0025",
      referrer: ADMIN_FEE_WALLET,
      integrator: "rtpp",
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["x-lifi-api-key"] = apiKey;
    }

    const response = await fetch(`https://li.quest/v1/quote?${queryParams.toString()}`, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json(data);
    }

    const errData = await response.json().catch(() => ({}));
    return res.status(response.status || 400).json({
      error: errData.message || errData.error || "Li.Fi route quote not available",
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: 0.0025,
      details: errData,
    });
  } catch (err) {
    return res.status(500).json({
      error: (err as Error).message || "Internal server error connecting to Li.Fi",
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: 0.0025,
    });
  }
}
