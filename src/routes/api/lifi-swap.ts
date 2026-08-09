import { createFileRoute } from "@tanstack/react-router";
import { getLifiSwapQuote, ADMIN_FEE_WALLET, PLATFORM_FEE_PERCENTAGE } from "@/lib/lifiSwap";

export const Route = createFileRoute("/api/lifi-swap")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const fromChain = url.searchParams.get("fromChain") || "1";
          const toChain = url.searchParams.get("toChain") || "1";
          const fromToken = url.searchParams.get("fromToken") || "ETH";
          const toToken = url.searchParams.get("toToken") || "USDT";
          const fromAmountWei =
            url.searchParams.get("fromAmount") ||
            url.searchParams.get("fromAmountWei") ||
            "100000000000000000";
          const fromAddress = url.searchParams.get("fromAddress") || ADMIN_FEE_WALLET;

          const quote = await getLifiSwapQuote({
            fromChain,
            toChain,
            fromToken,
            toToken,
            fromAmountWei,
            fromAddress,
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
              error: (err as Error).message || "Failed to fetch Li.Fi quote",
              feeRecipient: ADMIN_FEE_WALLET,
              feePercentage: PLATFORM_FEE_PERCENTAGE,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const fromChain = body.fromChain || "1";
          const toChain = body.toChain || "1";
          const fromToken = body.fromToken || "ETH";
          const toToken = body.toToken || "USDT";
          const fromAmountWei = body.fromAmount || body.fromAmountWei || "100000000000000000";
          const fromAddress = body.fromAddress || body.takerAddress || ADMIN_FEE_WALLET;

          const quote = await getLifiSwapQuote({
            fromChain,
            toChain,
            fromToken,
            toToken,
            fromAmountWei,
            fromAddress,
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
              error: (err as Error).message || "Failed to fetch Li.Fi quote",
              feeRecipient: ADMIN_FEE_WALLET,
              feePercentage: PLATFORM_FEE_PERCENTAGE,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
