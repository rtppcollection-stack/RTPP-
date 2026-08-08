import { createFileRoute } from "@tanstack/react-router";
import { generatePrintfulMockup } from "@/lib/printful";

export const Route = createFileRoute("/api/printful/mockup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { productId, variantId, imageUrl, color } = body;

          if (!variantId || !imageUrl) {
            return new Response(
              JSON.stringify({
                error: "Missing required parameters: variantId and imageUrl",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          const result = await generatePrintfulMockup({
            productId: productId || 71,
            variantId: Number(variantId),
            imageUrl: String(imageUrl),
            color: color ? String(color) : undefined,
          });

          return new Response(JSON.stringify(result), {
            status: result.error ? 400 : 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: (err as Error).message || "Internal server error during mockup generation",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
