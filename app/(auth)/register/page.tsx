import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun Baru",
  description: "Halaman registrasi user baru",
};

const RegisterPage = async () => {
  // Server component, jadi harus pakai server client (cookie-based),
  // bukan browser client yang butuh localStorage.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Kalau user udah login, lempar langsung ke dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <RegisterForm />
    </main>
  );
};

export default RegisterPage;
