import { prisma } from "@/lib/prisma";
import POSClient from "./POSClient";

export default async function POSPage() {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  return <POSClient products={products} />;
}