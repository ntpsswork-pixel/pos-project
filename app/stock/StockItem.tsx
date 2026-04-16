"use client";

import { useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export default function StockItem({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (qty <= 0) return;

    try {
      setLoading(true);

      const res = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: Number(qty),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "error");
        return;
      }

      alert("เพิ่ม stock สำเร็จ");
      window.location.reload();
    } catch {
      alert("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow">
      <div>
        <div className="font-semibold">{product.name}</div>
        <div className="text-sm text-gray-500">stock: {product.stock}</div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-20 rounded border px-2 py-1"
        />

        <button
          onClick={handleAdd}
          disabled={loading}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-300"
        >
          เพิ่ม
        </button>
      </div>
    </div>
  );
}