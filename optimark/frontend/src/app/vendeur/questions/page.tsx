"use client";

import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function SellerQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    api.get("/questions/seller")
      .then(r => setQuestions(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async (questionId: string) => {
    const answer = answerMap[questionId]?.trim();
    if (!answer) return;
    setSubmitting(questionId);
    try {
      const res = await api.patch(`/questions/${questionId}/answer`, { answer });
      setQuestions(prev => prev.map(q => q.id === questionId ? res.data?.data : q));
      setAnswerMap(prev => { const n = { ...prev }; delete n[questionId]; return n; });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-slate-900 mb-6">❓ Questions clients</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-xl" />)}
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
            <p className="text-4xl mb-3">❓</p>
            <p className="font-semibold">Aucune question pour le moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm shrink-0">
                    {q.user?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 text-sm">{q.user?.name}</span>
                      <span className="text-xs text-slate-400">{new Date(q.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {q.product && <p className="text-xs text-rose-700 font-medium mt-0.5">📦 {q.product.title}</p>}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl px-4 py-3 mb-3">
                  <p className="text-slate-800 text-sm font-medium">{q.question}</p>
                </div>

                {q.answer ? (
                  <div className="border-l-4 border-rose-800 bg-rose-50 rounded-r-xl px-4 py-3">
                    <p className="text-xs font-bold text-rose-800 mb-1">✓ Votre réponse :</p>
                    <p className="text-slate-700 text-sm">{q.answer}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <textarea
                      value={answerMap[q.id] || ""}
                      onChange={e => setAnswerMap(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder="Répondez à cette question..."
                      rows={2}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100 resize-none"
                    />
                    <button
                      onClick={() => submit(q.id)}
                      disabled={!answerMap[q.id]?.trim() || submitting === q.id}
                      className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 rounded-xl text-sm transition disabled:opacity-50 shrink-0"
                    >
                      {submitting === q.id ? "..." : "Répondre"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
