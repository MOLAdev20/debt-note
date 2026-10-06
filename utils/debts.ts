// utils/debts.ts — helper kecil seputar row `debts` biar gak diulang di banyak tempat

import type { Database } from "@/types/database";
import type { DebtItem } from "@/types/debt";

export type DebtRow = Database["public"]["Tables"]["debts"]["Row"];

/** Bentuk row sesuai kolom yang ada di `DEBT_SELECT`. */
export type DebtSelectedRow = Pick<
  DebtRow,
  | "id"
  | "type"
  | "counterpart_name"
  | "amount"
  | "note"
  | "due_date"
  | "settled_at"
  | "created_at"
>;

/**
 * Kolom yang dikirim ke client. Sengaja gak termasuk `user_id` & `updated_at`
 * supaya data internal user gak perlu ikut nongol di payload.
 */
export const DEBT_SELECT =
  "id, type, counterpart_name, amount, note, due_date, settled_at, created_at";

/** Map row database -> bentuk yang dipakai UI (udah dinormalisasi). */
export function toDebtItem(row: DebtSelectedRow): DebtItem {
  return {
    id: row.id,
    type: row.type,
    counterpart_name: row.counterpart_name,
    amount: Number(row.amount),
    note: row.note ?? null,
    due_date: row.due_date ?? null,
    settled_at: row.settled_at ?? null,
    created_at: row.created_at,
  };
}

export type Summary = {
  totalOwedToMe: number;
  totalIOwe: number;
  net: number;
};

/**
 * Hitung ringkasan dari daftar debt.
 * Yang dihitung cuma yang BELUM lunas (`settled_at === null`).
 */
export function summarize(debts: readonly DebtItem[]): Summary {
  let totalOwedToMe = 0;
  let totalIOwe = 0;

  for (const debt of debts) {
    if (debt.settled_at !== null) continue;
    if (debt.type === "owed_to_me") {
      totalOwedToMe += debt.amount;
    } else {
      totalIOwe += debt.amount;
    }
  }

  return {
    totalOwedToMe,
    totalIOwe,
    net: totalOwedToMe - totalIOwe,
  };
}
