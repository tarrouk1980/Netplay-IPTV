import Link from "next/link";

interface ServiceCardProps {
  id: string;
  title: string;
  provider: string;
  startingPrice: number;
  rating: number;
  category: string;
  isVerified?: boolean;
}

const categoryConfig: Record<string, { gradient: string; icon: string }> = {
  WEB: { gradient: "from-indigo-500 to-blue-600", icon: "💻" },
  DESIGN: { gradient: "from-purple-500 to-pink-600", icon: "🎨" },
  MARKETING: { gradient: "from-green-500 to-teal-600", icon: "📣" },
  REDACTION: { gradient: "from-amber-500 to-orange-500", icon: "✍️" },
  VIDEO: { gradient: "from-red-500 to-rose-600", icon: "🎬" },
  PHOTO: { gradient: "from-cyan-500 to-blue-500", icon: "📸" },
};

export default function ServiceCard({ id, title, provider, startingPrice, rating, category, isVerified = false }: ServiceCardProps) {
  const cat = category?.toUpperCase() || "";
  const config = categoryConfig[cat] || { gradient: "from-red-500 to-red-700", icon: "💼" };

  return (
    <Link
      href={`/services/${id}`}
      className="group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-100 border border-transparent hover:border-red-100"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
    >
      <div className={`relative h-36 bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
        <span className="text-5xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{config.icon}</span>
        <span className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
          {category}
        </span>
        {isVerified && (
          <span className="absolute top-2 right-2 bg-white text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ✓ Pro
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2 leading-snug">{title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-600">
            {provider.charAt(0).toUpperCase()}
          </div>
          <span className="text-slate-500 text-xs truncate">{provider}</span>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-amber-400" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[10px]">À partir de</span>
              <p className="text-red-600 font-black text-base">{startingPrice} <span className="text-xs font-semibold">TND</span></p>
            </div>
            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Contacter →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
