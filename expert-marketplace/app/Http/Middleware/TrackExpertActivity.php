<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class TrackExpertActivity
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $user = $request->user();
        if ($user && $user->role === 'expert' && $user->expertProfile) {
            $user->expertProfile->updateQuietly(['last_seen_at' => now()]);
        }

        return $response;
    }
}
