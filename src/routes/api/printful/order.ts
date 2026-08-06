import { createFileRoute } from "@tanstack/react-router";
import {
  createPrintfulOrder,
  getPrintfulOrderStatus,
  getPrintfulApiKey,
  topUpPrintfulWallet,
  type CreatePrintfulOrderParams,
} from "@/lib/printful";
import { executeUniswapAutoSwapOnBase } from "@/lib/uniswapSwap";

export const Route = createFileRoute("/api/printful/order")({
  server: {
    handlers: {
      /**
       * POST /api/printful/order
       * Real-Time Production Order Handler:
       * 1. Executes Uniswap SDK Router auto-swap of RTPP/ETH tokens into USDC on Base Network (Chain 8453).
       * 2. Triggers Printful API Billing Wallet Top-Up using swapped USDC value to fund Merchant Wallet.
       * 3. Submits confirmed live order (confirm: true) to Printful API.
       */
      POST: async ({ request }) => {
        try {
          const printfulApiKey = getPrintfulApiKey();

          if (!printfulApiKey) {
            return new Response(
              JSON.stringify({
                error:
                  "Server configuration error: PRINTFUL_API_KEY environment variable is not defined.",
              }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }

          const body = (await request.json()) as CreatePrintfulOrderParams;

          // Validate required Printful order fields & recipient shipping details
          if (!body.recipient || !body.items || body.items.length === 0) {
            return new Response(
              JSON.stringify({
                error:
                  "Invalid order payload. 'recipient' address and at least one item in 'items' are required.",
                receivedPayload: body,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const { recipient } = body;
          if (
            !recipient.name ||
            !recipient.address1 ||
            !recipient.city ||
            !recipient.country_code ||
            !recipient.zip ||
            !recipient.email ||
            !recipient.phone
          ) {
            return new Response(
              JSON.stringify({
                error:
                  "Incomplete shipping details. 'name', 'address1', 'city', 'country_code', 'zip', 'email', and 'phone' are required for Printful order dispatch.",
                receivedRecipient: recipient,
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // Force confirm: true for real-time production orders submitted to Printful API
          body.confirm = true;

          // 1. Execute Uniswap SDK Router Auto-Swap to USDC on Base Network
          const autoSwapResult = await executeUniswapAutoSwapOnBase({
            paymentCurrency: body.paymentCurrency || "RTPP",
            paymentAmount: body.paymentAmount || "100",
            paymentTxHash: body.external_id || body.paymentTxHash,
            orderTotalUSD: body.totalUSD || 29.99,
          });

          // 2. Automatically trigger Printful API Billing Top-Up using swapped USDC value to fund Merchant Wallet
          const usdcValueToFund =
            autoSwapResult.usdcReceived || (body.totalUSD || 29.99).toFixed(2);
          const billingTopUpResult = await topUpPrintfulWallet(
            usdcValueToFund,
            autoSwapResult.swapTxHash || body.external_id,
          );

          // 3. Submit confirmed live order payload securely to Printful API (/orders)
          const printfulResult = await createPrintfulOrder(body);

          const responsePayload = {
            ...printfulResult,
            autoSwap: autoSwapResult,
            billingTopUp: billingTopUpResult,
            orderMode: "REALTIME_PRODUCTION_CONFIRMED",
            confirm: true,
          };

          // Return result to frontend with appropriate HTTP status
          return new Response(JSON.stringify(responsePayload), {
            status: printfulResult.error ? 400 : 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: (err as Error).message || "Failed to process Printful order submission",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },

      /**
       * GET /api/printful/order?orderId=:id
       * Retrieves order status, details, & shipment tracking by orderId query parameter.
       */
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const orderId = url.searchParams.get("orderId");

          if (!orderId) {
            return new Response(
              JSON.stringify({ error: "Missing required query parameter: orderId" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const result = await getPrintfulOrderStatus(orderId);

          return new Response(JSON.stringify(result), {
            status: result.error ? 400 : 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: (err as Error).message || "Failed to retrieve Printful order status",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
