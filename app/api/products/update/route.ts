import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { id, name, price, stock, imageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ไม่มี product id" },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "update ไม่สำเร็จ" },
      { status: 500 }
    );
  }
}