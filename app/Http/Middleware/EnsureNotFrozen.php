<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotFrozen
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isFrozen() && ! $user->hasRole('admin')) {
            return response()->json([
                'message' => 'Your account has been frozen. Please contact support.',
                'frozen' => true,
                'frozen_at' => $user->frozen_at,
                'frozen_reason' => $user->frozen_reason,
            ], 403);
        }

        return $next($request);
    }
}
