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

export default function ServiceCard({ id, title, provider, startingPrice, rating, category, isVerified = false }: ServiceCardProps) {
  return (
    <Link href={`/services/${id}`} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col">
      <div className="bg-blue-50 h-40 flex items-center justify-center">
        <span className="text-5xl">💼</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs text-blue-700 font-medium uppercase tracking-wide mb-1">{category}</span>
        <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-2">par <span className="font-medium text-slate-700">{provider}</span></p>
        <div className="flex items-center justify-between mt-auto">
          <p className="text-blue-800 font-bold">à partir de {startingPrice} TND</p>
          {isVerified && (
            <span className="text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Vérifié</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < Math.floor(rating) ? "text-yellow-400" : "text-slate-200"}>★</span>
          ))}
          <span className="text-slate-500 text-xs ml-1">{rating}/5</span>
        </div>
      </div>
    </Link>
  );
}
