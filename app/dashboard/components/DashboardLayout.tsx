"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  Wallet,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  X,
} from "lucide-react";

type Props = {
  children: React.ReactNode;
  userEmail?: string | null;
};

export default function DashboardLayoutShell({ children, userEmail }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Drawer mobile: tutup pakai Escape + lock scroll body selama kebuka.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  // Kalau layar dipindah ke ukuran desktop pas drawer kebuka, tutup drawer-nya.
  // Tanpa ini, lock scroll body bakal nyangkut di tampilan desktop.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };

    desktopQuery.addEventListener("change", handleChange);
    return () => desktopQuery.removeEventListener("change", handleChange);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Desktop (Collapsible) */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 relative ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 text-gray-600 hover:text-black shadow-sm"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={16} />
          ) : (
            <ChevronRight size={16} />
          )}
        </button>

        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-black text-white p-2 rounded-xl">
              <Wallet size={20} />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-lg tracking-tight text-gray-900">
                Debt Note
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-100 text-black font-medium transition-colors"
          >
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500">
              <User size={16} />
              <span className="truncate">{userEmail}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors text-sm"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Navbar Mobile */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-black text-white p-1.5 rounded-lg">
            <Wallet size={18} />
          </div>
          <span className="font-bold text-base text-gray-900">Debt Note</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Buka menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-sidebar"
          className="p-2 text-gray-600 rounded-lg transition-colors hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Backdrop mobile — klik di luar area sidebar buat nutup */}
      <div
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/40 md:hidden transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/*
        Sidebar mobile — selalu ke-mount biar transisinya kebaca, digeser
        pakai transform dari kiri (-translate-x-full) ke posisi normal.
        Full height layar (inset-y-0 + h-dvh) dan di atas navbar.
      */}
      <aside
        id="mobile-sidebar"
        aria-label="Menu navigasi"
        aria-hidden={!isMobileMenuOpen}
        inert={!isMobileMenuOpen}
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh w-72 max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-4">
          <div className="flex items-center gap-2">
            <div className="bg-black text-white p-1.5 rounded-lg">
              <Wallet size={18} />
            </div>
            <span className="font-bold text-base text-gray-900">Debt Note</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Tutup menu"
            className="p-2 text-gray-500 rounded-lg transition-colors hover:bg-gray-100 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl bg-gray-100 px-3 py-2.5 font-medium text-black transition-colors"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="shrink-0 space-y-2 border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 px-3 py-2 text-xs text-gray-500">
            <User size={16} />
            <span className="truncate">{userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
