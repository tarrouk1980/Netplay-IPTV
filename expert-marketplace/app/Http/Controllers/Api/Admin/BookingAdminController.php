<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class BookingAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $bookings = Booking::with([
            'client:id,name',
            'expert.user:id,name',
        ])
        ->orderByDesc('created_at')
        ->paginate(20);

        return response()->json($bookings);
    }
}
