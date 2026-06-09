<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExpertProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WaitlistController extends Controller
{
    public function join(Request $request, ExpertProfile $expertProfile): JsonResponse
    {
        $data = $request->validate(['preferred_date' => ['nullable', 'date', 'after_or_equal:today']]);

        $existing = DB::table('waitlist')
            ->where('user_id', $request->user()->id)
            ->where('expert_profile_id', $expertProfile->id)
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Vous êtes déjà sur la liste d\'attente.'], 422);
        }

        DB::table('waitlist')->insert([
            'user_id' => $request->user()->id,
            'expert_profile_id' => $expertProfile->id,
            'preferred_date' => $data['preferred_date'] ?? null,
            'notified' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Ajouté à la liste d\'attente.'], 201);
    }

    public function leave(Request $request, ExpertProfile $expertProfile): JsonResponse
    {
        DB::table('waitlist')
            ->where('user_id', $request->user()->id)
            ->where('expert_profile_id', $expertProfile->id)
            ->delete();

        return response()->json(['message' => 'Retiré de la liste d\'attente.']);
    }
}
