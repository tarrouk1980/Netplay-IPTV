"use client";

import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CATEGORIES = [
  "Électronique",
  "Mode & Vêtements",
  "Alimentation & Bio",
  "Artisanat",
  "Maison & Décoration",
  "Beauté & Bien-être",
  "Sport & Loisirs",
  "Livres & Culture",
  "Autre",
];

interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  stock: string;
  images: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
}

export default function NouveauProduitPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    images: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "SELLER")) {
      router.replace("/auth/connexion");
    }
  }, [user, loading]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = "Le titre est requis";
    if (!form.description.trim()) errs.description = "La description est requise";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = "Prix invalide";
    if (!form.category) errs.category = "La catégorie est requise";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      errs.stock = "Stock invalide";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const images = form.images
        ? form.images.split("\n").map((u) => u.trim()).filter(Boolean)
        : [];
      await api.post("/products", {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        stock: parseInt(form.stock),
        images,
      });
      router.push("/vendeur/produits");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Nouveau produit</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={handleChange("title")}
              placeholder="Ex: Smartphone Samsung Galaxy A54"
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 ${errors.title ? "border-red-400" : "border-slate-300"}`}
            />
            {errors.title && <p className="text-crimson-light text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Décrivez votre produit en détail..."
              rows={4}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none ${errors.description ? "border-red-400" : "border-slate-300"}`}
            />
            {errors.description && <p className="text-crimson-light text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix (TND) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange("price")}
                placeholder="0.00"
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 ${errors.price ? "border-red-400" : "border-slate-300"}`}
              />
              {errors.price && <p className="text-crimson-light text-xs mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock *</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange("stock")}
                placeholder="0"
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 ${errors.stock ? "border-red-400" : "border-slate-300"}`}
              />
              {errors.stock && <p className="text-crimson-light text-xs mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
            <select
              value={form.category}
              onChange={handleChange("category")}
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white ${errors.category ? "border-red-400" : "border-slate-300"}`}
            >
              <option value="">Sélectionner une catégorie</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-crimson-light text-xs mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Images (URLs, une par ligne)
            </label>
            <textarea
              value={form.images}
              onChange={handleChange("images")}
              placeholder="https://exemple.com/image1.jpg&#10;https://exemple.com/image2.jpg"
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Création..." : "Créer le produit"}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
