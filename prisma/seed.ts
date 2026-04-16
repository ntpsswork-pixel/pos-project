import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔥 start seed");

  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      { name: "บิงซู", price: 89, stock: 20 },
      { name: "บัวลอย", price: 45, stock: 15 },
      { name: "น้ำลำไย", price: 35, stock: 30 },
    ],
  });

  console.log("✅ seed success");
}

main()
  .catch(async (e) => {
    console.error("❌ seed error:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });