"use client";

import Link from "next/link";
import { useState } from "react";

export default function InscriptionPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "BUYER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="text-3xl font-extrabold text-blue-800 mb-8">OPTIMARK</Link>

      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Créer un compte</h1>
        <p className="text-slate-500 mb-6">Rejoignez OPTIMARK gratuitement.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Mohamed Ben Ali"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="vous@exemple.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de téléphone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+216 XX XXX XXX"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type de compte</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-xl py-3 cursor-pointer transition font-medium text-sm ${form.role === "BUYER" ? "border-blue-800 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                <input type="radio" name="role" value="BUYER" checked={form.role === "BUYER"} onChange={handleChange} className="hidden" />
                🛒 Acheteur
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-xl py-3 cursor-pointer transition font-medium text-sm ${form.role === "SELLER" ? "border-blue-800 bg-blue-50 text-blue-800" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                <input type="radio" name="role" value="SELLER" checked={form.role === "SELLER"} onChange={handleChange} className="hidden" />
                🏪 Vendeur
              </label>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Déjà un compte ?{" "}
          <Link href="/auth/connexion" className="text-blue-800 font-semibold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
