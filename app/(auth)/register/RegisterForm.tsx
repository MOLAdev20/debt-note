"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const handleRegister = async () => {
    setLoading(true);
    setMessage(null);

    // Call Supabase Sign Up API
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Menyimpan data tambahan user ke metadata Supabase Auth
        data: {
          full_name: fullName,
        },
        // Redirect URL setelah user klik link konfirmasi email
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Registrasi berhasil! Silakan cek email lu buat verifikasi akun.",
      });
      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Buat Akun Baru
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Daftar sekarang buat mulai pake aplikasi
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-600 border border-green-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black sm:text-sm"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleRegister}
          disabled={loading}
          className="w-full justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 transition-all"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </div>

      <p className="text-center text-sm text-gray-500">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-black hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
