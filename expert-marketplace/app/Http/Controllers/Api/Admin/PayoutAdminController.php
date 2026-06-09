<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payout;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PayoutAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $payouts = Payout::with('expert.user:id,name')
            ->orderByDesc('created_at')
            ->get();

        return response()->json($payouts);
    }

    public function update(Request $request, Payout $payout): JsonResponse
    {
        $data = $request->validate(['status' => 'required|in:pending,paid']);

        if ($data['status'] === 'paid' && $payout->status !== 'paid') {
            $payout->update(['status' => 'paid', 'paid_at' => now()]);
        } else {
            $payout->update($data);
        }

        return response()->json($payout);
    }
}
