// types/debt.ts — shared TypeScript types

export type DebtType = "owed_to_me" | "i_owe";

export interface Debt {
  id: string;
  user_id: string;
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note: string | null;
  due_date: string | null;
  settled_at: string | null;
  created_at: string;
  updated_at: string;
}

// Subset yang aman dikirim ke client (tanpa user_id)
export type DebtItem = Omit<Debt, "user_id" | "updated_at">;

export interface CreateDebtPayload {
  type: DebtType;
  counterpart_name: string;
  amount: number;
  note?: string | null;
  due_date?: string | null;
}

export interface UpdateDebtPayload {
  type?: DebtType;
  counterpart_name?: string;
  amount?: number;
  note?: string | null;
  due_date?: string | null;
  settled_at?: string | null;
}

export interface ApiError {
  error: string;
}
