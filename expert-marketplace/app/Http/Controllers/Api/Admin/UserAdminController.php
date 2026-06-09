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

    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $users = User::orderByDesc('created_at')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="users-' . now()->format('Y-m-d') . '.csv"',
        ];

        return response()->stream(function () use ($users) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['ID', 'Name', 'Email', 'Role', 'Banned', 'Created']);
            foreach ($users as $u) {
                fputcsv($handle, [
                    $u->id, $u->name, $u->email, $u->role,
                    $u->banned_at ? 'yes' : 'no', $u->created_at,
                ]);
            }
            fclose($handle);
        }, 200, $headers);
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
