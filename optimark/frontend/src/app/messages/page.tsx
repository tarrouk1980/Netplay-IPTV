"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";

function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const withId = searchParams.get("with");

  const [threads, setThreads] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(withId);
  const [conversation, setConversation] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingConv, setLoadingConv] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/auth/connexion?redirect=/messages"); return; }
    api.get("/messages/threads").then(r => setThreads(r.data?.data || [])).catch(() => {}).finally(() => setLoadingThreads(false));
  }, [user, authLoading]);

  useEffect(() => {
    if (!activeId || !user) return;
    setLoadingConv(true);
    api.get(`/messages/conversation/${activeId}`)
      .then(r => {
        setConversation(r.data?.data || []);
        // Find active user from threads or fetch
        const thread = threads.find(t => t.other?.id === activeId);
        if (thread) setActiveUser(thread.other);
      })
      .catch(() => {})
      .finally(() => setLoadingConv(false));
  }, [activeId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await api.post("/messages/send", { receiverId: activeId, content: message });
      setConversation(prev => [...prev, res.data?.data]);
      setMessage("");
      // Refresh threads
      api.get("/messages/threads").then(r => setThreads(r.data?.data || []));
    } catch {} finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-black text-slate-900 mb-6">Messages</h1>

        <div className="flex gap-4 h-[600px] bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          {/* Thread list */}
          <div className="w-72 shrink-0 border-r border-slate-100 flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <p className="font-bold text-slate-700 text-sm">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingThreads ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}
                </div>
              ) : threads.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  <p className="text-3xl mb-2">💬</p>
                  <p>Aucune conversation</p>
                </div>
              ) : (
                threads.map(t => (
                  <button key={t.other?.id} onClick={() => { setActiveId(t.other?.id); setActiveUser(t.other); }}
                    className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${activeId === t.other?.id ? "bg-rose-50 border-l-2 border-l-rose-800" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-sm">
                          {t.other?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{t.other?.name}</p>
                          <p className="text-xs text-slate-400 truncate w-36">{t.lastMessage?.content}</p>
                        </div>
                      </div>
                      {t.unread > 0 && (
                        <span className="bg-rose-800 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{t.unread}</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Conversation */}
          {activeId ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 font-bold text-sm">
                  {activeUser?.name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{activeUser?.name || "..."}</p>
                  <p className="text-xs text-slate-400">{activeUser?.role === "SELLER" ? "Vendeur" : "Acheteur"}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {loadingConv ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => <div key={i} className="skeleton h-10 rounded-xl w-2/3" />)}
                  </div>
                ) : conversation.map(msg => {
                  const mine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${mine ? "bg-rose-800 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${mine ? "text-rose-200" : "text-slate-400"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("fr-TN", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <button type="submit" disabled={!message.trim() || sending}
                  className="bg-rose-800 hover:bg-rose-900 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50">
                  Envoyer
                </button>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-3">
              <p className="text-4xl">💬</p>
              <p className="font-semibold">Sélectionnez une conversation</p>
              <p className="text-sm">ou contactez un vendeur depuis la page d&apos;un produit</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function MessagesPage() {
  return <Suspense><MessagesContent /></Suspense>;
}
