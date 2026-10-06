"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import DashboardLayout from "./DashboardLayout";
import SummaryCards from "./SummaryCards";
import DebtTable from "./DebtTable";
import DebtFormModal from "./DebtFormModal";
import ConfirmDialog from "./ConfirmDialog";
import { summarize } from "@/utils/debts";
import { ApiRequestError, JSON_HEADERS, apiRequest } from "@/utils/api";
import type { CreateDebtPayload, DebtItem } from "@/types/debt";

type Props = {
  userEmail: string | null;
  initialDebts: DebtItem[];
  initialError?: string | null;
};

type Toast = { kind: "success" | "error"; message: string };

function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return "Ada yang error. Coba lagi ya!";
}

export default function DashboardClient({
  userEmail,
  initialDebts,
  initialError = null,
}: Props) {
  const [debts, setDebts] = useState<DebtItem[]>(initialDebts);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [toast, setToast] = useState<Toast | null>(null);

  const [formModal, setFormModal] = useState<{
    open: boolean;
    debt: DebtItem | null;
  }>({ open: false, debt: null });
  const [pendingDelete, setPendingDelete] = useState<DebtItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const summary = useMemo(() => summarize(debts), [debts]);

  const showToast = useCallback((next: Toast) => {
    setToast(next);
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  /** Ambil ulang data dari server (server tetap sumber kebenaran). */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await apiRequest<DebtItem[]>("/api/debts", {
        cache: "no-store",
      });
      setDebts(data);
      setErrorMsg(null);
    } catch (error) {
      setErrorMsg(errorMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleToggleSettle = useCallback(
    async (debt: DebtItem) => {
      const willSettle = debt.settled_at === null;
      setBusyId(debt.id);

      try {
        // PATCH kirim nilai eksplisit -> aman dipanggil berkali-kali (idempotent).
        const updated = await apiRequest<DebtItem>(`/api/debts/${debt.id}`, {
          method: "PATCH",
          headers: JSON_HEADERS,
          body: JSON.stringify({
            settled_at: willSettle ? new Date().toISOString() : null,
          }),
        });

        setDebts((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item)),
        );
        showToast({
          kind: "success",
          message: willSettle
            ? `"${updated.counterpart_name}" ditandai lunas.`
            : `"${updated.counterpart_name}" dibalikin jadi belum lunas.`,
        });
      } catch (error) {
        showToast({ kind: "error", message: errorMessage(error) });
      } finally {
        setBusyId(null);
      }
    },
    [showToast],
  );

  const handleFormSubmit = useCallback(
    async (payload: CreateDebtPayload) => {
      const editing = formModal.debt;

      const saved = editing
        ? await apiRequest<DebtItem>(`/api/debts/${editing.id}`, {
            method: "PATCH",
            headers: JSON_HEADERS,
            body: JSON.stringify(payload),
          })
        : await apiRequest<DebtItem>("/api/debts", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(payload),
          });

      setDebts((prev) =>
        editing
          ? prev.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...prev],
      );
      setFormModal({ open: false, debt: null });
      showToast({
        kind: "success",
        message: editing
          ? "Perubahan tersimpan."
          : `Catatan buat "${saved.counterpart_name}" tersimpan.`,
      });
    },
    [formModal.debt, showToast],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);

    try {
      await apiRequest<{ id: string }>(`/api/debts/${pendingDelete.id}`, {
        method: "DELETE",
      });
      setDebts((prev) => prev.filter((item) => item.id !== pendingDelete.id));
      showToast({
        kind: "success",
        message: `Catatan "${pendingDelete.counterpart_name}" udah dihapus.`,
      });
      setPendingDelete(null);
    } catch (error) {
      showToast({ kind: "error", message: errorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  }, [pendingDelete, showToast]);

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ringkasan utang piutang kamu
          </p>
        </header>

        {errorMsg && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <span className="flex items-center gap-2">
              <AlertCircle size={18} />
              {errorMsg}
            </span>
            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 font-semibold transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              {isRefreshing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Coba lagi
            </button>
          </div>
        )}

        <SummaryCards
          totalOwedToMe={summary.totalOwedToMe}
          totalIOwe={summary.totalIOwe}
          net={summary.net}
        />

        <DebtTable
          debts={debts}
          isLoading={isRefreshing}
          busyId={busyId}
          onAddClick={() => setFormModal({ open: true, debt: null })}
          onEdit={(debt) => setFormModal({ open: true, debt })}
          onToggleSettle={handleToggleSettle}
          onDelete={setPendingDelete}
        />
      </div>

      {formModal.open && (
        <DebtFormModal
          // `key` bikin form ke-reset otomatis pas pindah antara create <-> edit.
          key={formModal.debt?.id ?? "new"}
          debt={formModal.debt}
          onClose={() => setFormModal({ open: false, debt: null })}
          onSubmit={handleFormSubmit}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Hapus catatan ini?"
        description={`Catatan buat "${pendingDelete?.counterpart_name}" bakal dihapus permanen dan gak bisa dibalikin.`}
        loading={isDeleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 left-1/2 z-60 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.kind === "success" ? "bg-gray-900" : "bg-red-600"
          }`}
        >
          {toast.kind === "success" ? (
            <CheckCircle2 size={18} className="shrink-0" />
          ) : (
            <AlertCircle size={18} className="shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </DashboardLayout>
  );
}
