"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    bg: "from-rose-800 to-rose-950",
    badge: "⚡ FLASH DEAL — 24H SEULEMENT",
    title: "Smartphones & Électronique",
    sub: "Jusqu'à -40% sur les meilleures marques",
    cta: "Voir les offres",
    href: "/produits?cat=electronique",
    emoji: "📱",
    timer: true,
  },
  {
    bg: "from-slate-800 to-slate-950",
    badge: "🆕 NOUVEAUTÉ",
    title: "Mode & Artisanat Tunisien",
    sub: "Découvrez les créateurs locaux",
    cta: "Explorer",
    href: "/produits?cat=mode",
    emoji: "👗",
    timer: false,
  },
  {
    bg: "from-amber-700 to-orange-900",
    badge: "📦 FBO OPTIMARK",
    title: "Livraison Express 24h",
    sub: "Commandez avant 18h, livré demain",
    cta: "Commander",
    href: "/produits",
    emoji: "🚚",
    timer: false,
  },
];

function useCountdown(hours: number) {
  const [time, setTime] = useState({ h: hours, m: 59, s: 59 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const time = useCountdown(5);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative overflow-hidden">
      <div className={`bg-gradient-to-r ${slide.bg} text-white transition-all duration-500`}>
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-white/20 border border-white/30 text-white text-xs font-black px-3 py-1 rounded-full mb-4">
              {slide.badge}
            </span>
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3">{slide.title}</h1>
            <p className="text-white/80 text-lg mb-6">{slide.sub}</p>

            {slide.timer && (
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                <span className="text-white/70 text-sm font-medium">Expire dans :</span>
                {[time.h, time.m, time.s].map((v, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="bg-white text-rose-800 font-black text-lg w-10 h-10 rounded-lg flex items-center justify-center">
                      {String(v).padStart(2, "0")}
                    </div>
                    {i < 2 && <span className="text-white font-black">:</span>}
                  </div>
                ))}
              </div>
            )}

            <Link href={slide.href} className="inline-flex items-center gap-2 bg-white text-rose-800 font-black px-8 py-3.5 rounded-2xl hover:bg-rose-50 transition shadow-lg">
              {slide.cta} →
            </Link>
          </div>

          <div className="flex-shrink-0 animate-float">
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-3xl flex items-center justify-center">
              <span className="text-7xl md:text-9xl">{slide.emoji}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
