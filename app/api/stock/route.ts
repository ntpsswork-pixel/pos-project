import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { productId, quantity } = await req.json();

    if (!productId || !quantity || Number(quantity) <= 0) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    await prisma.product.update({
      where: { id: Number(productId) },
      data: {
        stock: {
          increment: Number(quantity),
        },
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: Number(productId),
        quantity: Number(quantity),
        type: "IN",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}