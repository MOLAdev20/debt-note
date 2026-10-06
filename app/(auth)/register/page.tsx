import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Halaman registrasi user baru",
};

const RegisterPage = async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Kalau user udah login, lempar langsung ke dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <RegisterForm />
    </main>
  );
};

export default RegisterPage;
