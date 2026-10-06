"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const LoginForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {
    // Handle login logic di sini
    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMsg("Email atau password salah. Coba periksa lagi ya!");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {errorMsg && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200">
          {errorMsg}
        </div>
      )}
      <div className="space-y-4">
        {/* Input Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username / Email
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="masukkan username"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all sm:text-sm"
          />
        </div>

        {/* Input Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-gray-900 placeholder-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all sm:text-sm"
          />
        </div>
      </div>

      {/* Button Submit */}
      <div>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex w-full justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all cursor-pointer"
        >
          {loading ? "Tunggu..." : "Masuk"}
        </button>
      </div>
    </div>
  );
};
