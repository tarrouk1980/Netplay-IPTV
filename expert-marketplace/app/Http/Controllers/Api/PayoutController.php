<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayoutController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profile = $request->user()->expertProfile;

        if (! $profile) {
            return response()->json(['message' => 'Expert profile not found.'], 404);
        }

        $payouts = $profile->payouts()->orderByDesc('created_at')->get();

        $totalEarnings = (float) $profile->bookings()->where('status', 'completed')->sum('expert_payout');
        $totalPaid = (float) $profile->payouts()->where('status', 'paid')->sum('amount');
        $pendingEarnings = max(0, $totalEarnings - $totalPaid);

        return response()->json([
            'payouts' => $payouts,
            'pending_earnings' => $pendingEarnings,
            'currency' => $profile->currency ?? 'EUR',
        ]);
    }

    public function request(Request $request): JsonResponse
    {
        $profile = $request->user()->expertProfile;

        if (! $profile) {
            return response()->json(['message' => 'Expert profile not found.'], 404);
        }

        $totalEarnings = (float) $profile->bookings()->where('status', 'completed')->sum('expert_payout');
        $totalPaid = (float) $profile->payouts()->where('status', 'paid')->sum('amount');
        $pendingEarnings = max(0, $totalEarnings - $totalPaid);

        if ($pendingEarnings <= 0) {
            return response()->json(['message' => 'Aucun revenu disponible pour un virement.'], 422);
        }

        $payout = $profile->payouts()->create([
            'amount' => $pendingEarnings,
            'period_start' => now()->startOfMonth(),
            'period_end' => now(),
            'status' => 'pending',
        ]);

        return response()->json($payout, 201);
    }
}
