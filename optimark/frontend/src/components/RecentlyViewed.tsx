"use client";

import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "recently_viewed";
const MAX = 10;

export function trackView(productId: string) {
  if (typeof window === "undefined") return;
  try {
    const ids: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const next = [productId, ...ids.filter(id => id !== productId)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export default function RecentlyViewed({ currentId }: { currentId?: string }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      const filtered = ids.filter(id => id !== currentId).slice(0, 6);
      if (filtered.length === 0) return;
      Promise.all(filtered.map(id => api.get(`/products/${id}`).catch(() => null)))
        .then(res => setProducts(res.filter(Boolean).map(r => r!.data.data)));
    } catch {}
  }, [currentId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-black text-slate-800 mb-4">🕐 Récemment consultés</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map(p => (
          <Link
            key={p.id}
            href={`/produits/${p.id}`}
            className="flex-shrink-0 w-40 bg-white rounded-xl border border-slate-100 hover:border-rose-200 transition p-3 group"
          >
            {p.images?.[0] ? (
              <img src={p.images[0]} alt={p.title} className="w-full h-24 object-cover rounded-lg mb-2" />
            ) : (
              <div className="w-full h-24 bg-slate-100 rounded-lg mb-2 flex items-center justify-center text-3xl">📦</div>
            )}
            <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">{p.title}</p>
            <p className="text-rose-800 font-black text-sm mt-1">{Number(p.promoPrice || p.price).toFixed(2)} TND</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
