import { createFileRoute } from "@tanstack/react-router";
import { getPrintfulProductsFromApi } from "@/lib/printful";

export const Route = createFileRoute("/api/printful/products")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const products = await getPrintfulProductsFromApi();
          return new Response(
            JSON.stringify({
              products,
              count: products.length,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({
              error: (err as Error).message || "Failed to fetch products from Printful API",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
