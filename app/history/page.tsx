import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const sales = await prisma.sale.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">ประวัติการขาย</h1>

          <a
            href="/pos"
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            กลับไปหน้า POS
          </a>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow">
          <div className="grid grid-cols-[120px_1fr_120px_120px_180px] border-b bg-gray-50 px-4 py-3 font-semibold">
            <div>ออเดอร์</div>
            <div>สินค้า</div>
            <div className="text-center">จำนวน</div>
            <div className="text-right">รวม</div>
            <div className="text-right">เวลา</div>
          </div>

          {sales.length === 0 ? (
            <div className="p-6 text-gray-500">ยังไม่มีประวัติการขาย</div>
          ) : (
            sales.flatMap((sale) =>
              sale.items.map((item) => (
                <div
                  key={`${sale.id}-${item.id}`}
                  className="grid grid-cols-[120px_1fr_120px_120px_180px] items-center border-b px-4 py-3 last:border-b-0"
                >
                  <div>#{sale.id}</div>
                  <div>{item.name}</div>
                  <div className="text-center">{item.qty}</div>
                  <div className="text-right">{item.lineTotal}฿</div>
                  <div className="text-right text-sm text-gray-500">
                    {new Date(sale.createdAt).toLocaleString("th-TH")}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}