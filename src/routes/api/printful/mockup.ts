import { createFileRoute } from "@tanstack/react-router";
import { generatePrintfulMockup } from "@/lib/printful";

export const Route = createFileRoute("/api/printful/mockup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const { productId, variantId, imageUrl, color } = body;

          const numVariantId = Number(variantId);
          const strImageUrl = typeof imageUrl === "string" ? imageUrl.trim() : "";

          if (!numVariantId || isNaN(numVariantId) || !strImageUrl || !strImageUrl.startsWith("http")) {
            console.log("Missing Variant ID or NFT URL");
            return new Response(
              JSON.stringify({
                error: "Missing Variant ID or NFT URL",
                mockupUrl: null,
              }),
              { status: 200, headers: { "Content-Type": "application/json" } },
            );
          }

          const result = await generatePrintfulMockup({
            productId: Number(productId) || 71,
            variantId: Math.floor(numVariantId),
            imageUrl: strImageUrl,
            color: color ? String(color) : undefined,
          });

          return new Response(
            JSON.stringify({
              mockupUrl: result.mockupUrl || null,
              error: result.error || null,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: (err as Error).message || "Internal server error during mockup generation",
              mockupUrl: null,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
