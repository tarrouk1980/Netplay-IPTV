<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Stripe\StripeClient;

class PaymentController extends Controller
{
    public function __construct(private readonly StripeClient $stripe) {}

    /**
     * Create a Stripe Checkout session for a pending booking.
     * Uses a destination charge so Stripe automatically splits the
     * payment between the platform (application fee = commission)
     * and the expert's connected account.
     */
    public function checkout(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id) {
            abort(403);
        }

        if ($booking->status !== 'pending') {
            abort(409, 'Cette réservation ne peut pas être payée dans son état actuel.');
        }

        $expert = $booking->expert;

        if (! $expert->stripe_account_id || ! $expert->stripe_onboarded) {
            abort(409, "Cet expert n'a pas encore configuré son compte de paiement.");
        }

        $session = $this->stripe->checkout->sessions->create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'success_url' => config('app.url')."/api/bookings/{$booking->id}?payment=success",
            'cancel_url' => config('app.url')."/api/bookings/{$booking->id}?payment=cancelled",
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => strtolower($expert->currency),
                    'unit_amount' => (int) round($booking->price * 100),
                    'product_data' => [
                        'name' => 'Session avec '.$expert->user->name,
                    ],
                ],
            ]],
            'payment_intent_data' => [
                'application_fee_amount' => (int) round($booking->commission_amount * 100),
                'transfer_data' => [
                    'destination' => $expert->stripe_account_id,
                ],
                'metadata' => ['booking_id' => $booking->id],
            ],
            'metadata' => ['booking_id' => $booking->id],
        ]);

        $booking->payment()->updateOrCreate([], [
            'amount' => $booking->price,
            'currency' => $expert->currency,
            'provider' => 'stripe',
            'provider_transaction_id' => $session->id,
            'status' => 'pending',
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }
}
