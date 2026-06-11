import Link from "next/link";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  seller: string;
  rating: number;
  reviewCount?: number;
  isVerified?: boolean;
  category?: string;
  image?: string;
  badge?: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  stock?: number;
  stockAlert?: number;
  onCompare?: (e: React.MouseEvent) => void;
  inCompare?: boolean;
}

const categoryColors: Record<string, string> = {
  ELECTRONIQUE: "from-blue-500 to-blue-700",
  "ÉLECTRONIQUE": "from-blue-500 to-blue-700",
  MODE: "from-pink-500 to-rose-600",
  MAISON: "from-amber-500 to-orange-600",
  ALIMENTATION: "from-green-500 to-emerald-600",
  DECORATION: "from-purple-500 to-violet-600",
  "DÉCORATION": "from-purple-500 to-violet-600",
  SPORT: "from-cyan-500 to-sky-600",
};

const categoryIcons: Record<string, string> = {
  ELECTRONIQUE: "📱", "ÉLECTRONIQUE": "📱",
  MODE: "👗", MAISON: "🏠",
  ALIMENTATION: "🥘", DECORATION: "🏺", "DÉCORATION": "🏺",
  SPORT: "⚽",
};

export default function ProductCard({ id, title, price, originalPrice, seller, rating, reviewCount = 0, isVerified = false, category, image, badge, isBestSeller, isNewArrival, stock, stockAlert = 5, onCompare, inCompare }: ProductCardProps) {
  const cat = category?.toUpperCase() || "";
  const gradient = categoryColors[cat] || "from-rose-700 to-rose-900";
  const icon = categoryIcons[cat] || "📦";
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const isLowStock = stock !== undefined && stock > 0 && stock <= stockAlert;
  const isOutOfStock = stock === 0;

  return (
    <Link
      href={`/produits/${id}`}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-100 border border-slate-100 hover:border-rose-200"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      {/* Image area */}
      <div className={`relative h-44 overflow-hidden ${image ? "bg-slate-100" : `bg-gradient-to-br ${gradient}`} flex items-center justify-center`}>
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="text-5xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{icon}</span>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {onCompare && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCompare(e); }}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition shadow ${inCompare ? "bg-rose-800 text-white" : "bg-white/90 text-slate-600 opacity-0 group-hover:opacity-100 hover:bg-rose-50"}`}>
              {inCompare ? "✓ Comparer" : "+ Comparer"}
            </button>
          )}
          {isBestSeller && <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">🏆 Best seller</span>}
          {badge && <span className="bg-rose-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
          {discount > 0 && <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">-{discount}%</span>}
          {isNewArrival && !isBestSeller && <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Nouveau</span>}
        </div>

        {/* Top-right */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {isVerified && <span className="bg-white text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">✓ Vérifié</span>}
          {isOutOfStock && <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Épuisé</span>}
          {isLowStock && !isOutOfStock && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Stock limité</span>}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {category && <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider mb-1">{category}</span>}
        <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 leading-snug">{title}</h3>
        <p className="text-slate-400 text-xs mb-3 truncate">{seller}</p>

        <div className="mt-auto">
          <div className="flex items-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-slate-400 text-[10px] ml-0.5">{rating > 0 ? `${rating}` : "Nouveau"}{reviewCount > 0 ? ` (${reviewCount})` : ""}</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-rose-800 font-black text-base leading-none">{price.toFixed(2)} <span className="text-xs font-semibold">TND</span></p>
              {originalPrice && <p className="text-slate-400 text-xs line-through mt-0.5">{originalPrice.toFixed(2)} TND</p>}
            </div>
            <span className="text-xs text-rose-800 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Voir →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
