import { createFileRoute } from "@tanstack/react-router";
import { handleChatMessage, type ChatRequest } from "@/lib/chat-engine";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as ChatRequest;
          const result = await handleChatMessage(body);
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          const fallback = await handleChatMessage({ messages: [{ role: "user", content: "" }] });
          return new Response(JSON.stringify(fallback), {
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
