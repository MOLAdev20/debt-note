import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";
import { formatRupiah } from "@/utils/formatter";

type Props = {
  totalOwedToMe: number;
  totalIOwe: number;
  net: number;
};

export default function SummaryCards({ totalOwedToMe, totalIOwe, net }: Props) {
  const isNetPositive = net >= 0;

  // Lebar bar dibandingin dari total keseluruhan, guard biar gak bagi nol.
  const total = totalOwedToMe + totalIOwe;
  const owedRatio = total > 0 ? (totalOwedToMe / total) * 100 : 50;

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Total dihutang ke saya */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Total dihutang ke saya
          </span>
          <div className="rounded-xl bg-green-50 p-2 text-green-600">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 md:text-3xl">
          {formatRupiah(totalOwedToMe)}
        </p>
      </div>

      {/* Total saya hutang */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Total saya hutang
          </span>
          <div className="rounded-xl bg-red-50 p-2 text-red-600">
            <ArrowDownLeft size={18} />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 md:text-3xl">
          {formatRupiah(totalIOwe)}
        </p>
      </div>

      {/* Net */}
      <div className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">
            Net (dihutang - hutang)
          </span>
          <div className="rounded-xl bg-gray-50 p-2 text-gray-600">
            <Scale size={18} />
          </div>
        </div>
        <div>
          <p
            className={`text-2xl font-bold md:text-3xl ${
              isNetPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatRupiah(net)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {isNetPositive
              ? "Aman, kamu masih di posisi dihutang."
              : "Waspada, kamu lebih banyak hutang."}
          </p>
        </div>
      </div>

      {/* Bar chart ringkas: perbandingan dihutang vs hutang */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-3">
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-gray-500">
          <span>Perbandingan (belum lunas)</span>
          <span>{formatRupiah(net)}</span>
        </div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-red-100">
          <div
            className="h-full rounded-l-full bg-green-500 transition-all"
            style={{ width: `${owedRatio}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Dihutang ke saya
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-100" />
            Saya hutang
          </span>
        </div>
      </div>
    </section>
  );
}
