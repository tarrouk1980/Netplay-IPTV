<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent(
                $request->getContent(),
                $request->header('Stripe-Signature'),
                $secret,
            );
        } catch (UnexpectedValueException|SignatureVerificationException) {
            abort(400, 'Webhook invalide.');
        }

        match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutCompleted($event->data->object),
            'customer.subscription.updated', 'customer.subscription.deleted' => $this->handleSubscriptionUpdated($event->data->object),
            default => null,
        };

        return response()->json(['received' => true]);
    }

    private function handleCheckoutCompleted(object $session): void
    {
        if ($session->mode === 'subscription') {
            $clientId = $session->metadata->client_id ?? null;
            $planId = $session->metadata->plan_id ?? null;

            if ($clientId && $planId) {
                Subscription::updateOrCreate(
                    ['stripe_subscription_id' => $session->subscription],
                    [
                        'client_id' => $clientId,
                        'plan_id' => $planId,
                        'status' => 'active',
                    ],
                );
            }

            return;
        }

        $payment = Payment::where('provider_transaction_id', $session->id)->first();

        if ($payment && $payment->status !== 'paid') {
            $payment->update([
                'status' => 'paid',
                'paid_at' => Carbon::now(),
            ]);

            $booking = $payment->booking;
            $booking->update(['status' => 'confirmed']);
            $booking->client->notify(new \App\Notifications\BookingStatusChanged($booking, 'confirmed'));
            $booking->expert->user->notify(new \App\Notifications\BookingStatusChanged($booking, 'confirmed'));
        }
    }

    private function handleSubscriptionUpdated(object $stripeSubscription): void
    {
        $subscription = Subscription::where('stripe_subscription_id', $stripeSubscription->id)->first();

        if (! $subscription) {
            return;
        }

        $status = match ($stripeSubscription->status) {
            'active', 'trialing' => 'active',
            'canceled', 'unpaid', 'incomplete_expired' => 'cancelled',
            default => 'expired',
        };

        $periodEnd = $stripeSubscription->current_period_end ?? null;

        $subscription->update([
            'status' => $status,
            'current_period_end' => $periodEnd ? Carbon::createFromTimestamp($periodEnd) : null,
        ]);
    }
}
