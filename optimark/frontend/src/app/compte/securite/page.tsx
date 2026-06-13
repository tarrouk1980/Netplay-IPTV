"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SecuritePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/auth/connexion?redirect=/compte/securite"); return; }
    setProfileForm({ name: user.name || "", phone: user.phone || "" });
  }, [user, loading, router]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.patch("/auth/profile", profileForm);
      setProfileMsg({ ok: true, text: "Profil mis à jour avec succès." });
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err.response?.data?.message || "Erreur." });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwMsg({ ok: false, text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ ok: false, text: "Minimum 6 caractères." });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      await api.patch("/auth/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg({ ok: true, text: "Mot de passe modifié avec succès." });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.response?.data?.message || "Erreur." });
    } finally {
      setSavingPw(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-black text-slate-900">🔒 Sécurité & Profil</h1>
        </div>

        {/* Profile info */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h2 className="font-black text-slate-800 mb-4">Informations personnelles</h2>
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nom complet</label>
              <input
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Téléphone</label>
              <input
                value={profileForm.phone}
                onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="+216 XX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
            {profileMsg && (
              <p className={`text-sm font-semibold ${profileMsg.ok ? "text-green-600" : "text-red-600"}`}>
                {profileMsg.ok ? "✓ " : "✗ "}{profileMsg.text}
              </p>
            )}
            <button type="submit" disabled={savingProfile || !profileForm.name.trim()}
              className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50">
              {savingProfile ? "Sauvegarde..." : "Mettre à jour le profil"}
            </button>
          </form>
        </div>

        {/* Password change */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
          <h2 className="font-black text-slate-800 mb-1">Changer le mot de passe</h2>
          <p className="text-xs text-slate-400 mb-4">Choisissez un mot de passe fort d'au moins 6 caractères.</p>
          <form onSubmit={savePw} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mot de passe actuel</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="Min. 6 caractères"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                placeholder="••••••••"
              />
            </div>
            {pwMsg && (
              <p className={`text-sm font-semibold ${pwMsg.ok ? "text-green-600" : "text-red-600"}`}>
                {pwMsg.ok ? "✓ " : "✗ "}{pwMsg.text}
              </p>
            )}
            <button type="submit"
              disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50">
              {savingPw ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
