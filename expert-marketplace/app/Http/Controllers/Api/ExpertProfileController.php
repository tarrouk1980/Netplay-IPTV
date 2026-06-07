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
            ->with(['user:id,name,avatar_url', 'category']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        return $query->paginate(15);
    }

    public function show(ExpertProfile $expertProfile)
    {
        return $expertProfile->load(['user:id,name,avatar_url,country', 'category', 'reviews']);
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

        $data = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'bio' => ['required', 'string'],
            'years_experience' => ['nullable', 'integer', 'min:0'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'size:3'],
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
            'hourly_rate' => ['sometimes', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
        ]);

        $expertProfile->update($data);

        return $expertProfile;
    }
}
