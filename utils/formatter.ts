// utils/formatter.ts — helper format tampilan (Rupiah, relative time, tanggal)

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Format Rupiah pakai locale id-ID: `Rp 1.234.000`.
 * NBSP dari Intl dinormalisasi jadi spasi biasa biar konsisten di semua render.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00a0/g, " ");
}

/** `2026-10-07` -> `7 Okt 2026` (buat tooltip / detail tanggal). */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Tanggal hari ini dalam format `YYYY-MM-DD` pakai timezone lokal (bukan UTC). */
export function todayISODate(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/**
 * Relative time Bahasa Indonesia: "Hari ini", "Kemarin", "3 hari lalu"...
 * Kalau tanggalnya di masa depan: "Besok", "4 hari lagi"...
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  const now = new Date();
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  // Dibandingin per hari kalender, bukan per 24 jam, biar "kemarin" akurat.
  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / MS_PER_DAY,
  );

  if (diffDays === 0) return "Hari ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays === -1) return "Besok";

  if (diffDays > 1 && diffDays < 30) return `${diffDays} hari lalu`;
  if (diffDays < -1 && diffDays > -30) return `${Math.abs(diffDays)} hari lagi`;

  const months = Math.floor(Math.abs(diffDays) / 30);
  if (Math.abs(diffDays) < 365) {
    return diffDays > 0 ? `${months} bulan lalu` : `${months} bulan lagi`;
  }

  const years = Math.floor(Math.abs(diffDays) / 365);
  return diffDays > 0 ? `${years} tahun lalu` : `${years} tahun lagi`;
}
