// app/api/debts/[id]/route.ts — PATCH (update / tandai lunas) + DELETE

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DEBT_SELECT, toDebtItem } from "@/utils/debts";
import { validateUpdateDebt } from "@/utils/validation";

const UNAUTHORIZED = "Kamu harus login dulu buat akses data ini.";
const NOT_FOUND = "Catatan utangnya gak ketemu.";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ id: string }> };

/** Ambil user yang lagi login, atau balikin Response 401. */
async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// PATCH /api/debts/[id] — update field apa aja, termasuk tandai lunas
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  const { supabase, user } = await requireUser();
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

  const validated = validateUpdateDebt(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  // `user_id` di-filter juga sebagai lapisan kedua di atas RLS,
  // jadi user lain gak mungkin ke-update walau id-nya ditebak.
  const { data, error } = await supabase
    .from("debts")
    .update(validated.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(DEBT_SELECT)
    .maybeSingle();

  if (error) {
    console.error("[PATCH /api/debts/:id]", error.message);
    return NextResponse.json(
      { error: "Gagal update data. Coba lagi ya!" },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  return NextResponse.json(toDebtItem(data));
}

// DELETE /api/debts/[id] — hapus entry
export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  const { supabase, user } = await requireUser();
  if (!user) {
    return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[DELETE /api/debts/:id]", error.message);
    return NextResponse.json(
      { error: "Gagal hapus data. Coba lagi ya!" },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
  }

  return NextResponse.json({ id: data.id });
}
