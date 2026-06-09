<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VideoRoomController extends Controller
{
    private string $baseUrl = 'https://api.daily.co/v1';

    public function create(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        $this->authorizeBookingAccess($user, $booking);

        if ($booking->video_room_name && $booking->video_room_url) {
            return $this->tokenResponse($booking, $user);
        }

        $roomName = 'skolz-booking-' . $booking->id;
        $expTimestamp = $booking->slot_datetime_end->addMinutes(30)->timestamp;

        $response = Http::withToken(env('DAILY_API_KEY'))
            ->post("{$this->baseUrl}/rooms", [
                'name' => $roomName,
                'privacy' => 'private',
                'properties' => [
                    'exp' => $expTimestamp,
                    'enable_chat' => true,
                    'enable_screenshare' => true,
                ],
            ]);

        if ($response->failed()) {
            abort(502, 'Failed to create video room: ' . $response->body());
        }

        $room = $response->json();

        $booking->update([
            'video_room_name' => $room['name'],
            'video_room_url' => $room['url'],
        ]);

        return $this->tokenResponse($booking, $user);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        $this->authorizeBookingAccess($user, $booking);

        if (! $booking->video_room_name || ! $booking->video_room_url) {
            abort(404, 'No video room exists for this booking.');
        }

        return $this->tokenResponse($booking, $user);
    }

    private function authorizeBookingAccess($user, Booking $booking): void
    {
        $isClient = $booking->client_id === $user->id;
        $isExpert = $user->expertProfile && $booking->expert_id === $user->expertProfile->id;

        if (! $isClient && ! $isExpert) {
            abort(403, 'You are not authorized to access this booking.');
        }
    }

    private function tokenResponse(Booking $booking, $user): JsonResponse
    {
        $expTimestamp = $booking->slot_datetime_end->addMinutes(30)->timestamp;
        $isExpert = $user->expertProfile && $booking->expert_id === $user->expertProfile->id;

        $response = Http::withToken(env('DAILY_API_KEY'))
            ->post("{$this->baseUrl}/meeting-tokens", [
                'properties' => [
                    'room_name' => $booking->video_room_name,
                    'exp' => $expTimestamp,
                    'is_owner' => $isExpert,
                    'user_name' => $user->name,
                ],
            ]);

        if ($response->failed()) {
            abort(502, 'Failed to generate meeting token: ' . $response->body());
        }

        $token = $response->json('token');

        return response()->json([
            'room_url' => $booking->video_room_url,
            'room_name' => $booking->video_room_name,
            'token' => $token,
        ]);
    }
}
