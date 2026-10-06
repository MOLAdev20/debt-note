"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import Modal from "./Modal";
import { formatRupiah, todayISODate } from "@/utils/formatter";
import { MAX_NOTE_LENGTH, validateCreateDebt } from "@/utils/validation";
import type { CreateDebtPayload, DebtItem, DebtType } from "@/types/debt";

type Props = {
  /** null = mode "catat baru", ada isinya = mode edit. */
  debt: DebtItem | null;
  onClose: () => void;
  onSubmit: (payload: CreateDebtPayload) => Promise<void>;
};

const TYPE_OPTIONS: { value: DebtType; label: string; hint: string }[] = [
  { value: "owed_to_me", label: "Saya dihutang", hint: "Duit gue ada di orang lain" },
  { value: "i_owe", label: "Saya hutang", hint: "Gue yang punya utang" },
];

const inputClass =
  "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

export default function DebtFormModal({ debt, onClose, onSubmit }: Props) {
  const isEdit = debt !== null;

  // Komponen ini di-mount ulang (pakai `key`) tiap ganti mode/data edit,
  // jadi state awal cukup diambil sekali di sini tanpa perlu useEffect.
  const [type, setType] = useState<DebtType>(debt?.type ?? "owed_to_me");
  const [name, setName] = useState(debt?.counterpart_name ?? "");
  const [amount, setAmount] = useState(debt ? String(debt.amount) : "");
  const [dueDate, setDueDate] = useState(debt?.due_date ?? todayISODate());
  const [note, setNote] = useState(debt?.note ?? "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const amountValue = amount === "" ? 0 : Number(amount);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMsg(null);

    // Validasi client pakai validator yang sama dengan API -> pesan konsisten.
    const validated = validateCreateDebt({
      type,
      counterpart_name: name,
      amount,
      note,
      due_date: dueDate,
    });

    if (!validated.ok) {
      setErrorMsg(validated.error);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(validated.data);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Ada yang error pas nyimpen. Coba lagi ya!",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      title={isEdit ? "Edit Catatan" : "Catat Baru"}
      description={
        isEdit
          ? `Ubah detail utang sama ${debt?.counterpart_name}.`
          : "Isi detailnya, gak sampe 30 detik kok."
      }
      onClose={isSubmitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tipe */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">Tipe</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {TYPE_OPTIONS.map((option) => {
              const selected = type === option.value;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    selected
                      ? "border-black bg-gray-50 ring-1 ring-black"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value={option.value}
                      checked={selected}
                      onChange={() => setType(option.value)}
                      className="accent-black"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {option.label}
                    </span>
                  </div>
                  <p className="mt-1 pl-6 text-xs text-gray-500">{option.hint}</p>
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Nama orang */}
        <div>
          <label htmlFor="counterpart_name" className="mb-1 block text-sm font-medium text-gray-700">
            Nama orang <span className="text-red-500">*</span>
          </label>
          <input
            id="counterpart_name"
            name="counterpart_name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Budi"
            className={inputClass}
          />
        </div>

        {/* Jumlah */}
        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-700">
            Jumlah (Rupiah) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="text"
            required
            inputMode="numeric"
            value={amount}
            onChange={(event) =>
              // Cuma nerima digit, biar gak ada desimal / karakter aneh.
              setAmount(event.target.value.replace(/\D/g, ""))
            }
            placeholder="50000"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            {amountValue > 0
              ? `Kebaca: ${formatRupiah(amountValue)}`
              : "Isi angka aja, tanpa titik atau koma."}
          </p>
        </div>

        {/* Tanggal */}
        <div>
          <label htmlFor="due_date" className="mb-1 block text-sm font-medium text-gray-700">
            Tanggal
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={inputClass}
          />
        </div>

        {/* Catatan */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="note" className="text-sm font-medium text-gray-700">
              Catatan <span className="text-gray-400">(opsional)</span>
            </label>
            <span
              className={`text-xs ${
                note.length > MAX_NOTE_LENGTH ? "text-red-500" : "text-gray-400"
              }`}
            >
              {note.length}/{MAX_NOTE_LENGTH}
            </span>
          </div>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={MAX_NOTE_LENGTH}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Misal: buat makan siang bareng"
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isSubmitting ? "Nyimpen..." : isEdit ? "Simpan Perubahan" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
