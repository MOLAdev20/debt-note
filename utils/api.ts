// utils/api.ts — wrapper fetch biar error handling konsisten di sisi client

/** Error khusus request API, pesannya udah siap tampil ke user. */
export class ApiRequestError extends Error {}

/** Ambil pesan error dari body JSON `{ error: string }` kalau ada. */
export function readErrorMessage(payload: unknown): string {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return "Ada yang error di server. Coba lagi ya!";
}

/**
 * Fetch + parse JSON + lempar `ApiRequestError` kalau response-nya gak OK.
 * Semua request ke /api/* lewat sini, jadi pesan error-nya seragam.
 */
export async function apiRequest<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiRequestError(
      "Koneksi ke server bermasalah. Cek internet kamu ya!",
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiRequestError(readErrorMessage(payload));
  }

  return payload as T;
}

export const JSON_HEADERS = { "Content-Type": "application/json" } as const;
