<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ExpertProfile;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function suggestions(Request $request)
    {
        $q = $request->string('q')->trim()->value();

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $experts = ExpertProfile::where('status', 'approved')
            ->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%"))
            ->with('user:id,name,avatar_url')
            ->limit(5)
            ->get()
            ->map(fn ($p) => [
                'type' => 'expert',
                'id' => $p->id,
                'label' => $p->user->name,
            ]);

        $categories = Category::where('name', 'like', "%{$q}%")
            ->limit(3)
            ->get()
            ->map(fn ($c) => [
                'type' => 'category',
                'id' => $c->id,
                'label' => $c->name,
            ]);

        return response()->json($experts->merge($categories)->values());
    }
}
