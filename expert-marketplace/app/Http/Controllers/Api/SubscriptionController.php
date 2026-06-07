<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class SubscriptionController extends Controller
{
    public function __construct(private readonly StripeClient $stripe) {}

    public function index(Request $request)
    {
        return $request->user()->subscriptions()->with('plan')->latest()->get();
    }

    /**
     * Start a Stripe Checkout session in subscription mode for the given plan.
     */
    public function checkout(Request $request)
    {
        $data = $request->validate([
            'plan_id' => ['required', 'exists:subscription_plans,id'],
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::findOrFail($data['plan_id']);

        if (! $plan->stripe_price_id) {
            abort(409, "Ce plan n'est pas encore configuré pour le paiement.");
        }

        if ($user->subscriptions()->where('status', 'active')->exists()) {
            abort(409, 'Vous avez déjà un abonnement actif.');
        }

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'subscription',
            'customer_email' => $user->email,
            'success_url' => config('app.url').'/api/subscriptions?payment=success',
            'cancel_url' => config('app.url').'/api/subscriptions?payment=cancelled',
            'line_items' => [[
                'price' => $plan->stripe_price_id,
                'quantity' => 1,
            ]],
            'metadata' => [
                'client_id' => $user->id,
                'plan_id' => $plan->id,
            ],
            'subscription_data' => [
                'metadata' => [
                    'client_id' => $user->id,
                    'plan_id' => $plan->id,
                ],
            ],
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }

    public function cancel(Request $request, \App\Models\Subscription $subscription)
    {
        $user = $request->user();

        if ($subscription->client_id !== $user->id) {
            abort(403);
        }

        if ($subscription->stripe_subscription_id) {
            $this->stripe->subscriptions->cancel($subscription->stripe_subscription_id);
        }

        $subscription->update(['status' => 'cancelled']);

        return $subscription;
    }
}
