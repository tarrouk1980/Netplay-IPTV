import Link from "next/link";

interface LiveCardProps {
  id: string;
  title: string;
  vendorName: string;
  viewerCount: number;
  isActive?: boolean;
}

export default function LiveCard({ id, title, vendorName, viewerCount, isActive = true }: LiveCardProps) {
  return (
    <Link href={`/live/${id}`} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden flex flex-col group">
      <div className="relative bg-slate-900 h-44 flex items-center justify-center">
        <span className="text-6xl">📹</span>
        {isActive && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full inline-block"></span>
            EN DIRECT
          </span>
        )}
        <span className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
          </svg>
          {viewerCount}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2 group-hover:text-blue-800 transition">{title}</h3>
        <p className="text-slate-500 text-sm">{vendorName}</p>
      </div>
    </Link>
  );
}
