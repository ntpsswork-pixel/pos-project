"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

export default function ProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !price || !stock) {
      alert("กรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          stock: Number(stock),
          imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "เพิ่มสินค้าไม่สำเร็จ");
        return;
      }

      alert("เพิ่มสินค้าสำเร็จ");
      setName("");
      setPrice("");
      setStock("");
      setImageUrl("");
    } catch {
      alert("เชื่อมต่อระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-rose-600">เพิ่มสินค้า</h1>
              <p className="mt-1 text-sm text-gray-500">
                เพิ่มเมนูใหม่เข้าระบบ POS
              </p>
            </div>

            <Navbar current="product" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-md">
            <div>
              <label className="text-sm text-gray-500">ชื่อสินค้า</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:border-rose-400"
                placeholder="เช่น บิงซูนมสด"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">ราคา (บาท)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">จำนวนสต๊อก</label>
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-500">รูปสินค้า (URL)</label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1 w-full rounded-xl border p-3 outline-none focus:border-rose-400"
                placeholder="https://..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-green-500 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-green-600 disabled:bg-gray-300"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกสินค้า"}
            </button>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-md">
            <p className="mb-3 text-sm text-gray-500">ตัวอย่างสินค้า</p>

            {imageUrl ? (
              <img
                src={imageUrl}
                className="mb-4 h-56 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="mb-4 flex h-56 w-full items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                ไม่มีรูป
              </div>
            )}

            <h2 className="text-2xl font-bold">{name || "ชื่อสินค้า"}</h2>
            <p className="mt-1 font-semibold text-rose-600">
              {price ? `${price}฿` : "ราคา"}
            </p>

            <p className="mt-2 text-sm text-gray-500">stock: {stock || "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}