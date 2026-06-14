"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SellerPromotionsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { promoPrice: string }>>({});
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "promo" | "no-promo">("all");

  useEffect(() => {
    api.get("/vendors/products?limit=100")
      .then(r => {
        const data = r.data?.data || [];
        setProducts(data);
        const init: Record<string, { promoPrice: string }> = {};
        data.forEach((p: any) => { init[p.id] = { promoPrice: p.promoPrice?.toString() ?? "" }; });
        setEdits(init);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async (productId: string, price: number) => {
    setSaving(productId);
    try {
      await api.patch(`/vendors/products/${productId}`, { promoPrice: price || null });
      setProducts(ps => ps.map(p => p.id === productId ? { ...p, promoPrice: price || null } : p));
      setSuccess(productId);
      setTimeout(() => setSuccess(null), 2000);
    } catch {}
    setSaving(null);
  };

  const removePromo = async (productId: string) => {
    setSaving(productId);
    try {
      await api.patch(`/vendors/products/${productId}`, { promoPrice: null });
      setProducts(ps => ps.map(p => p.id === productId ? { ...p, promoPrice: null } : p));
      setEdits(e => ({ ...e, [productId]: { promoPrice: "" } }));
      setSuccess(productId);
      setTimeout(() => setSuccess(null), 2000);
    } catch {}
    setSaving(null);
  };

  const filtered = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "promo" ? !!p.promoPrice :
      !p.promoPrice;
    return matchSearch && matchFilter;
  });

  const promoCount = products.filter(p => !!p.promoPrice).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-rose-800 text-white px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">🏷️ Gestion des promotions</h1>
            <p className="text-rose-200 text-sm mt-1">Définissez des prix promotionnels sur vos produits</p>
          </div>
          <Link href="/vendeur/dashboard" className="text-rose-200 hover:text-white text-sm font-semibold">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total produits", value: products.length, icon: "📦" },
            { label: "En promotion", value: promoCount, icon: "🏷️", color: "text-rose-800" },
            { label: "Sans promo", value: products.length - promoCount, icon: "📋" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center"
              style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color || "text-slate-800"}`}>{s.value}</div>
              <div className="text-xs text-slate-400 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-rose-300"
          />
          <div className="flex gap-2">
            {[
              { key: "all", label: "Tous" },
              { key: "promo", label: "🏷️ En promo" },
              { key: "no-promo", label: "Sans promo" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key as any)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${filter === f.key ? "bg-rose-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">Aucun produit trouvé.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => {
              const edit = edits[p.id] || { promoPrice: "" };
              const discount = p.promoPrice
                ? Math.round((1 - Number(p.promoPrice) / Number(p.price)) * 100)
                : null;
              const isSaving = saving === p.id;
              const isSuccess = success === p.id;

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4"
                  style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  {/* Image */}
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-slate-700">{p.price} TND</span>
                      {p.promoPrice && (
                        <>
                          <span className="text-xs text-rose-800 font-bold">→ {p.promoPrice} TND</span>
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-black">-{discount}%</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Promo price input */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Prix promo"
                        value={edit.promoPrice}
                        onChange={e => setEdits(prev => ({ ...prev, [p.id]: { promoPrice: e.target.value } }))}
                        className="w-32 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rose-300 pr-10"
                        min={0}
                        max={p.price}
                        step={0.01}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">TND</span>
                    </div>

                    <button
                      onClick={() => {
                        const val = parseFloat(edit.promoPrice);
                        if (!isNaN(val) && val > 0 && val < p.price) save(p.id, val);
                      }}
                      disabled={isSaving || !edit.promoPrice || parseFloat(edit.promoPrice) >= p.price}
                      className="bg-rose-800 text-white px-3 py-2 rounded-xl text-xs font-black hover:bg-rose-900 transition disabled:opacity-40"
                    >
                      {isSaving ? "..." : isSuccess ? "✓" : "Appliquer"}
                    </button>

                    {p.promoPrice && (
                      <button
                        onClick={() => removePromo(p.id)}
                        disabled={isSaving}
                        className="text-slate-400 hover:text-red-500 text-xs font-semibold transition px-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
