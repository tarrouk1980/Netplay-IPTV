<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string']);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon || !$coupon->isValid()) {
            return response()->json(['message' => 'Code promo invalide ou expiré.'], 422);
        }

        return response()->json([
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
        ]);
    }
}
