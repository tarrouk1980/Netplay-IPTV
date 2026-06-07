<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, Booking $booking)
    {
        $this->authorizeParticipant($request, $booking);

        $booking->messages()->whereNot('sender_id', $request->user()->id)->whereNull('read_at')->update(['read_at' => now()]);

        return $booking->messages()->with('sender:id,name,avatar_url')->oldest()->get();
    }

    public function store(Request $request, Booking $booking)
    {
        $this->authorizeParticipant($request, $booking);

        if (! in_array($booking->status, ['confirmed', 'completed'], true)) {
            abort(409, 'La messagerie est disponible uniquement pour les réservations confirmées.');
        }

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = $booking->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        return response()->json($message->load('sender:id,name,avatar_url'), 201);
    }

    private function authorizeParticipant(Request $request, Booking $booking): void
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id && $booking->expert_id !== $user->expertProfile?->id) {
            abort(403);
        }
    }
}
