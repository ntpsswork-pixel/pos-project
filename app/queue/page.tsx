import { prisma } from "@/lib/prisma";
import Navbar from "../components/Navbar";
import DoneButton from "./DoneButton";

export default async function QueuePage() {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-rose-600">
                Order Queue
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                จัดการคิวออเดอร์หน้าร้านและครัว
              </p>
            </div>

            <Navbar current="queue" />
          </div>
        </div>

        {sales.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-md">
            ยังไม่มีออเดอร์
          </div>
        ) : (
          <div className="grid gap-5">
            {sales.map((sale: any) => (
              <div
                key={sale.id}
                className="rounded-2xl border border-rose-100 bg-white p-6 shadow-md"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <div className="text-2xl font-black text-rose-600">
                      Order #{sale.id}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {new Date(sale.createdAt).toLocaleString("th-TH")}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-full px-4 py-2 text-sm font-bold ${
                        sale.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {sale.status}
                    </div>

                    {sale.status === "PENDING" && <DoneButton saleId={sale.id} />}
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border">
                  <div className="grid grid-cols-[1fr_120px_120px] bg-gray-50 px-4 py-3 text-sm font-bold text-gray-600">
                    <div>รายการ</div>
                    <div className="text-center">จำนวน</div>
                    <div className="text-right">รวม</div>
                  </div>

                  {sale.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_120px_120px] items-center border-t px-4 py-3"
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-center">{item.qty}</div>
                      <div className="text-right font-semibold">
                        {item.lineTotal}฿
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {sale.items.length} รายการ
                  </div>
                  <div className="text-2xl font-black">รวม {sale.totalAmount}฿</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}