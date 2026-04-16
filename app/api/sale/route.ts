import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CheckoutItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const items: CheckoutItem[] = body.items ?? [];
    const totalAmount: number = body.totalAmount ?? 0;

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "ไม่มีสินค้าในตะกร้า" },
        { status: 400 }
      );
    }

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, error: `ไม่พบสินค้า ${item.name}` },
          { status: 404 }
        );
      }

      if (product.stock < item.qty) {
        return NextResponse.json(
          { success: false, error: `สินค้า ${item.name} มีไม่พอ` },
          { status: 400 }
        );
      }
    }

    const sale = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.id,
            quantity: item.qty,
            type: "OUT",
          },
        });
      }

      return await tx.sale.create({
        data: {
          totalAmount,
          status: "PENDING",
          items: {
            create: items.map((item) => ({
              name: item.name,
              price: item.price,
              qty: item.qty,
              lineTotal: item.price * item.qty,
            })),
          },
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json({ success: true, sale });
  } catch (error) {
    console.error("POST /api/sale error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "ชำระเงินไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const saleId = Number(body.saleId);

    if (!saleId) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ saleId" },
        { status: 400 }
      );
    }

    const sale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        status: "DONE",
      },
    });

    return NextResponse.json({ success: true, sale });
  } catch (error) {
    console.error("PATCH /api/sale error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "อัปเดตสถานะไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}