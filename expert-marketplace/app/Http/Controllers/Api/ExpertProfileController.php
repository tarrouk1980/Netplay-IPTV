<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpertProfile;
use Illuminate\Http\Request;

class ExpertProfileController extends Controller
{
    public function index(Request $request)
    {
        $query = ExpertProfile::query()
            ->where('status', 'approved')
            ->with(['user:id,name,avatar_url', 'category'])
            ->orderByDesc('featured');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('q')) {
            $search = $request->string('q');
            $query->where(function ($q) use ($search) {
                $q->where('bio', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('min_price')) {
            $query->where('hourly_rate', '>=', $request->float('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('hourly_rate', '<=', $request->float('max_price'));
        }

        if ($request->filled('min_rating')) {
            $query->where('rating_avg', '>=', $request->float('min_rating'));
        }

        if ($request->filled('language')) {
            $query->whereJsonContains('languages', $request->string('language')->value());
        }

        $sort =$request->string('sort', 'rating_avg');
        $direction = $request->string('direction', 'desc');

        if (in_array($sort->value(), ['hourly_rate', 'rating_avg', 'total_sessions'], true)) {
            $query->orderBy($sort->value(), $direction->value() === 'asc' ? 'asc' : 'desc');
        }

        return $query->paginate(15);
    }

    public function show(ExpertProfile $expertProfile)
    {
        return $expertProfile->load(['user:id,name,avatar_url,country', 'category', 'reviews', 'portfolioItems']);
    }

    public function similar(ExpertProfile $expertProfile)
    {
        $similar = ExpertProfile::where('status', 'approved')
            ->where('category_id', $expertProfile->category_id)
            ->where('id', '!=', $expertProfile->id)
            ->with(['user:id,name,avatar_url', 'category'])
            ->inRandomOrder()
            ->limit(3)
            ->get();

        return $similar;
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->isExpert()) {
            abort(403, "Seuls les utilisateurs avec le rôle 'expert' peuvent créer un profil.");
        }

        if ($user->expertProfile) {
            abort(409, 'Un profil expert existe déjà pour cet utilisateur.');
        }

        $regulatedCategoryIds = \App\Models\Category::whereIn('slug', ['conseil-juridique', 'pre-diagnostic-medical'])->pluck('id');
        $requiresCredential = $regulatedCategoryIds->contains((int) $request->input('category_id'));

        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'bio' => ['required', 'string'],
            'years_experience' => ['nullable', 'integer', 'min:0'],
            'credential_reference' => [$requiresCredential ? 'required' : 'nullable', 'string', 'max:255'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['string', 'in:fr,ar,en'],
        ]);

        $profile = $user->expertProfile()->create([
            ...$data,
            'status' => 'pending',
            'commission_rate' => config('marketplace.default_commission_rate', 0.18),
        ]);

        return response()->json($profile, 201);
    }

    public function update(Request $request, ExpertProfile $expertProfile)
    {
        if ($request->user()->id !== $expertProfile->user_id) {
            abort(403);
        }

        $data = $request->validate([
            'bio' => ['sometimes', 'string'],
            'years_experience' => ['sometimes', 'integer', 'min:0'],
            'credential_reference' => ['sometimes', 'nullable', 'string', 'max:255'],
            'hourly_rate' => ['sometimes', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'languages' => ['sometimes', 'nullable', 'array'],
            'languages.*' => ['string', 'in:fr,ar,en'],
        ]);

        $expertProfile->update($data);

        return $expertProfile;
    }

    public function stats(Request $request)
    {
        $profile = $request->user()->expertProfile;

        if (! $profile) {
            return response()->json(['message' => 'No expert profile found.'], 404);
        }

        $bookings = $profile->bookings();

        $totalBookings = $bookings->count();
        $completedBookings = $bookings->where('status', 'completed')->count();
        $upcomingBookings = $profile->bookings()->where('status', 'confirmed')
            ->where('starts_at', '>', now())->count();
        $totalEarnings = $profile->bookings()->where('status', 'completed')->sum('expert_payout');
        $avgRating = round($profile->reviews()->avg('rating') ?? 0, 1);
        $totalReviews = $profile->reviews()->count();

        return response()->json([
            'total_bookings'    => $totalBookings,
            'completed_bookings'=> $completedBookings,
            'upcoming_bookings' => $upcomingBookings,
            'total_earnings'    => (float) $totalEarnings,
            'currency'          => $profile->currency ?? 'EUR',
            'avg_rating'        => $avgRating,
            'total_reviews'     => $totalReviews,
        ]);
    }

    public function earnings(Request $request)
    {
        $profile = $request->user()->expertProfile;

        if (! $profile) {
            return response()->json(['message' => 'No expert profile found.'], 404);
        }

        $bookings = $profile->bookings()
            ->where('status', 'completed')
            ->with('client:id,name,avatar_url')
            ->orderByDesc('slot_datetime_start')
            ->get(['id', 'client_id', 'slot_datetime_start', 'price', 'commission_amount', 'expert_payout', 'coupon_code', 'discount_amount']);

        return response()->json([
            'currency' => $profile->currency ?? 'EUR',
            'total' => (float) $bookings->sum('expert_payout'),
            'bookings' => $bookings,
        ]);
    }
}
