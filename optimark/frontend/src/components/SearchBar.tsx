"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchSuggestion {
  id: string;
  title: string;
  type: "product" | "service";
  price: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
        const json = await res.json();
        if (json.data) {
          setSuggestions(json.data.slice(0, 5));
          setOpen(true);
        }
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/recherche?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (s: SearchSuggestion) => {
    setOpen(false);
    const path = s.type === "product" ? `/produits/${s.id}` : `/services/${s.id}`;
    router.push(path);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSubmit} className="flex items-center bg-slate-100 rounded-xl overflow-hidden border border-slate-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition">
        <svg className="w-5 h-5 text-slate-400 ml-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher produits, services..."
          className="flex-1 bg-transparent px-3 py-2.5 text-slate-700 placeholder-slate-400 outline-none text-sm"
        />
        <button type="submit" className="bg-blue-800 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition">
          Chercher
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSuggestionClick(s)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 text-left transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{s.type === "product" ? "📦" : "💼"}</span>
                <span className="text-sm text-slate-700 line-clamp-1">{s.title}</span>
              </div>
              <span className="text-sm font-semibold text-blue-800 shrink-0 ml-2">{s.price} TND</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
