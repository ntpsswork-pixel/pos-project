import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสินค้าในระบบสำหรับสร้าง demo data" },
        { status: 400 }
      );
    }

    const createdSales = await prisma.$transaction(async (tx: any) => {
      const salesToCreate = 60;
      const created = [];

      for (let i = 0; i < salesToCreate; i++) {
        const daysAgo = randomBetween(0, 6);
        const hour = randomBetween(10, 21);
        const minute = randomBetween(0, 59);

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        createdAt.setHours(hour, minute, 0, 0);

        const itemCount = randomBetween(1, 3);
        const selectedProducts = [...products]
          .sort(() => Math.random() - 0.5)
          .slice(0, itemCount);

        const items = selectedProducts.map((product) => {
          const qty = randomBetween(1, 3);
          return {
            name: product.name,
            price: product.price,
            qty,
            lineTotal: product.price * qty,
          };
        });

        const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

        const sale = await tx.sale.create({
          data: {
            totalAmount,
            status: Math.random() > 0.3 ? "DONE" : "PENDING",
            createdAt,
            items: {
              create: items,
            },
          },
        });

        created.push(sale);
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      count: createdSales.length,
    });
  } catch (error) {
    console.error("POST /api/demo-data error:", error);

    return NextResponse.json(
      { success: false, error: "สร้าง demo data ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}