import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ADMIN_FEE_WALLET, mapChainToLifiChainId } from "../src/lib/lifiSwap.js";

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

    const apiKey = process.env.LIFI_API_KEY || process.env.VITE_LIFI_API_KEY || "";

    const queryParams = new URLSearchParams({
      fromChain,
      toChain,
      fromToken,
      toToken,
      fromAmount,
      fromAddress: fromAddress.startsWith("0x") ? fromAddress : ADMIN_FEE_WALLET,
      fee: "0.002",
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: "0.002",
      referrer: ADMIN_FEE_WALLET,
      integrator: "rtpp-multi-chain",
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
      error: errData.message || errData.error || "Li.Fi API fetch failed",
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: 0.002,
      details: errData,
    });
  } catch (err) {
    return res.status(500).json({
      error: (err as Error).message || "Internal server error connecting to Li.Fi",
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: 0.002,
    });
  }
}
