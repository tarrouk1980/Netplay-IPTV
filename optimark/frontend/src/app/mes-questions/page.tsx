"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MesQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/questions/my")
      .then(r => setQuestions(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteQ = async (id: string) => {
    if (!confirm("Supprimer cette question ?")) return;
    await api.delete(`/questions/${id}`).catch(() => {});
    setQuestions(q => q.filter(x => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-1">❓ Mes questions</h1>
          <p className="text-slate-500 text-sm">Toutes vos questions posées aux vendeurs.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-4">❓</div>
            <p className="font-semibold">Aucune question posée</p>
            <p className="text-sm mt-1">Parcourez les produits et posez vos questions aux vendeurs.</p>
            <Link href="/" className="mt-4 inline-block bg-rose-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-rose-900 transition">
              Explorer les produits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-100 p-5"
                style={{ boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                {/* Product */}
                <Link href={`/produits/${q.product.id}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                    {q.product.images?.[0] ? (
                      <img src={q.product.images[0]} alt={q.product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">📦</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{q.product.title}</p>
                    <p className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                </Link>

                {/* Question */}
                <div className="flex gap-3 mb-3">
                  <span className="text-rose-800 font-black text-sm shrink-0">Q</span>
                  <p className="text-slate-700 text-sm font-medium">{q.question}</p>
                </div>

                {/* Answer */}
                {q.answer ? (
                  <div className="flex gap-3 bg-green-50 rounded-xl p-3 border border-green-100">
                    <span className="text-green-700 font-black text-sm shrink-0">R</span>
                    <div>
                      <p className="text-green-800 text-sm">{q.answer}</p>
                      {q.answeredAt && (
                        <p className="text-green-600 text-xs mt-1">
                          Répondu le {new Date(q.answeredAt).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2 inline-block">
                    ⏳ En attente de réponse
                  </div>
                )}

                {/* Delete */}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => deleteQ(q.id)}
                    className="text-xs text-slate-400 hover:text-red-500 transition"
                  >
                    Supprimer
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
