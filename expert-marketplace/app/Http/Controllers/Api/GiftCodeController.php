<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GiftCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GiftCodeController extends Controller
{
    public function create(Request $request): JsonResponse
    {
        $data = $request->validate([
            'expert_profile_id' => ['nullable', 'exists:expert_profiles,id'],
            'amount' => ['required', 'numeric', 'min:10'],
            'recipient_email' => ['required', 'email'],
            'recipient_name' => ['required', 'string', 'max:100'],
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $code = GiftCode::create([
            ...$data,
            'purchaser_id' => $request->user()->id,
            'code' => strtoupper(Str::random(12)),
            'currency' => 'EUR',
            'expires_at' => now()->addYear(),
        ]);

        return response()->json($code, 201);
    }

    public function redeem(Request $request): JsonResponse
    {
        $data = $request->validate(['code' => 'required|string']);

        $gift = GiftCode::where('code', strtoupper($data['code']))->first();

        if (!$gift || $gift->redeemed) {
            return response()->json(['message' => 'Code cadeau invalide ou déjà utilisé.'], 422);
        }

        if ($gift->expires_at && $gift->expires_at->isPast()) {
            return response()->json(['message' => 'Ce code cadeau a expiré.'], 422);
        }

        $gift->update([
            'redeemed' => true,
            'redeemed_by' => $request->user()->id,
            'redeemed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Code cadeau utilisé avec succès !',
            'amount' => $gift->amount,
            'currency' => $gift->currency,
        ]);
    }

    public function mine(Request $request): JsonResponse
    {
        $gifts = GiftCode::where('purchaser_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($gifts);
    }
}
