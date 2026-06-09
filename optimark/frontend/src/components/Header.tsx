"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

export default function Header() {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("FR");
  const [currency, setCurrency] = useState("TND");
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    api.get("/notifications").then(res => setUnread(res.data?.unreadCount || 0)).catch(() => {});
    const interval = setInterval(() => {
      api.get("/notifications").then(res => setUnread(res.data?.unreadCount || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/produits", label: "Produits" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Tarifs" },
  ];

  return (
    <>
      {/* Top utility bar — language & currency */}
      <div className="hidden md:block bg-slate-900 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <p>🇹🇳 Livraison partout en Tunisie • Service client 7j/7</p>
          <div className="flex items-center gap-4">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-slate-300 hover:text-white outline-none cursor-pointer text-xs"
            >
              <option value="FR" className="text-slate-900">🇫🇷 Français</option>
              <option value="AR" className="text-slate-900">🇹🇳 العربية</option>
              <option value="EN" className="text-slate-900">🇬🇧 English</option>
            </select>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent text-slate-300 hover:text-white outline-none cursor-pointer text-xs"
            >
              <option value="TND" className="text-slate-900">TND (د.ت)</option>
              <option value="EUR" className="text-slate-900">EUR (€)</option>
              <option value="USD" className="text-slate-900">USD ($)</option>
            </select>
            <Link href="/vendeur/dashboard" className="hover:text-white transition">Vendre sur OPTIMARK</Link>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main bar */}
          <div className="flex items-center gap-3 py-3">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 mr-2">
              <span className="text-2xl font-black tracking-tight leading-none">
                <span className="text-rose-800">OPTI</span>
                <span className="text-slate-900">MARK</span>
              </span>
            </Link>

            {/* Search — desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-800 focus-within:ring-2 focus-within:ring-rose-100 transition">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher produits, services, artisans..."
                  className="flex-1 px-4 py-2.5 bg-white text-slate-700 placeholder-slate-400 outline-none text-sm"
                />
                <button className="bg-rose-800 hover:bg-rose-900 text-white px-5 py-2.5 font-semibold text-sm transition flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Chercher
                </button>
              </div>
            </div>

            {/* Mobile right actions */}
            <div className="flex md:hidden items-center gap-2 ml-auto">
              <button className="p-2 text-slate-500 hover:text-rose-800 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link href="/panier" className="p-2 text-slate-500 hover:text-rose-800 transition relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-4 px-1 bg-rose-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
            </div>

            {/* Desktop right actions */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto">
              <Link href="/panier" className="p-2.5 text-slate-500 hover:text-rose-800 transition relative">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/notifications" className="p-2.5 text-slate-500 hover:text-rose-800 transition relative">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/compte"
                    className="text-slate-700 font-semibold hover:text-rose-800 transition text-sm px-4 py-2.5 rounded-xl hover:bg-rose-50"
                  >
                    {user.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm shadow-rose-200"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth/connexion" className="text-slate-700 font-semibold hover:text-rose-800 transition text-sm px-4 py-2.5 rounded-xl hover:bg-rose-50">
                    Connexion
                  </Link>
                  <Link href="/auth/inscription" className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-sm shadow-rose-200">
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 border-t border-slate-50 pt-1.5 pb-1.5">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  pathname === href
                    ? "bg-rose-50 text-rose-800 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/live"
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 ${
                pathname === "/live" ? "bg-rose-100 text-rose-900" : "text-rose-800 hover:bg-rose-50"
              }`}
            >
              <span className="w-2 h-2 bg-rose-800 rounded-full animate-pulse" />
              Live
            </Link>
          </nav>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-rose-100 shadow-lg">
        <div className="flex items-end justify-around px-2 py-1">
          <Link href="/" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${pathname === "/" ? "text-rose-800" : "text-slate-400"}`}>
            <svg className="w-6 h-6" fill={pathname === "/" ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={pathname === "/" ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-semibold">Accueil</span>
          </Link>

          <Link href="/produits" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${pathname.startsWith("/produits") ? "text-rose-800" : "text-slate-400"}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="text-[10px] font-semibold">Produits</span>
          </Link>

          {/* Live center button */}
          <Link href="/live" className="flex flex-col items-center -mt-4">
            <div className="w-14 h-14 rounded-full bg-rose-800 flex flex-col items-center justify-center shadow-lg shadow-rose-200 border-4 border-white">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse mb-0.5" />
              <span className="text-white text-[11px] font-black tracking-wide">LIVE</span>
            </div>
          </Link>

          <Link href="/services" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${pathname.startsWith("/services") ? "text-rose-800" : "text-slate-400"}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-semibold">Services</span>
          </Link>

          <Link href="/auth/connexion" className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition ${pathname.startsWith("/auth") ? "text-rose-800" : "text-slate-400"}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-semibold">Compte</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
