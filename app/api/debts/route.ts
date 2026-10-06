// app/api/debts/route.ts — GET (list) + POST (create)

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DEBT_SELECT, toDebtItem } from "@/utils/debts";
import { validateCreateDebt } from "@/utils/validation";
import type { DebtItem } from "@/types/debt";

const UNAUTHORIZED = "Kamu harus login dulu buat akses data ini.";

// GET /api/debts?status=all|unsettled|settled&type=all|owed_to_me|i_owe
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "all";
  const type = searchParams.get("type") ?? "all";

  let query = supabase
    .from("debts")
    .select(DEBT_SELECT)
    .order("created_at", { ascending: false });

  if (status === "unsettled") {
    query = query.is("settled_at", null);
  } else if (status === "settled") {
    query = query.not("settled_at", "is", null);
  }

  if (type === "owed_to_me" || type === "i_owe") {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[GET /api/debts]", error.message);
    return NextResponse.json(
      { error: "Gagal ngambil data dari server. Coba lagi ya!" },
      { status: 500 },
    );
  }

  const debts: DebtItem[] = data.map(toDebtItem);

  return NextResponse.json(debts);
}

// POST /api/debts — bikin entry baru
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body request-nya bukan JSON yang valid." },
      { status: 400 },
    );
  }

  const validated = validateCreateDebt(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("debts")
    .insert({
      user_id: user.id,
      type: validated.data.type,
      counterpart_name: validated.data.counterpart_name,
      amount: validated.data.amount,
      note: validated.data.note,
      due_date: validated.data.due_date,
    })
    .select(DEBT_SELECT)
    .single();

  if (error || !data) {
    console.error("[POST /api/debts]", error?.message);
    return NextResponse.json(
      { error: "Gagal nyimpen data. Coba lagi ya!" },
      { status: 500 },
    );
  }

  return NextResponse.json(toDebtItem(data), { status: 201 });
}
