<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::orderByDesc('created_at');

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        return response()->json($query->paginate(20));
    }

    public function ban(User $user): JsonResponse
    {
        $user->update(['banned_at' => now()]);
        return response()->json(['message' => 'Utilisateur suspendu.']);
    }

    public function unban(User $user): JsonResponse
    {
        $user->update(['banned_at' => null]);
        return response()->json(['message' => 'Utilisateur réactivé.']);
    }
}
