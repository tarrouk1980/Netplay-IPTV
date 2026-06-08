<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpertProfile;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = $request->user()->favorites()->with('expertProfile.user', 'expertProfile.category')->latest()->get();

        return response()->json($favorites->pluck('expertProfile'));
    }

    public function store(Request $request, ExpertProfile $expertProfile)
    {
        Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'expert_profile_id' => $expertProfile->id,
        ]);

        return response()->json(['favorited' => true]);
    }

    public function destroy(Request $request, ExpertProfile $expertProfile)
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('expert_profile_id', $expertProfile->id)
            ->delete();

        return response()->json(['favorited' => false]);
    }
}
