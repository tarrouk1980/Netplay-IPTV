"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function VendeurClientsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    api.get("/vendors/customers/top")
      .then(r => setCustomers(r.data?.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user, loading, router]);

  if (loading || fetching) return (
    <div className="min-h-screen bg-slate-50 flex flex-col"><Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-3">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </main><Footer />
    </div>
  );

  const maxSpend = customers[0]?.spend || 1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-slate-500 hover:text-slate-700 text-sm">← Retour</button>
          <h1 className="text-2xl font-black text-slate-900">👥 Mes meilleurs clients</h1>
        </div>

        {customers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-bold text-slate-700 mb-2">Aucun client pour le moment</p>
            <p className="text-slate-400 text-sm">Vos clients apparaîtront ici une fois que vous aurez des commandes livrées.</p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <p className="text-2xl font-black text-rose-800">{customers.length}</p>
                <p className="text-xs text-slate-500 font-semibold">Clients uniques</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <p className="text-2xl font-black text-rose-800">
                  {customers.reduce((s, c) => s + c.spend, 0).toFixed(0)} TND
                </p>
                <p className="text-xs text-slate-500 font-semibold">Revenu total</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                <p className="text-2xl font-black text-rose-800">
                  {customers.filter(c => c.orders > 1).length}
                </p>
                <p className="text-xs text-slate-500 font-semibold">Clients fidèles (2+ cmd)</p>
              </div>
            </div>

            {/* Customer table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                  <span className="col-span-1">#</span>
                  <span className="col-span-4">Client</span>
                  <span className="col-span-2 text-center">Commandes</span>
                  <span className="col-span-3 text-right">Total dépensé</span>
                  <span className="col-span-2 text-right">Part</span>
                </div>
              </div>

              {customers.map((c, i) => (
                <div key={c.id} className="px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-sm font-black text-slate-400">#{i + 1}</span>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-black text-sm shrink-0">
                          {c.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`inline-block text-xs font-black px-2 py-0.5 rounded-full ${c.orders > 1 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {c.orders} cmd
                      </span>
                    </div>
                    <div className="col-span-3 text-right">
                      <p className="font-black text-rose-800 text-sm">{c.spend} TND</p>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-rose-800 rounded-full" style={{ width: `${(c.spend / maxSpend) * 100}%` }} />
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs font-bold text-slate-500">
                        {((c.spend / customers.reduce((s, x) => s + x.spend, 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
