import type { VercelRequest, VercelResponse } from "@vercel/node";
import { uploadNFTToPrintful } from "../../src/lib/printful";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { imageUrl, filename } = body;

    if (!imageUrl) {
      return res.status(400).json({
        error: "Missing required parameter: imageUrl",
        rawPayload: { request: body, response: null },
      });
    }

    const result = await uploadNFTToPrintful(imageUrl, filename);
    return res.status(result.error ? 400 : 200).json(result);
  } catch (err) {
    return res.status(500).json({
      error: (err as Error).message || "Internal server error during NFT upload",
    });
  }
}
