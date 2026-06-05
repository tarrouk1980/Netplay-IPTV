"use client";

import Link from "next/link";
import { useState } from "react";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <Link href="/" className="text-3xl font-extrabold text-blue-800 mb-8">OPTIMARK</Link>

      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Connexion</h1>
        <p className="text-slate-500 mb-6">Bienvenue ! Connectez-vous à votre compte.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse e-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-800"
            />
          </div>
          <div className="flex justify-end">
            <a href="#" className="text-sm text-blue-800 hover:underline">Mot de passe oublié ?</a>
          </div>
          <button type="submit" className="w-full bg-blue-800 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition">
            Se connecter
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/inscription" className="text-blue-800 font-semibold hover:underline">S&apos;inscrire</Link>
        </p>
      </div>
    </div>
  );
}
