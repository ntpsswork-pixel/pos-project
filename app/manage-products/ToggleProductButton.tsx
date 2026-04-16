"use client";

import { useState } from "react";

export default function ToggleProductButton({
  productId,
  isActive,
}: {
  productId: number;
  isActive: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/products/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      // refresh หน้า
      window.location.reload();
    } catch (err) {
      alert("เชื่อมต่อ server ไม่ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`rounded-xl px-4 py-2 text-sm font-bold text-white ${
        isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
      }`}
    >
      {loading ? "..." : isActive ? "ซ่อน" : "แสดง"}
    </button>
  );
}