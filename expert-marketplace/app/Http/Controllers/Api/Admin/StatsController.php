<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ExpertProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    public function monthly(Request $request)
    {
        $months = Booking::where('status', 'completed')
            ->select(
                DB::raw("DATE_FORMAT(slot_datetime_start, '%Y-%m') as month"),
                DB::raw('COUNT(*) as sessions'),
                DB::raw('SUM(commission_amount) as revenue'),
                DB::raw('SUM(price) as gmv')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->limit(12)
            ->get();

        return response()->json($months);
    }
}
