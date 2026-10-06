import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
};

const LoginPage = async () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Halo!
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Yuk, login untuk mencatat utang piutang kamu!
          </p>
        </div>

        {/* Login Form */}
        <LoginForm />
        {/* End of Login Form */}

        {/* Footer Link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-black hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
