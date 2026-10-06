"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Password minimal 6 karakter ya.",
      });
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    // Kalau konfirmasi email dimatiin, user langsung dapet session.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setMessage({
      type: "success",
      text: "Registrasi berhasil! Cek email kamu buat verifikasi akunnya ya.",
    });
    setFullName("");
    setEmail("");
    setPassword("");
  };

  return (
    <form
      onSubmit={handleRegister}
      noValidate
      className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Buat Akun Baru
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Daftar dulu buat mulai nyatet utang piutang kamu
        </p>
      </div>

      {message && (
        <div
          role="alert"
          className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
            message.type === "error"
              ? "border border-red-200 bg-red-50 text-red-600"
              : "border border-green-200 bg-green-50 text-green-600"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
            Nama Lengkap
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Budi Santoso"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimal 6 karakter"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-black hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
