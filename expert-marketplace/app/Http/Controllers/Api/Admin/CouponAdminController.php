<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponAdminController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Coupon::orderByDesc('created_at')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type' => ['required', 'in:percent,fixed'],
            'value' => ['required', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $coupon = Coupon::create($data);

        return response()->json($coupon, 201);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
