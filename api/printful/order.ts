import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createPrintfulOrder,
  getPrintfulOrderStatus,
  getPrintfulApiKey,
  topUpPrintfulWallet,
  type CreatePrintfulOrderParams,
} from "../../src/lib/printful";
import { executeUniswapAutoSwapOnBase } from "../../src/lib/uniswapSwap";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    try {
      const printfulApiKey = getPrintfulApiKey();

      if (!printfulApiKey) {
        return res.status(500).json({
          error:
            "Server configuration error: PRINTFUL_API_KEY environment variable is not defined.",
        });
      }

      const body = (
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {}
      ) as CreatePrintfulOrderParams;

      if (!body.recipient || !body.items || body.items.length === 0) {
        return res.status(400).json({
          error:
            "Invalid order payload. 'recipient' address and at least one item in 'items' are required.",
          receivedPayload: body,
        });
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
        return res.status(400).json({
          error:
            "Incomplete shipping details. 'name', 'address1', 'city', 'country_code', 'zip', 'email', and 'phone' are required for Printful order dispatch.",
          receivedRecipient: recipient,
        });
      }

      body.confirm = true;

      const autoSwapResult = await executeUniswapAutoSwapOnBase({
        paymentCurrency: body.paymentCurrency || "RTPP",
        paymentAmount: body.paymentAmount || "100",
        paymentTxHash: body.external_id || body.paymentTxHash,
        orderTotalUSD: body.totalUSD || 29.99,
      });

      const usdcValueToFund = autoSwapResult.usdcReceived || (body.totalUSD || 29.99).toFixed(2);
      const billingTopUpResult = await topUpPrintfulWallet(
        usdcValueToFund,
        autoSwapResult.swapTxHash || body.external_id,
      );

      const printfulResult = await createPrintfulOrder(body);

      const responsePayload = {
        ...printfulResult,
        autoSwap: autoSwapResult,
        billingTopUp: billingTopUpResult,
        orderMode: "REALTIME_PRODUCTION_CONFIRMED",
        confirm: true,
      };

      return res.status(printfulResult.error ? 400 : 200).json(responsePayload);
    } catch (err) {
      return res.status(500).json({
        error: (err as Error).message || "Failed to process Printful order submission",
      });
    }
  } else if (req.method === "GET") {
    try {
      const orderId = req.query.orderId as string;

      if (!orderId) {
        return res.status(400).json({ error: "Missing required query parameter: orderId" });
      }

      const result = await getPrintfulOrderStatus(orderId);
      return res.status(result.error ? 400 : 200).json(result);
    } catch (err) {
      return res.status(500).json({
        error: (err as Error).message || "Failed to retrieve Printful order status",
      });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
