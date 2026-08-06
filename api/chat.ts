import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleChatMessage, type ChatRequest } from "../src/lib/chat-engine";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const result = await handleChatMessage(body as ChatRequest);
    return res.status(200).json(result);
  } catch {
    const fallback = await handleChatMessage({ messages: [{ role: "user", content: "" }] });
    return res.status(200).json(fallback);
  }
}
