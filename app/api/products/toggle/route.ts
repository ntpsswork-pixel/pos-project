import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const productId = Number(body.productId);

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "ไม่พบ productId" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "ไม่พบสินค้า" },
        { status: 404 }
      );
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        isActive: !product.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (error) {
    console.error("PATCH /api/products/toggle error:", error);

    return NextResponse.json(
      { success: false, error: "อัปเดตไม่สำเร็จ" },
      { status: 500 }
    );
  }
}