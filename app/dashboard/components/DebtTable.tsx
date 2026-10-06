"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  Inbox,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { formatDate, formatRelativeTime, formatRupiah } from "@/utils/formatter";
import type { DebtItem } from "@/types/debt";

type StatusFilter = "all" | "unsettled" | "settled";
type TypeFilter = "all" | "owed_to_me" | "i_owe";
type SortOption = "newest" | "oldest" | "amount_desc" | "amount_asc";

type Props = {
  debts: DebtItem[];
  isLoading: boolean;
  /** id yang lagi diproses (tandai lunas), buat nunjukin spinner per baris. */
  busyId: string | null;
  onAddClick: () => void;
  onEdit: (debt: DebtItem) => void;
  onToggleSettle: (debt: DebtItem) => void;
  onDelete: (debt: DebtItem) => void;
};

const selectClass =
  "w-full sm:w-auto rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-black focus:outline-none";

function TypeBadge({ type }: { type: DebtItem["type"] }) {
  if (type === "owed_to_me") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
        <ArrowUpRight size={12} />
        Dihutang ke saya
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <ArrowDownLeft size={12} />
      Saya hutang
    </span>
  );
}

function StatusBadge({ settled }: { settled: boolean }) {
  if (settled) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
        <CheckCircle size={12} />
        Lunas
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Belum lunas
    </span>
  );
}

function RowActions({
  debt,
  busy,
  onEdit,
  onToggleSettle,
  onDelete,
}: {
  debt: DebtItem;
  busy: boolean;
  onEdit: (debt: DebtItem) => void;
  onToggleSettle: (debt: DebtItem) => void;
  onDelete: (debt: DebtItem) => void;
}) {
  const isSettled = debt.settled_at !== null;

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={() => onToggleSettle(debt)}
        disabled={busy}
        title={isSettled ? "Batal lunas" : "Tandai lunas"}
        aria-label={isSettled ? "Batal lunas" : "Tandai lunas"}
        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isSettled ? (
          <RotateCcw size={16} />
        ) : (
          <CheckCircle size={16} />
        )}
      </button>
      <button
        type="button"
        onClick={() => onEdit(debt)}
        disabled={busy}
        title="Edit"
        aria-label="Edit"
        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-50"
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={() => onDelete(debt)}
        disabled={busy}
        title="Hapus"
        aria-label="Hapus"
        className="rounded-lg border border-red-200 p-1.5 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function DebtTable({
  debts,
  isLoading,
  busyId,
  onAddClick,
  onEdit,
  onToggleSettle,
  onDelete,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");

  const visibleDebts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = debts.filter((debt) => {
      const isSettled = debt.settled_at !== null;
      if (statusFilter === "unsettled" && isSettled) return false;
      if (statusFilter === "settled" && !isSettled) return false;
      if (typeFilter !== "all" && debt.type !== typeFilter) return false;
      if (keyword && !debt.counterpart_name.toLowerCase().includes(keyword)) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return a.created_at.localeCompare(b.created_at);
        case "amount_desc":
          return b.amount - a.amount;
        case "amount_asc":
          return a.amount - b.amount;
        default:
          return b.created_at.localeCompare(a.created_at);
      }
    });
  }, [debts, statusFilter, typeFilter, search, sortBy]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header + kontrol filter */}
      <div className="space-y-4 border-b border-gray-100 p-4 md:p-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Catatan Utang</h2>
            <p className="flex items-center gap-2 text-sm text-gray-500">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading
                ? "Lagi nyegerin data..."
                : `${visibleDebts.length} dari ${debts.length} catatan`}
            </p>
          </div>
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            <Plus size={18} />
            Catat Baru
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="search"
              placeholder="Cari nama orang..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-black focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            aria-label="Filter status"
            className={selectClass}
          >
            <option value="all">Semua status</option>
            <option value="unsettled">Belum lunas</option>
            <option value="settled">Lunas</option>
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
            aria-label="Filter tipe"
            className={selectClass}
          >
            <option value="all">Semua tipe</option>
            <option value="owed_to_me">Dihutang ke saya</option>
            <option value="i_owe">Saya hutang</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            aria-label="Urutkan"
            className={selectClass}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="amount_desc">Jumlah terbesar</option>
            <option value="amount_asc">Jumlah terkecil</option>
          </select>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && debts.length === 0 ? (
        <div className="space-y-3 p-4 md:p-6">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : debts.length === 0 ? (
        /* Empty state: belum ada data sama sekali */
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="rounded-2xl bg-gray-50 p-4 text-gray-400">
            <Inbox size={28} />
          </div>
          <h3 className="mt-4 font-semibold text-gray-900">Belum ada catatan</h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            Mulai catat utang piutang kamu biar gak lupa siapa yang belum bayar.
          </p>
          <button
            type="button"
            onClick={onAddClick}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <Plus size={18} />
            Catat yang pertama
          </button>
        </div>
      ) : visibleDebts.length === 0 ? (
        /* Empty state: ada data tapi kefilter habis */
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <h3 className="font-semibold text-gray-900">
            Gak ada yang cocok sama filter ini
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Coba ganti kata kunci atau reset filternya.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
            className="mt-4 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <>
          {/* Desktop: tabel */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Nama orang</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Jumlah</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {visibleDebts.map((debt) => {
                  const isSettled = debt.settled_at !== null;
                  return (
                    <tr
                      key={debt.id}
                      className={`transition-colors hover:bg-gray-50/80 ${
                        isSettled ? "text-gray-400" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {debt.counterpart_name}
                        </span>
                        {debt.note && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">
                            {debt.note}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <TypeBadge type={debt.type} />
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {formatRupiah(debt.amount)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <span title={formatDate(debt.created_at)}>
                          {formatRelativeTime(debt.created_at)}
                        </span>
                        {debt.due_date && !isSettled && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            Jatuh tempo {formatRelativeTime(debt.due_date)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge settled={isSettled} />
                      </td>
                      <td className="px-6 py-4">
                        <RowActions
                          debt={debt}
                          busy={busyId === debt.id}
                          onEdit={onEdit}
                          onToggleSettle={onToggleSettle}
                          onDelete={onDelete}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: kartu */}
          <ul className="divide-y divide-gray-100 md:hidden">
            {visibleDebts.map((debt) => {
              const isSettled = debt.settled_at !== null;
              return (
                <li key={debt.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {debt.counterpart_name}
                      </p>
                      <p
                        className="text-xs text-gray-400"
                        title={formatDate(debt.created_at)}
                      >
                        {formatRelativeTime(debt.created_at)}
                      </p>
                    </div>
                    <p
                      className={`shrink-0 text-right font-bold ${
                        isSettled ? "text-gray-400 line-through" : "text-gray-900"
                      }`}
                    >
                      {formatRupiah(debt.amount)}
                    </p>
                  </div>

                  {debt.note && (
                    <p className="text-xs text-gray-500">{debt.note}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <TypeBadge type={debt.type} />
                    <StatusBadge settled={isSettled} />
                  </div>

                  <RowActions
                    debt={debt}
                    busy={busyId === debt.id}
                    onEdit={onEdit}
                    onToggleSettle={onToggleSettle}
                    onDelete={onDelete}
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
