# Kasbon 🧾

Web app sederhana buat nyatet **utang piutang pribadi**. Catat siapa yang hutang ke kita, atau kita yang hutang ke siapa, tandai lunas kalau udah dibayar, dan lihat ringkasan totalnya dalam satu layar.

Dibikin dengan Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase (Postgres + Auth).

---

## ✨ Fitur

- **Auth** — daftar & login pakai email + password (Supabase Auth), tombol logout, dan semua halaman app diproteksi.
- **Dashboard** — 3 kartu ringkasan (*Total dihutang ke saya*, *Total saya hutang*, *Net* dengan warna hijau/merah) + bar perbandingan.
- **List catatan** — nama orang, tipe, jumlah (`Rp 1.234.000`), tanggal relative (`3 hari lalu`), status, dan aksi.
- **Filter & sort** — filter status (semua / belum lunas / lunas), filter tipe, search nama, dan sorting (terbaru / terlama / jumlah terbesar / terkecil).
- **Form catat baru & edit** — validasi di client *dan* server pakai validator yang sama.
- **Mobile-first** — di HP list-nya jadi kartu, di desktop jadi tabel.

---

## 🧱 Stack & alasan library

| Library | Alasan |
|---|---|
| **Next.js 16 (App Router) + TypeScript** | Wajib dari brief. Server component dipakai buat fetch awal + proteksi route, client component buat interaksi. |
| **Tailwind CSS v4** | Wajib. Styling cepat tanpa file CSS terpisah. |
| **Supabase (`@supabase/supabase-js` + `@supabase/ssr`)** | Wajib. `@supabase/ssr` dibutuhin biar session-nya jalan lewat cookie di Server Component / Route Handler / Proxy, bukan localStorage. |
| **Lucide React** | Wajib. Ikon konsisten dan ringan. |

**Nggak ada library tambahan** di luar yang diwajibkan — validasi form ditulis manual (`utils/validation.ts`) supaya pesan errornya bisa persis Bahasa Indonesia dan dipakai bareng client + server.

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

### 1. Bikin project Supabase

1. Bikin project baru di [supabase.com](https://supabase.com) (free tier cukup).
2. Buka **Project Settings → API Keys**, copy **Project URL** dan **Publishable key** (anon key).

### 2. Isi environment variables

Bikin file `.env.local` di root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

> Kalau project kamu masih pakai anon key lama, isinya bisa ditaruh di
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` — server client bakal otomatis pakai itu.

### 3. Migrate database

Buka **Supabase Dashboard → SQL Editor**, copy seluruh isi file:

```
supabase/migrations/001_create_debts_table.sql
```

paste, lalu **Run**. Migration-nya idempotent, jadi aman dijalanin lebih dari sekali.

File ini bikin:
- enum `debt_type` (`owed_to_me` / `i_owe`)
- tabel `public.debts` + index + trigger `updated_at`
- **RLS policies** (SELECT/INSERT/UPDATE/DELETE cuma buat row milik sendiri)
- grant ke role `authenticated` (`anon` sengaja gak dikasih akses)

> Kalau punya Supabase CLI, bisa juga lewat: `supabase link --project-ref <ref>` lalu `supabase db push`.

### 4. Jalanin di local

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) — bakal otomatis diarahin ke `/login`.

**Catatan soal konfirmasi email:** Supabase secara default ngirim email verifikasi.
Buat demo yang lancar, matiin di **Authentication → Sign In / Providers → Email → Confirm email**.
Kalau dibiarin nyala, user harus klik link verifikasi dulu (link-nya bakal balik ke `/auth/callback`).

### 5. Cek kualitas kode

```bash
npm run build   # build + typecheck
npm run lint    # eslint
```

---

## 🌐 Demo

**Link Vercel:** `https://kasbon-<username>.vercel.app` ← _ganti dengan link deploy kamu_

Cara deploy:

1. Push repo ini ke GitHub.
2. Import repo-nya di [vercel.com/new](https://vercel.com/new).
3. Tambahin dua environment variable yang sama kayak `.env.local`.
4. Deploy.

---

## 🔌 API Endpoints

Semua endpoint butuh login (session cookie). Kalau belum login → `401` dengan pesan Bahasa Indonesia.

| Method | Path | Fungsi |
|---|---|---|
| `GET` | `/api/debts?status=&type=` | List debt milik user. `status`: `all`\|`unsettled`\|`settled`. `type`: `all`\|`owed_to_me`\|`i_owe`. |
| `POST` | `/api/debts` | Bikin entry baru. |
| `PATCH` | `/api/debts/[id]` | Update field apa aja, termasuk `settled_at` buat tandai lunas (`null` = belum lunas). |
| `DELETE` | `/api/debts/[id]` | Hapus entry. |

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

Status code yang dipakai: `200` / `201` sukses, `400` input gak valid, `401` belum login, `404` catatan gak ketemu, `500` error server.

---

## 🔒 RLS & test kebocoran

Semua policy ada di `supabase/migrations/001_create_debts_table.sql`. Ringkasnya: `auth.uid() = user_id` buat SELECT / INSERT / UPDATE / DELETE, dan role `anon` gak dikasih grant ke tabel ini.

Tes pakai anon key (harus **gak** bocor):

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

Selain RLS, route `PATCH` & `DELETE` juga nge-filter `.eq("user_id", user.id)` sebagai lapisan kedua — jadi walau id-nya ditebak, row user lain tetap gak kesentuh.

---

## 🧠 Approach

Keputusan yang paling saya banggain: **satu sumber kebenaran buat validasi dan satu sumber kebenaran buat data**. Dua hal itu bikin bug paling umum di app CRUD ini hilang dengan sendirinya. Pertama, `utils/validation.ts` dipakai bareng oleh form (client) dan API route (server) — jadi mustahil ada kasus "client bilang valid tapi server nolak" atau pesan error yang beda-beda, dan `amount` dijamin integer Rupiah di kedua sisi. Kedua, halaman dashboard-nya server component yang cuma nyiapin **data awal** lalu nyerahin ke satu client orchestrator (`DashboardClient`); semua mutation lewat API route yang bales row terbaru dari Postgres, dan state di client selalu di-replace pakai row itu — bukan hasil hitung ulang di client. Efeknya, "Tandai lunas" itu *idempotent* dan persisten (kirim nilai `settled_at` eksplisit, bukan toggle), dan summary total selalu ikut sinkron karena dihitung dari daftar yang sama lewat `summarize()`. Saya juga nulis tipe `Database` Supabase manual (`types/database.ts`) supaya semua query fully typed tanpa `any`, plus nge-rename `middleware.ts` → `proxy.ts` biar mengikuti konvensi Next.js 16 terbaru.

## 🔧 Trade-off — kalau ada 1 hari lagi

- **Optimistic update + grouping per orang.** Sekarang tiap aksi nunggu response server dulu. Kalau ada waktu, saya bakal tambah update optimistik dengan rollback saat gagal, plus grouping "Budi: 3 entry, total Rp X" yang bisa di-expand.
- **Test otomatis.** Belum ada test sama sekali. Prioritas pertama saya adalah test RLS (dua user, mastiin gak bisa saling baca) dan unit test buat `summarize()` + `formatRupiah()`/`formatRelativeTime()`.
- **UX tanggal.** Field tanggal sekarang masih `<input type="date">` bawaan browser. Bakal saya ganti jadi date picker yang lebih enak di HP, plus fitur "jatuh tempo" yang bisa di-sort dan di-highlight kalau udah lewat.

## ⏱️ Time spent

_Isi jujur sesuai waktu kamu, contoh:_ **±8 jam** (setup + auth 2 jam, dashboard & CRUD 3 jam, RLS + polish UI 2 jam, README 1 jam).

---

## 🎥 Loom

Link video demo (max 3 menit): `https://www.loom.com/share/<id>` ← _ganti dengan link Loom kamu_
