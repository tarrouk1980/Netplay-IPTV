<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExpertProfile;
use Illuminate\Http\Request;

class ExpertProfileModerationController extends Controller
{
    public function index(Request $request)
    {
        $query = ExpertProfile::with(['user:id,name,email', 'category']);

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return $query->latest()->paginate(20);
    }

    public function update(Request $request, ExpertProfile $expertProfile)
    {
        $data = $request->validate([
            'status'   => ['sometimes', 'in:pending,approved,rejected'],
            'featured' => ['sometimes', 'boolean'],
        ]);

        $expertProfile->update($data);

        return $expertProfile;
    }
}
