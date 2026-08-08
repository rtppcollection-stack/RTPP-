import { createFileRoute } from "@tanstack/react-router";
import { get0xSwapQuote, ADMIN_FEE_WALLET, PLATFORM_FEE_PERCENTAGE } from "@/lib/zeroXSwap";

export const Route = createFileRoute("/api/zero-x/quote")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const { sellToken, buyToken, sellAmountWei, takerAddress, chainId } = body;

          const quote = await get0xSwapQuote({
            sellToken: sellToken || "ETH",
            buyToken: buyToken || "USDT",
            sellAmountWei: sellAmountWei || "100000000000000000",
            takerAddress: takerAddress || ADMIN_FEE_WALLET,
            chainId: chainId || "0x1",
          });

          return new Response(
            JSON.stringify({
              quote,
              feeRecipient: ADMIN_FEE_WALLET,
              buyTokenPercentageFee: PLATFORM_FEE_PERCENTAGE,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: (err as Error).message || "Failed to fetch 0x quote",
              feeRecipient: ADMIN_FEE_WALLET,
              buyTokenPercentageFee: PLATFORM_FEE_PERCENTAGE,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
