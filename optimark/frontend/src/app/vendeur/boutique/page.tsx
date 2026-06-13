"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendeurBoutiquePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  type DayKey = "lun" | "mar" | "mer" | "jeu" | "ven" | "sam" | "dim";
  const DAYS: { key: DayKey; label: string }[] = [
    { key: "lun", label: "Lundi" }, { key: "mar", label: "Mardi" }, { key: "mer", label: "Mercredi" },
    { key: "jeu", label: "Jeudi" }, { key: "ven", label: "Vendredi" }, { key: "sam", label: "Samedi" }, { key: "dim", label: "Dimanche" },
  ];
  type Hours = Record<DayKey, { open: string; close: string; closed: boolean }>;
  const defaultHours = (): Hours => Object.fromEntries(DAYS.map(d => [d.key, { open: "09:00", close: "18:00", closed: d.key === "dim" }])) as Hours;

  const [form, setForm] = useState({ name: "", description: "", logo: "", cover: "", phone: "", address: "", bannerText: "", bannerColor: "#9f1239" });
  const [hours, setHours] = useState<Hours>(defaultHours());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    api.get("/vendors/store").then(res => {
      if (res.data?.data) {
        const s = res.data.data;
        setForm({ name: s.name || "", description: s.description || "", logo: s.logo || "", cover: s.cover || "", phone: s.phone || "", address: s.address || "", bannerText: s.bannerText || "", bannerColor: s.bannerColor || "#9f1239" });
        if (s.businessHours) setHours({ ...defaultHours(), ...s.businessHours });
      }
    }).catch(() => {}).finally(() => setFetching(false));
  }, [user, loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.put("/vendors/store", { ...form, businessHours: hours });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading || fetching) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-bold text-slate-800">Profil de ma boutique</h1>
        </div>

        {/* Preview */}
        {(form.cover || form.logo || form.name) && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div className="h-32 bg-gradient-to-r from-rose-100 to-rose-50 relative overflow-hidden">
              {form.cover && <img src={form.cover} alt="cover" className="w-full h-full object-cover" />}
            </div>
            <div className="px-5 pb-5 -mt-8 flex items-end gap-4">
              <div className="w-16 h-16 rounded-xl border-4 border-white bg-rose-800 flex items-center justify-center text-white text-2xl font-black shadow overflow-hidden shrink-0">
                {form.logo ? <img src={form.logo} alt="logo" className="w-full h-full object-cover" /> : form.name?.charAt(0)?.toUpperCase() || "B"}
              </div>
              <div className="pt-8">
                <p className="font-black text-slate-900">{form.name || "Nom de la boutique"}</p>
                {form.address && <p className="text-slate-500 text-xs">📍 {form.address}</p>}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la boutique *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: TechStore Tunis" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Décrivez votre boutique..." rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Logo</label>
              <input value={form.logo} onChange={e => setForm(f => ({ ...f, logo: e.target.value }))} placeholder="https://..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL Photo couverture</label>
              <input value={form.cover} onChange={e => setForm(f => ({ ...f, cover: e.target.value }))} placeholder="https://..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+216 XX XXX XXX" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Adresse / Ville</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Tunis, Tunisie" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-bold text-slate-700 mb-3">🕐 Horaires d'ouverture</label>
            <div className="space-y-2">
              {DAYS.map(d => (
                <div key={d.key} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-16">{d.label}</span>
                  <input type="checkbox" checked={!hours[d.key].closed}
                    onChange={e => setHours(h => ({ ...h, [d.key]: { ...h[d.key], closed: !e.target.checked } }))}
                    className="accent-rose-800" />
                  {!hours[d.key].closed ? (
                    <>
                      <input type="time" value={hours[d.key].open}
                        onChange={e => setHours(h => ({ ...h, [d.key]: { ...h[d.key], open: e.target.value } }))}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs" />
                      <span className="text-slate-300">–</span>
                      <input type="time" value={hours[d.key].close}
                        onChange={e => setHours(h => ({ ...h, [d.key]: { ...h[d.key], close: e.target.value } }))}
                        className="border border-slate-200 rounded-lg px-2 py-1 text-xs" />
                    </>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Fermé</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">📢 Bannière promotionnelle</label>
            <p className="text-xs text-slate-400 mb-3">Affiché en haut de votre boutique publique (laisser vide pour désactiver)</p>
            <input value={form.bannerText} onChange={e => setForm(f => ({ ...f, bannerText: e.target.value }))} placeholder="Ex: 🎉 Soldes d'été — -30% sur tout !" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 mb-2" maxLength={120} />
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500">Couleur :</label>
              {["#9f1239", "#1e3a5f", "#065f46", "#92400e", "#1e293b"].map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, bannerColor: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition ${form.bannerColor === c ? "border-slate-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            {form.bannerText && (
              <div className="mt-3 rounded-lg px-4 py-2 text-white text-sm font-semibold text-center" style={{ backgroundColor: form.bannerColor }}>
                {form.bannerText}
              </div>
            )}
          </div>
          <button type="submit" disabled={saving || !form.name.trim()} className="w-full bg-rose-800 hover:bg-rose-900 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50">
            {saving ? "Sauvegarde..." : saved ? "✓ Sauvegardé !" : "Sauvegarder la boutique"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
