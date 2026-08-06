import { createFileRoute } from "@tanstack/react-router";
import { uploadNFTToPrintful } from "@/lib/printful";

export const Route = createFileRoute("/api/printful/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { imageUrl, filename } = body;

          if (!imageUrl) {
            return new Response(
              JSON.stringify({
                error: "Missing required parameter: imageUrl",
                rawPayload: { request: body, response: null },
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const result = await uploadNFTToPrintful(imageUrl, filename);

          return new Response(JSON.stringify(result), {
            status: result.error ? 400 : 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: (err as Error).message || "Internal server error during NFT upload",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
