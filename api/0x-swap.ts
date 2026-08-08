import type { VercelRequest, VercelResponse } from "@vercel/node";

export const ADMIN_FEE_WALLET = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
export const PLATFORM_FEE_PERCENTAGE = 0.002; // 0.2% commission

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Support CORS for client-side API requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, 0x-api-key");

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

    const sellToken = (body.sellToken as string) || "ETH";
    const buyToken = (body.buyToken as string) || "USDT";
    const sellAmount =
      (body.sellAmount as string) || (body.sellAmountWei as string) || "100000000000000000";
    const takerAddress = (body.takerAddress as string) || ADMIN_FEE_WALLET;
    const chainId = (body.chainId as string) || "0x1";

    const apiKey =
      process.env.NEXT_PUBLIC_ZEROX_API_KEY ||
      process.env.ZEROX_API_KEY ||
      process.env.VITE_ZEROX_API_KEY ||
      "";

    let baseUrl = "https://api.0x.org";
    if (chainId === "0x2105" || chainId === "8453") {
      baseUrl = "https://base.api.0x.org";
    } else if (chainId === "0x38" || chainId === "56") {
      baseUrl = "https://bsc.api.0x.org";
    } else if (chainId === "0x89" || chainId === "137") {
      baseUrl = "https://polygon.api.0x.org";
    }

    const queryParams = new URLSearchParams({
      sellToken,
      buyToken,
      sellAmount,
      takerAddress: takerAddress.startsWith("0x") ? takerAddress : ADMIN_FEE_WALLET,
      feeRecipient: ADMIN_FEE_WALLET,
      buyTokenPercentageFee: "0.002",
      affiliateAddress: ADMIN_FEE_WALLET,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["0x-api-key"] = apiKey;
    }

    const response = await fetch(`${baseUrl}/swap/v1/quote?${queryParams.toString()}`, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({
        to: data.to || "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
        data: data.data || "0x",
        value: data.value || "0",
        buyAmount: data.buyAmount || "0",
        sellAmount: data.sellAmount || sellAmount,
        estimatedGas: data.estimatedGas || "210000",
        price: data.price || "0",
        guaranteedPrice: data.guaranteedPrice || data.price || "0",
        allowanceTarget:
          data.allowanceTarget || data.to || "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
        buyTokenAddress: data.buyTokenAddress || buyToken,
        sellTokenAddress: data.sellTokenAddress || sellToken,
        buyTokenPercentageFee: 0.002,
        feeRecipient: ADMIN_FEE_WALLET,
        sources: data.sources || [],
      });
    }

    const errData = await response.json().catch(() => ({}));
    console.warn("0x API response notice:", errData);

    // Fallback response with fee parameters preserved
    return res.status(200).json({
      to: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
      data: "0x",
      value: sellAmount,
      buyAmount: "0",
      sellAmount,
      estimatedGas: "210000",
      buyTokenPercentageFee: 0.002,
      feeRecipient: ADMIN_FEE_WALLET,
      isSimulated: true,
      message:
        errData.reason || errData.message || "0x Quote generated with 0.2% commission recipient.",
    });
  } catch (err) {
    return res.status(500).json({
      error: (err as Error).message || "0x Swap API route error",
      feeRecipient: ADMIN_FEE_WALLET,
      buyTokenPercentageFee: 0.002,
    });
  }
}
