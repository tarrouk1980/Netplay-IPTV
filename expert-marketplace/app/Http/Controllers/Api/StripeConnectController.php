<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class StripeConnectController extends Controller
{
    public function __construct(private readonly StripeClient $stripe) {}

    /**
     * Create (if needed) a Stripe Connect Express account for the expert
     * and return an onboarding link to finish KYC and bank details.
     */
    public function onboard(Request $request)
    {
        $profile = $request->user()->expertProfile;

        if (! $profile) {
            abort(403, "Vous devez d'abord créer un profil expert.");
        }

        if (! $profile->stripe_account_id) {
            $account = $this->stripe->accounts->create([
                'type' => 'express',
                'email' => $request->user()->email,
                'capabilities' => [
                    'card_payments' => ['requested' => true],
                    'transfers' => ['requested' => true],
                ],
            ]);

            $profile->update(['stripe_account_id' => $account->id]);
        }

        $link = $this->stripe->accountLinks->create([
            'account' => $profile->stripe_account_id,
            'refresh_url' => config('app.url').'/api/stripe/connect/refresh',
            'return_url' => config('app.url').'/api/stripe/connect/return',
            'type' => 'account_onboarding',
        ]);

        return response()->json(['url' => $link->url]);
    }

    public function status(Request $request)
    {
        $profile = $request->user()->expertProfile;

        if (! $profile?->stripe_account_id) {
            return response()->json(['onboarded' => false]);
        }

        $account = $this->stripe->accounts->retrieve($profile->stripe_account_id);
        $onboarded = (bool) $account->charges_enabled && (bool) $account->payouts_enabled;

        $profile->update(['stripe_onboarded' => $onboarded]);

        return response()->json(['onboarded' => $onboarded]);
    }
}
