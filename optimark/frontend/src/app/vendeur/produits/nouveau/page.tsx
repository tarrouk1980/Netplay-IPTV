"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORIES = ["Électronique", "Mode & Vêtements", "Alimentation & Bio", "Artisanat", "Maison & Décoration", "Beauté & Bien-être", "Sport & Loisirs", "Livres & Culture", "Autre"];

export default function NouveauProduitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", price: "", promoPrice: "", category: "", stock: "", stockAlert: "5", images: "", isBestSeller: false, isNewArrival: true });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "SELLER")) router.replace("/auth/connexion");
  }, [user, loading]);

  const validate = () => {
    const e: any = {};
    if (!form.title.trim()) e.title = "Requis";
    if (!form.description.trim()) e.description = "Requis";
    if (!form.price || isNaN(Number(form.price))) e.price = "Prix invalide";
    if (!form.category) e.category = "Requis";
    if (!form.stock || isNaN(Number(form.stock))) e.stock = "Stock invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post("/products", {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        promoPrice: form.promoPrice ? parseFloat(form.promoPrice) : null,
        category: form.category,
        stock: parseInt(form.stock),
        stockAlert: parseInt(form.stockAlert || "5"),
        images: form.images.split("\n").map((u: string) => u.trim()).filter(Boolean),
        isBestSeller: form.isBestSeller,
        isNewArrival: form.isNewArrival,
      });
      router.push("/vendeur/produits");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-bold text-slate-800">Nouveau produit</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
            <input value={form.title} onChange={set("title")} placeholder="Ex: Smartphone Samsung Galaxy A54" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${errors.title ? "border-red-400" : "border-slate-300"}`} />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={set("description")} rows={4} placeholder="Décrivez votre produit..." className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 resize-none ${errors.description ? "border-red-400" : "border-slate-300"}`} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix normal (TND) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={set("price")} placeholder="0.00" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${errors.price ? "border-red-400" : "border-slate-300"}`} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix promo (TND)</label>
              <input type="number" min="0" step="0.01" value={form.promoPrice} onChange={set("promoPrice")} placeholder="Optionnel" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
              {form.promoPrice && form.price && Number(form.promoPrice) < Number(form.price) && (
                <p className="text-green-600 text-xs mt-1">✓ -{Math.round((1 - Number(form.promoPrice) / Number(form.price)) * 100)}%</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
              <input type="number" min="0" value={form.stock} onChange={set("stock")} placeholder="0" className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 ${errors.stock ? "border-red-400" : "border-slate-300"}`} />
              {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seuil "Stock limité"</label>
              <input type="number" min="1" value={form.stockAlert} onChange={set("stockAlert")} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
              <p className="text-slate-400 text-xs mt-1">Badge si stock ≤ {form.stockAlert}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
            <select value={form.category} onChange={set("category")} className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 bg-white ${errors.category ? "border-red-400" : "border-slate-300"}`}>
              <option value="">Sélectionner une catégorie</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Badges produit</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm((f) => ({ ...f, isBestSeller: e.target.checked }))} className="w-4 h-4 accent-amber-500" />
              <span className="text-sm">🏆 <strong>Best Seller</strong> — badge doré visible sur la carte</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm((f) => ({ ...f, isNewArrival: e.target.checked }))} className="w-4 h-4 accent-blue-500" />
              <span className="text-sm">🆕 <strong>Nouveau</strong> — badge bleu pour nouvelles arrivées</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Images (URLs, une par ligne)</label>
            <textarea value={form.images} onChange={set("images")} rows={3} placeholder="https://..." className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="flex-1 border border-slate-300 text-slate-700 font-medium py-2.5 rounded-xl text-sm hover:bg-slate-50 transition">Annuler</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-rose-800 hover:bg-rose-900 text-white font-bold py-2.5 rounded-xl text-sm transition disabled:opacity-50">
              {submitting ? "Création..." : "Créer le produit"}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
