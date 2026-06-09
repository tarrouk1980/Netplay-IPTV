<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketAdminController extends Controller
{
    public function index(): JsonResponse
    {
        $tickets = SupportTicket::with('user:id,name,email', 'booking:id,slot_datetime_start')
            ->orderByDesc('created_at')
            ->get();
        return response()->json($tickets);
    }

    public function update(Request $request, SupportTicket $supportTicket): JsonResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:open,in_progress,resolved,closed'],
            'admin_reply' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ]);

        if (!empty($data['admin_reply'])) {
            $data['replied_at'] = now();
        }

        $supportTicket->update($data);
        return response()->json($supportTicket);
    }
}
