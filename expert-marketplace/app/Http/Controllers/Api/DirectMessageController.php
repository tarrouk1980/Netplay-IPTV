<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DirectMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DirectMessageController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = DirectMessage::query()
            ->where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender:id,name,avatar_url', 'receiver:id,name,avatar_url'])
            ->orderByDesc('created_at')
            ->get();

        $conversations = $messages->groupBy(function ($msg) use ($userId) {
            return $msg->sender_id === $userId ? $msg->receiver_id : $msg->sender_id;
        })->map(function ($msgs, $partnerId) use ($userId) {
            $last = $msgs->first();
            $partner = $last->sender_id === $userId ? $last->receiver : $last->sender;
            $unread = $msgs->where('receiver_id', $userId)->whereNull('read_at')->count();
            return [
                'partner' => $partner,
                'last_message' => $last->body,
                'last_message_at' => $last->created_at,
                'unread_count' => $unread,
            ];
        })->values();

        return response()->json($conversations);
    }

    public function thread(Request $request, User $user): JsonResponse
    {
        $me = $request->user()->id;
        $other = $user->id;

        $messages = DirectMessage::query()
            ->where(function ($q) use ($me, $other) {
                $q->where('sender_id', $me)->where('receiver_id', $other);
            })
            ->orWhere(function ($q) use ($me, $other) {
                $q->where('sender_id', $other)->where('receiver_id', $me);
            })
            ->with(['sender:id,name,avatar_url'])
            ->orderBy('created_at')
            ->get();

        DirectMessage::where('receiver_id', $me)->where('sender_id', $other)->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json($messages);
    }

    public function send(Request $request, User $user): JsonResponse
    {
        $data = $request->validate(['body' => 'required|string|max:2000']);

        $msg = DirectMessage::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $user->id,
            'body' => $data['body'],
        ]);

        $msg->load('sender:id,name,avatar_url');

        return response()->json($msg, 201);
    }
}
