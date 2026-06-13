"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: "En attente", color: "bg-amber-100 text-amber-700" },
  APPROVED: { label: "Approuvée",  color: "bg-blue-100 text-blue-700"  },
  REFUNDED: { label: "Remboursée", color: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejetée",   color: "bg-red-100 text-red-700"    },
};

export default function VendeurRetoursPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "SELLER") { router.replace("/auth/connexion"); return; }
    api.get("/returns/seller")
      .then(r => setReturns(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const pending = returns.filter(r => r.status === "PENDING");
  const others = returns.filter(r => r.status !== "PENDING");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">↩️ Demandes de retour</h1>
            <p className="text-slate-500 text-sm mt-1">Retours sur vos produits vendus.</p>
          </div>
          {pending.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-black px-3 py-1.5 rounded-full">
              {pending.length} en attente
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({length:4}).map((_,i) => <div key={i} className="skeleton rounded-xl h-24"/>)}</div>
        ) : returns.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-4xl mb-3">😊</p>
            <p className="font-bold text-slate-700">Aucune demande de retour</p>
            <p className="text-slate-400 text-sm mt-1">Vos acheteurs sont satisfaits !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...pending, ...others].map(ret => (
              <div key={ret.id} className={`bg-white rounded-2xl border-2 p-5 ${ret.status === "PENDING" ? "border-amber-200" : "border-slate-100"}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">
                        Commande #{ret.order?.id?.slice(0, 8)}
                      </span>
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${STATUS_LABELS[ret.status]?.color}`}>
                        {STATUS_LABELS[ret.status]?.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mb-1">
                      Client : <span className="font-semibold text-slate-700">{ret.buyer?.name}</span>
                      {" · "}{ret.buyer?.email}
                    </p>
                    <p className="text-slate-600 text-sm mt-2 max-w-lg">{ret.reason}</p>
                    {ret.adminNote && (
                      <p className="text-xs text-blue-600 mt-1.5 italic bg-blue-50 px-3 py-1.5 rounded-lg inline-block">
                        Note admin : {ret.adminNote}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      Soumis le {new Date(ret.createdAt).toLocaleDateString("fr-FR")}
                      {ret.order?.total && ` · Montant : ${Number(ret.order.total).toFixed(2)} TND`}
                    </p>
                  </div>
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
