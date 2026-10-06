# Debt Note 🧾

Web app sederhana untuk mencatat **utang dan piutang pribadi**. Catat siapa yang hutang ke kita, atau kita yang hutang ke siapa, tandai lunas jika sudah dibayar, dan lihat ringkasan totalnya dalam satu layar.

Dibuat dengan Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Postgres + Auth).

---

## ✨ Fitur

- **Auth** — daftar & login pakai email + password (Supabase Auth)
- **Dashboard** — 3 kartu ringkasan
- **List catatan**
- **Filter & sort** — filter status (semua / belum lunas / lunas), filter tipe, search nama, dan sorting (terbaru / terlama / jumlah terbesar / terkecil).
- **Form catat baru & edit**
- **Mobile-first** — Responsive

---

## 🧱 Stack & alasan library

| Library                                                  | Alasan                                                                                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 (App Router) + TypeScript**                 | Wajib dari brief. Server component dipakai untuk fetch awal + proteksi route, client component untuk interaksi.                         |
| **Tailwind CSS v4**                                      | Wajib. Styling cepat tanpa file CSS terpisah.                                                                                           |
| **Supabase (`@supabase/supabase-js` + `@supabase/ssr`)** | Wajib. `@supabase/ssr` dibutuhkann agar session-nya jalan lewat cookie di Server Component / Route Handler / Proxy, bukan localStorage. |
| **Lucide React**                                         | Wajib. Ikon konsisten dan ringan.                                                                                                       |

**Tidak ada library tambahan** di luar yang diwajibkan — validasi form ditulis manual (`utils/validation.ts`) supaya pesan errornya bisa persis Bahasa Indonesia dan dipakai bareng client + server.

---

## 📁 Struktur singkat

```
app/
  (auth)/
    login/            # halaman + form login
    register/         # halaman + form daftar
  auth/callback/      # tukar code verifikasi email jadi session
  dashboard/
    page.tsx          # server: cek auth + fetch awal, kirim data ke client
    components/
      DashboardClient.tsx  # otak dashboard: state, filter, modal, mutation
      DashboardLayout.tsx  # sidebar desktop + drawer mobile + logout
      SummaryCards.tsx     # 3 kartu ringkasan + bar perbandingan
      DebtTable.tsx        # tabel (desktop) & kartu (mobile) + filter
      DebtFormModal.tsx    # form catat baru / edit
      Modal.tsx            # shell modal (escape, klik backdrop, lock scroll)
      ConfirmDialog.tsx    # konfirmasi hapus
  api/debts/
    route.ts          # GET (list) + POST (create)
    [id]/route.ts     # PATCH (update / tandai lunas) + DELETE
supabase/migrations/  # SQL migration + RLS policies
utils/                # formatter, validation, api client, supabase client
types/                # tipe Debt + tipe Database Supabase
proxy.ts              # refresh session + proteksi /dashboard
```

---

## 🚀 Setup

### 1. Buat project Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **Project Settings → API Keys**, copy **Project URL** dan **Publishable key** (anon key).

### 2. Isi environment variables

Buat file `.env.local` di root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

> jika project masih pakai anon key lama, isinya bisa ditaruh di
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` — server client bakal otomatis pakai itu.

### 3. Migrate database

Buka **Supabase Dashboard → SQL Editor**, copy seluruh isi file:

```
supabase/migrations/001_create_debts_table.sql
```

paste, lalu **Run**. Migration sudah idempotent, aman dijalanin lebih dari sekali.

File ini membuat:

- enum `debt_type` (`owed_to_me` / `i_owe`)
- tabel `public.debts` + index + trigger `updated_at`
- **RLS policies** (SELECT/INSERT/UPDATE/DELETE hanya buat row milik sendiri)
- grant ke role `authenticated` (`anon` sengaja tidak dikasih akses)

> jika punya Supabase CLI, bisa juga lewat: `supabase link --project-ref <ref>` lalu `supabase db push`.

### 4. Jalanin di local

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — bakal otomatis diarahin ke `/login`.

**Catatan soal konfirmasi email:** Supabase secara default mengirimkan email verifikasi.
Buat demo yang lancar, matikan di **Authentication → Sign In / Providers → Email → Confirm email**.
jika dibiarkan menyala, user harus klik link verifikasi dulu (link-nya redirect ke `/auth/callback`).

### 5. Cek kualitas kode

```bash
npm run build   # build + typecheck
npm run lint    # eslint
```

---

## 🌐 Demo

**Link Vercel:** `https://debt-note-chi.vercel.app/`

Cara deploy:

1. Push repo ini ke GitHub.
2. Import repo-nya di [vercel.com/new](https://vercel.com/new).
3. Tambahin dua environment variable yang sama seperti `.env.local`.
4. Deploy.

---

## 🔌 API Endpoints

Semua endpoint butuh login (session cookie). jika belum login → `401` dengan pesan Bahasa Indonesia.

| Method   | Path                       | Fungsi                                                                                               |
| -------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/debts?status=&type=` | List debt milik user. `status`: `all`\|`unsettled`\|`settled`. `type`: `all`\|`owed_to_me`\|`i_owe`. |
| `POST`   | `/api/debts`               | Insert entry baru.                                                                                   |
| `PATCH`  | `/api/debts/[id]`          | Update field apa aja, termasuk `settled_at` buat tandai lunas (`null` = belum lunas).                |
| `DELETE` | `/api/debts/[id]`          | Hapus entry.                                                                                         |

Contoh:

```bash
# Tandai lunas (idempotent — kirim nilai eksplisit, bukan toggle di client)
curl -X PATCH http://localhost:3000/api/debts/<id> \
  -H 'Content-Type: application/json' \
  -d '{"settled_at":"2026-10-07T00:00:00.000Z"}'

# Batal lunas
curl -X PATCH http://localhost:3000/api/debts/<id> \
  -H 'Content-Type: application/json' \
  -d '{"settled_at":null}'
```

Status code yang dipakai: `200` / `201` sukses, `400` input tidak valid, `401` belum login, `404` catatan tidak ketemu, `500` error server.

---

## 🔒 RLS & test kebocoran

Semua policy ada di `supabase/migrations/001_create_debts_table.sql`. Ringkasnya: `auth.uid() = user_id` buat SELECT / INSERT / UPDATE / DELETE, dan role `anon` tidak dikasih grant ke tabel ini.

Tes pakai anon key (harus **tidak** bocor):

```bash
curl "$SUPABASE_URL/rest/v1/debts?select=*" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
# -> []  (bukan data user lain)
```

```bash
# Insert pakai anon key harus ditolak RLS
curl -X POST "$SUPABASE_URL/rest/v1/debts" \
  -H "apikey: $NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"type":"i_owe","counterpart_name":"x","amount":1,"user_id":"<user-lain>"}'
# -> {"code":"42501", "message":"new row violates row-level security policy ..."}
```

Selain RLS, route `PATCH` & `DELETE` juga memfilter `.eq("user_id", user.id)` sebagai lapisan kedua — jadi walau id-nya ditebak, row user lain tetap tidak tersentuh.

---

## 🧠 Approach

Keputusan yang paling saya banggakan: **satu sumber kebenaran untuk validasi dan satu sumber kebenaran untuk data**. Dua hal itu membuat bug paling umum di app CRUD ini hilang dengan sendirinya. Pertama, `utils/validation.ts` dipakai bareng oleh form (client) dan API route (server). Jadi mustahil ada kasus "client bilang valid tapi server nolak" atau pesan error yang beda-beda, dan `amount` dijamin integer Rupiah di kedua sisi. Kedua, halaman dashboard-nya server component yang hanya menyiapkan **data awal** lalu menyerahkan ke satu client orchestrator (`DashboardClient`); semua mutation lewat API route yang bales row terbaru dari Postgres, dan state di client selalu direplace pakai row itu. Bukan hasil hitung ulang di client. Efeknya, "Tandai lunas" itu _idempotent_ dan persisten (kirim nilai `settled_at` eksplisit, bukan toggle), dan summary total selalu ikut sinkron karena dihitung dari daftar yang sama lewat `summarize()`. Saya juga nulis tipe `Database` Supabase manual (`types/database.ts`) supaya semua query fully typed tanpa `any`, plus nge-rename `middleware.ts` → `proxy.ts` biar mengikuti konvensi Next.js 16 terbaru.

## 🔧 Trade-off — jika ada 1 hari lagi

- **Test otomatis.** Belum ada test sama sekali. Prioritas pertama saya adalah test RLS (dua user, mastiin tidak bisa saling baca) dan unit test buat `summarize()` + `formatRupiah()`/`formatRelativeTime()`.
- **UX tanggal.** Field tanggal sekarang masih `<input type="date">` bawaan browser. Akan saya ganti menjadi date picker yang lebih baik secara UI dan estetika di HP, plus fitur "jatuh tempo" yang bisa di-sort dan di-highlight jika sudah lewat.

## ⏱️ Time spent

**±8 jam** (setup + auth 2 jam, dashboard & CRUD 3 jam, RLS + polish UI 2 jam).

---
