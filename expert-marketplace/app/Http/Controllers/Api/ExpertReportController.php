<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpertProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpertReportController extends Controller
{
    public function store(Request $request, ExpertProfile $expertProfile): JsonResponse
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
            'details' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ]);

        $existing = $expertProfile->reports()->where('reporter_id', $request->user()->id)->exists();
        if ($existing) {
            return response()->json(['message' => 'Vous avez déjà signalé cet expert.'], 422);
        }

        $expertProfile->reports()->create([
            'reporter_id' => $request->user()->id,
            'reason' => $data['reason'],
            'details' => $data['details'] ?? null,
        ]);

        return response()->json(['message' => 'Signalement envoyé.'], 201);
    }
}
