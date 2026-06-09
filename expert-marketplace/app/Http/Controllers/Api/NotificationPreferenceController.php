<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $prefs = NotificationPreference::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['booking_updates' => true, 'new_messages' => true, 'review_notifications' => true, 'promotions' => false]
        );
        return response()->json($prefs);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'booking_updates' => ['sometimes', 'boolean'],
            'new_messages' => ['sometimes', 'boolean'],
            'review_notifications' => ['sometimes', 'boolean'],
            'promotions' => ['sometimes', 'boolean'],
        ]);

        $prefs = NotificationPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json($prefs);
    }
}
