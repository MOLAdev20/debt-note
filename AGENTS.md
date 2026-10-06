# **Hiring Task - Junior Fullstack Developer**

## **Brief**

Bikin **"Debt Note"** - web app sederhana buat track utang piutang pribadi. User catat siapa hutang berapa ke dia, atau dia hutang berapa ke siapa. Bisa tandai "lunas" kalau sudah dibayar. Ada summary total. Bikin dari **Next.js project kosong** , jangan fork repo orang.

## **Stack (wajib)**

- Next.js 16 App Router + TypeScript

- Tailwind CSS v4

- Supabase (PostgreSQL + Auth)

- Lucide React (icons)

Library lain boleh kalau perlu - tapi jelasin alasannya di README.

## **Deliverables**

### **1. Auth**

- Signup & login pakai email + password (Supabase Auth)

- Logout button

- Halaman aplikasi cuma bisa diakses user yang login

### **2. Halaman Dashboard /**

#### **Summary di atas (3 card):**

- "Total dihutang ke saya" (Rp X)

- "Total saya hutang" (Rp Y)

- "Net" (X - Y, kasih warna hijau/merah)

**Di bawah:** list semua entry dengan:

- Nama orang

- Tipe (dihutang / saya hutang)

- Jumlah (format `Rp 1.234.000` )

- Tanggal relative ("3 hari lalu")

- Status: **Belum lunas** / **Lunas**

- Tombol aksi: "Tandai lunas", "Edit", "Hapus"

**Filter:** dropdown status (semua / belum / lunas) + tipe (semua / dihutang / hutang) **Tombol "+ Catat baru"** → buka modal/halaman form

### **3. Form Catat Baru / Edit**

- **Tipe** (radio): Saya dihutang / Saya hutang

- **Nama orang** (text, wajib)

- **Jumlah** (number, wajib, dalam Rupiah)

- **Tanggal** (default hari ini)

- **Catatan** (opsional, max 200 char)

Validasi client + server.

### **4. API Endpoints**

| **Method** | **Path**          | **Fungsi**                                    |
| ---------- | ----------------- | --------------------------------------------- |
| `GET`      | `/api/debts`      | List debt user (terima query ?status= ?type=) |
| `POST`     | `/api/debts`      | Create entry baru                             |
| `PATCH`    | `/api/debts/[id]` | Update (termasuk tandai lunas)                |
| `DELETE`   | `/api/debts/[id]` | Hapus entry                                   |

Semua endpoint:

- Wajib auth

- TypeScript proper (no `any` )

- Validasi input

- Error response Bahasa Indonesia + status code yang bener

### **5. Database**

SQL migration di folder `migrations/` atau `supabase/migrations/` . **Tabel** `debts` :

- `id` (uuid, PK)

- `user_id` (uuid, FK ke `auth.users` )

- `type` (enum: `owed_to_me` / `i_owe` )

- `counterpart_name` (text)

- `amount` (bigint, dalam Rupiah utuh - bukan desimal)

- `note` (text, nullable)

- `due_date` (date, nullable)

- `settled_at` (timestamptz, nullable - null = belum lunas)

- `created_at` , `updated_at`

#### **RLS policies WAJIB:**

- User cuma bisa SELECT/INSERT/UPDATE/DELETE row miliknya

- **Test kebocoran:** kalau saya pakai API key kamu, saya gak boleh bisa baca/edit data user lain via Supabase REST API langsung

### **6. README**

- **Setup:** env, cara migrate, cara jalanin local

- **Demo:** link Vercel deploy (wajib)

- **Approach:** 1 paragraf - keputusan teknis yang kamu banggakan

- **Trade-off:** kalau ada 1 hari lagi, apa yang kamu polish?

- **Time spent:** jujur

## **Constraint**

1. **Boleh pakai AI assistant** , tapi setiap baris harus kamu paham. Interview kita random tanya.

2. **Jangan hardcode data** - semua dari Supabase.

3. **Jangan skip RLS.**

4. **Format Rupiah** pakai locale `id-ID` ( `Rp 1.234.000` , bukan `Rp 1234000` atau `IDR 1,234,000` ).

5. **Tanggal relative time** ("3 hari lalu", "kemarin").

6. **Copy UI Bahasa Indonesia** casual, bukan formal/translated.

7. **TypeScript strict** , `any` minimal.

8. **Commit history bermakna** - minimal 5 commit, bukan "initial commit" doang.

## **Bonus (gak wajib)**

Yang ngerjain ini = signal niat & taste:

- Search by nama orang

- Sort by jumlah / tanggal

- Group multiple debts dari orang sama (mis. "Budi: 3 entry, total Rp X")

- Bar chart compare total dihutang vs hutang

- Empty state, loading state, error state semua di-handle

- Mobile-first design beneran enak di HP

## **Submission**

9. **Repo publik** di GitHub akun kamu

10. **Deploy Vercel** (free tier) - link aktif

11. Supabase project sendiri (free tier OK) - demo harus jalan tanpa kita setup ulang

12. **Loom max 3 menit:** demo (1m) + 1 keputusan teknis yang dibanggakan (1m) + 1 yang masih kurang (1m)

13. Kirim link ke recruiter

## **Rubrik**

| **Kategori**     | **Bobot** | **Sinyal kuat**                                                        |
| ---------------- | --------- | ---------------------------------------------------------------------- |
| **DB + RLS**     | 25%       | Schema rapi, RLS strict, gak bocor saat dites via curl                 |
| **Code quality** | 20%       | TS proper, komponen split logis, hook reusable, naming<br>konsisten    |
| **UI/UX taste**  | 20%       | Spacing rapi, hierarchy jelas, mobile enak,<br>micro-interaction halus |

| **Kategori**       | **Bobot** | **Sinyal kuat**                                                    |
| ------------------ | --------- | ------------------------------------------------------------------ |
| **Business logic** | 20%       | Net calc bener, format Rupiah bener, status toggle<br>idempotent   |
| **Communication**  | 15%       | README clear, commit bermakna, Loom rapi, trade-off<br>di-vocalize |

## **Auto-Reject**

- RLS bocor (saya bisa baca/edit data user lain via Supabase REST API)

- Format Rupiah salah / inkonsisten

- "Tandai lunas" cuma di client (refresh → status balik)

- `any` di mana-mana

- Mock/hardcode data di production

- Deploy gak jalan

- Loom defensive, gak bisa jelasin kodenya
