"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

type Product = {
  id: number;
  name: string;
  stock: number;
};

export default function StockPageClient({
  products,
}: {
  products: Product[];
}) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const setQty = (productId: number, value: string) => {
    const num = Number(value);
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number.isNaN(num) || num < 1 ? 1 : num,
    }));
  };

  const getQty = (productId: number) => quantities[productId] ?? 1;

  const addStock = async (productId: number) => {
    try {
      setLoadingId(productId);

      const res = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: getQty(productId),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "เพิ่มสต๊อกไม่สำเร็จ");
        return;
      }

      window.location.reload();
    } catch {
      alert("เชื่อมต่อระบบไม่สำเร็จ");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-rose-600">รับสินค้าเข้า</h1>
              <p className="mt-1 text-sm text-gray-500">
                เพิ่มจำนวนสต๊อกเข้าสู่ระบบ และดูประวัติ movement ได้ทันที
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Navbar current="stock" />
              <a
                href="/stock/history"
                className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                Movement History
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-white bg-white p-5 shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="truncate text-2xl font-bold">{product.name}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    stock ปัจจุบัน: {product.stock}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={getQty(product.id)}
                    onChange={(e) => setQty(product.id, e.target.value)}
                    className="w-28 rounded-xl border p-3 text-center text-lg font-semibold outline-none focus:border-rose-400"
                  />

                  <button
                    onClick={() => addStock(product.id)}
                    disabled={loadingId === product.id}
                    className="rounded-xl bg-green-500 px-6 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-green-600 disabled:bg-gray-300"
                  >
                    {loadingId === product.id ? "กำลังเพิ่ม..." : "เพิ่ม"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}