import { prisma } from "@/lib/prisma";
import StockPageClient from "./StockPageClient";

export default async function StockPage() {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: { id: "asc" },
  });

  return <StockPageClient products={products} />;
}