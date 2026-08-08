export const ADMIN_FEE_WALLET = "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f";
export const PLATFORM_FEE_PERCENTAGE = 0.002; // 0.2% commission

export interface LifiQuoteParams {
  fromChain: string; // Chain ID or key, e.g. "1", "137", "8453", "56", "solana"
  toChain: string;   // Chain ID or key
  fromToken: string; // Token contract address or symbol
  toToken: string;   // Token contract address or symbol
  fromAmountWei: string;
  fromAddress: string;
}

export interface LifiGasCost {
  amount: string;
  amountUSD: string;
  token: {
    symbol: string;
    decimals: number;
    priceUSD: string;
  };
}

export interface LifiFeeCost {
  name: string;
  amount: string;
  amountUSD: string;
  token: {
    symbol: string;
  };
}

export interface LifiQuoteResult {
  id?: string;
  tool?: string;
  toolName?: string;
  fromChainId?: number | string;
  toChainId?: number | string;
  fromAmount?: string;
  toAmount?: string;
  toAmountMin?: string;
  toAmountUSD?: string;
  fromAmountUSD?: string;
  approvalAddress?: string;
  executionDuration?: number;
  gasCosts?: LifiGasCost[];
  feeCosts?: LifiFeeCost[];
  totalGasCostUSD?: number;
  transactionRequest?: {
    to: string;
    data: string;
    value: string;
    gasLimit?: string;
    gasPrice?: string;
    chainId?: number;
  };
  feeRecipient: string;
  feePercentage: number;
  error?: string;
  rawResponse?: unknown;
}

// Map user-friendly chain keys to Li.Fi recognized chain IDs
export function mapChainToLifiChainId(chain: string): string {
  const c = chain.toLowerCase().trim();
  if (c === "bitcoin" || c === "btc") return "btc";
  if (c === "ethereum" || c === "eth" || c === "0x1" || c === "1") return "1";
  if (c === "polygon" || c === "pol" || c === "0x89" || c === "137") return "137";
  if (c === "base" || c === "0x2105" || c === "8453") return "8453";
  if (c === "bsc" || c === "binance" || c === "0x38" || c === "56") return "56";
  if (c === "solana" || c === "sol") return "SOL";
  if (c === "arbitrum" || c === "0xa4b1" || c === "42161") return "42161";
  if (c === "optimism" || c === "0xa" || c === "10") return "10";
  if (c === "avalanche" || c === "0xa86a" || c === "43114") return "43114";
  return chain;
}

/**
 * Fetch Live Cross-Chain Route & Transaction Data from Li.Fi API (https://li.quest/v1/quote)
 * Includes feeRecipient: "0x82627aeEDD0E7f0B6d45d443A1F59bCD2Adcd68f" and feePercentage: 0.002
 */
export async function getLifiSwapQuote(params: LifiQuoteParams): Promise<LifiQuoteResult> {
  const fromChain = mapChainToLifiChainId(params.fromChain);
  const toChain = mapChainToLifiChainId(params.toChain);
  const takerAddress = params.fromAddress && params.fromAddress.startsWith("0x")
    ? params.fromAddress
    : ADMIN_FEE_WALLET;

  const queryParams = new URLSearchParams({
    fromChain,
    toChain,
    fromToken: params.fromToken,
    toToken: params.toToken,
    fromAmount: params.fromAmountWei,
    fromAddress: takerAddress,
    fee: "0.002",
    feeRecipient: ADMIN_FEE_WALLET,
    feePercentage: "0.002",
    referrer: ADMIN_FEE_WALLET,
    integrator: "rtpp-multi-chain",
  });

  const apiKey =
    (typeof process !== "undefined" && process.env?.LIFI_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_LIFI_API_KEY) ||
    (typeof import.meta !== "undefined" &&
      (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_LIFI_API_KEY) ||
    "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["x-lifi-api-key"] = apiKey;
  }

  try {
    const res = await fetch(`https://li.quest/v1/quote?${queryParams.toString()}`, {
      method: "GET",
      headers,
    });

    if (res.ok) {
      const data = await res.json();
      const estimate = data.estimate || {};
      const gasCosts: LifiGasCost[] = estimate.gasCosts || [];
      const feeCosts: LifiFeeCost[] = estimate.feeCosts || [];

      const totalGasCostUSD = gasCosts.reduce(
        (acc, g) => acc + (parseFloat(g.amountUSD) || 0),
        0
      );

      return {
        id: data.id,
        tool: data.tool,
        toolName: data.toolDetails?.name || data.tool,
        fromChainId: data.action?.fromChainId || fromChain,
        toChainId: data.action?.toChainId || toChain,
        fromAmount: estimate.fromAmount || params.fromAmountWei,
        toAmount: estimate.toAmount || "0",
        toAmountMin: estimate.toAmountMin || "0",
        approvalAddress: estimate.approvalAddress || data.transactionRequest?.to,
        executionDuration: estimate.executionDuration || 30,
        gasCosts,
        feeCosts,
        totalGasCostUSD,
        transactionRequest: data.transactionRequest
          ? {
              to: data.transactionRequest.to,
              data: data.transactionRequest.data,
              value: data.transactionRequest.value || "0x0",
              gasLimit: data.transactionRequest.gasLimit,
              gasPrice: data.transactionRequest.gasPrice,
              chainId: data.transactionRequest.chainId,
            }
          : undefined,
        feeRecipient: ADMIN_FEE_WALLET,
        feePercentage: 0.002,
        rawResponse: data,
      };
    }

    const errJson = await res.json().catch(() => ({}));
    return {
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: 0.002,
      error: errJson.message || errJson.error || `Li.Fi HTTP error ${res.status}`,
    };
  } catch (err) {
    return {
      feeRecipient: ADMIN_FEE_WALLET,
      feePercentage: 0.002,
      error: (err as Error).message || "Failed to reach Li.Fi API at https://li.quest",
    };
  }
}
