"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ToggleProductButton from "./ToggleProductButton";
import EditProductModal from "./EditProductModal";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string | Date;
};

export default function ManageProductsClient({
  products,
}: {
  products: Product[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        keyword === "" ||
        product.name.toLowerCase().includes(keyword) ||
        String(product.id).includes(keyword);

      const matchFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && product.isActive) ||
        (filter === "INACTIVE" && !product.isActive);

      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-rose-600">
                Manage Products
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                จัดการการแสดงผลและข้อมูลสินค้าในระบบ POS
              </p>
            </div>

            <Navbar current="manage" />
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-md">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                ค้นหาสินค้า
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาจากชื่อสินค้า หรือ ID"
                className="w-full rounded-xl border p-3 outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                สถานะ
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold ${
                    filter === "ALL"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  ทั้งหมด
                </button>

                <button
                  onClick={() => setFilter("ACTIVE")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold ${
                    filter === "ACTIVE"
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  แสดงอยู่
                </button>

                <button
                  onClick={() => setFilter("INACTIVE")}
                  className={`rounded-xl px-4 py-3 text-sm font-bold ${
                    filter === "INACTIVE"
                      ? "bg-slate-700 text-white"
                      : "bg-gray-100 text-black"
                  }`}
                >
                  ซ่อนอยู่
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            พบ {filteredProducts.length} รายการ
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="grid grid-cols-[100px_1fr_140px_120px_140px_220px] bg-gray-50 px-4 py-4 text-sm font-bold text-gray-600">
            <div>ID</div>
            <div>สินค้า</div>
            <div className="text-right">ราคา</div>
            <div className="text-right">Stock</div>
            <div className="text-center">สถานะ</div>
            <div className="text-center">จัดการ</div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">ไม่พบสินค้า</div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="grid grid-cols-[100px_1fr_140px_120px_140px_220px] items-center border-t px-4 py-4"
              >
                <div>#{product.id}</div>

                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-200 text-xs text-gray-500">
                      ไม่มีรูป
                    </div>
                  )}

                  <div>
                    <div className="font-semibold">{product.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(product.createdAt).toLocaleString("th-TH")}
                    </div>
                  </div>
                </div>

                <div className="text-right font-semibold">{product.price}฿</div>
                <div className="text-right">{product.stock}</div>

                <div className="text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      product.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {product.isActive ? "แสดงอยู่" : "ซ่อนอยู่"}
                  </span>
                </div>

                <div className="flex justify-center gap-2">
                  <EditProductModal product={product} />
                  <ToggleProductButton
                    productId={product.id}
                    isActive={product.isActive}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}