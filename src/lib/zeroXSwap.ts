import { ethers } from "ethers";

export const ADMIN_FEE_WALLET = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
export const PLATFORM_FEE_PERCENTAGE = 0.002; // 0.2% commission
export const PLATFORM_FEE_BPS = 20; // 20 BPS

export interface ZeroXQuoteParams {
  sellToken: string;
  buyToken: string;
  sellAmountWei: string;
  takerAddress: string;
  chainId?: string;
}

export interface ZeroXQuoteResult {
  to: string;
  data: string;
  value: string;
  buyAmount: string;
  sellAmount: string;
  estimatedGas: string;
  buyTokenPercentageFee: number;
  feeRecipient: string;
  protocolFee?: string;
  isSimulated?: boolean;
}

/**
 * Fetch 0x API Quote with mandatory feeRecipient and buyTokenPercentageFee
 */
export async function get0xSwapQuote(params: ZeroXQuoteParams): Promise<ZeroXQuoteResult> {
  const { sellToken, buyToken, sellAmountWei, takerAddress, chainId = "0x1" } = params;

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
    sellAmount: sellAmountWei,
    takerAddress: takerAddress || ADMIN_FEE_WALLET,
    feeRecipient: ADMIN_FEE_WALLET,
    buyTokenPercentageFee: "0.002",
    affiliateAddress: ADMIN_FEE_WALLET,
  });

  const apiKey =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ZEROX_API_KEY) ||
    (typeof process !== "undefined" && process.env?.ZEROX_API_KEY) ||
    (typeof import.meta !== "undefined" &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ZEROX_API_KEY) ||
    "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["0x-api-key"] = apiKey;
  }

  try {
    const res = await fetch(`${baseUrl}/swap/v1/quote?${queryParams.toString()}`, { headers });
    if (res.ok) {
      const data = await res.json();
      return {
        to: data.to || "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
        data: data.data || "0x",
        value: data.value || "0x0",
        buyAmount: data.buyAmount || "0",
        sellAmount: data.sellAmount || sellAmountWei,
        estimatedGas: data.estimatedGas || "210000",
        buyTokenPercentageFee: 0.002,
        feeRecipient: ADMIN_FEE_WALLET,
      };
    }
  } catch (err) {
    console.warn("0x API quote note:", err);
  }

  // Robust fallback 0x transaction wrapper with 0.2% feeRecipient
  return {
    to: "0xdef1c0ded9bec7f1a1670819833240f027b25eff", // 0x Router / Exchange Proxy
    data: "0x",
    value: sellAmountWei,
    buyAmount: "0",
    sellAmount: sellAmountWei,
    estimatedGas: "210000",
    buyTokenPercentageFee: 0.002,
    feeRecipient: ADMIN_FEE_WALLET,
    isSimulated: true,
  };
}
