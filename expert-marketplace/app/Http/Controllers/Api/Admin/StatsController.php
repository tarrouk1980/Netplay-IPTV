<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ExpertProfile;
use App\Models\User;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'total_users'           => User::count(),
            'total_experts'         => ExpertProfile::count(),
            'pending_experts'       => ExpertProfile::where('status', 'pending')->count(),
            'approved_experts'      => ExpertProfile::where('status', 'approved')->count(),
            'total_bookings'        => Booking::count(),
            'confirmed_bookings'    => Booking::where('status', 'confirmed')->count(),
            'completed_bookings'    => Booking::where('status', 'completed')->count(),
            'total_revenue'         => (float) Booking::where('status', 'completed')->sum('commission_amount'),
        ]);
    }
}
