import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [sales, products] = await Promise.all([
    prisma.sale.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),
    prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return <DashboardClient sales={sales} products={products} />;
}