type NavbarProps = {
  current?:
    | "pos"
    | "history"
    | "dashboard"
    | "stock"
    | "product"
    | "manage"
    | "queue";
};

export default function Navbar({ current }: NavbarProps) {
  const base =
    "rounded-xl px-4 py-2 text-sm font-semibold transition shadow-sm";
  const active = "ring-2 ring-offset-2 ring-black/10";

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/pos"
        className={`${base} bg-black text-white ${
          current === "pos" ? active : ""
        }`}
      >
        POS
      </a>

      <a
        href="/history"
        className={`${base} bg-zinc-900 text-white ${
          current === "history" ? active : ""
        }`}
      >
        History
      </a>

      <a
        href="/dashboard"
        className={`${base} bg-blue-500 text-white ${
          current === "dashboard" ? active : ""
        }`}
      >
        Dashboard
      </a>

      <a
        href="/stock"
        className={`${base} bg-green-500 text-white ${
          current === "stock" ? active : ""
        }`}
      >
        Stock
      </a>

      <a
        href="/product"
        className={`${base} bg-purple-500 text-white ${
          current === "product" ? active : ""
        }`}
      >
        Add Product
      </a>

      <a
        href="/manage-products"
        className={`${base} bg-slate-700 text-white ${
          current === "manage" ? active : ""
        }`}
      >
        Manage Products
      </a>

      <a
        href="/queue"
        className={`${base} bg-orange-500 text-white ${
          current === "queue" ? active : ""
        }`}
      >
        Queue
      </a>
    </div>
  );
}