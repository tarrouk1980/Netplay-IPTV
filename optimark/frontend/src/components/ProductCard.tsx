import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  seller: string;
  rating: number;
  isVerified?: boolean;
  category?: string;
}

const categoryColors: Record<string, string> = {
  ELECTRONIQUE: "from-blue-500 to-blue-700",
  MODE: "from-pink-500 to-rose-600",
  MAISON: "from-amber-500 to-orange-600",
  ALIMENTATION: "from-green-500 to-emerald-600",
  DECORATION: "from-purple-500 to-violet-600",
  SPORT: "from-cyan-500 to-sky-600",
};

const categoryIcons: Record<string, string> = {
  ELECTRONIQUE: "📱",
  MODE: "👗",
  MAISON: "🏠",
  ALIMENTATION: "🥘",
  DECORATION: "🏺",
  SPORT: "⚽",
};

export default function ProductCard({ id, title, price, seller, rating, isVerified = false, category }: ProductCardProps) {
  const cat = category?.toUpperCase() || "";
  const gradient = categoryColors[cat] || "from-rose-700 to-rose-900";
  const icon = categoryIcons[cat] || "📦";

  return (
    <Link
      href={`/produits/${id}`}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-200 border border-transparent hover:border-rose-100"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      {/* Image area */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <span className="text-5xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{icon}</span>
        {category && (
          <span className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {category}
          </span>
        )}
        {isVerified && (
          <span className="absolute top-2 right-2 bg-white text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
            ✓ Vérifié
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 leading-snug">{title}</h3>
        <p className="text-slate-400 text-xs mb-3 truncate">{seller}</p>

        <div className="mt-auto">
          {/* Stars */}
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-slate-400 text-[10px] ml-1">{rating > 0 ? `${rating}/5` : "Nouveau"}</span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-crimson font-black text-base">{price.toFixed(2)} <span className="text-xs font-semibold">TND</span></p>
            <span className="text-xs text-crimson font-semibold bg-rose-50 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Voir →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
