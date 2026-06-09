<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BookingAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::with([
            'client:id,name',
            'expert.user:id,name',
        ])->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status')->value());
        }

        return response()->json($query->paginate(20));
    }

    public function export(): StreamedResponse
    {
        $bookings = Booking::with(['client:id,name', 'expert.user:id,name'])
            ->orderByDesc('created_at')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="bookings-' . now()->format('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($bookings) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Client', 'Expert', 'Status', 'Start', 'End', 'Price', 'Expert Payout', 'Created']);
            foreach ($bookings as $b) {
                fputcsv($handle, [
                    $b->id,
                    $b->client?->name ?? '',
                    $b->expert?->user?->name ?? '',
                    $b->status,
                    $b->slot_datetime_start,
                    $b->slot_datetime_end,
                    $b->price,
                    $b->expert_payout,
                    $b->created_at,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
    }
}
