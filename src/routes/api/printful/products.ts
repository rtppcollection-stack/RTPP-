import { createFileRoute } from "@tanstack/react-router";
import { CATALOG_PRODUCTS } from "@/lib/printful";

export const Route = createFileRoute("/api/printful/products")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(
          JSON.stringify({
            products: CATALOG_PRODUCTS,
            count: CATALOG_PRODUCTS.length,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
