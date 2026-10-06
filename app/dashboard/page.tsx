import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { DEBT_SELECT, toDebtItem } from "@/utils/debts";
import type { DebtItem } from "@/types/debt";
import DashboardClient from "./components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Pakai getUser() (bukan getSession()) karena ini nge-validasi token ke Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // RLS yang mastiin query ini cuma balikin row milik user yang login.
  const { data, error } = await supabase
    .from("debts")
    .select(DEBT_SELECT)
    .order("created_at", { ascending: false });

  const initialDebts: DebtItem[] = data ? data.map(toDebtItem) : [];

  return (
    <DashboardClient
      userEmail={user.email ?? null}
      initialDebts={initialDebts}
      initialError={
        error ? "Gagal ngambil data dari server. Coba refresh halaman ini ya!" : null
      }
    />
  );
}
