"use client";

import { useState } from "react";

export default function EditProductModal({
  product,
}: {
  product: any;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/products/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
          name,
          price: Number(price),
          stock: Number(stock),
          imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "แก้ไขไม่สำเร็จ");
        return;
      }

      alert("บันทึกสำเร็จ");
      window.location.reload();
    } catch {
      alert("เชื่อมต่อระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-blue-500 px-3 py-2 text-sm text-white"
      >
        แก้ไข
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-black shadow-xl">
            <h2 className="mb-4 text-2xl font-bold">แก้ไขสินค้า</h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  ชื่อสินค้า
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  ราคา
                </label>
                <input
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  type="number"
                  className="w-full rounded-xl border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  สต๊อก
                </label>
                <input
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  type="number"
                  className="w-full rounded-xl border p-3"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-500">
                  รูปสินค้า (URL)
                </label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border p-3"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={save}
                disabled={loading}
                className="flex-1 rounded-xl bg-green-500 py-3 font-bold text-white disabled:bg-gray-300"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>

              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-gray-200 py-3 font-bold"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}