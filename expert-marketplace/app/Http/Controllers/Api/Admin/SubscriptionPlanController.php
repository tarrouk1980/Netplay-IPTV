<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;

class SubscriptionPlanController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_interval' => ['required', 'in:monthly,yearly'],
            'stripe_price_id' => ['nullable', 'string'],
            'included_sessions_per_month' => ['required', 'integer', 'min:0'],
        ]);

        return response()->json(SubscriptionPlan::create($data), 201);
    }

    public function update(Request $request, SubscriptionPlan $subscriptionPlan)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'billing_interval' => ['sometimes', 'in:monthly,yearly'],
            'stripe_price_id' => ['nullable', 'string'],
            'included_sessions_per_month' => ['sometimes', 'integer', 'min:0'],
        ]);

        $subscriptionPlan->update($data);

        return $subscriptionPlan;
    }

    public function destroy(SubscriptionPlan $subscriptionPlan)
    {
        $subscriptionPlan->delete();

        return response()->noContent();
    }
}
