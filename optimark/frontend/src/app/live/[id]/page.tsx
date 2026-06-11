"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMessage {
  id: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface FeaturedProduct {
  productId: string;
  productTitle: string;
  productPrice: number;
}

export default function LiveSessionPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewers, setViewers] = useState(0);
  const [featured, setFeatured] = useState<FeaturedProduct | null>(null);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/live/${id}`)
      .then((r) => r.text())
      .then((t) => { try { return JSON.parse(t); } catch { return {}; } })
      .then((d) => {
        setSession(d.data);
        setViewers(d.data?.viewerCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
    const socket = io(`${backendUrl}/live`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-live", { sessionId: id });
    });

    socket.on("chat-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("viewers-count", (data: { count: number }) => {
      setViewers(data.count);
    });

    socket.on("product-featured", (data: FeaturedProduct) => {
      setFeatured(data);
    });

    return () => {
      socket.emit("leave-live", { sessionId: id });
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("chat-message", {
      sessionId: id,
      message: input.trim(),
      userName: "Visiteur",
    });
    setInput("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-slate-500 text-lg mb-4">Session introuvable</p>
        <Link href="/live" className="text-blue-800 font-semibold hover:underline">Retour aux lives</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row gap-0 max-h-[calc(100vh-64px)]">
        <div className="flex-1 flex flex-col">
          <div className="relative bg-slate-800 flex-1 flex items-center justify-center min-h-64">
            <span className="text-8xl">📹</span>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-rose-800 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                EN DIRECT
              </span>
              <span className="flex items-center gap-1 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" />
                </svg>
                {viewers}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-white text-xl font-bold mb-1">{session.title}</h1>
              <p className="text-slate-300 text-sm">par {session.vendor?.name}</p>
            </div>
          </div>

          {featured && (
            <div className="bg-slate-900 border-t border-slate-700 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-0.5">Produit en avant</p>
                <p className="text-white font-semibold">{featured.productTitle}</p>
                <p className="text-blue-400 font-bold">{featured.productPrice} TND</p>
              </div>
              <Link
                href={`/produits/${featured.productId}`}
                className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-500 transition text-sm"
              >
                Acheter maintenant
              </Link>
            </div>
          )}

          {session.products && session.products.length > 0 && (
            <div className="bg-slate-900 border-t border-slate-700 px-4 py-3">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Produits du live</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {session.products.map((pid: string) => (
                  <Link
                    key={pid}
                    href={`/produits/${pid}`}
                    className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-2 rounded-lg transition"
                  >
                    Voir produit
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="text-white font-semibold text-sm">Chat en direct</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-blue-400 text-xs font-semibold">{msg.userName}</span>
                <span className="text-slate-200 text-sm">{msg.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="px-3 py-3 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition text-sm font-medium">
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
