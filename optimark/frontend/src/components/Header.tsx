"use client";

import Link from "next/link";
import { useState } from "react";
import SearchBar from "./SearchBar";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold text-blue-800 tracking-tight">
          OPTIMARK
        </Link>

        <div className="hidden md:flex flex-1 max-w-lg mx-6">
          <SearchBar />
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-slate-600 hover:text-blue-800 font-medium transition">Accueil</Link>
          <Link href="/produits" className="text-slate-600 hover:text-blue-800 font-medium transition">Produits</Link>
          <Link href="/services" className="text-slate-600 hover:text-blue-800 font-medium transition">Services</Link>
          <Link href="/live" className="text-red-600 hover:text-red-700 font-medium transition flex items-center gap-1">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse inline-block"></span>
            Live
          </Link>
          <Link href="/pricing" className="text-slate-600 hover:text-blue-800 font-medium transition">Tarifs</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/panier" className="relative p-2 text-slate-600 hover:text-blue-800 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
          <Link href="/auth/connexion" className="text-blue-800 font-semibold hover:text-blue-600 transition">
            Connexion
          </Link>
          <Link href="/auth/inscription" className="bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            S&apos;inscrire
          </Link>
        </div>

        <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 px-4 py-4 flex flex-col gap-4 bg-white">
          <Link href="/" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Accueil</Link>
          <Link href="/produits" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Produits</Link>
          <Link href="/services" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Services</Link>
          <Link href="/produits" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Vendeurs</Link>
          <Link href="/panier" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Panier</Link>
          <Link href="/auth/connexion" className="text-blue-800 font-semibold" onClick={() => setMenuOpen(false)}>Connexion</Link>
          <Link href="/auth/inscription" className="bg-blue-800 text-white font-semibold px-4 py-2 rounded-lg text-center" onClick={() => setMenuOpen(false)}>S&apos;inscrire</Link>
        </div>
      )}
    </header>
  );
}
