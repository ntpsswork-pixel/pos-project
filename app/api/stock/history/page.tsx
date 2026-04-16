import { prisma } from "@/lib/prisma";

export default async function StockHistoryPage() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">ประวัติการรับสินค้า</h1>

          <a
            href="/stock"
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            กลับไปหน้า Stock
          </a>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="grid grid-cols-[120px_1fr_120px_180px] border-b bg-gray-50 px-4 py-3 font-semibold">
            <div>ประเภท</div>
            <div>สินค้า</div>
            <div className="text-center">จำนวน</div>
            <div className="text-right">เวลา</div>
          </div>

          {movements.length === 0 ? (
            <div className="p-6 text-gray-500">ยังไม่มีประวัติ</div>
          ) : (
            movements.map((m) => (
              <div
                key={m.id}
                className="grid grid-cols-[120px_1fr_120px_180px] items-center border-b px-4 py-3 last:border-b-0"
              >
                <div>
                  <span
                    className={`rounded px-2 py-1 text-sm font-medium ${
                      m.type === "IN"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.type}
                  </span>
                </div>

                <div>{m.product.name}</div>

                <div className="text-center">{m.quantity}</div>

                <div className="text-right text-sm text-gray-500">
                  {new Date(m.createdAt).toLocaleString("th-TH")}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}