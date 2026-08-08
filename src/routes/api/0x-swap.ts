import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_FEE_WALLET, PLATFORM_FEE_PERCENTAGE, get0xSwapQuote } from "@/lib/zeroXSwap";

export const Route = createFileRoute("/api/0x-swap")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const sellToken = url.searchParams.get("sellToken") || "ETH";
          const buyToken = url.searchParams.get("buyToken") || "USDT";
          const sellAmount =
            url.searchParams.get("sellAmount") ||
            url.searchParams.get("sellAmountWei") ||
            "100000000000000000";
          const takerAddress = url.searchParams.get("takerAddress") || ADMIN_FEE_WALLET;
          const chainId = url.searchParams.get("chainId") || "0x1";

          const quote = await get0xSwapQuote({
            sellToken,
            buyToken,
            sellAmountWei: sellAmount,
            takerAddress,
            chainId,
          });

          return new Response(JSON.stringify(quote), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
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
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const sellToken = body.sellToken || "ETH";
          const buyToken = body.buyToken || "USDT";
          const sellAmount = body.sellAmount || body.sellAmountWei || "100000000000000000";
          const takerAddress = body.takerAddress || ADMIN_FEE_WALLET;
          const chainId = body.chainId || "0x1";

          const quote = await get0xSwapQuote({
            sellToken,
            buyToken,
            sellAmountWei: sellAmount,
            takerAddress,
            chainId,
          });

          return new Response(JSON.stringify(quote), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
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
