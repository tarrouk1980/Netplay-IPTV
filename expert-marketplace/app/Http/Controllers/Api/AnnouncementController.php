<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AnnouncementController extends Controller
{
    private const CACHE_KEY = 'platform_announcement';

    public function show(): JsonResponse
    {
        $announcement = Cache::get(self::CACHE_KEY);

        return response()->json(['announcement' => $announcement]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['nullable', 'string', 'max:500'],
            'type' => ['nullable', 'in:info,warning,success'],
        ]);

        if (empty($data['message'])) {
            Cache::forget(self::CACHE_KEY);
        } else {
            Cache::forever(self::CACHE_KEY, [
                'message' => $data['message'],
                'type' => $data['type'] ?? 'info',
            ]);
        }

        return response()->json(['announcement' => Cache::get(self::CACHE_KEY)]);
    }
}
