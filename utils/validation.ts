// utils/validation.ts — validasi payload debt, dipakai bareng oleh API route & form
//
// Semua fungsi di sini nerima `unknown` (hasil `request.json()` atau input form),
// jadi gak ada `any` dan gak bisa nerima data sembarangan tanpa dicek dulu.

import type { CreateDebtPayload, DebtType, UpdateDebtPayload } from "@/types/debt";

export const MAX_NOTE_LENGTH = 200;
export const MAX_NAME_LENGTH = 100;
export const MAX_AMOUNT = 1_000_000_000_000; // Rp 1 triliun

const DEBT_TYPES: readonly DebtType[] = ["owed_to_me", "i_owe"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function isDebtType(value: unknown): value is DebtType {
  return (
    typeof value === "string" && (DEBT_TYPES as readonly string[]).includes(value)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Terima number atau string angka (input form selalu string). */
function parseAmount(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type Normalized<T> = { value: T; error: null } | { value: null; error: string };

function normalizeNote(value: unknown): Normalized<string | null> {
  if (value === undefined || value === null) return { value: null, error: null };
  if (typeof value !== "string") {
    return { value: null, error: "Catatan harus berupa teks." };
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_NOTE_LENGTH) {
    return { value: null, error: `Catatan maksimal ${MAX_NOTE_LENGTH} karakter.` };
  }
  return { value: trimmed === "" ? null : trimmed, error: null };
}

function normalizeDueDate(value: unknown): Normalized<string | null> {
  if (value === undefined || value === null || value === "") {
    return { value: null, error: null };
  }
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) {
    return { value: null, error: "Format tanggal gak valid (harus YYYY-MM-DD)." };
  }
  if (Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) {
    return { value: null, error: "Tanggal yang kamu isi gak valid." };
  }
  return { value, error: null };
}

/** `settled_at`: null = belum lunas, ISO string = sudah lunas. Boolean juga diterima. */
function normalizeSettledAt(value: unknown): Normalized<string | null> {
  if (value === null || value === false) return { value: null, error: null };
  if (value === true) return { value: new Date().toISOString(), error: null };
  if (typeof value !== "string" || value.trim() === "") {
    return { value: null, error: "Status lunas gak valid." };
  }
  if (Number.isNaN(new Date(value).getTime())) {
    return { value: null, error: "Tanggal pelunasan gak valid." };
  }
  return { value, error: null };
}

export function validateCreateDebt(
  input: unknown,
): ValidationResult<CreateDebtPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Format data yang dikirim gak valid." };
  }

  if (!isDebtType(input.type)) {
    return {
      ok: false,
      error: "Tipe wajib dipilih: 'Saya dihutang' atau 'Saya hutang'.",
    };
  }

  const name = parseName(input.counterpart_name);
  if (!name) {
    return { ok: false, error: "Nama orang wajib diisi." };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, error: `Nama orang maksimal ${MAX_NAME_LENGTH} karakter.` };
  }

  const amount = parseAmount(input.amount);
  if (amount === null || !Number.isInteger(amount) || amount <= 0) {
    return {
      ok: false,
      error: "Jumlah wajib diisi dan harus angka bulat lebih dari 0.",
    };
  }
  if (amount > MAX_AMOUNT) {
    return { ok: false, error: "Jumlahnya kegedean, maksimal Rp 1.000.000.000.000." };
  }

  const note = normalizeNote(input.note);
  if (note.error) return { ok: false, error: note.error };

  const dueDate = normalizeDueDate(input.due_date);
  if (dueDate.error) return { ok: false, error: dueDate.error };

  return {
    ok: true,
    data: {
      type: input.type,
      counterpart_name: name,
      amount,
      note: note.value,
      due_date: dueDate.value,
    },
  };
}

export function validateUpdateDebt(
  input: unknown,
): ValidationResult<UpdateDebtPayload> {
  if (!isRecord(input)) {
    return { ok: false, error: "Format data yang dikirim gak valid." };
  }

  const data: UpdateDebtPayload = {};
  let hasField = false;

  if ("type" in input) {
    if (!isDebtType(input.type)) {
      return {
        ok: false,
        error: "Tipe wajib dipilih: 'Saya dihutang' atau 'Saya hutang'.",
      };
    }
    data.type = input.type;
    hasField = true;
  }

  if ("counterpart_name" in input) {
    const name = parseName(input.counterpart_name);
    if (!name) return { ok: false, error: "Nama orang wajib diisi." };
    if (name.length > MAX_NAME_LENGTH) {
      return { ok: false, error: `Nama orang maksimal ${MAX_NAME_LENGTH} karakter.` };
    }
    data.counterpart_name = name;
    hasField = true;
  }

  if ("amount" in input) {
    const amount = parseAmount(input.amount);
    if (amount === null || !Number.isInteger(amount) || amount <= 0) {
      return {
        ok: false,
        error: "Jumlah wajib diisi dan harus angka bulat lebih dari 0.",
      };
    }
    if (amount > MAX_AMOUNT) {
      return { ok: false, error: "Jumlahnya kegedean, maksimal Rp 1.000.000.000.000." };
    }
    data.amount = amount;
    hasField = true;
  }

  if ("note" in input) {
    const note = normalizeNote(input.note);
    if (note.error) return { ok: false, error: note.error };
    data.note = note.value;
    hasField = true;
  }

  if ("due_date" in input) {
    const dueDate = normalizeDueDate(input.due_date);
    if (dueDate.error) return { ok: false, error: dueDate.error };
    data.due_date = dueDate.value;
    hasField = true;
  }

  if ("settled_at" in input) {
    const settledAt = normalizeSettledAt(input.settled_at);
    if (settledAt.error) return { ok: false, error: settledAt.error };
    data.settled_at = settledAt.value;
    hasField = true;
  }

  if (!hasField) {
    return { ok: false, error: "Gak ada data yang mau diubah." };
  }

  return { ok: true, data };
}
