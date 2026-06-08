<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpertBlockedDate;
use App\Models\ExpertProfile;
use Illuminate\Http\Request;

class ExpertBlockedDateController extends Controller
{
    public function index(ExpertProfile $expertProfile)
    {
        return $expertProfile->blockedDates()
            ->orderBy('blocked_date')
            ->where('blocked_date', '>=', now()->toDateString())
            ->get();
    }

    public function store(Request $request)
    {
        $profile = $request->user()->expertProfile;
        abort_unless($profile, 403);

        $data = $request->validate([
            'blocked_date' => ['required', 'date', 'after_or_equal:today'],
            'reason'       => ['nullable', 'string', 'max:150'],
        ]);

        $blocked = ExpertBlockedDate::firstOrCreate(
            ['expert_profile_id' => $profile->id, 'blocked_date' => $data['blocked_date']],
            ['reason' => $data['reason'] ?? null]
        );

        return response()->json($blocked, 201);
    }

    public function destroy(Request $request, ExpertBlockedDate $expertBlockedDate)
    {
        $profile = $request->user()->expertProfile;
        abort_unless($profile && $expertBlockedDate->expert_profile_id === $profile->id, 403);

        $expertBlockedDate->delete();

        return response()->json(['success' => true]);
    }
}
