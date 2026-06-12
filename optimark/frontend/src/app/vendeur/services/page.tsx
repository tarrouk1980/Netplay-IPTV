"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORIES = ["Développement", "Design", "Marketing", "Rédaction", "Traduction", "Comptabilité", "Conseil", "Artisanat", "Autre"];

const EMPTY_FORM = { title: "", description: "", price: "", category: CATEGORIES[0], deliveryTime: "" };

export default function VendeurServicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) { router.push("/"); return; }
    load();
  }, [user, authLoading]);

  const load = () => {
    setLoading(true);
    api.get("/services/my").then(r => setServices(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (svc: any) => {
    setEditing(svc);
    setForm({ title: svc.title || "", description: svc.description || "", price: String(svc.price || ""), category: svc.category || CATEGORIES[0], deliveryTime: String(svc.deliveryTime || "") });
    setError("");
    setShowForm(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      deliveryTime: form.deliveryTime ? parseInt(form.deliveryTime) : undefined,
    };
    try {
      if (editing) await api.put(`/services/${editing.id}`, payload);
      else await api.post("/services", payload);
      setShowForm(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de la sauvegarde.");
    }
    setSaving(false);
  };

  const deleteService = async (id: string) => {
    if (!confirm("Supprimer ce service ?")) return;
    await api.delete(`/services/${id}`).catch(() => {});
    load();
  };

  if (authLoading || loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="skeleton h-10 w-48 rounded-xl mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="skeleton h-40 rounded-2xl" />)}</div>
      </main><Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">💼 Mes services</h1>
            <p className="text-slate-500 text-sm mt-1">Proposez vos services freelance sur OPTIMARK</p>
          </div>
          <button onClick={openCreate}
            className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">
            + Nouveau service
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-slate-900">{editing ? "Modifier le service" : "Nouveau service"}</h2>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 text-xl">✕</button>
              </div>
              {error && <p className="text-rose-700 text-sm bg-rose-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
              <form onSubmit={save} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Titre *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                    placeholder="Ex: Création de logo professionnel"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Catégorie</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, category: c }))}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${form.category === c ? "bg-rose-800 text-white border-rose-800" : "border-slate-200 text-slate-600 hover:border-rose-300"}`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Décrivez votre service en détail..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-800 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Prix (TND) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0" step="0.01"
                      placeholder="150"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">Délai (jours)</label>
                    <input type="number" value={form.deliveryTime} onChange={e => setForm(f => ({ ...f, deliveryTime: e.target.value }))} min="1"
                      placeholder="7"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-800" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full bg-rose-800 hover:bg-rose-900 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50">
                  {saving ? "Sauvegarde..." : editing ? "Mettre à jour" : "Créer le service"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Grid */}
        {services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
            <p className="text-5xl mb-4">💼</p>
            <p className="font-bold text-slate-700 text-lg">Aucun service créé</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">Proposez vos compétences à des milliers de clients tunisiens</p>
            <button onClick={openCreate} className="bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
              Créer votre premier service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(svc => (
              <div key={svc.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-rose-200 transition" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-full">{svc.category}</span>
                  {svc.deliveryTime && <span className="text-xs text-slate-400">⏱ {svc.deliveryTime}j</span>}
                </div>
                <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{svc.title}</h3>
                {svc.description && <p className="text-slate-500 text-xs line-clamp-2 mb-3">{svc.description}</p>}
                <p className="text-rose-800 font-black text-lg mb-4">À partir de {Number(svc.price).toFixed(2)} TND</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(svc)}
                    className="flex-1 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-800 text-xs font-semibold py-2 rounded-xl transition">
                    Modifier
                  </button>
                  <button onClick={() => deleteService(svc.id)}
                    className="border border-rose-100 text-rose-600 hover:bg-rose-50 text-xs font-semibold px-3 py-2 rounded-xl transition">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
