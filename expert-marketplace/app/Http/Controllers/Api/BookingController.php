<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ExpertProfile;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isExpert() && $user->expertProfile) {
            return $user->expertProfile->bookings()->with('client:id,name,avatar_url')->latest('slot_datetime_start')->paginate(15);
        }

        return $user->bookings()->with('expert.user:id,name,avatar_url')->latest('slot_datetime_start')->paginate(15);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (! $user->isClient()) {
            abort(403, 'Seuls les clients peuvent réserver une session.');
        }

        $data = $request->validate([
            'expert_id' => ['required', 'exists:expert_profiles,id'],
            'slot_datetime_start' => ['required', 'date', 'after:now'],
            'slot_datetime_end' => ['required', 'date', 'after:slot_datetime_start'],
        ]);

        $expert = ExpertProfile::findOrFail($data['expert_id']);

        $overlaps = Booking::where('expert_id', $expert->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('slot_datetime_start', '<', $data['slot_datetime_end'])
            ->where('slot_datetime_end', '>', $data['slot_datetime_start'])
            ->exists();

        if ($overlaps) {
            abort(409, 'Ce créneau est déjà réservé.');
        }

        $hours = (strtotime($data['slot_datetime_end']) - strtotime($data['slot_datetime_start'])) / 3600;
        $price = round($expert->hourly_rate * $hours, 2);
        $commission = round($price * $expert->commission_rate / 100, 2);

        $booking = Booking::create([
            'client_id' => $user->id,
            'expert_id' => $expert->id,
            'slot_datetime_start' => $data['slot_datetime_start'],
            'slot_datetime_end' => $data['slot_datetime_end'],
            'status' => 'pending',
            'price' => $price,
            'commission_amount' => $commission,
            'expert_payout' => $price - $commission,
        ]);

        return response()->json($booking, 201);
    }

    public function show(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id && $booking->expert_id !== $user->expertProfile?->id) {
            abort(403);
        }

        return $booking->load(['client:id,name,avatar_url', 'expert.user:id,name,avatar_url', 'payment']);
    }

    public function cancel(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id && $booking->expert_id !== $user->expertProfile?->id) {
            abort(403);
        }

        if (! in_array($booking->status, ['pending', 'confirmed'], true)) {
            abort(409, 'Cette réservation ne peut plus être annulée.');
        }

        $booking->update(['status' => 'cancelled']);

        return $booking;
    }
}
