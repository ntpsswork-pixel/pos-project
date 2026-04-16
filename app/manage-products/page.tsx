import { prisma } from "@/lib/prisma";
import ManageProductsClient from "./ManageProductsClient";

export default async function ManageProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { id: "asc" },
  });

  return <ManageProductsClient products={products} />;
}