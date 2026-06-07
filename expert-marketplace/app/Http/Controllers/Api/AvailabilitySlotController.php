<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvailabilitySlot;
use Illuminate\Http\Request;

class AvailabilitySlotController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['expert_id' => ['required', 'exists:expert_profiles,id']]);

        return AvailabilitySlot::where('expert_id', $request->integer('expert_id'))->get();
    }

    public function store(Request $request)
    {
        $profile = $request->user()->expertProfile;

        if (! $profile) {
            abort(403, "Vous devez d'abord créer un profil expert.");
        }

        $data = $request->validate([
            'day_of_week' => ['nullable', 'integer', 'between:0,6'],
            'specific_date' => ['nullable', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'is_recurring' => ['required', 'boolean'],
            'timezone' => ['required', 'string', 'max:64'],
        ]);

        $slot = $profile->availabilitySlots()->create($data);

        return response()->json($slot, 201);
    }

    public function destroy(Request $request, AvailabilitySlot $availabilitySlot)
    {
        if ($availabilitySlot->expert_id !== $request->user()->expertProfile?->id) {
            abort(403);
        }

        $availabilitySlot->delete();

        return response()->noContent();
    }
}
