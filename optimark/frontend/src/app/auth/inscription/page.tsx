"use client";

import Link from "next/link";
import { useState } from "react";

export default function InscriptionPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "BUYER" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-rose-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-rose-700 rounded-full opacity-50" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-900 rounded-full opacity-40" />
        <div className="relative text-center">
          <p className="text-5xl font-black text-white mb-3">OPTI<span className="text-rose-200">MARK</span></p>
          <p className="text-rose-100 text-xl font-medium mb-10">Rejoignez la marketplace #1</p>
          <div className="grid grid-cols-1 gap-4 max-w-xs mx-auto">
            {[
              { icon: "🚀", text: "Vendez dès aujourd'hui" },
              { icon: "🤖", text: "IA pour booster vos ventes" },
              { icon: "📦", text: "FBO — Livraison par OPTIMARK" },
              { icon: "📊", text: "Analytics temps réel" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-white">
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden block text-center mb-8">
            <span className="text-3xl font-black"><span className="text-rose-800">OPTI</span><span className="text-slate-900">MARK</span></span>
          </Link>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 p-8">
            <h1 className="text-2xl font-black text-slate-900 mb-1">Créer un compte</h1>
            <p className="text-slate-500 text-sm mb-6">Rejoignez OPTIMARK gratuitement.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Nom complet", name: "name", type: "text", placeholder: "Mohamed Ben Ali" },
                { label: "Adresse e-mail", name: "email", type: "email", placeholder: "vous@exemple.com" },
                { label: "Téléphone", name: "phone", type: "tel", placeholder: "+216 XX XXX XXX" },
                { label: "Mot de passe", name: "password", type: "password", placeholder: "••••••••" },
              ].map(({ label, name, type, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
                  <input
                    type={type}
                    name={name}
                    required={name !== "phone"}
                    value={form[name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800 focus:border-transparent transition"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type de compte</label>
                <div className="flex gap-3">
                  {[{ value: "BUYER", icon: "🛒", label: "Acheteur" }, { value: "SELLER", icon: "🏪", label: "Vendeur" }].map(({ value, icon, label }) => (
                    <label key={value} className={`flex-1 flex items-center justify-center gap-2 border-2 rounded-xl py-3 cursor-pointer transition font-semibold text-sm ${form.role === value ? "border-rose-800 bg-rose-50 text-rose-800" : "border-slate-200 text-slate-600 hover:border-rose-300"}`}>
                      <input type="radio" name="role" value={value} checked={form.role === value} onChange={handleChange} className="hidden" />
                      {icon} {label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-800 hover:bg-rose-900 text-white font-black py-3.5 rounded-xl transition shadow-md shadow-rose-200 text-base">
                Créer mon compte
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-6">
              Déjà un compte ?{" "}
              <Link href="/auth/connexion" className="text-rose-800 font-bold hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
