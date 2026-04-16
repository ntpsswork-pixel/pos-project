"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";

type SaleItem = {
  id: number;
  name: string;
  qty: number;
  lineTotal: number;
};

type Sale = {
  id: number;
  totalAmount: number;
  createdAt: string | Date;
  items: SaleItem[];
};

type Product = {
  id: number;
  name: string;
  stock: number;
};

type CompareProduct = {
  name: string;
  qty: number;
  revenue: number;
};

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function MiniBarChart({
  title,
  labels,
  values,
  colorClass,
}: {
  title: string;
  labels: string[];
  values: number[];
  colorClass: string;
}) {
  const maxValue = Math.max(...values, 1);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-5 text-xl font-bold">{title}</h2>

      <div className="space-y-4">
        {labels.map((label, index) => (
          <div key={`${label}-${index}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{label}</span>
              <span className="font-bold">{values[index]}</span>
            </div>

            <div className="h-4 rounded-full bg-gray-100">
              <div
                className={`h-4 rounded-full ${colorClass}`}
                style={{
                  width: `${Math.max(
                    (values[index] / maxValue) * 100,
                    values[index] > 0 ? 8 : 0
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardClient({
  sales,
  products,
}: {
  sales: Sale[];
  products: Product[];
}) {
  const today = new Date();
  const [startDate, setStartDate] = useState(toInputDate(today));
  const [endDate, setEndDate] = useState(toInputDate(today));
  const [leftName, setLeftName] = useState("");
  const [rightName, setRightName] = useState("");
  const [loadingDemo, setLoadingDemo] = useState(false);

  const filtered = useMemo(() => {
    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    const selectedSales = sales.filter((sale) => {
      const created = new Date(sale.createdAt);
      return created >= start && created <= end;
    });

    const diffDays = Math.max(
      1,
      Math.floor(
        (startOfDay(new Date(endDate)).getTime() -
          startOfDay(new Date(startDate)).getTime()) /
          86400000
      ) + 1
    );

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);

    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - (diffDays - 1));
    prevStart.setHours(0, 0, 0, 0);

    const previousSales = sales.filter((sale) => {
      const created = new Date(sale.createdAt);
      return created >= prevStart && created <= prevEnd;
    });

    const revenue = selectedSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const previousRevenue = previousSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );

    const orders = selectedSales.length;
    const previousOrders = previousSales.length;
    const avgBill = orders > 0 ? Math.round(revenue / orders) : 0;

    const diffRevenue = revenue - previousRevenue;
    const revenueChangePercent =
      previousRevenue > 0
        ? Math.round((diffRevenue / previousRevenue) * 100)
        : revenue > 0
        ? 100
        : 0;

    const productMap: Record<string, { qty: number; revenue: number }> = {};
    const hourMap: Record<number, number> = {};

    selectedSales.forEach((sale) => {
      const hour = new Date(sale.createdAt).getHours();
      hourMap[hour] = (hourMap[hour] || 0) + 1;

      sale.items.forEach((item) => {
        if (!productMap[item.name]) {
          productMap[item.name] = { qty: 0, revenue: 0 };
        }
        productMap[item.name].qty += item.qty;
        productMap[item.name].revenue += item.lineTotal;
      });
    });

    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        qty: data.qty,
        revenue: data.revenue,
      }));

    const compareProducts = Object.entries(productMap)
      .sort((a, b) => b[1].qty - a[1].qty)
      .map(([name, data]) => ({
        name,
        qty: data.qty,
        revenue: data.revenue,
      }));

    const lowStock = products
      .filter((product) => product.stock <= 5)
      .sort((a, b) => a.stock - b.stock);

    const days = eachDay(start, end);
    const revenueByDay = days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const value = selectedSales
        .filter((sale) => {
          const created = new Date(sale.createdAt);
          return created >= dayStart && created <= dayEnd;
        })
        .reduce((sum, sale) => sum + sale.totalAmount, 0);

      return {
        label: day.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "2-digit",
        }),
        value,
      };
    });

    const bestHourEntry = Object.entries(hourMap).sort((a, b) => b[1] - a[1])[0];
    const bestHourText = bestHourEntry
      ? `${String(bestHourEntry[0]).padStart(2, "0")}:00 - ${String(
          Number(bestHourEntry[0]) + 1
        ).padStart(2, "0")}:00`
      : "-";

    const bestSeller = topProducts[0]?.name ?? "-";

    return {
      selectedSales,
      revenue,
      previousRevenue,
      orders,
      previousOrders,
      avgBill,
      diffRevenue,
      revenueChangePercent,
      topProducts,
      compareProducts,
      lowStock,
      revenueCompare: [
        { label: "ช่วงก่อนหน้า", value: previousRevenue },
        { label: "ช่วงที่เลือก", value: revenue },
      ],
      ordersCompare: [
        { label: "ช่วงก่อนหน้า", value: previousOrders },
        { label: "ช่วงที่เลือก", value: orders },
      ],
      revenueByDay,
      bestHourText,
      bestSeller,
    };
  }, [sales, products, startDate, endDate]);

  const compareOptions = filtered.compareProducts;
  const selectedLeft =
    compareOptions.find((p) => p.name === leftName) ?? compareOptions[0];
  const selectedRight =
    compareOptions.find((p) => p.name === rightName) ?? compareOptions[1];

  const maxCompareQty = Math.max(
    selectedLeft?.qty ?? 0,
    selectedRight?.qty ?? 0,
    1
  );

  const maxCompareRevenue = Math.max(
    selectedLeft?.revenue ?? 0,
    selectedRight?.revenue ?? 0,
    1
  );

  const diffText =
    filtered.diffRevenue > 0
      ? `+${filtered.diffRevenue}฿`
      : filtered.diffRevenue < 0
      ? `${filtered.diffRevenue}฿`
      : "0฿";

  const diffColor =
    filtered.diffRevenue > 0
      ? "text-green-600"
      : filtered.diffRevenue < 0
      ? "text-red-600"
      : "text-gray-500";

  const percentText =
    filtered.revenueChangePercent > 0
      ? `+${filtered.revenueChangePercent}%`
      : filtered.revenueChangePercent < 0
      ? `${filtered.revenueChangePercent}%`
      : "0%";

  const createDemoData = async () => {
    try {
      setLoadingDemo(true);

      const res = await fetch("/api/demo-data", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "สร้าง demo data ไม่สำเร็จ");
        return;
      }

      alert(`สร้าง demo data สำเร็จ ${data.count} บิล`);
      window.location.reload();
    } catch {
      alert("เชื่อมต่อระบบไม่สำเร็จ");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-black">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-rose-600">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                วิเคราะห์ยอดขายจากช่วงวันที่ที่เลือกได้ พร้อมเปรียบเทียบสินค้า
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Navbar current="dashboard" />
              <button
                onClick={createDemoData}
                disabled={loadingDemo}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:bg-gray-300"
              >
                {loadingDemo ? "กำลังสร้าง..." : "Generate Demo Data"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-md">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border p-3 outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-500">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border p-3 outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  const now = new Date();
                  const todayStr = toInputDate(now);
                  setStartDate(todayStr);
                  setEndDate(todayStr);
                }}
                className="rounded-xl bg-black px-4 py-3 font-semibold text-white"
              >
                วันนี้
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-5">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">ยอดขายช่วงที่เลือก</p>
            <div className="mt-2 text-4xl font-black text-rose-600">
              {filtered.revenue}฿
            </div>
            <div className={`mt-2 text-sm font-semibold ${diffColor}`}>
              เทียบช่วงก่อนหน้า {diffText} ({percentText})
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">ยอดขายช่วงก่อนหน้า</p>
            <div className="mt-2 text-4xl font-black text-blue-600">
              {filtered.previousRevenue}฿
            </div>
            <div className="mt-2 text-sm text-gray-500">ช่วงก่อนหน้าจำนวนวันเท่ากัน</div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">จำนวนออเดอร์</p>
            <div className="mt-2 text-4xl font-black text-green-600">
              {filtered.orders}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              ช่วงก่อนหน้า {filtered.previousOrders} ออเดอร์
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <p className="text-sm text-gray-500">ค่าเฉลี่ยต่อบิล</p>
            <div className="mt-2 text-4xl font-black text-yellow-600">
              {filtered.avgBill}฿
            </div>
            <div className="mt-2 text-sm text-gray-500">Average bill ช่วงที่เลือก</div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-5">
          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="text-sm font-bold text-gray-500">Insight 1</div>
            <div className="mt-2 text-lg font-bold text-rose-600">
              สินค้าขายดีที่สุด
            </div>
            <div className="mt-1 text-2xl font-black">{filtered.bestSeller}</div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="text-sm font-bold text-gray-500">Insight 2</div>
            <div className="mt-2 text-lg font-bold text-blue-600">
              ช่วงเวลาขายเด่น
            </div>
            <div className="mt-1 text-2xl font-black">{filtered.bestHourText}</div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-md">
            <div className="text-sm font-bold text-gray-500">Insight 3</div>
            <div className="mt-2 text-lg font-bold text-green-600">
              สถานะภาพรวม
            </div>
            <div className="mt-1 text-lg font-black">
              {filtered.diffRevenue > 0
                ? "ยอดขายโตจากช่วงก่อนหน้า"
                : filtered.diffRevenue < 0
                ? "ยอดขายลดลงจากช่วงก่อนหน้า"
                : "ยอดขายทรงตัว"}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6">
          <MiniBarChart
            title="เปรียบเทียบยอดขาย ช่วงที่เลือก vs ช่วงก่อนหน้า"
            labels={filtered.revenueCompare.map((i) => i.label)}
            values={filtered.revenueCompare.map((i) => i.value)}
            colorClass="bg-rose-500"
          />
          <MiniBarChart
            title="เปรียบเทียบจำนวนออเดอร์ ช่วงที่เลือก vs ช่วงก่อนหน้า"
            labels={filtered.ordersCompare.map((i) => i.label)}
            values={filtered.ordersCompare.map((i) => i.value)}
            colorClass="bg-blue-500"
          />
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <MiniBarChart
            title="กราฟยอดขายรายวันตามช่วงวันที่เลือก"
            labels={filtered.revenueByDay.map((i) => i.label)}
            values={filtered.revenueByDay.map((i) => i.value)}
            colorClass="bg-orange-500"
          />
        </div>

        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">📊 Compare Product</h2>
              <p className="mt-1 text-sm text-gray-500">
                เปรียบเทียบสินค้าตามช่วงวันที่ที่เลือก
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={selectedLeft?.name ?? ""}
                onChange={(e) => setLeftName(e.target.value)}
                className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-rose-400"
              >
                {compareOptions.map((product) => (
                  <option key={`left-${product.name}`} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedRight?.name ?? ""}
                onChange={(e) => setRightName(e.target.value)}
                className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-400"
              >
                {compareOptions.map((product) => (
                  <option key={`right-${product.name}`} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {compareOptions.length === 0 ? (
            <div className="text-gray-400">ยังไม่มีข้อมูลสินค้าให้เปรียบเทียบ</div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-2xl border p-5">
                <div className="mb-4 text-sm font-bold text-gray-500">
                  เปรียบเทียบจำนวนขาย
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium">
                        {selectedLeft?.name ?? "-"}
                      </span>
                      <span className="font-bold">{selectedLeft?.qty ?? 0}</span>
                    </div>
                    <div className="h-4 rounded-full bg-gray-100">
                      <div
                        className="h-4 rounded-full bg-rose-500"
                        style={{
                          width: `${Math.max(
                            ((selectedLeft?.qty ?? 0) / maxCompareQty) * 100,
                            (selectedLeft?.qty ?? 0) > 0 ? 8 : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium">
                        {selectedRight?.name ?? "-"}
                      </span>
                      <span className="font-bold">{selectedRight?.qty ?? 0}</span>
                    </div>
                    <div className="h-4 rounded-full bg-gray-100">
                      <div
                        className="h-4 rounded-full bg-blue-500"
                        style={{
                          width: `${Math.max(
                            ((selectedRight?.qty ?? 0) / maxCompareQty) * 100,
                            (selectedRight?.qty ?? 0) > 0 ? 8 : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-5">
                <div className="mb-4 text-sm font-bold text-gray-500">
                  เปรียบเทียบรายได้
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium">
                        {selectedLeft?.name ?? "-"}
                      </span>
                      <span className="font-bold">
                        {selectedLeft?.revenue ?? 0}฿
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-gray-100">
                      <div
                        className="h-4 rounded-full bg-rose-500"
                        style={{
                          width: `${Math.max(
                            ((selectedLeft?.revenue ?? 0) / maxCompareRevenue) * 100,
                            (selectedLeft?.revenue ?? 0) > 0 ? 8 : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium">
                        {selectedRight?.name ?? "-"}
                      </span>
                      <span className="font-bold">
                        {selectedRight?.revenue ?? 0}฿
                      </span>
                    </div>
                    <div className="h-4 rounded-full bg-gray-100">
                      <div
                        className="h-4 rounded-full bg-blue-500"
                        style={{
                          width: `${Math.max(
                            ((selectedRight?.revenue ?? 0) / maxCompareRevenue) * 100,
                            (selectedRight?.revenue ?? 0) > 0 ? 8 : 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">🏆 สินค้าขายดี</h2>

            {filtered.topProducts.length === 0 ? (
              <p className="text-gray-400">ยังไม่มีข้อมูล</p>
            ) : (
              <div className="space-y-3">
                {filtered.topProducts.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        รายได้ {item.revenue}฿
                      </div>
                    </div>
                    <div className="font-bold text-rose-600">{item.qty}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold">⚠️ สินค้าใกล้หมด</h2>

            {filtered.lowStock.length === 0 ? (
              <p className="text-gray-400">ไม่มีสินค้าใกล้หมด</p>
            ) : (
              <div className="space-y-3">
                {filtered.lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
                  >
                    <div className="font-semibold">{product.name}</div>
                    <div className="font-bold text-red-500">{product.stock}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold">🧾 ออเดอร์ล่าสุดในช่วงที่เลือก</h2>

          {filtered.selectedSales.length === 0 ? (
            <p className="text-gray-400">ยังไม่มีออเดอร์ในช่วงนี้</p>
          ) : (
            <div className="overflow-hidden rounded-xl border">
              <div className="grid grid-cols-[120px_1fr_140px_180px] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                <div>ออเดอร์</div>
                <div>จำนวนรายการ</div>
                <div className="text-right">ยอดรวม</div>
                <div className="text-right">เวลา</div>
              </div>

              {filtered.selectedSales
                .slice()
                .reverse()
                .slice(0, 10)
                .reverse()
                .map((sale) => (
                  <div
                    key={sale.id}
                    className="grid grid-cols-[120px_1fr_140px_180px] items-center border-t px-4 py-3"
                  >
                    <div className="font-semibold">#{sale.id}</div>
                    <div>{sale.items.length} รายการ</div>
                    <div className="text-right font-bold">{sale.totalAmount}฿</div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleString("th-TH")}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-rose-200 bg-white/70 p-5 text-sm text-gray-600">
          <div className="font-bold text-rose-600">ต่อยอด Dashboard ได้อีก</div>
          <div className="mt-2">
            เปรียบเทียบสาขา / วิเคราะห์โปรโมชั่น / peak hour / branch ranking /
            campaign performance
          </div>
        </div>
      </div>
    </div>
  );
}