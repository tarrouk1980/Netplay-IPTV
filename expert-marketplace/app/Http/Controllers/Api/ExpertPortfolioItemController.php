<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpertPortfolioItem;
use App\Models\ExpertProfile;
use Illuminate\Http\Request;

class ExpertPortfolioItemController extends Controller
{
    public function index(ExpertProfile $expertProfile)
    {
        return $expertProfile->portfolioItems()->orderBy('position')->get();
    }

    public function store(Request $request)
    {
        $profile = $request->user()->expertProfile;
        abort_unless($profile, 403);

        $data = $request->validate([
            'title'       => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'url'         => ['nullable', 'url', 'max:2048'],
        ]);

        $position = $profile->portfolioItems()->max('position') + 1;

        $item = $profile->portfolioItems()->create([...$data, 'position' => $position]);

        return response()->json($item, 201);
    }

    public function destroy(Request $request, ExpertPortfolioItem $expertPortfolioItem)
    {
        $profile = $request->user()->expertProfile;
        abort_unless($profile && $expertPortfolioItem->expert_profile_id === $profile->id, 403);

        $expertPortfolioItem->delete();

        return response()->json(['success' => true]);
    }
}
