"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive?: boolean;
};

type CartItem = {
  id: number;
  name: string;
  baseName: string;
  price: number;
  qty: number;
  stock: number;
  imageUrl?: string | null;
  size: string;
  toppings: string[];
};

export default function POSClient({ products }: { products: Product[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [size, setSize] = useState("M");
  const [toppings, setToppings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const visibleProducts = useMemo(
    () => products.filter((p) => p.isActive !== false),
    [products]
  );

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const toggleTopping = (t: string) => {
    setToppings((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const resetPopup = () => {
    setSelected(null);
    setToppings([]);
    setSize("M");
  };

  const addConfiguredToCart = () => {
    if (!selected) return;
    if (selected.stock <= 0) return;

    const toppingPrice = toppings.length * 10;
    const sizePrice = size === "L" ? 20 : size === "S" ? -10 : 0;
    const finalPrice = selected.price + toppingPrice + sizePrice;
    const displayName = `${selected.name} (${size})`;

    setCart((prev) => {
      const found = prev.find(
        (item) =>
          item.id === selected.id &&
          item.size === size &&
          JSON.stringify(item.toppings) === JSON.stringify(toppings)
      );

      if (!found) {
        return [
          ...prev,
          {
            id: selected.id,
            name: displayName,
            baseName: selected.name,
            price: finalPrice,
            qty: 1,
            stock: selected.stock,
            imageUrl: selected.imageUrl ?? null,
            size,
            toppings: [...toppings],
          },
        ];
      }

      const currentQtyForProduct = prev
        .filter((item) => item.id === selected.id)
        .reduce((sum, item) => sum + item.qty, 0);

      if (currentQtyForProduct >= selected.stock) return prev;

      return prev.map((item) =>
        item.id === selected.id &&
        item.size === size &&
        JSON.stringify(item.toppings) === JSON.stringify(toppings)
          ? { ...item, qty: item.qty + 1 }
          : item
      );
    });

    resetPopup();
  };

  const increaseQty = (index: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (!item) return prev;

      const totalQtyForSameProduct = prev
        .filter((p) => p.id === item.id)
        .reduce((sum, p) => sum + p.qty, 0);

      if (totalQtyForSameProduct >= item.stock) return prev;

      return prev.map((p, i) => (i === index ? { ...p, qty: p.qty + 1 } : p));
    });
  };

  const decreaseQty = (index: number) => {
    setCart((prev) =>
      prev
        .map((p, i) => (i === index ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const checkout = async () => {
    if (cart.length === 0) return;

    try {
      setLoading(true);

      const payload = {
        items: cart.map((item) => ({
          id: item.id,
          name:
            item.toppings.length > 0
              ? `${item.name} + ${item.toppings.join(", ")}`
              : item.name,
          price: item.price,
          qty: item.qty,
        })),
        totalAmount: total,
      };

      const res = await fetch("/api/sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "ชำระเงินไม่สำเร็จ");
        return;
      }

      alert(`ชำระเงินสำเร็จ | Order #${data.sale.id}`);
      setCart([]);
      window.location.reload();
    } catch {
      alert("เชื่อมต่อระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 text-black">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <div className="w-[68%] p-6">
          <div className="mb-6 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-sm">
                <h1 className="text-4xl font-black leading-tight text-rose-600">
                  Tingting POS
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  เลือกเมนู เพิ่มตัวเลือก และบันทึกออเดอร์ได้ในระบบเดียว
                </p>
              </div>

              <Navbar current="pos" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {visibleProducts.map((p) => {
              const isLow = p.stock > 0 && p.stock <= 5;
              const isOut = p.stock <= 0;

              return (
                <button
                  key={p.id}
                  onClick={() => !isOut && setSelected(p)}
                  disabled={isOut}
                  className={`overflow-hidden rounded-2xl border text-left shadow-md transition hover:-translate-y-1 hover:shadow-lg ${
                    isOut
                      ? "cursor-not-allowed border-red-200 bg-red-100"
                      : isLow
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-white bg-white"
                  }`}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-gray-200 text-gray-500">
                      ไม่มีรูป
                    </div>
                  )}

                  <div className="space-y-2 p-4">
                    <div className="truncate text-2xl font-bold">{p.name}</div>
                    <div className="text-lg font-semibold text-rose-600">
                      {p.price}฿
                    </div>

                    <div
                      className={`text-sm font-medium ${
                        isOut
                          ? "text-red-600"
                          : isLow
                          ? "text-yellow-700"
                          : "text-gray-500"
                      }`}
                    >
                      {isOut
                        ? "ของหมด"
                        : isLow
                        ? `stock: ${p.stock} ⚠️ ใกล้หมด`
                        : `stock: ${p.stock}`}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-[32%] border-l border-rose-100 bg-white/90 p-6 backdrop-blur">
          <h2 className="mb-5 text-3xl font-black text-rose-600">ตะกร้า</h2>

          <div className="min-h-[420px] rounded-2xl border border-rose-100 bg-white p-5 shadow-md">
            {cart.length === 0 ? (
              <div className="text-gray-400">ยังไม่มีรายการ</div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, i) => (
                  <div key={i} className="border-b pb-3 last:border-b-0">
                    <div className="grid grid-cols-[1fr_auto_110px] items-center gap-3">
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        {item.toppings.length > 0 && (
                          <div className="mt-1 text-xs text-gray-500">
                            + {item.toppings.join(", ")}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-400">
                          {item.price}฿ / ชิ้น
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decreaseQty(i)}
                          className="h-8 w-8 rounded-lg bg-slate-200 font-bold hover:bg-slate-300"
                        >
                          -
                        </button>
                        <span className="w-5 text-center font-semibold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => increaseQty(i)}
                          className="h-8 w-8 rounded-lg bg-slate-200 font-bold hover:bg-slate-300"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right font-bold">
                        {item.price * item.qty}฿
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 text-3xl font-black">รวม {total}฿</div>

          <button
            onClick={checkout}
            disabled={cart.length === 0 || loading}
            className="mt-5 w-full rounded-2xl bg-green-500 py-4 text-xl font-bold text-white shadow-md transition hover:bg-green-600 disabled:bg-slate-300"
          >
            {loading ? "กำลังบันทึก..." : "ชำระเงิน"}
          </button>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-black text-rose-600">
              {selected.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">เลือกขนาดและ topping</p>

            <div className="mt-5">
              <p className="mb-2 font-semibold">ขนาด</p>
              <div className="flex gap-2">
                {["S", "M", "L"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-xl px-4 py-2 font-semibold ${
                      size === s
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 font-semibold">Topping (+10฿ / อย่าง)</p>
              <div className="flex flex-wrap gap-2">
                {["ไข่มุก", "เฉาก๊วย", "โมจิ"].map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleTopping(t)}
                    className={`rounded-xl px-4 py-2 font-medium ${
                      toppings.includes(t)
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-black"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={addConfiguredToCart}
                className="flex-1 rounded-xl bg-green-500 py-3 font-bold text-white"
              >
                เพิ่มลงตะกร้า
              </button>

              <button
                onClick={resetPopup}
                className="flex-1 rounded-xl bg-gray-200 py-3 font-bold text-black"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}