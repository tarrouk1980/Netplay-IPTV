'use client';

import {useState} from 'react';
import {Link} from '@/i18n/navigation';
import type {ExpertProfile} from '@/lib/api';

interface ExpertCardProps {
  expert: ExpertProfile;
}

function StarRating({rating}: {rating: number}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-neutral-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function ExpertCard({expert}: ExpertCardProps) {
  const [favorited, setFavorited] = useState(false);
  const avatarUrl = expert.user?.avatar_url || `https://i.pravatar.cc/150?u=${expert.id}`;

  return (
    <div className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setFavorited(!favorited);
        }}
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all shadow-sm"
        aria-label="Favori"
      >
        <svg
          className={`w-4 h-4 transition-colors ${favorited ? 'text-red-500 fill-red-500' : 'text-neutral-400'}`}
          fill={favorited ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <Link href={`/experts/${expert.id}`} className="block p-6">
        {/* Avatar + verified badge */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={expert.user?.name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-white shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${expert.id}`;
              }}
            />
            {expert.status === 'approved' && (
              <span className="absolute -bottom-1 -right-1 bg-cyan-500 rounded-full p-1" title="Expert vérifié">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-indigo-950 truncate">{expert.user?.name}</h3>
            {expert.headline && (
              <p className="text-sm text-neutral-500 mt-0.5 line-clamp-1">{expert.headline}</p>
            )}
            {/* Category pill */}
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
              {expert.category?.name}
            </span>
          </div>
        </div>

        {/* Bio */}
        {expert.bio && (
          <p className="mt-4 text-sm text-neutral-600 line-clamp-2 leading-relaxed">{expert.bio}</p>
        )}

        {/* Rating + price */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating rating={expert.rating_avg || 0} />
            <span className="text-xs text-neutral-500 font-medium">
              {Number(expert.rating_avg ?? 0).toFixed(1)}
            </span>
          </div>
          <span className="text-indigo-600 font-semibold text-sm">
            {expert.hourly_rate} {expert.currency}
            <span className="text-neutral-400 font-normal">/h</span>
          </span>
        </div>

        {/* Book button */}
        <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2.5 font-semibold text-sm shadow-md hover:shadow-lg transition-all">
          Réserver
        </button>
      </Link>
    </div>
  );
}
