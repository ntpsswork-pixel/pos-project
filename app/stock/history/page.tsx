import { prisma } from "@/lib/prisma";
import Navbar from "../../components/Navbar";

export default async function StockHistoryPage() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 p-6 text-black">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-rose-600">
                ประวัติการรับสินค้า
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                ติดตาม movement เข้า-ออกของสินค้าในระบบ
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Navbar current="stock" />
              <a
                href="/stock"
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
              >
                กลับหน้า Stock
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-md">
          <div className="grid grid-cols-[160px_1fr_140px_220px] bg-gray-50 px-4 py-4 text-sm font-bold text-gray-600">
            <div>ประเภท</div>
            <div>สินค้า</div>
            <div className="text-center">จำนวน</div>
            <div className="text-right">เวลา</div>
          </div>

          {movements.length === 0 ? (
            <div className="p-8 text-center text-gray-400">ยังไม่มีประวัติ</div>
          ) : (
            movements.map((movement) => (
              <div
                key={movement.id}
                className="grid grid-cols-[160px_1fr_140px_220px] items-center border-t px-4 py-4"
              >
                <div>
                  <span
                    className={`rounded-full px-3 py-2 text-sm font-bold ${
                      movement.type === "IN"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {movement.type}
                  </span>
                </div>

                <div className="font-medium">{movement.product.name}</div>

                <div className="text-center text-xl font-semibold">
                  {movement.quantity}
                </div>

                <div className="text-right text-sm text-gray-500">
                  {new Date(movement.createdAt).toLocaleString("th-TH")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}