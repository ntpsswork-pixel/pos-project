import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const price = Number(body.price ?? 0);
    const stock = Number(body.stock ?? 0);
    const imageUrl =
      String(body.imageUrl ?? "").trim() === ""
        ? null
        : String(body.imageUrl).trim();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "กรุณาใส่ชื่อสินค้า" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { success: false, error: "ราคาต้องมากกว่า 0" },
        { status: 400 }
      );
    }

    if (stock < 0) {
      return NextResponse.json(
        { success: false, error: "stock ต้องไม่ติดลบ" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        imageUrl,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "server error",
      },
      { status: 500 }
    );
  }
}