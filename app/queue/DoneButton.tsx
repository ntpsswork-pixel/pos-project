"use client";

import { useState } from "react";

export default function DoneButton({ saleId }: { saleId: number }) {
  const [loading, setLoading] = useState(false);

  const markDone = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/sale", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ saleId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "อัปเดตสถานะไม่สำเร็จ");
        return;
      }

      window.location.reload();
    } catch {
      alert("เชื่อมต่อระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={markDone}
      disabled={loading}
      className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-bold text-white shadow hover:bg-green-600 disabled:bg-gray-300"
    >
      {loading ? "กำลังอัปเดต..." : "เสร็จแล้ว"}
    </button>
  );
}