<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ExpertProfile;
use App\Notifications\BookingStatusChanged;
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

    public function downloadIcs(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id && $booking->expert_id !== $user->expertProfile?->id) {
            abort(403);
        }

        $booking->loadMissing(['client:id,name', 'expert.user:id,name']);

        $start = $booking->slot_datetime_start->utc()->format('Ymd\THis\Z');
        $end = $booking->slot_datetime_end->utc()->format('Ymd\THis\Z');
        $stamp = now()->utc()->format('Ymd\THis\Z');
        $summary = 'Session avec '.$booking->expert->user->name;
        $description = 'Réservation #'.$booking->id.' sur SideKick avec '.$booking->expert->user->name;

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SideKick//Booking//FR',
            'BEGIN:VEVENT',
            'UID:booking-'.$booking->id.'@sidekick',
            'DTSTAMP:'.$stamp,
            'DTSTART:'.$start,
            'DTEND:'.$end,
            'SUMMARY:'.$summary,
            'DESCRIPTION:'.$description,
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        $ics = implode("\r\n", $lines)."\r\n";

        return response($ics, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="booking-'.$booking->id.'.ics"',
        ]);
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

        $data = $request->validate([
            'cancellation_reason' => ['nullable', 'string', 'max:255'],
        ]);

        $booking->update(['status' => 'cancelled', 'cancellation_reason' => $data['cancellation_reason'] ?? null]);

        $other = $booking->client_id === $user->id ? $booking->expert->user : $booking->client;
        $other->notify(new BookingStatusChanged($booking, 'cancelled'));

        return $booking;
    }

    public function reschedule(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id && $booking->expert_id !== $user->expertProfile?->id) {
            abort(403);
        }

        if (! in_array($booking->status, ['pending', 'confirmed'], true)) {
            abort(409, 'Cette réservation ne peut plus être déplacée.');
        }

        $data = $request->validate([
            'slot_datetime_start' => ['required', 'date', 'after:now'],
            'slot_datetime_end' => ['required', 'date', 'after:slot_datetime_start'],
        ]);

        $overlaps = Booking::where('expert_id', $booking->expert_id)
            ->where('id', '!=', $booking->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('slot_datetime_start', '<', $data['slot_datetime_end'])
            ->where('slot_datetime_end', '>', $data['slot_datetime_start'])
            ->exists();

        if ($overlaps) {
            abort(409, 'Ce créneau est déjà réservé.');
        }

        $booking->update([
            'slot_datetime_start' => $data['slot_datetime_start'],
            'slot_datetime_end' => $data['slot_datetime_end'],
        ]);

        $other = $booking->client_id === $user->id ? $booking->expert->user : $booking->client;
        $other->notify(new BookingStatusChanged($booking, 'rescheduled'));

        return $booking;
    }

    public function complete(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->expert_id !== $user->expertProfile?->id) {
            abort(403);
        }

        if ($booking->status !== 'confirmed') {
            abort(409, 'Seule une réservation confirmée peut être marquée comme terminée.');
        }

        $booking->update(['status' => 'completed']);
        $booking->expert->increment('total_sessions');
        $booking->client->notify(new BookingStatusChanged($booking, 'completed'));

        return $booking;
    }

    public function setMeetingLink(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->expert_id !== $user->expertProfile?->id) {
            abort(403);
        }

        if ($booking->status !== 'confirmed') {
            abort(409, 'Le lien ne peut être défini que pour une réservation confirmée.');
        }

        $data = $request->validate([
            'meeting_link' => ['required', 'url', 'max:2048'],
        ]);

        $booking->update($data);

        return $booking;
    }
}
