<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['expert_id' => ['required', 'exists:expert_profiles,id']]);

        return \App\Models\Review::where('expert_id', $request->integer('expert_id'))
            ->with('client:id,name,avatar_url')
            ->latest()
            ->paginate(15);
    }

    public function store(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id) {
            abort(403);
        }

        if ($booking->status !== 'completed') {
            abort(409, 'Vous ne pouvez laisser un avis que pour une session terminée.');
        }

        if ($booking->review()->exists()) {
            abort(409, 'Un avis a déjà été laissé pour cette réservation.');
        }

        $data = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $review = $booking->review()->create([
            ...$data,
            'client_id' => $user->id,
            'expert_id' => $booking->expert_id,
        ]);

        $expert = $booking->expert;
        $expert->update([
            'rating_avg' => round($expert->reviews()->avg('rating'), 2),
        ]);

        return response()->json($review, 201);
    }

    public function reply(Request $request, Review $review)
    {
        $user = $request->user();
        $expertProfile = $user->expertProfile;

        if (! $expertProfile || $review->expert_id !== $expertProfile->id) {
            abort(403);
        }

        $data = $request->validate([
            'expert_reply' => ['required', 'string', 'max:2000'],
        ]);

        $review->update([
            'expert_reply' => $data['expert_reply'],
            'expert_reply_at' => now(),
        ]);

        return response()->json($review);
    }
}
